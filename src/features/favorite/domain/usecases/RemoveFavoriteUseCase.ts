import { FavoriteEntityType } from '../entities/Favorite';
import { FavoriteRepository } from '../repositories/FavoriteRepository';

export class RemoveFavoriteUseCase {
  constructor(private readonly favoriteRepository: FavoriteRepository) {}

  async execute(userId: string, entityType: FavoriteEntityType, entityId: string): Promise<void> {
    await this.favoriteRepository.remove(userId, entityType, entityId);
  }
}
