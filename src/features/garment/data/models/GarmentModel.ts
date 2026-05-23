import { Garment } from '../../domain/entities/Garment';
import { GarmentRow } from '../../../../core/database/types';
import { resolveImageUrl } from '../../../../core/config/imageConfig';

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
  vendorId: string;
  vendorName: string;
  published: boolean;
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
    vendorId: row.vendorId,
    vendorName: row.vendorName,
    published: row.published === 1,
  };
}

export function toGarmentEntity(model: GarmentModel): Garment {
  return {
    id: model.id,
    name: model.name,
    category: model.category,
    price: model.price,
    imageUrl: resolveImageUrl(model.imageUrl) ?? '',
    description: model.description,
    size: model.size,
    color: model.color,
    stock: model.stock,
    vendorId: model.vendorId,
    vendorName: model.vendorName,
    published: model.published,
  };
}

export function toGarmentRow(model: GarmentModel): GarmentRow {
  const now = new Date().toISOString();

  return {
    ...model,
    published: model.published ? 1 : 0,
    createdAt: now,
    updatedAt: now,
  };
}
