#!/usr/bin/env node
// Massive Firestore seed for OutfitCatalog.
// Usage examples:
//   node scripts/seed-massive.js --dry-run
//   node scripts/seed-massive.js --vendors 40 --clients 250 --admins 3 --garments 100
//   node scripts/seed-massive.js --auth-users --password Atelier123!
//   node scripts/seed-massive.js --service-account .\service-account.json --auth-users

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const DEFAULTS = {
  admins: 3,
  batchSize: 400,
  clients: 250,
  garments: 100,
  password: 'Atelier123!',
  prefix: 'mass',
  seed: 7391,
  vendorPhone: '+573104221496',
  vendors: 40,
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
    authUsers: false,
    dryRun: false,
    help: false,
    serviceAccount: process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
    vendorPhone: process.env.SEED_VENDOR_PHONE || DEFAULTS.vendorPhone,
    writerEmail: process.env.FIREBASE_SEED_WRITER_EMAIL || '',
    writerPassword: process.env.FIREBASE_SEED_WRITER_PASSWORD || '',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--auth-users') args.authUsers = true;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = argv[i + 1];
      if (!value || value.startsWith('--')) {
        throw new Error(`Falta valor para ${arg}`);
      }
      i += 1;
      if (['admins', 'batchSize', 'clients', 'garments', 'seed', 'vendors'].includes(key)) {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed < 0) {
          throw new Error(`${arg} debe ser un numero valido.`);
        }
        args[key] = Math.floor(parsed);
      } else if (key === 'password' || key === 'prefix') {
        args[key] = value;
      } else if (key === 'service-account') {
        args.serviceAccount = value;
      } else if (key === 'vendor-phone') {
        args.vendorPhone = value;
      } else if (key === 'writer-email') {
        args.writerEmail = value;
      } else if (key === 'writer-password') {
        args.writerPassword = value;
      } else {
        throw new Error(`Opcion no reconocida: ${arg}`);
      }
    }
  }

  if (args.vendors < 1) {
    throw new Error('Necesitas al menos 1 vendedor para crear prendas.');
  }
  if (args.batchSize < 1 || args.batchSize > 500) {
    throw new Error('--batchSize debe estar entre 1 y 500.');
  }
  if (Boolean(args.writerEmail) !== Boolean(args.writerPassword)) {
    throw new Error('Usa --writer-email y --writer-password juntos.');
  }
  return args;
}

function printHelp() {
  console.log(`
Seed masivo para OutfitCatalog

Opciones:
  --admins N       Admins de prueba. Default: ${DEFAULTS.admins}
  --vendors N      Vendedores de prueba. Default: ${DEFAULTS.vendors}
  --clients N      Clientes de prueba. Default: ${DEFAULTS.clients}
  --garments N     Prendas/articulos. Default: ${DEFAULTS.garments}
  --batchSize N    Escrituras por commit Firestore, max 500. Default: ${DEFAULTS.batchSize}
  --prefix TXT     Prefijo de IDs/emails. Default: ${DEFAULTS.prefix}
  --seed N         Semilla deterministica. Default: ${DEFAULTS.seed}
  --auth-users     Tambien crea usuarios reales en Firebase Auth.
  --password TXT   Password para usuarios creados con --auth-users. Default: ${DEFAULTS.password}
  --vendor-phone TXT
                  Telefono para todos los vendedores. Default: ${DEFAULTS.vendorPhone}
  --service-account PATH
                  Usa una cuenta de servicio para escribir aunque las reglas esten cerradas.
  --writer-email EMAIL
                  Usuario Firebase Auth que firmara escrituras Firestore.
  --writer-password TXT
                  Password del usuario indicado en --writer-email.
  --dry-run        Genera datos y resumen sin escribir en Firebase.

Notas:
  - Por defecto crea documentos en Firestore users/garments.
  - Usa --auth-users si quieres poder iniciar sesion con los usuarios de prueba.
  - Si ya existen usuarios Auth con esos emails, intentara reutilizarlos con la misma password.
  - Para una base limpia con reglas seguras, lo recomendado es --service-account.
`);
}

function mulberry32(seed) {
  let value = seed >>> 0;
  return function random() {
    value += 0x6D2B79F5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makePicker(random) {
  return function pick(items) {
    return items[Math.floor(random() * items.length)];
  };
}

function pad(num, size) {
  return String(num).padStart(size, '0');
}

function iso(offsetMinutes = 0) {
  return new Date(Date.now() - offsetMinutes * 60 * 1000).toISOString();
}

function slug(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const FIRST_NAMES = [
  'Camila', 'Valentina', 'Sofia', 'Isabella', 'Laura', 'Daniela', 'Manuela', 'Lucia',
  'Mariana', 'Paula', 'Antonia', 'Juliana', 'Natalia', 'Carolina', 'Gabriela', 'Sara',
  'Mateo', 'Santiago', 'Nicolas', 'Sebastian', 'Andres', 'Tomas', 'Lucas', 'Emilio',
  'Felipe', 'Martin', 'Juan', 'Samuel', 'Alejandro', 'Daniel',
];

const LAST_NAMES = [
  'Rojas', 'Gomez', 'Martinez', 'Rodriguez', 'Perez', 'Garcia', 'Morales', 'Castro',
  'Vargas', 'Torres', 'Ramirez', 'Mendoza', 'Navarro', 'Salazar', 'Herrera', 'Cortes',
  'Lopez', 'Mejia', 'Ortega', 'Valencia',
];

const STORE_ADJECTIVES = [
  'Atelier', 'Studio', 'Casa', 'Galeria', 'Distrito', 'Linea', 'Aura', 'Nube',
  'Sello', 'Origen', 'Norte', 'Sur', 'Musa', 'Raiz', 'Vera', 'Luna',
];

const STORE_NOUNS = [
  'Couture', 'Urbana', 'Lino', 'Denim', 'Seda', 'Capsula', 'Minimal', 'Boho',
  'Noche', 'Avenida', 'Taller', 'Look', 'Moda', 'Vestir', 'Ropa', 'Prendas',
];

const CITIES = [
  'Bogota', 'Medellin', 'Cali', 'Barranquilla', 'Bucaramanga', 'Pereira', 'Cartagena',
  'Manizales', 'Armenia', 'Santa Marta',
];

const CATEGORIES = [
  'Vestidos', 'Blusas', 'Camisas', 'Camisetas', 'Tops', 'Pantalones', 'Jeans', 'Faldas',
  'Chaquetas', 'Blazers', 'Sudaderas', 'Conjuntos', 'Kimonos', 'Cardigans', 'Abrigos',
  'Shorts', 'Enterizos', 'Accesorios', 'Ropa de bano', 'Deportivo',
];

const PRODUCT_BASE = {
  Vestidos: ['Vestido midi', 'Vestido coctel', 'Vestido camisero', 'Vestido lencero', 'Vestido boho'],
  Blusas: ['Blusa satinada', 'Blusa cuello lazo', 'Blusa manga globo', 'Blusa romantica'],
  Camisas: ['Camisa oversize', 'Camisa popelina', 'Camisa lino', 'Camisa denim'],
  Camisetas: ['Camiseta basica', 'Camiseta grafica', 'Camiseta ribbed', 'Camiseta crop'],
  Tops: ['Top crochet', 'Top halter', 'Top bustier', 'Top asimetrico'],
  Pantalones: ['Pantalon palazzo', 'Pantalon sastre', 'Pantalon lino', 'Pantalon cargo'],
  Jeans: ['Jean mom fit', 'Jean wide leg', 'Jean recto', 'Jean flare'],
  Faldas: ['Falda plisada', 'Falda satinada', 'Falda mini', 'Falda cargo'],
  Chaquetas: ['Chaqueta denim', 'Chaqueta bomber', 'Chaqueta biker', 'Chaqueta acolchada'],
  Blazers: ['Blazer estructurado', 'Blazer lino', 'Blazer ejecutivo', 'Blazer corto'],
  Sudaderas: ['Sudadera oversize', 'Hoodie premium', 'Buzo crop', 'Sudadera fleece'],
  Conjuntos: ['Conjunto deportivo', 'Set sastre', 'Set lino', 'Conjunto ribbed'],
  Kimonos: ['Kimono floral', 'Kimono satinado', 'Kimono playa', 'Kimono bordado'],
  Cardigans: ['Cardigan largo', 'Cardigan botones', 'Cardigan tejido', 'Cardigan crop'],
  Abrigos: ['Abrigo lana', 'Trench clasico', 'Abrigo largo', 'Gabardina fluida'],
  Shorts: ['Short lino', 'Short denim', 'Bermuda sastre', 'Short deportivo'],
  Enterizos: ['Enterizo fluido', 'Jumpsuit sastre', 'Enterizo denim', 'Enterizo satinado'],
  Accesorios: ['Bolso mini', 'Cinturon cuero', 'Panuelo satinado', 'Gorra urbana'],
  'Ropa de bano': ['Bikini triangular', 'Enterizo playa', 'Top swim', 'Salida de bano'],
  Deportivo: ['Legging sculpt', 'Top deportivo', 'Short running', 'Chaqueta training'],
};

const COLORS = [
  'Negro', 'Marfil', 'Champagne', 'Beige', 'Camel', 'Gris', 'Blanco', 'Azul',
  'Verde oliva', 'Terracota', 'Vino', 'Rosa palo', 'Cafe', 'Arena', 'Dorado',
  'Lavanda', 'Rojo', 'Nude', 'Multicolor',
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'Unica', '28', '30', '32', '34'];

const MATERIALS = [
  'lino suave', 'algodon premium', 'satin ligero', 'denim rigido', 'tejido ribbed',
  'paño liviano', 'fleece suave', 'crochet artesanal', 'viscosa fluida', 'gabardina',
];

const FITS = [
  'corte relajado', 'silueta estructurada', 'fit ajustado', 'caida fluida',
  'tiro alto', 'manga amplia', 'largo midi', 'acabado minimal',
];

const OCCASIONS = [
  'oficina', 'fin de semana', 'evento nocturno', 'viaje', 'look casual', 'cena',
  'clima calido', 'dias frios', 'streetwear', 'capsula diaria',
];

const IMAGE_URLS = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=80',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&q=80',
  'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=900&q=80',
  'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=900&q=80',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&q=80',
  'https://images.unsplash.com/photo-1490481974074-c20ba1cbc50b?w=900&q=80',
  'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=900&q=80',
  'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=900&q=80',
  'https://images.unsplash.com/photo-1594938298603-a3e98cd93b3c?w=900&q=80',
  'https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=900&q=80',
  'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=900&q=80',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&q=80',
  'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=900&q=80',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&q=80',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&q=80',
  'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=900&q=80',
  'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=900&q=80',
  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900&q=80',
  'https://images.unsplash.com/photo-1520975661595-6453be3f7070?w=900&q=80',
  'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&q=80',
  'https://images.unsplash.com/photo-1495385794356-15371f348c31?w=900&q=80',
  'https://images.unsplash.com/photo-1542295669297-4d352b042bca?w=900&q=80',
  'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=900&q=80',
  'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=900&q=80',
  'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=900&q=80',
  'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=900&q=80',
  'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=900&q=80',
  'https://images.unsplash.com/photo-1506629905607-d9d297d0f5f6?w=900&q=80',
  'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=900&q=80',
];

function randomPhone(index) {
  return `573${String(100000000 + index * 7919).slice(0, 9)}`;
}

function buildPerson(index, role, prefix, pick) {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const roleSlug = role === 'user' ? 'client' : role;
  const email = `${prefix}.${roleSlug}.${pad(index, 4)}@outfit.test`;
  return {
    deterministicId: `${role}-${prefix}-${pad(index, 4)}`,
    name: `${first} ${last}`,
    email,
    phone: randomPhone(index),
    role,
  };
}

function buildVendors(count, prefix, pick, vendorPhone) {
  const vendors = [];
  for (let i = 1; i <= count; i += 1) {
    const base = buildPerson(i, 'vendor', prefix, pick);
    const storeName = `${pick(STORE_ADJECTIVES)} ${pick(STORE_NOUNS)}`;
    vendors.push({
      ...base,
      phone: vendorPhone,
      city: pick(CITIES),
      storeName: `${storeName} ${pad(i, 2)}`,
    });
  }
  return vendors;
}

function buildUsers(args, pick) {
  const admins = [];
  const clients = [];
  const vendors = buildVendors(args.vendors, args.prefix, pick, args.vendorPhone);

  for (let i = 1; i <= args.admins; i += 1) {
    admins.push(buildPerson(i, 'admin', args.prefix, pick));
  }

  for (let i = 1; i <= args.clients; i += 1) {
    clients.push(buildPerson(i, 'user', args.prefix, pick));
  }

  return { admins, clients, vendors };
}

function buildGarments(count, vendors, random, pick, prefix) {
  const garments = [];

  for (let i = 1; i <= count; i += 1) {
    const vendor = vendors[(i - 1) % vendors.length];
    const category = pick(CATEGORIES);
    const baseName = pick(PRODUCT_BASE[category] ?? PRODUCT_BASE.Vestidos);
    const color = pick(COLORS);
    const size = pick(SIZES);
    const material = pick(MATERIALS);
    const fit = pick(FITS);
    const occasion = pick(OCCASIONS);
    const price = Math.round((45000 + random() * 310000) / 5000) * 5000;
    const stock = Math.floor(random() * 19);
    const image = IMAGE_URLS[(i - 1) % IMAGE_URLS.length];
    const createdOffset = Math.floor(random() * 60 * 24 * 35);
    const now = iso(createdOffset);

    garments.push({
      id: `garment-${prefix}-${pad(i, 6)}`,
      name: `${baseName} ${color}`,
      category,
      price,
      imageUrl: `${image}&auto=format&fit=crop&seed=${i}`,
      description: `${baseName} en ${material}, ${fit}. Pensado para ${occasion} y combinaciones de catalogo.`,
      size,
      color,
      stock,
      vendorId: vendor.id,
      vendorName: vendor.name,
      published: random() > 0.06,
      createdAt: now,
      updatedAt: now,
    });
  }

  return garments;
}

function toFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return { integerValue: String(value) };
    return { doubleValue: value };
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestoreValue) } };
  }
  if (typeof value === 'object') {
    return { mapValue: { fields: toFirestoreFields(value) } };
  }
  return { stringValue: String(value) };
}

function toFirestoreFields(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, toFirestoreValue(value)]),
  );
}

function docName(projectId, collection, docId) {
  const safeDocId = encodeURIComponent(docId).replace(/%2F/g, '/');
  return `projects/${projectId}/databases/(default)/documents/${collection}/${safeDocId}`;
}

function writeUpdate(projectId, collection, docId, data) {
  return {
    update: {
      name: docName(projectId, collection, docId),
      fields: toFirestoreFields(data),
    },
  };
}

async function commitBatch(projectId, apiKey, writes, authToken = '') {
  const keyParam = authToken ? '' : `?key=${apiKey}`;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit${keyParam}`;
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ writes }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Firestore commit fallo (${res.status}): ${body}`);
  }
}

async function commitAll(projectId, apiKey, writes, batchSize, authToken = '') {
  let done = 0;
  for (let i = 0; i < writes.length; i += batchSize) {
    const batch = writes.slice(i, i + batchSize);
    await commitBatch(projectId, apiKey, batch, authToken);
    done += batch.length;
    console.log(`  Firestore: ${done}/${writes.length} documentos escritos`);
  }
}

async function authRequest(apiKey, endpoint, payload) {
  const url = `https://identitytoolkit.googleapis.com/v1/${endpoint}?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    const code = data?.error?.message ?? `HTTP_${res.status}`;
    const err = new Error(code);
    err.code = code;
    throw err;
  }
  return data;
}

async function ensureAuthUser(apiKey, user, password) {
  try {
    const created = await authRequest(apiKey, 'accounts:signUp', {
      email: user.email,
      password,
      displayName: user.name,
      returnSecureToken: true,
    });
    return created.localId;
  } catch (error) {
    if (error.code !== 'EMAIL_EXISTS') throw error;
    const signed = await authRequest(apiKey, 'accounts:signInWithPassword', {
      email: user.email,
      password,
      returnSecureToken: true,
    });
    return signed.localId;
  }
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

async function lookupAdminAuthUser(projectId, apiKey, accessToken, user) {
  try {
    const byEmail = await adminAuthRequest(projectId, apiKey, accessToken, ':lookup', {
      email: [user.email],
    });
    const found = byEmail?.users?.[0];
    if (found?.localId) return found.localId;
  } catch (error) {
    if (error.code !== 'EMAIL_NOT_FOUND' && error.code !== 'USER_NOT_FOUND') throw error;
  }

  try {
    const byLocalId = await adminAuthRequest(projectId, apiKey, accessToken, ':lookup', {
      localId: [user.deterministicId],
    });
    return byLocalId?.users?.[0]?.localId ?? null;
  } catch (error) {
    if (error.code !== 'EMAIL_NOT_FOUND' && error.code !== 'USER_NOT_FOUND') throw error;
    return null;
  }
}

async function ensureAuthUserWithServiceAccount(projectId, apiKey, accessToken, user, password) {
  const existingUid = await lookupAdminAuthUser(projectId, apiKey, accessToken, user);
  if (existingUid) return existingUid;

  try {
    const created = await adminAuthRequest(projectId, apiKey, accessToken, '', {
      localId: user.deterministicId,
      email: user.email,
      password,
      displayName: user.name,
      emailVerified: true,
      disabled: false,
    }, true);
    return created.localId || user.deterministicId;
  } catch (error) {
    if (error.code !== 'EMAIL_EXISTS' && error.code !== 'LOCAL_ID_EXISTS') throw error;
    const retryUid = await lookupAdminAuthUser(projectId, apiKey, accessToken, user);
    if (retryUid) return retryUid;
    throw error;
  }
}

async function signInWriter(apiKey, email, password) {
  const signed = await authRequest(apiKey, 'accounts:signInWithPassword', {
    email,
    password,
    returnSecureToken: true,
  });

  return signed.idToken;
}

async function attachAuthIdsWithServiceAccount(projectId, apiKey, accessToken, users, password) {
  const all = [...users.admins, ...users.vendors, ...users.clients];
  console.log(`\nCreando/reutilizando ${all.length} usuarios en Firebase Auth con service account...`);

  for (let i = 0; i < all.length; i += 1) {
    const user = all[i];
    const uid = await ensureAuthUserWithServiceAccount(projectId, apiKey, accessToken, user, password);
    user.id = uid;
    if ((i + 1) % 25 === 0 || i === all.length - 1) {
      console.log(`  Auth admin: ${i + 1}/${all.length}`);
    }
  }
}

async function attachAuthIds(apiKey, users, password) {
  const all = [...users.admins, ...users.vendors, ...users.clients];
  console.log(`\nCreando/reutilizando ${all.length} usuarios en Firebase Auth...`);

  for (let i = 0; i < all.length; i += 1) {
    const user = all[i];
    const uid = await ensureAuthUser(apiKey, user, password);
    user.id = uid;
    if ((i + 1) % 25 === 0 || i === all.length - 1) {
      console.log(`  Auth: ${i + 1}/${all.length}`);
    }
  }
}

function attachDeterministicIds(users) {
  for (const user of [...users.admins, ...users.vendors, ...users.clients]) {
    user.id = user.deterministicId;
  }
}

function userDoc(user, extra = {}) {
  return {
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: iso(),
    updatedAt: iso(),
    ...extra,
  };
}

async function main() {
  loadDotEnv();
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const firebaseApiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY || FALLBACK_FIREBASE_API_KEY;
  const firebaseProjectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || FALLBACK_FIREBASE_PROJECT_ID;
  if (!firebaseApiKey || !firebaseProjectId) {
    throw new Error('Faltan EXPO_PUBLIC_FIREBASE_API_KEY y EXPO_PUBLIC_FIREBASE_PROJECT_ID.');
  }

  const random = mulberry32(args.seed);
  const pick = makePicker(random);
  const users = buildUsers(args, pick);
  let firestoreAuthToken = '';

  if (args.serviceAccount && !args.dryRun) {
    console.log('\nObteniendo token de service account...');
    firestoreAuthToken = await getServiceAccountAccessToken(args.serviceAccount);
  }

  if (args.authUsers && !args.dryRun) {
    if (firestoreAuthToken) {
      await attachAuthIdsWithServiceAccount(
        firebaseProjectId,
        firebaseApiKey,
        firestoreAuthToken,
        users,
        args.password,
      );
    } else {
      await attachAuthIds(firebaseApiKey, users, args.password);
    }
  } else {
    attachDeterministicIds(users);
  }

  const garments = buildGarments(args.garments, users.vendors, random, pick, args.prefix);
  const allUsers = [...users.admins, ...users.vendors, ...users.clients];
  const writes = [];

  for (const admin of users.admins) {
    writes.push(writeUpdate(firebaseProjectId, 'users', admin.id, userDoc(admin)));
  }
  for (const vendor of users.vendors) {
    writes.push(writeUpdate(firebaseProjectId, 'users', vendor.id, userDoc(vendor, {
      city: vendor.city,
      storeName: vendor.storeName,
    })));
  }
  for (const client of users.clients) {
    writes.push(writeUpdate(firebaseProjectId, 'users', client.id, userDoc(client)));
  }
  for (const garment of garments) {
    writes.push(writeUpdate(firebaseProjectId, 'garments', garment.id, garment));
  }

  console.log('\nSeed masivo listo para OutfitCatalog');
  console.log(`  Proyecto Firebase: ${firebaseProjectId}`);
  console.log(`  Admins: ${users.admins.length}`);
  console.log(`  Vendedores: ${users.vendors.length}`);
  console.log(`  Clientes: ${users.clients.length}`);
  console.log(`  Prendas: ${garments.length}`);
  console.log(`  Usuarios Auth: ${args.authUsers ? 'si' : 'no'}`);
  console.log(`  Total documentos Firestore: ${writes.length}`);
  console.log(`  Escritura Firestore: ${args.serviceAccount ? 'service account' : args.writerEmail ? 'usuario autenticado' : 'API key'}`);

  if (allUsers[0]) {
    console.log('\nUsuario de muestra:');
    console.log(`  Email: ${allUsers[0].email}`);
    console.log(`  Password: ${args.authUsers ? args.password : '(solo documento Firestore, no login)'}`);
  }
  if (users.vendors[0]) {
    console.log('\nVendedor de muestra:');
    console.log(`  Email: ${users.vendors[0].email}`);
    console.log(`  Phone: ${users.vendors[0].phone}`);
    console.log(`  Store: ${users.vendors[0].storeName}`);
  }

  if (args.dryRun) {
    console.log('\nDry run: no se escribio nada en Firebase.');
    return;
  }

  if (!firestoreAuthToken && args.writerEmail) {
    console.log('\nIniciando sesion del usuario escritor...');
    firestoreAuthToken = await signInWriter(firebaseApiKey, args.writerEmail, args.writerPassword);
  }

  console.log('\nEscribiendo documentos en Firestore...');
  await commitAll(firebaseProjectId, firebaseApiKey, writes, args.batchSize, firestoreAuthToken);
  console.log('\nSeed masivo completo. Abre la app y sincroniza el catalogo.');
}

main().catch((err) => {
  console.error('\nError en seed masivo:', err.message);
  process.exit(1);
});
