import { LookRepository } from '../repositories/LookRepository';

export class DeleteLookUseCase {
  constructor(private readonly repository: LookRepository) {}

  execute(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
