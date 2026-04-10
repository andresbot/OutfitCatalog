import { GarmentRepository } from '../repositories/GarmentRepository';

export class GetGarmentCategoriesUseCase {
  constructor(private readonly repository: GarmentRepository) {}

  execute(): Promise<string[]> {
    return this.repository.getCategories();
  }
}
