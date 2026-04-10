import { GarmentDao } from '../../../../core/database/daos/GarmentDao';
import { getDatabase } from '../../../../core/database/database';
import { GarmentModel, toGarmentModel } from '../models/GarmentModel';

export interface GarmentLocalDataSource {
  getGarments(): Promise<GarmentModel[]>;
  getGarmentById(id: string): Promise<GarmentModel | null>;
  getCategories(): Promise<string[]>;
  upsertGarment(garment: GarmentModel): Promise<void>;
  deleteGarment(id: string): Promise<void>;
}

export class GarmentLocalDataSourceImpl implements GarmentLocalDataSource {
  constructor(private readonly garmentDao = new GarmentDao(getDatabase)) {}

  async getGarments(): Promise<GarmentModel[]> {
    return (await this.garmentDao.list()).map(toGarmentModel);
  }

  async getGarmentById(id: string): Promise<GarmentModel | null> {
    const row = await this.garmentDao.getById(id);
    return row ? toGarmentModel(row) : null;
  }

  async getCategories(): Promise<string[]> {
    return this.garmentDao.listCategories();
  }

  async upsertGarment(garment: GarmentModel): Promise<void> {
    await this.garmentDao.upsert({
      ...garment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  async deleteGarment(id: string): Promise<void> {
    await this.garmentDao.delete(id);
  }
}
