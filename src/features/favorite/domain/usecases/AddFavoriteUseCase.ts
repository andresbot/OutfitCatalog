import { Favorite, FavoriteEntityType } from '../entities/Favorite';
import { FavoriteRepository } from '../repositories/FavoriteRepository';

export class AddFavoriteUseCase {
  constructor(private readonly favoriteRepository: FavoriteRepository) {}

  async execute(userId: string, entityType: FavoriteEntityType, entityId: string): Promise<void> {
    if (!userId.trim()) {
      throw new Error('Debes iniciar sesion para guardar favoritos.');
    }

    const favorite: Favorite = {
      id: `fav-${userId}-${entityType}-${entityId}`,
      userId,
      entityType,
      entityId,
      createdAt: new Date().toISOString(),
    };
    await this.favoriteRepository.add(favorite);
  }
}
