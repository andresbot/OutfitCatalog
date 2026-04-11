import { Garment } from '../entities/Garment';
import { GarmentRepository } from '../repositories/GarmentRepository';

export class SearchGarmentsUseCase {
  constructor(private readonly repository: GarmentRepository) {}

  execute(query: string): Promise<Garment[]> {
    return this.repository.searchGarments(query);
  }
}
