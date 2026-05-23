import { FavoriteDao } from '../../../../core/database/daos/FavoriteDao';
import { Favorite, FavoriteEntityType } from '../../domain/entities/Favorite';
import { FavoriteRepository } from '../../domain/repositories/FavoriteRepository';

export class FavoriteRepositoryImpl implements FavoriteRepository {
  constructor(private readonly favoriteDao: FavoriteDao) {}

  async list(userId: string): Promise<Favorite[]> {
    const rows = await this.favoriteDao.listByUserId(userId);
    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      entityType: row.entityType as FavoriteEntityType,
      entityId: row.entityId,
      createdAt: row.createdAt,
    }));
  }

  async isFavorite(
    userId: string,
    entityType: FavoriteEntityType,
    entityId: string,
  ): Promise<boolean> {
    const row = await this.favoriteDao.getByUserEntity(userId, entityType, entityId);
    return row !== null;
  }

  async add(favorite: Favorite): Promise<void> {
    await this.favoriteDao.upsert({
      id: favorite.id,
      userId: favorite.userId,
      entityType: favorite.entityType,
      entityId: favorite.entityId,
      createdAt: favorite.createdAt,
    });
  }

  async remove(userId: string, entityType: FavoriteEntityType, entityId: string): Promise<void> {
    await this.favoriteDao.deleteByUserEntity(userId, entityType, entityId);
  }
}
