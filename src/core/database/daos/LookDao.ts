import { LookRow } from '../types';
import { SqliteClient, SqliteClientProvider } from '../sqliteClient';

export class LookDao {
  constructor(private readonly databaseProvider: SqliteClientProvider) {}

  private async database(): Promise<SqliteClient> {
    return this.databaseProvider();
  }

  async list(): Promise<LookRow[]> {
    const database = await this.database();
    return database.getAllAsync<LookRow>(
      `SELECT
        id,
        user_id AS userId,
        name,
        description,
        cover_image_url AS coverImageUrl,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM looks
      ORDER BY updated_at DESC, name ASC`,
    );
  }

  async listByUserId(userId: string): Promise<LookRow[]> {
    const database = await this.database();
    return database.getAllAsync<LookRow>(
      `SELECT
        id,
        user_id AS userId,
        name,
        description,
        cover_image_url AS coverImageUrl,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM looks
      WHERE user_id = ?
      ORDER BY updated_at DESC, name ASC`,
      userId,
    );
  }

  async getById(id: string): Promise<LookRow | null> {
    const database = await this.database();
    return database.getFirstAsync<LookRow>(
      `SELECT
        id,
        user_id AS userId,
        name,
        description,
        cover_image_url AS coverImageUrl,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM looks
      WHERE id = ?`,
      id,
    );
  }

  async getByIdForUser(id: string, userId: string): Promise<LookRow | null> {
    const database = await this.database();
    return database.getFirstAsync<LookRow>(
      `SELECT
        id,
        user_id AS userId,
        name,
        description,
        cover_image_url AS coverImageUrl,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM looks
      WHERE id = ? AND user_id = ?`,
      id,
      userId,
    );
  }

  async listByIdsForUser(ids: string[], userId: string): Promise<LookRow[]> {
    if (ids.length === 0) {
      return [];
    }

    const database = await this.database();
    const placeholders = ids.map(() => '?').join(', ');
    return database.getAllAsync<LookRow>(
      `SELECT
        id,
        user_id AS userId,
        name,
        description,
        cover_image_url AS coverImageUrl,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM looks
      WHERE user_id = ?
        AND id IN (${placeholders})
      ORDER BY updated_at DESC, name ASC`,
      userId,
      ...ids,
    );
  }

  async create(look: LookRow): Promise<void> {
    const database = await this.database();
    await database.runAsync(
      `INSERT INTO looks (
        id,
        user_id,
        name,
        description,
        cover_image_url,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      look.id,
      look.userId,
      look.name,
      look.description,
      look.coverImageUrl,
      look.createdAt,
      look.updatedAt,
    );
  }

  async update(look: LookRow): Promise<void> {
    const database = await this.database();
    await database.runAsync(
      `UPDATE looks
       SET name = ?,
           description = ?,
           cover_image_url = ?,
           updated_at = ?
       WHERE id = ?`,
      look.name,
      look.description,
      look.coverImageUrl,
      look.updatedAt,
      look.id,
    );
  }

  async delete(id: string): Promise<void> {
    const database = await this.database();
    await database.runAsync('DELETE FROM looks WHERE id = ?', id);
  }

  async deleteForUser(id: string, userId: string): Promise<void> {
    const database = await this.database();
    await database.runAsync('DELETE FROM looks WHERE id = ? AND user_id = ?', id, userId);
  }

  async upsert(look: LookRow): Promise<void> {
    const existing = await this.getById(look.id);

    if (existing) {
      await this.update(look);
      return;
    }

    await this.create(look);
  }
}
