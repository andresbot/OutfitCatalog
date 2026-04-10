import { Garment } from '../entities/Garment';
import { GarmentSyncInfo } from '../entities/GarmentSyncInfo';

export interface GarmentRepository {
  getGarments(): Promise<Garment[]>;
  getGarmentById(id: string): Promise<Garment | null>;
  getCategories(): Promise<string[]>;
  syncGarments(): Promise<GarmentSyncInfo>;
  getSyncInfo(): Promise<GarmentSyncInfo>;
}
