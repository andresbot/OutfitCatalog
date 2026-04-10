import { FavoriteRow } from '../types';
import { SqliteClient, SqliteClientProvider } from '../sqliteClient';

export class FavoriteDao {
  constructor(private readonly databaseProvider: SqliteClientProvider) {}

  private async database(): Promise<SqliteClient> {
    return this.databaseProvider();
  }

  async list(): Promise<FavoriteRow[]> {
    const database = await this.database();
    return database.getAllAsync<FavoriteRow>(
      `SELECT
        id,
        entity_type AS entityType,
        entity_id AS entityId,
        created_at AS createdAt
      FROM favorites
      ORDER BY created_at DESC`,
    );
  }

  async getById(id: string): Promise<FavoriteRow | null> {
    const database = await this.database();
    return database.getFirstAsync<FavoriteRow>(
      `SELECT
        id,
        entity_type AS entityType,
        entity_id AS entityId,
        created_at AS createdAt
      FROM favorites
      WHERE id = ?`,
      id,
    );
  }

  async getByEntity(entityType: string, entityId: string): Promise<FavoriteRow | null> {
    const database = await this.database();
    return database.getFirstAsync<FavoriteRow>(
      `SELECT
        id,
        entity_type AS entityType,
        entity_id AS entityId,
        created_at AS createdAt
      FROM favorites
      WHERE entity_type = ? AND entity_id = ?`,
      entityType,
      entityId,
    );
  }

  async create(favorite: FavoriteRow): Promise<void> {
    const database = await this.database();
    await database.runAsync(
      `INSERT INTO favorites (
        id,
        entity_type,
        entity_id,
        created_at
      ) VALUES (?, ?, ?, ?)`,
      favorite.id,
      favorite.entityType,
      favorite.entityId,
      favorite.createdAt,
    );
  }

  async delete(id: string): Promise<void> {
    const database = await this.database();
    await database.runAsync('DELETE FROM favorites WHERE id = ?', id);
  }

  async deleteByEntity(entityType: string, entityId: string): Promise<void> {
    const database = await this.database();
    await database.runAsync(
      'DELETE FROM favorites WHERE entity_type = ? AND entity_id = ?',
      entityType,
      entityId,
    );
  }

  async upsert(favorite: FavoriteRow): Promise<void> {
    const existing = await this.getByEntity(favorite.entityType, favorite.entityId);

    if (existing) {
      await this.delete(existing.id);
      return this.create(favorite);
    }

    await this.create(favorite);
  }
}