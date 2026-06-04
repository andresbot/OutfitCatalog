#!/usr/bin/env node
// Creates or updates one Firebase Auth user and its Firestore admin profile.
// Usage:
//   node scripts/seed-admin.js --dry-run
//   node scripts/seed-admin.js --service-account "C:\path\service-account.json"
//   node scripts/seed-admin.js --email admin@outfit.test --password Admin123! --name "Admin Outfit" --phone 3104221496 --service-account ".\service-account.json"

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const DEFAULTS = {
  email: 'admin@outfit.test',
  name: 'Admin OutfitCatalog',
  password: 'Admin123!',
  phone: '3104221496',
};

const FALLBACK_FIREBASE_API_KEY = 'AIzaSyCufMwgMdz1dH8-tY2Xja35uAJee0ojpbw';
const FALLBACK_FIREBASE_PROJECT_ID = 'outfitcatalog-bb66c';

function loadDotEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const idx = trimmed.indexOf('=');
    const key = trimmed.slice(0, idx).trim();
    const raw = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = raw.replace(/^['"]|['"]$/g, '');
    }
  }
}

function parseArgs(argv) {
  const args = {
    ...DEFAULTS,
    dryRun: false,
    help: false,
    serviceAccount: process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = argv[i + 1];
      if (!value || value.startsWith('--')) {
        throw new Error(`Falta valor para ${arg}`);
      }
      i += 1;

      if (key === 'email') args.email = value.trim().toLowerCase();
      else if (key === 'name') args.name = value.trim();
      else if (key === 'password') args.password = value;
      else if (key === 'phone') args.phone = value.trim();
      else if (key === 'service-account') args.serviceAccount = value;
      else throw new Error(`Opcion no reconocida: ${arg}`);
    }
  }

  if (!args.email.includes('@')) throw new Error('--email debe ser un correo valido.');
  if (args.password.length < 6) throw new Error('--password debe tener minimo 6 caracteres.');
  if (!args.name) throw new Error('--name no puede estar vacio.');
  if (!args.phone) throw new Error('--phone no puede estar vacio.');
  if (!args.dryRun && !args.serviceAccount) {
    throw new Error('Para crear un admin real usa --service-account "ruta.json".');
  }

  return args;
}

function printHelp() {
  console.log(`
Seed de usuario administrador para OutfitCatalog

Opciones:
  --email EMAIL              Default: ${DEFAULTS.email}
  --password PASSWORD        Default: ${DEFAULTS.password}
  --name NAME                Default: ${DEFAULTS.name}
  --phone PHONE              Default: ${DEFAULTS.phone}
  --service-account PATH     JSON de cuenta de servicio Firebase.
  --dry-run                  Muestra lo que se crearia sin escribir.

Ejemplo:
  npm run seed:admin -- --service-account "C:\\Users\\jtria\\Downloads\\service-account.json"
`);
}

function iso() {
  return new Date().toISOString();
}

function deterministicIdFromEmail(email) {
  return `admin-${email.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

function base64Url(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function getServiceAccountAccessToken(serviceAccountPath) {
  const absolutePath = path.resolve(process.cwd(), serviceAccountPath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`No existe el service account JSON: ${absolutePath}`);
  }

  const raw = fs.readFileSync(absolutePath, 'utf8');
  const account = JSON.parse(raw);
  const tokenUri = account.token_uri || 'https://oauth2.googleapis.com/token';

  if (!account.client_email || !account.private_key) {
    throw new Error('El service account JSON debe incluir client_email y private_key.');
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64Url(JSON.stringify({
    iss: account.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: tokenUri,
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claim}`;
  const signature = crypto
    .createSign('RSA-SHA256')
    .update(unsigned)
    .sign(account.private_key, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const res = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${signature}`,
    }).toString(),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`No se pudo obtener access token del service account: ${JSON.stringify(data)}`);
  }

  return data.access_token;
}

async function adminAuthRequest(projectId, apiKey, accessToken, method, payload, useApiKey = false) {
  const keyParam = useApiKey ? `?key=${apiKey}` : '';
  const url = `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts${method}${keyParam}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    const code = data?.error?.message ?? `HTTP_${res.status}`;
    const err = new Error(code);
    err.code = code;
    err.details = data;
    throw err;
  }
  return data;
}

async function lookupAuthUser(projectId, apiKey, accessToken, email, fallbackLocalId) {
  try {
    const byEmail = await adminAuthRequest(projectId, apiKey, accessToken, ':lookup', {
      email: [email],
    });
    const found = byEmail?.users?.[0];
    if (found?.localId) return found.localId;
  } catch (error) {
    if (error.code !== 'EMAIL_NOT_FOUND' && error.code !== 'USER_NOT_FOUND') throw error;
  }

  try {
    const byLocalId = await adminAuthRequest(projectId, apiKey, accessToken, ':lookup', {
      localId: [fallbackLocalId],
    });
    return byLocalId?.users?.[0]?.localId ?? null;
  } catch (error) {
    if (error.code !== 'EMAIL_NOT_FOUND' && error.code !== 'USER_NOT_FOUND') throw error;
    return null;
  }
}

async function ensureAdminAuthUser(projectId, apiKey, accessToken, user, password) {
  const existingUid = await lookupAuthUser(projectId, apiKey, accessToken, user.email, user.id);
  if (existingUid) {
    await adminAuthRequest(projectId, apiKey, accessToken, ':update', {
      localId: existingUid,
      password,
      displayName: user.name,
      emailVerified: true,
      disabled: false,
    }, true);
    return existingUid;
  }

  const created = await adminAuthRequest(projectId, apiKey, accessToken, '', {
    localId: user.id,
    email: user.email,
    password,
    displayName: user.name,
    emailVerified: true,
    disabled: false,
  }, true);
  return created.localId || user.id;
}

function toFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return { integerValue: String(value) };
    return { doubleValue: value };
  }
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
  if (typeof value === 'object') return { mapValue: { fields: toFirestoreFields(value) } };
  return { stringValue: String(value) };
}

function toFirestoreFields(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, toFirestoreValue(value)]),
  );
}

async function writeUserProfile(projectId, accessToken, uid, profile) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${encodeURIComponent(uid)}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields: toFirestoreFields(profile) }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Firestore users/${uid} fallo (${res.status}): ${body}`);
  }
}

async function main() {
  loadDotEnv();
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || FALLBACK_FIREBASE_PROJECT_ID;
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY || FALLBACK_FIREBASE_API_KEY;
  const plannedId = deterministicIdFromEmail(args.email);
  const user = {
    id: plannedId,
    email: args.email,
    name: args.name,
    phone: args.phone,
    role: 'admin',
  };

  console.log('\nSeed admin listo para OutfitCatalog');
  console.log(`  Proyecto Firebase: ${projectId}`);
  console.log(`  Email: ${user.email}`);
  console.log(`  Password: ${args.password}`);
  console.log(`  Nombre: ${user.name}`);
  console.log(`  Telefono: ${user.phone}`);
  console.log(`  Rol: ${user.role}`);

  if (args.dryRun) {
    console.log('\nDry run: no se escribio nada en Firebase.');
    return;
  }

  console.log('\nObteniendo token de service account...');
  const accessToken = await getServiceAccountAccessToken(args.serviceAccount);

  console.log('Creando/reutilizando usuario en Firebase Auth...');
  const uid = await ensureAdminAuthUser(projectId, apiKey, accessToken, user, args.password);

  const now = iso();
  console.log('Escribiendo perfil admin en Firestore...');
  await writeUserProfile(projectId, accessToken, uid, {
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: now,
    updatedAt: now,
  });

  console.log('\nAdmin listo para iniciar sesion:');
  console.log(`  UID: ${uid}`);
  console.log(`  Email: ${user.email}`);
  console.log(`  Password: ${args.password}`);
}

main().catch((err) => {
  console.error('\nError en seed admin:', err.message);
  process.exit(1);
});
