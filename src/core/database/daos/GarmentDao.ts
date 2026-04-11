import { GarmentRow } from '../types';
import { SqliteClient, SqliteClientProvider } from '../sqliteClient';

export class GarmentDao {
  constructor(private readonly databaseProvider: SqliteClientProvider) {}

  private async database(): Promise<SqliteClient> {
    return this.databaseProvider();
  }

  async list(): Promise<GarmentRow[]> {
    const database = await this.database();
    return database.getAllAsync<GarmentRow>(
      `SELECT
        id,
        name,
        category,
        price,
        image_url AS imageUrl,
        description,
        size,
        color,
        stock,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM garments
      ORDER BY category ASC, name ASC`,
    );
  }

  async search(term: string): Promise<GarmentRow[]> {
    const database = await this.database();
    const normalizedTerm = `%${term.trim().toLowerCase()}%`;

    return database.getAllAsync<GarmentRow>(
      `SELECT
        id,
        name,
        category,
        price,
        image_url AS imageUrl,
        description,
        size,
        color,
        stock,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM garments
      WHERE LOWER(name) LIKE ?
         OR LOWER(id) LIKE ?
      ORDER BY category ASC, name ASC`,
      normalizedTerm,
      normalizedTerm,
    );
  }

  async getById(id: string): Promise<GarmentRow | null> {
    const database = await this.database();
    return database.getFirstAsync<GarmentRow>(
      `SELECT
        id,
        name,
        category,
        price,
        image_url AS imageUrl,
        description,
        size,
        color,
        stock,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM garments
      WHERE id = ?`,
      id,
    );
  }

  async listCategories(): Promise<string[]> {
    const garments = await this.list();
    const categories = Array.from(new Set(garments.map((garment) => garment.category)));
    return ['Todas', ...categories];
  }

  async create(garment: GarmentRow): Promise<void> {
    const database = await this.database();
    await database.runAsync(
      `INSERT INTO garments (
        id,
        name,
        category,
        price,
        image_url,
        description,
        size,
        color,
        stock,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      garment.id,
      garment.name,
      garment.category,
      garment.price,
      garment.imageUrl,
      garment.description,
      garment.size,
      garment.color,
      garment.stock,
      garment.createdAt,
      garment.updatedAt,
    );
  }

  async update(garment: GarmentRow): Promise<void> {
    const database = await this.database();
    await database.runAsync(
      `UPDATE garments
       SET name = ?,
           category = ?,
           price = ?,
           image_url = ?,
           description = ?,
           size = ?,
           color = ?,
           stock = ?,
           updated_at = ?
       WHERE id = ?`,
      garment.name,
      garment.category,
      garment.price,
      garment.imageUrl,
      garment.description,
      garment.size,
      garment.color,
      garment.stock,
      garment.updatedAt,
      garment.id,
    );
  }

  async delete(id: string): Promise<void> {
    const database = await this.database();
    await database.runAsync('DELETE FROM garments WHERE id = ?', id);
  }

  async upsert(garment: GarmentRow): Promise<void> {
    const existing = await this.getById(garment.id);

    if (existing) {
      await this.update(garment);
      return;
    }

    await this.create(garment);
  }
}