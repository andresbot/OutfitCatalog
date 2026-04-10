import { INITIAL_GARMENTS } from './seedData';
import { GarmentRow } from './types';

export const DATABASE_NAME = 'outfit_catalog.db';
export const DATABASE_VERSION = 1;

export type Migration = {
  version: number;
  statements: string[];
  seedGarments?: GarmentRow[];
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
    seedGarments: INITIAL_GARMENTS.map((garment) => ({
      ...garment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
  },
];