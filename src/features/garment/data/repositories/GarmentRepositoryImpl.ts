import { Garment } from '../../domain/entities/Garment';
import { GarmentRepository } from '../../domain/repositories/GarmentRepository';
import { GarmentLocalDataSource } from '../datasources/GarmentLocalDataSource';
import { toGarmentEntity } from '../models/GarmentModel';

export class GarmentRepositoryImpl implements GarmentRepository {
  constructor(private readonly localDataSource: GarmentLocalDataSource) {}

  async getGarments(): Promise<Garment[]> {
    const models = await this.localDataSource.getGarments();
    return models.map(toGarmentEntity);
  }

  async getGarmentById(id: string): Promise<Garment | null> {
    const garments = await this.getGarments();
    return garments.find((item) => item.id === id) ?? null;
  }

  async getCategories(): Promise<string[]> {
    const garments = await this.getGarments();
    const categories = Array.from(new Set(garments.map((item) => item.category)));
    return ['Todas', ...categories];
  }
}
