export type FavoriteEntityType = 'garment' | 'look';

export type Favorite = {
  id: string;
  userId: string;
  entityType: FavoriteEntityType;
  entityId: string;
  createdAt: string;
};
