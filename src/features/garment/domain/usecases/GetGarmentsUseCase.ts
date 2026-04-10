import { Garment } from '../entities/Garment';
import { GarmentRepository } from '../repositories/GarmentRepository';

export class GetGarmentsUseCase {
  constructor(private readonly repository: GarmentRepository) {}

  execute(): Promise<Garment[]> {
    return this.repository.getGarments();
  }
}
