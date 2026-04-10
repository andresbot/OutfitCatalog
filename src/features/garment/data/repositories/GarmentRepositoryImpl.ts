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
    const garment = await this.localDataSource.getGarmentById(id);
    return garment ? toGarmentEntity(garment) : null;
  }

  async getCategories(): Promise<string[]> {
    return this.localDataSource.getCategories();
  }
}
