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
        user_id AS userId,
        entity_type AS entityType,
        entity_id AS entityId,
        created_at AS createdAt
      FROM favorites
      ORDER BY created_at DESC`,
    );
  }

  async listByUserId(userId: string): Promise<FavoriteRow[]> {
    const database = await this.database();
    return database.getAllAsync<FavoriteRow>(
      `SELECT
        id,
        user_id AS userId,
        entity_type AS entityType,
        entity_id AS entityId,
        created_at AS createdAt
      FROM favorites
      WHERE user_id = ?
      ORDER BY created_at DESC`,
      userId,
    );
  }

  async getById(id: string): Promise<FavoriteRow | null> {
    const database = await this.database();
    return database.getFirstAsync<FavoriteRow>(
      `SELECT
        id,
        user_id AS userId,
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
        user_id AS userId,
        entity_type AS entityType,
        entity_id AS entityId,
        created_at AS createdAt
      FROM favorites
      WHERE entity_type = ? AND entity_id = ?`,
      entityType,
      entityId,
    );
  }

  async getByUserEntity(
    userId: string,
    entityType: string,
    entityId: string,
  ): Promise<FavoriteRow | null> {
    const database = await this.database();
    return database.getFirstAsync<FavoriteRow>(
      `SELECT
        id,
        user_id AS userId,
        entity_type AS entityType,
        entity_id AS entityId,
        created_at AS createdAt
      FROM favorites
      WHERE user_id = ? AND entity_type = ? AND entity_id = ?`,
      userId,
      entityType,
      entityId,
    );
  }

  async create(favorite: FavoriteRow): Promise<void> {
    const database = await this.database();
    await database.runAsync(
      `INSERT INTO favorites (
        id,
        user_id,
        entity_type,
        entity_id,
        created_at
      ) VALUES (?, ?, ?, ?, ?)`,
      favorite.id,
      favorite.userId,
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

  async deleteByUserEntity(userId: string, entityType: string, entityId: string): Promise<void> {
    const database = await this.database();
    await database.runAsync(
      'DELETE FROM favorites WHERE user_id = ? AND entity_type = ? AND entity_id = ?',
      userId,
      entityType,
      entityId,
    );
  }

  async upsert(favorite: FavoriteRow): Promise<void> {
    const existing = await this.getByUserEntity(
      favorite.userId,
      favorite.entityType,
      favorite.entityId,
    );

    if (existing) {
      await this.delete(existing.id);
      return this.create(favorite);
    }

    await this.create(favorite);
  }
}
