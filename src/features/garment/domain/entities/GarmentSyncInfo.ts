export type GarmentSyncSource = 'remote' | 'cache' | 'not_configured';

export interface GarmentSyncInfo {
  source: GarmentSyncSource;
  lastSyncedAt: string | null;
}
