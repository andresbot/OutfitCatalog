import { Garment } from '../../domain/entities/Garment';

export interface GarmentModel {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  description: string;
  size: string;
  color: string;
  stock: number;
}

export function toGarmentEntity(model: GarmentModel): Garment {
  return {
    id: model.id,
    name: model.name,
    category: model.category,
    price: model.price,
    imageUrl: model.imageUrl,
    description: model.description,
    size: model.size,
    color: model.color,
    stock: model.stock,
  };
}
