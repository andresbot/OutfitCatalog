import { FavoriteEntityType } from '../entities/Favorite';
import { FavoriteRepository } from '../repositories/FavoriteRepository';

export class IsFavoriteUseCase {
  constructor(private readonly favoriteRepository: FavoriteRepository) {}

  async execute(userId: string, entityType: FavoriteEntityType, entityId: string): Promise<boolean> {
    return this.favoriteRepository.isFavorite(userId, entityType, entityId);
  }
}
