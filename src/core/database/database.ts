import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME, DATABASE_VERSION, migrations } from './migrations';
import { SqliteClient, SqliteClientProvider } from './sqliteClient';

let databasePromise: Promise<SqliteClient> | null = null;

function toNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }

  return Number(value ?? 0);
}

async function applyMigration(
  database: SqliteClient,
  migrationVersion: number,
  statements: string[],
): Promise<void> {
  for (const statement of statements) {
    await database.execAsync(statement);
  }

  await database.runAsync(
    `INSERT INTO schema_meta (key, value)
     VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    'schema_version',
    String(migrationVersion),
  );
}

async function initializeDatabase(): Promise<SqliteClient> {
  const database = (await SQLite.openDatabaseAsync(DATABASE_NAME)) as unknown as SqliteClient;
  await database.execAsync('PRAGMA foreign_keys = ON;');

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    )
  `);

  const schemaRow = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM schema_meta WHERE key = ?',
    'schema_version',
  );
  const currentVersion = toNumber(schemaRow?.value);

  for (const migration of migrations) {
    if (migration.version <= currentVersion) {
      continue;
    }

    await database.execAsync('BEGIN');
    try {
      await applyMigration(database, migration.version, migration.statements);

      await database.execAsync('COMMIT');
    } catch (error) {
      await database.execAsync('ROLLBACK');
      throw error;
    }
  }

  await database.runAsync(
    `INSERT INTO schema_meta (key, value)
     VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    'schema_version',
    String(DATABASE_VERSION),
  );

  return database;
}

export function getDatabase(): Promise<SqliteClient> {
  if (!databasePromise) {
    databasePromise = initializeDatabase();
  }

  return databasePromise;
}

export type DatabaseTableSnapshot = {
  name: string;
  rowCount: number;
  previewRows: Record<string, unknown>[];
};

export type DatabaseSnapshot = {
  databaseName: string;
  schemaVersion: number;
  tables: DatabaseTableSnapshot[];
};

export async function getDatabaseSnapshot(): Promise<DatabaseSnapshot> {
  const database = await getDatabase();
  const schemaRow = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM schema_meta WHERE key = ?',
    'schema_version',
  );

  const tableRows = await database.getAllAsync<{ name: string }>(
    `SELECT name
     FROM sqlite_master
     WHERE type = 'table'
       AND name NOT LIKE 'sqlite_%'
       AND name <> 'schema_meta'
     ORDER BY name ASC`,
  );

  const tables: DatabaseTableSnapshot[] = [];

  for (const table of tableRows) {
    const countRow = await database.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) AS count FROM ${table.name}`,
    );
    const previewRows = await database.getAllAsync<Record<string, unknown>>(
      `SELECT * FROM ${table.name} LIMIT 5`,
    );

    tables.push({
      name: table.name,
      rowCount: Number(countRow?.count ?? 0),
      previewRows,
    });
  }

  return {
    databaseName: DATABASE_NAME,
    schemaVersion: toNumber(schemaRow?.value),
    tables,
  };
}

export type { SqliteClient, SqliteClientProvider } from './sqliteClient';
