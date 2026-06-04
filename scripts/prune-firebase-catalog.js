#!/usr/bin/env node
// Prunes the Firestore garments collection to a small, demo-friendly catalog.
// Usage:
//   node scripts/prune-firebase-catalog.js --dry-run
//   node scripts/prune-firebase-catalog.js --limit 100 --yes
//   node scripts/prune-firebase-catalog.js --service-account "C:\path\service-account.json" --limit 100 --yes

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const FALLBACK_FIREBASE_PROJECT_ID = 'outfitcatalog-bb66c';
const DEFAULT_LIMIT = 100;
const DEFAULT_BATCH_SIZE = 400;

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
    batchSize: DEFAULT_BATCH_SIZE,
    collection: 'garments',
    dryRun: false,
    help: false,
    limit: DEFAULT_LIMIT,
    serviceAccount: process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
    yes: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--yes') args.yes = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = argv[i + 1];
      if (!value || value.startsWith('--')) {
        throw new Error(`Falta valor para ${arg}`);
      }
      i += 1;

      if (key === 'limit' || key === 'batchSize') {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed < 1) {
          throw new Error(`${arg} debe ser un numero mayor a 0.`);
        }
        args[key] = Math.floor(parsed);
      } else if (key === 'collection') {
        args.collection = value;
      } else if (key === 'service-account') {
        args.serviceAccount = value;
      } else {
        throw new Error(`Opcion no reconocida: ${arg}`);
      }
    }
  }

  if (args.batchSize > 500) {
    throw new Error('--batchSize no puede superar 500 por limite de Firestore commit.');
  }
  if (args.collection !== 'garments') {
    throw new Error('Por seguridad este script solo permite podar la coleccion garments.');
  }

  return args;
}

function printHelp() {
  console.log(`
Poda de catalogo Firestore para OutfitCatalog

Opciones:
  --limit N            Cantidad final de prendas a conservar. Default: ${DEFAULT_LIMIT}
  --service-account P  JSON de cuenta de servicio Firebase.
  --batchSize N        Deletes por commit, max 500. Default: ${DEFAULT_BATCH_SIZE}
  --dry-run            Muestra el plan sin borrar nada.
  --yes                Ejecuta la eliminacion real.

Notas:
  - Solo toca Firestore/garments.
  - Conserva primero prendas publicadas, con stock y datos completos.
  - Hace round-robin por categoria para dejar variedad.
  - Guarda backup local en artifacts/ antes de borrar.
`);
}

function findDefaultServiceAccount(projectId) {
  const downloads = path.join(os.homedir(), 'Downloads');
  if (!fs.existsSync(downloads)) return '';

  const candidates = fs
    .readdirSync(downloads)
    .filter((name) => name.endsWith('.json') && name.includes(projectId))
    .map((name) => path.join(downloads, name))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

  return candidates[0] || '';
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

function fromFirestoreValue(value) {
  if (!value || typeof value !== 'object') return undefined;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return Boolean(value.booleanValue);
  if ('timestampValue' in value) return value.timestampValue;
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) {
    return (value.arrayValue.values || []).map(fromFirestoreValue);
  }
  if ('mapValue' in value) {
    return fromFirestoreFields(value.mapValue.fields || {});
  }
  return undefined;
}

function fromFirestoreFields(fields = {}) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, fromFirestoreValue(value)]),
  );
}

function normalizeDoc(projectId, doc) {
  const id = decodeURIComponent(doc.name.split('/').pop() || '');
  const data = fromFirestoreFields(doc.fields || {});
  return {
    id,
    name: doc.name,
    shortName: doc.name.replace(`projects/${projectId}/databases/(default)/documents/`, ''),
    data,
  };
}

async function listCollection(projectId, collection, accessToken) {
  const docs = [];
  let pageToken = '';

  do {
    const params = new URLSearchParams({ pageSize: '500' });
    if (pageToken) params.set('pageToken', pageToken);
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}?${params}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(`No se pudo listar ${collection} (${res.status}): ${JSON.stringify(body)}`);
    }

    for (const doc of body.documents || []) {
      docs.push(normalizeDoc(projectId, doc));
    }
    pageToken = body.nextPageToken || '';
  } while (pageToken);

  return docs;
}

function docScore(doc) {
  const data = doc.data;
  let score = 0;
  if (!doc.id.startsWith('garment-mass-')) score += 5000;
  if (data.published !== false) score += 2000;
  if (Number(data.stock || 0) > 0) score += 800;
  if (typeof data.imageUrl === 'string' && data.imageUrl.trim()) score += 400;
  if (typeof data.vendorId === 'string' && data.vendorId.trim()) score += 250;
  if (typeof data.name === 'string' && data.name.trim()) score += 150;
  if (typeof data.createdAt === 'string') score += Date.parse(data.createdAt) / 100000000000;
  return score;
}

function selectDocsToKeep(docs, limit) {
  const byCategory = new Map();

  for (const doc of docs) {
    const category = typeof doc.data.category === 'string' && doc.data.category.trim()
      ? doc.data.category.trim()
      : 'Sin categoria';
    if (!byCategory.has(category)) byCategory.set(category, []);
    byCategory.get(category).push(doc);
  }

  for (const categoryDocs of byCategory.values()) {
    categoryDocs.sort((a, b) => docScore(b) - docScore(a) || a.id.localeCompare(b.id));
  }

  const categories = [...byCategory.keys()].sort((a, b) => a.localeCompare(b));
  const keep = [];
  const keepIds = new Set();

  while (keep.length < Math.min(limit, docs.length)) {
    let moved = false;
    for (const category of categories) {
      const categoryDocs = byCategory.get(category);
      const next = categoryDocs.shift();
      if (!next) continue;
      keep.push(next);
      keepIds.add(next.id);
      moved = true;
      if (keep.length >= limit) break;
    }
    if (!moved) break;
  }

  const remove = docs
    .filter((doc) => !keepIds.has(doc.id))
    .sort((a, b) => a.shortName.localeCompare(b.shortName));

  return { keep, remove };
}

function summarizeByCategory(docs) {
  const counts = new Map();
  for (const doc of docs) {
    const category = doc.data.category || 'Sin categoria';
    counts.set(category, (counts.get(category) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
    .map(([category, count]) => `${category}: ${count}`)
    .join(', ');
}

function writeBackup(projectId, collection, keep, remove) {
  const outDir = path.join(process.cwd(), 'artifacts');
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outPath = path.join(outDir, `firebase-prune-${collection}-${stamp}.json`);
  fs.writeFileSync(
    outPath,
    JSON.stringify({
      projectId,
      collection,
      createdAt: new Date().toISOString(),
      keptCount: keep.length,
      deletedCount: remove.length,
      keep,
      remove,
    }, null, 2),
  );
  return outPath;
}

async function commitDeleteBatch(projectId, accessToken, docs) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      writes: docs.map((doc) => ({ delete: doc.name })),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Firestore delete fallo (${res.status}): ${body}`);
  }
}

async function deleteDocs(projectId, accessToken, docs, batchSize) {
  let done = 0;
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize);
    await commitDeleteBatch(projectId, accessToken, batch);
    done += batch.length;
    console.log(`  Eliminadas: ${done}/${docs.length}`);
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
  if (!args.serviceAccount) {
    args.serviceAccount = findDefaultServiceAccount(projectId);
  }
  if (!args.serviceAccount) {
    throw new Error('No encontre service account. Usa --service-account "ruta.json".');
  }

  console.log('\nPoda de catalogo Firebase para OutfitCatalog');
  console.log(`  Proyecto Firebase: ${projectId}`);
  console.log(`  Coleccion: ${args.collection}`);
  console.log(`  Limite final: ${args.limit}`);
  console.log(`  Modo: ${args.yes && !args.dryRun ? 'eliminacion real' : 'dry run'}`);
  console.log(`  Service account: ${path.resolve(process.cwd(), args.serviceAccount)}`);

  const accessToken = await getServiceAccountAccessToken(args.serviceAccount);
  const docs = await listCollection(projectId, args.collection, accessToken);
  const { keep, remove } = selectDocsToKeep(docs, args.limit);
  const backupPath = writeBackup(projectId, args.collection, keep, remove);

  console.log('\nResumen');
  console.log(`  Documentos actuales: ${docs.length}`);
  console.log(`  Se conservaran: ${keep.length}`);
  console.log(`  Se eliminaran: ${remove.length}`);
  console.log(`  Categorias conservadas: ${summarizeByCategory(keep) || 'sin datos'}`);
  console.log(`  Backup local: ${backupPath}`);

  if (remove.length === 0) {
    console.log('\nNo hay documentos que eliminar.');
    return;
  }

  if (!args.yes || args.dryRun) {
    console.log('\nDry run: no se elimino nada en Firebase.');
    console.log('Para ejecutar: npm run firebase:prune-catalog -- --limit 100 --yes');
    return;
  }

  console.log('\nEliminando documentos en Firestore...');
  await deleteDocs(projectId, accessToken, remove, args.batchSize);
  console.log(`\nListo. Firestore/${args.collection} queda en ${keep.length} documentos.`);
}

main().catch((err) => {
  console.error('\nError en poda de catalogo:', err.message);
  process.exitCode = 1;
});
