#!/usr/bin/env node
// Usage: node scripts/seed.js <admin-email> <admin-password>
// Requires Node 18+ (native fetch)

const FIREBASE_API_KEY = 'AIzaSyCufMwgMdz1dH8-tY2Xja35uAJee0ojpbw';
const FIREBASE_PROJECT_ID = 'outfitcatalog-bb66c';
const CLOUDINARY_CLOUD = 'dnfxp64lu';
const CLOUDINARY_PRESET = 'OutfitCatalog';

const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`;
const TEST_VENDOR_PHONE = '+573104221496';

// ── Fashion images from Unsplash ──────────────────────────────────────────────
const FASHION_IMAGES = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80',
  'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600&q=80',
  'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80',
  'https://images.unsplash.com/photo-1490481974074-c20ba1cbc50b?w=600&q=80',
  'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=80',
  'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&q=80',
  'https://images.unsplash.com/photo-1594938298603-a3e98cd93b3c?w=600&q=80',
  'https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=600&q=80',
  'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&q=80',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80',
  'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80',
];

// ── Seed data ─────────────────────────────────────────────────────────────────
const VENDORS = [
  {
    id: 'vendor-seed-001',
    name: 'María López',
    email: 'maria@boutique-elegance.co',
    phone: TEST_VENDOR_PHONE,
    storeName: 'Boutique Élégance',
  },
  {
    id: 'vendor-seed-002',
    name: 'Carlos Pérez',
    email: 'carlos@modaurbana.co',
    phone: TEST_VENDOR_PHONE,
    storeName: 'Moda Urbana Co.',
  },
  {
    id: 'vendor-seed-003',
    name: 'Ana García',
    email: 'ana@casacouture.co',
    phone: TEST_VENDOR_PHONE,
    storeName: 'Casa Couture',
  },
];

const GARMENTS_RAW = [
  // ── Boutique Élégance (vendor-seed-001) ──
  {
    name: 'Vestido Cóctel Negro',
    category: 'Vestidos',
    price: 180000,
    size: 'M',
    color: 'Negro',
    stock: 3,
    description: 'Vestido de cóctel en tela satinada con escote en V. Perfecto para eventos formales y cenas elegantes.',
    vendorIdx: 0,
  },
  {
    name: 'Blazer Ejecutivo Beige',
    category: 'Chaquetas',
    price: 250000,
    size: 'S',
    color: 'Beige',
    stock: 5,
    description: 'Blazer de corte recto en tono beige clásico. Ideal para looks de oficina o casual elegante.',
    vendorIdx: 0,
  },
  {
    name: 'Falda Plisada Nude',
    category: 'Faldas',
    price: 120000,
    size: 'S',
    color: 'Nude',
    stock: 8,
    description: 'Falda midi plisada en tono nude con cintura elástica. Combinable con cualquier tipo de top.',
    vendorIdx: 0,
  },
  {
    name: 'Blusa Satinada Vino',
    category: 'Blusas',
    price: 95000,
    size: 'M',
    color: 'Vino',
    stock: 6,
    description: 'Blusa fluida de satín en color vino con manga larga y cuello lazo.',
    vendorIdx: 0,
  },
  {
    name: 'Pantalón Palazzo Crema',
    category: 'Pantalones',
    price: 140000,
    size: 'L',
    color: 'Crema',
    stock: 4,
    description: 'Pantalón palazzo de tiro alto en lino crema. Elegante y cómodo para cualquier temporada.',
    vendorIdx: 0,
  },

  // ── Moda Urbana Co. (vendor-seed-002) ──
  {
    name: 'Sudadera Oversize Gris',
    category: 'Sudaderas',
    price: 85000,
    size: 'L',
    color: 'Gris',
    stock: 12,
    description: 'Sudadera oversize en fleece gris jaspeado. Corte relajado con capucha ajustable.',
    vendorIdx: 1,
  },
  {
    name: 'Jeans Mom Azul Clásico',
    category: 'Pantalones',
    price: 110000,
    size: '30',
    color: 'Azul',
    stock: 9,
    description: 'Jeans mom fit de tiro alto en denim azul stonewash. Con rotos naturales en las rodillas.',
    vendorIdx: 1,
  },
  {
    name: 'Crop Top Ribbed Blanco',
    category: 'Camisetas',
    price: 55000,
    size: 'S',
    color: 'Blanco',
    stock: 15,
    description: 'Crop top de punto acanalado en blanco con manga corta y escote redondo.',
    vendorIdx: 1,
  },
  {
    name: 'Chaqueta Denim Vintage',
    category: 'Chaquetas',
    price: 165000,
    size: 'M',
    color: 'Azul',
    stock: 7,
    description: 'Chaqueta de mezclilla de corte clásico con detalles desgastados. Estilo noventero.',
    vendorIdx: 1,
  },
  {
    name: 'Conjunto Deportivo Negro',
    category: 'Conjuntos',
    price: 145000,
    size: 'M',
    color: 'Negro',
    stock: 6,
    description: 'Conjunto deportivo de dos piezas en tela sculpt. Top con soporte y legging de cintura alta.',
    vendorIdx: 1,
  },

  // ── Casa Couture (vendor-seed-003) ──
  {
    name: 'Vestido Boho Floral',
    category: 'Vestidos',
    price: 155000,
    size: 'M',
    color: 'Multicolor',
    stock: 4,
    description: 'Vestido largo de estilo bohemio en gasa floral. Con mangas acampanadas y bordado en el escote.',
    vendorIdx: 2,
  },
  {
    name: 'Kimono Floral Salmón',
    category: 'Kimonos',
    price: 130000,
    size: 'Única',
    color: 'Salmón',
    stock: 5,
    description: 'Kimono estampado con flores orientales en salmón y blanco. Talla única, fluido y ligero.',
    vendorIdx: 2,
  },
  {
    name: 'Top Crochet Beige',
    category: 'Tops',
    price: 75000,
    size: 'S',
    color: 'Beige',
    stock: 8,
    description: 'Top de crochet artesanal en beige natural. Tejido a mano con terminaciones en flecos.',
    vendorIdx: 2,
  },
  {
    name: 'Pantalón Lino Terracota',
    category: 'Pantalones',
    price: 120000,
    size: 'M',
    color: 'Terracota',
    stock: 6,
    description: 'Pantalón de lino 100% en terracota con bolsillos laterales y corte recto holgado.',
    vendorIdx: 2,
  },
  {
    name: 'Cardigan Largo Camel',
    category: 'Cardigans',
    price: 185000,
    size: 'M',
    color: 'Camel',
    stock: 3,
    description: 'Cardigan largo tejido en camel con botones dorados. Abriga y estiliza con cualquier look.',
    vendorIdx: 2,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function iso() {
  return new Date().toISOString();
}


async function uploadToCloudinary(imageUrl) {
  const body = new URLSearchParams({ file: imageUrl, upload_preset: CLOUDINARY_PRESET });
  const res = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Cloudinary: ${JSON.stringify(data.error)}`);
  return data.secure_url;
}

function toFirestoreFields(obj) {
  const fields = {};
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === 'string') fields[key] = { stringValue: val };
    else if (typeof val === 'number') fields[key] = { integerValue: String(val) };
    else if (typeof val === 'boolean') fields[key] = { booleanValue: val };
  }
  return fields;
}

async function firestoreSet(collection, docId, data) {
  const url = `${FIRESTORE_BASE}/${collection}/${docId}?key=${FIREBASE_API_KEY}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: toFirestoreFields(data) }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Firestore ${collection}/${docId}: ${JSON.stringify(err.error)}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {

  // 1. Upload images to Cloudinary
  console.log('\n📸 Subiendo imágenes a Cloudinary...');
  const uploadedUrls = [];
  for (let i = 0; i < GARMENTS_RAW.length; i++) {
    const unsplashUrl = FASHION_IMAGES[i % FASHION_IMAGES.length];
    process.stdout.write(`  [${i + 1}/${GARMENTS_RAW.length}] Subiendo imagen...`);
    try {
      const url = await uploadToCloudinary(unsplashUrl);
      uploadedUrls.push(url);
      process.stdout.write(` ✓\n`);
    } catch (e) {
      process.stdout.write(` ✗ (usando URL original)\n`);
      uploadedUrls.push(unsplashUrl);
    }
  }

  // 2. Insert vendors into Firestore users collection
  console.log('\n👤 Creando vendedores en Firestore...');
  for (const vendor of VENDORS) {
    await firestoreSet('users', vendor.id, {
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      role: 'vendor',
      createdAt: iso(),
    });
    console.log(`  ✓ ${vendor.storeName} (${vendor.name})`);
  }

  // 3. Insert garments into Firestore
  console.log('\n👗 Insertando prendas en Firestore...');
  for (let i = 0; i < GARMENTS_RAW.length; i++) {
    const g = GARMENTS_RAW[i];
    const vendor = VENDORS[g.vendorIdx];
    const garmentId = `garment-seed-${String(i + 1).padStart(3, '0')}`;
    const now = iso();

    await firestoreSet('garments', garmentId, {
      name: g.name,
      category: g.category,
      price: g.price,
      imageUrl: uploadedUrls[i],
      description: g.description,
      size: g.size,
      color: g.color,
      stock: g.stock,
      vendorId: vendor.id,
      vendorName: vendor.name,
      published: true,
      createdAt: now,
      updatedAt: now,
    });

    console.log(`  ✓ [${vendor.storeName}] ${g.name} — ${g.color} ${g.size} — $${g.price.toLocaleString()}`);
  }

  console.log(`\n✨ Seed completo: ${VENDORS.length} vendedores y ${GARMENTS_RAW.length} prendas insertadas.`);
  console.log('   Abre la app y sincroniza para verlos.\n');
}

main().catch((err) => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
