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
        vendor_id AS vendorId,
        vendor_name AS vendorName,
        published,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM garments
      ORDER BY category ASC, name ASC`,
    );
  }

  async listPublished(): Promise<GarmentRow[]> {
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
        vendor_id AS vendorId,
        vendor_name AS vendorName,
        published,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM garments
      WHERE published = 1
      ORDER BY category ASC, name ASC`,
    );
  }

  async listByVendorId(vendorId: string): Promise<GarmentRow[]> {
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
        vendor_id AS vendorId,
        vendor_name AS vendorName,
        published,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM garments
      WHERE vendor_id = ?
      ORDER BY category ASC, name ASC`,
      vendorId,
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
        vendor_id AS vendorId,
        vendor_name AS vendorName,
        published,
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

  async searchPublished(term: string): Promise<GarmentRow[]> {
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
        vendor_id AS vendorId,
        vendor_name AS vendorName,
        published,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM garments
      WHERE published = 1
        AND (
          LOWER(name) LIKE ?
          OR LOWER(id) LIKE ?
          OR LOWER(category) LIKE ?
          OR LOWER(vendor_name) LIKE ?
        )
      ORDER BY category ASC, name ASC`,
      normalizedTerm,
      normalizedTerm,
      normalizedTerm,
      normalizedTerm,
    );
  }

  async searchByVendorId(vendorId: string, term: string): Promise<GarmentRow[]> {
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
        vendor_id AS vendorId,
        vendor_name AS vendorName,
        published,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM garments
      WHERE vendor_id = ?
        AND (
          LOWER(name) LIKE ?
          OR LOWER(id) LIKE ?
          OR LOWER(category) LIKE ?
        )
      ORDER BY category ASC, name ASC`,
      vendorId,
      normalizedTerm,
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
        vendor_id AS vendorId,
        vendor_name AS vendorName,
        published,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM garments
      WHERE id = ?`,
      id,
    );
  }

  async getByIdForVendor(id: string, vendorId: string): Promise<GarmentRow | null> {
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
        vendor_id AS vendorId,
        vendor_name AS vendorName,
        published,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM garments
      WHERE id = ? AND vendor_id = ?`,
      id,
      vendorId,
    );
  }

  async listCategories(): Promise<string[]> {
    const garments = await this.list();
    const categories = Array.from(new Set(garments.map((garment) => garment.category)));
    return ['Todas', ...categories];
  }

  async listPublishedCategories(): Promise<string[]> {
    const garments = await this.listPublished();
    const categories = Array.from(new Set(garments.map((garment) => garment.category)));
    return ['Todas', ...categories];
  }

  async listCategoriesByVendorId(vendorId: string): Promise<string[]> {
    const garments = await this.listByVendorId(vendorId);
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
        vendor_id,
        vendor_name,
        published,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      garment.id,
      garment.name,
      garment.category,
      garment.price,
      garment.imageUrl,
      garment.description,
      garment.size,
      garment.color,
      garment.stock,
      garment.vendorId,
      garment.vendorName,
      garment.published,
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
           vendor_id = ?,
           vendor_name = ?,
           published = ?,
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
      garment.vendorId,
      garment.vendorName,
      garment.published,
      garment.updatedAt,
      garment.id,
    );
  }

  async delete(id: string): Promise<void> {
    const database = await this.database();
    await database.runAsync('DELETE FROM garments WHERE id = ?', id);
  }

  async deleteForVendor(id: string, vendorId: string): Promise<void> {
    const database = await this.database();
    await database.runAsync('DELETE FROM garments WHERE id = ? AND vendor_id = ?', id, vendorId);
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
