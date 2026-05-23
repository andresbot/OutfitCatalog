import { Favorite, FavoriteEntityType } from '../entities/Favorite';

export interface FavoriteRepository {
  list(userId: string): Promise<Favorite[]>;
  isFavorite(userId: string, entityType: FavoriteEntityType, entityId: string): Promise<boolean>;
  add(favorite: Favorite): Promise<void>;
  remove(userId: string, entityType: FavoriteEntityType, entityId: string): Promise<void>;
}
