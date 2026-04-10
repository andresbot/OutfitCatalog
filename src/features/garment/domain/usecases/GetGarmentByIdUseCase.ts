import { Garment } from '../entities/Garment';
import { GarmentRepository } from '../repositories/GarmentRepository';

export class GetGarmentByIdUseCase {
  constructor(private readonly repository: GarmentRepository) {}

  execute(id: string): Promise<Garment | null> {
    return this.repository.getGarmentById(id);
  }
}
