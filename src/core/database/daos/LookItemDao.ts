import { LookItemRow } from '../types';
import { SqliteClient, SqliteClientProvider } from '../sqliteClient';

export class LookItemDao {
  constructor(private readonly databaseProvider: SqliteClientProvider) {}

  private async database(): Promise<SqliteClient> {
    return this.databaseProvider();
  }

  async listByLookId(lookId: string): Promise<LookItemRow[]> {
    const database = await this.database();
    return database.getAllAsync<LookItemRow>(
      `SELECT
        id,
        look_id AS lookId,
        garment_id AS garmentId,
        position
      FROM look_items
      WHERE look_id = ?
      ORDER BY position ASC`,
      lookId,
    );
  }

  async getById(id: string): Promise<LookItemRow | null> {
    const database = await this.database();
    return database.getFirstAsync<LookItemRow>(
      `SELECT
        id,
        look_id AS lookId,
        garment_id AS garmentId,
        position
      FROM look_items
      WHERE id = ?`,
      id,
    );
  }

  async create(lookItem: LookItemRow): Promise<void> {
    const database = await this.database();
    await database.runAsync(
      `INSERT INTO look_items (
        id,
        look_id,
        garment_id,
        position
      ) VALUES (?, ?, ?, ?)`,
      lookItem.id,
      lookItem.lookId,
      lookItem.garmentId,
      lookItem.position,
    );
  }

  async update(lookItem: LookItemRow): Promise<void> {
    const database = await this.database();
    await database.runAsync(
      `UPDATE look_items
       SET look_id = ?,
           garment_id = ?,
           position = ?
       WHERE id = ?`,
      lookItem.lookId,
      lookItem.garmentId,
      lookItem.position,
      lookItem.id,
    );
  }

  async delete(id: string): Promise<void> {
    const database = await this.database();
    await database.runAsync('DELETE FROM look_items WHERE id = ?', id);
  }

  async deleteByLookId(lookId: string): Promise<void> {
    const database = await this.database();
    await database.runAsync('DELETE FROM look_items WHERE look_id = ?', lookId);
  }

  async replaceForLook(lookId: string, lookItems: LookItemRow[]): Promise<void> {
    const database = await this.database();
    await database.execAsync('BEGIN');

    try {
      await database.runAsync('DELETE FROM look_items WHERE look_id = ?', lookId);

      for (const lookItem of lookItems) {
        await database.runAsync(
          `INSERT INTO look_items (
            id,
            look_id,
            garment_id,
            position
          ) VALUES (?, ?, ?, ?)`,
          lookItem.id,
          lookItem.lookId,
          lookItem.garmentId,
          lookItem.position,
        );
      }

      await database.execAsync('COMMIT');
    } catch (error) {
      await database.execAsync('ROLLBACK');
      throw error;
    }
  }
}