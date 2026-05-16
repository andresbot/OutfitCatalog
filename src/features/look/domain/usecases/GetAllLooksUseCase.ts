import { Look } from '../entities/Look';
import { LookRepository } from '../repositories/LookRepository';

export class GetAllLooksUseCase {
  constructor(private readonly lookRepository: LookRepository) {}

  async execute(userId?: string): Promise<Look[]> {
    if (userId) {
      return this.lookRepository.listByUserId(userId);
    }
    return this.lookRepository.list();
  }
}
