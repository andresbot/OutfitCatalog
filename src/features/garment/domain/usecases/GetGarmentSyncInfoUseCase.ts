import { GarmentSyncInfo } from '../entities/GarmentSyncInfo';
import { GarmentRepository } from '../repositories/GarmentRepository';

export class GetGarmentSyncInfoUseCase {
  constructor(private readonly repository: GarmentRepository) {}

  execute(): Promise<GarmentSyncInfo> {
    return this.repository.getSyncInfo();
  }
}
