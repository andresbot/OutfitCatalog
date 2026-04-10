export type GarmentRow = {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  description: string;
  size: string;
  color: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
};

export type LookRow = {
  id: string;
  name: string;
  description: string;
  coverImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LookItemRow = {
  id: string;
  lookId: string;
  garmentId: string;
  position: number;
};

export type FavoriteRow = {
  id: string;
  entityType: string;
  entityId: string;
  createdAt: string;
};