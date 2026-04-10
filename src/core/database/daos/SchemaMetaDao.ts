import { SqliteClient, SqliteClientProvider } from '../sqliteClient';

export class SchemaMetaDao {
  constructor(private readonly databaseProvider: SqliteClientProvider) {}

  private async database(): Promise<SqliteClient> {
    return this.databaseProvider();
  }

  async getValue(key: string): Promise<string | null> {
    const database = await this.database();
    const row = await database.getFirstAsync<{ value: string }>(
      'SELECT value FROM schema_meta WHERE key = ?',
      key,
    );

    return row?.value ?? null;
  }

  async setValue(key: string, value: string): Promise<void> {
    const database = await this.database();
    await database.runAsync(
      `INSERT INTO schema_meta (key, value)
       VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      key,
      value,
    );
  }
}
