import { Garment } from '../../domain/entities/Garment';
import { GarmentRow } from '../../../../core/database/types';

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

export function toGarmentModel(row: GarmentRow): GarmentModel {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    imageUrl: row.imageUrl,
    description: row.description,
    size: row.size,
    color: row.color,
    stock: row.stock,
  };
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

export function toGarmentRow(model: GarmentModel): GarmentRow {
  const now = new Date().toISOString();

  return {
    ...model,
    createdAt: now,
    updatedAt: now,
  };
}
