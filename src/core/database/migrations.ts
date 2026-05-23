export const DATABASE_NAME = 'outfit_catalog.db';
export const DATABASE_VERSION = 3;

export type Migration = {
  version: number;
  statements: string[];
};

const GARMENT_COLUMNS = `
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT NOT NULL,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  stock INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
`;

export const migrations: Migration[] = [
  {
    version: 1,
    statements: [
      `PRAGMA foreign_keys = ON`,
      `CREATE TABLE IF NOT EXISTS schema_meta (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS garments (${GARMENT_COLUMNS})`,
      `CREATE TABLE IF NOT EXISTS looks (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        cover_image_url TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS look_items (
        id TEXT PRIMARY KEY NOT NULL,
        look_id TEXT NOT NULL,
        garment_id TEXT NOT NULL,
        position INTEGER NOT NULL,
        FOREIGN KEY (look_id) REFERENCES looks(id) ON DELETE CASCADE,
        FOREIGN KEY (garment_id) REFERENCES garments(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS favorites (
        id TEXT PRIMARY KEY NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(entity_type, entity_id)
      )`,
    ],
  },
  {
    version: 2,
    statements: [
      `ALTER TABLE looks ADD COLUMN user_id TEXT NOT NULL DEFAULT 'legacy-user'`,
      `CREATE INDEX IF NOT EXISTS idx_looks_user_id ON looks(user_id)`,
      `ALTER TABLE favorites RENAME TO favorites_legacy`,
      `CREATE TABLE favorites (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(user_id, entity_type, entity_id)
      )`,
      `INSERT INTO favorites (
        id,
        user_id,
        entity_type,
        entity_id,
        created_at
      )
      SELECT
        id,
        'legacy-user',
        entity_type,
        entity_id,
        created_at
      FROM favorites_legacy`,
      `DROP TABLE favorites_legacy`,
      `CREATE INDEX IF NOT EXISTS idx_favorites_user_entity
        ON favorites(user_id, entity_type, entity_id)`,
    ],
  },
  {
    version: 3,
    statements: [
      `ALTER TABLE garments ADD COLUMN vendor_id TEXT NOT NULL DEFAULT 'legacy-vendor'`,
      `ALTER TABLE garments ADD COLUMN vendor_name TEXT NOT NULL DEFAULT 'Vendedor anterior'`,
      `ALTER TABLE garments ADD COLUMN published INTEGER NOT NULL DEFAULT 0`,
      `DELETE FROM garments WHERE id IN (
        'g-001',
        'g-002',
        'g-003',
        'g-004',
        'g-005',
        'g-006'
      )`,
      `CREATE INDEX IF NOT EXISTS idx_garments_vendor_id ON garments(vendor_id)`,
      `CREATE INDEX IF NOT EXISTS idx_garments_published ON garments(published)`,
    ],
  },
];
