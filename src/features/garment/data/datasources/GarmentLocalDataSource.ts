import { GarmentSyncInfo } from '../../domain/entities/GarmentSyncInfo';
import { GarmentDao } from '../../../../core/database/daos/GarmentDao';
import { SchemaMetaDao } from '../../../../core/database/daos/SchemaMetaDao';
import { getDatabase } from '../../../../core/database/database';
import { GarmentModel, toGarmentModel } from '../models/GarmentModel';

const LAST_SYNC_AT_KEY = 'garments_last_sync_at';
const LAST_SYNC_SOURCE_KEY = 'garments_last_sync_source';

export interface GarmentLocalDataSource {
  getGarments(): Promise<GarmentModel[]>;
  searchGarments(query: string): Promise<GarmentModel[]>;
  getGarmentById(id: string): Promise<GarmentModel | null>;
  getCategories(): Promise<string[]>;
  upsertGarment(garment: GarmentModel): Promise<void>;
  upsertMany(garments: GarmentModel[]): Promise<void>;
  deleteGarment(id: string): Promise<void>;
  getSyncInfo(): Promise<GarmentSyncInfo>;
  setSyncInfo(syncInfo: GarmentSyncInfo): Promise<void>;
}

export class GarmentLocalDataSourceImpl implements GarmentLocalDataSource {
  constructor(
    private readonly garmentDao = new GarmentDao(getDatabase),
    private readonly schemaMetaDao = new SchemaMetaDao(getDatabase),
  ) {}

  async getGarments(): Promise<GarmentModel[]> {
    return (await this.garmentDao.list()).map(toGarmentModel);
  }

  async searchGarments(query: string): Promise<GarmentModel[]> {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return this.getGarments();
    }

    return (await this.garmentDao.search(normalizedQuery)).map(toGarmentModel);
  }

  async getGarmentById(id: string): Promise<GarmentModel | null> {
    const row = await this.garmentDao.getById(id);
    return row ? toGarmentModel(row) : null;
  }

  async getCategories(): Promise<string[]> {
    return this.garmentDao.listCategories();
  }

  async upsertGarment(garment: GarmentModel): Promise<void> {
    const now = new Date().toISOString();
    await this.garmentDao.upsert({
      ...garment,
      createdAt: now,
      updatedAt: now,
    });
  }

  async upsertMany(garments: GarmentModel[]): Promise<void> {
    for (const garment of garments) {
      await this.upsertGarment(garment);
    }
  }

  async deleteGarment(id: string): Promise<void> {
    await this.garmentDao.delete(id);
  }

  async getSyncInfo(): Promise<GarmentSyncInfo> {
    const [lastSyncedAt, source] = await Promise.all([
      this.schemaMetaDao.getValue(LAST_SYNC_AT_KEY),
      this.schemaMetaDao.getValue(LAST_SYNC_SOURCE_KEY),
    ]);

    if (source === 'remote' || source === 'cache' || source === 'not_configured') {
      return {
        source,
        lastSyncedAt,
      };
    }

    return {
      source: 'cache',
      lastSyncedAt,
    };
  }

  async setSyncInfo(syncInfo: GarmentSyncInfo): Promise<void> {
    await this.schemaMetaDao.setValue(LAST_SYNC_SOURCE_KEY, syncInfo.source);

    if (syncInfo.lastSyncedAt) {
      await this.schemaMetaDao.setValue(LAST_SYNC_AT_KEY, syncInfo.lastSyncedAt);
    }
  }
}
