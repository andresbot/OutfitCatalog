import { LookRepository, UpdateLookInput } from '../repositories/LookRepository';

export class UpdateLookUseCase {
  constructor(private readonly repository: LookRepository) {}

  execute(input: UpdateLookInput): Promise<void> {
    return this.repository.update(input);
  }
}
