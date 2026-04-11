import { describe, expect, it } from 'vitest';
import { GarmentLocalDataSource } from '../src/features/garment/data/datasources/GarmentLocalDataSource';
import { GarmentRemoteDataSource } from '../src/features/garment/data/datasources/GarmentRemoteDataSource';
import { GarmentModel } from '../src/features/garment/data/models/GarmentModel';
import { GarmentRepositoryImpl } from '../src/features/garment/data/repositories/GarmentRepositoryImpl';
import { GarmentSyncInfo } from '../src/features/garment/domain/entities/GarmentSyncInfo';

class FakeLocalDataSource implements GarmentLocalDataSource {
  constructor(
    public garments: GarmentModel[] = [],
    public syncInfo: GarmentSyncInfo = { source: 'cache', lastSyncedAt: null },
  ) {}

  async getGarments(): Promise<GarmentModel[]> {
    return this.garments;
  }

  async searchGarments(query: string): Promise<GarmentModel[]> {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return this.garments;
    }

    return this.garments.filter(
      (garment) =>
        garment.name.toLowerCase().includes(normalizedQuery) ||
        garment.id.toLowerCase().includes(normalizedQuery),
    );
  }

  async getGarmentById(id: string): Promise<GarmentModel | null> {
    return this.garments.find((garment) => garment.id === id) ?? null;
  }

  async getCategories(): Promise<string[]> {
    return ['Todas', ...Array.from(new Set(this.garments.map((garment) => garment.category)))];
  }

  async upsertGarment(garment: GarmentModel): Promise<void> {
    const index = this.garments.findIndex((current) => current.id === garment.id);
    if (index >= 0) {
      this.garments[index] = garment;
      return;
    }

    this.garments.push(garment);
  }

  async upsertMany(garments: GarmentModel[]): Promise<void> {
    for (const garment of garments) {
      await this.upsertGarment(garment);
    }
  }

  async deleteGarment(id: string): Promise<void> {
    this.garments = this.garments.filter((garment) => garment.id !== id);
  }

  async getSyncInfo(): Promise<GarmentSyncInfo> {
    return this.syncInfo;
  }

  async setSyncInfo(syncInfo: GarmentSyncInfo): Promise<void> {
    this.syncInfo = syncInfo;
  }
}

class FakeRemoteDataSource implements GarmentRemoteDataSource {
  constructor(
    private readonly configured: boolean,
    private readonly garments: GarmentModel[],
    private readonly shouldThrow = false,
  ) {}

  isConfigured(): boolean {
    return this.configured;
  }

  async fetchGarments(): Promise<GarmentModel[]> {
    if (this.shouldThrow) {
      throw new Error('network error');
    }

    return this.garments;
  }
}

const SAMPLE_GARMENT: GarmentModel = {
  id: 'g1',
  name: 'Chaqueta Denim',
  category: 'Chaquetas',
  price: 130000,
  imageUrl: 'https://example.com/jacket.jpg',
  description: 'Chaqueta azul',
  size: 'M',
  color: 'Azul',
  stock: 5,
};

describe('GarmentRepositoryImpl syncGarments', () => {
  it('synchronizes from remote and stores last sync metadata', async () => {
    const local = new FakeLocalDataSource();
    const remote = new FakeRemoteDataSource(true, [SAMPLE_GARMENT]);
    const repository = new GarmentRepositoryImpl(local, remote);

    const syncInfo = await repository.syncGarments();
    const garments = await repository.getGarments();

    expect(syncInfo.source).toBe('remote');
    expect(syncInfo.lastSyncedAt).not.toBeNull();
    expect(garments).toHaveLength(1);
    expect(garments[0].id).toBe('g1');
  });

  it('falls back to cache metadata when remote sync fails', async () => {
    const local = new FakeLocalDataSource([], {
      source: 'remote',
      lastSyncedAt: '2026-04-09T20:00:00.000Z',
    });
    const remote = new FakeRemoteDataSource(true, [], true);
    const repository = new GarmentRepositoryImpl(local, remote);

    const syncInfo = await repository.syncGarments();

    expect(syncInfo.source).toBe('cache');
    expect(syncInfo.lastSyncedAt).toBe('2026-04-09T20:00:00.000Z');
  });
});
