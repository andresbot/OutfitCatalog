import { Garment } from '../../domain/entities/Garment';
import { GarmentSyncInfo } from '../../domain/entities/GarmentSyncInfo';
import { GarmentRepository } from '../../domain/repositories/GarmentRepository';
import { GarmentLocalDataSource } from '../datasources/GarmentLocalDataSource';
import { GarmentRemoteDataSource } from '../datasources/GarmentRemoteDataSource';
import { toGarmentEntity } from '../models/GarmentModel';

export class GarmentRepositoryImpl implements GarmentRepository {
  constructor(
    private readonly localDataSource: GarmentLocalDataSource,
    private readonly remoteDataSource: GarmentRemoteDataSource,
  ) {}

  async getGarments(): Promise<Garment[]> {
    const models = await this.localDataSource.getGarments();
    return models.map(toGarmentEntity);
  }

  async searchGarments(query: string): Promise<Garment[]> {
    const models = await this.localDataSource.searchGarments(query);
    return models.map(toGarmentEntity);
  }

  async getGarmentById(id: string): Promise<Garment | null> {
    const garment = await this.localDataSource.getGarmentById(id);
    return garment ? toGarmentEntity(garment) : null;
  }

  async getCategories(): Promise<string[]> {
    return this.localDataSource.getCategories();
  }

  async syncGarments(): Promise<GarmentSyncInfo> {
    if (!this.remoteDataSource.isConfigured()) {
      const currentSyncInfo = await this.localDataSource.getSyncInfo();
      const nextInfo: GarmentSyncInfo = {
        source: 'not_configured',
        lastSyncedAt: currentSyncInfo.lastSyncedAt,
      };
      await this.localDataSource.setSyncInfo(nextInfo);
      return nextInfo;
    }

    try {
      const remoteGarments = await this.remoteDataSource.fetchGarments();
      await this.localDataSource.upsertMany(remoteGarments);
      const syncInfo: GarmentSyncInfo = {
        source: 'remote',
        lastSyncedAt: new Date().toISOString(),
      };
      await this.localDataSource.setSyncInfo(syncInfo);
      return syncInfo;
    } catch (error) {
      // Keep cache fallback, but surface why remote sync failed for debugging.
      console.warn('Garment remote sync failed, using cache:', error);
      const currentSyncInfo = await this.localDataSource.getSyncInfo();
      const syncInfo: GarmentSyncInfo = {
        source: 'cache',
        lastSyncedAt: currentSyncInfo.lastSyncedAt,
      };
      await this.localDataSource.setSyncInfo(syncInfo);
      return syncInfo;
    }
  }

  async getSyncInfo(): Promise<GarmentSyncInfo> {
    return this.localDataSource.getSyncInfo();
  }
}
