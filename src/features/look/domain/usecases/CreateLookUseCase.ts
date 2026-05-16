import { Look } from '../entities/Look';
import { CreateLookInput, LookRepository } from '../repositories/LookRepository';

export class CreateLookUseCase {
  constructor(private readonly lookRepository: LookRepository) {}

  async execute(input: CreateLookInput): Promise<Look> {
    if (!input.garmentIds.length) {
      throw new Error('El look debe tener al menos una prenda.');
    }

    const name = input.name.trim() || `Look ${new Date().toLocaleDateString()}`;
    const description = input.description.trim();

    return this.lookRepository.create({ ...input, name, description });
  }
}
