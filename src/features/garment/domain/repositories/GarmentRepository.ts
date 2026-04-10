import { Garment } from '../entities/Garment';

export interface GarmentRepository {
  getGarments(): Promise<Garment[]>;
  getGarmentById(id: string): Promise<Garment | null>;
  getCategories(): Promise<string[]>;
}
