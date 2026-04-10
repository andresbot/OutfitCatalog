import {
  GarmentLocalDataSource,
  GarmentLocalDataSourceImpl,
} from '../../features/garment/data/datasources/GarmentLocalDataSource';
import {
  GarmentRemoteDataSource,
  GarmentRemoteDataSourceImpl,
} from '../../features/garment/data/datasources/GarmentRemoteDataSource';
import { GarmentRepositoryImpl } from '../../features/garment/data/repositories/GarmentRepositoryImpl';
import { GarmentRepository } from '../../features/garment/domain/repositories/GarmentRepository';
import { GetGarmentByIdUseCase } from '../../features/garment/domain/usecases/GetGarmentByIdUseCase';
import { GetGarmentCategoriesUseCase } from '../../features/garment/domain/usecases/GetGarmentCategoriesUseCase';
import { GetGarmentsUseCase } from '../../features/garment/domain/usecases/GetGarmentsUseCase';
import { GetGarmentSyncInfoUseCase } from '../../features/garment/domain/usecases/GetGarmentSyncInfoUseCase';
import { SyncGarmentsUseCase } from '../../features/garment/domain/usecases/SyncGarmentsUseCase';
import { getIt } from './getIt';

export const DI_TOKENS = {
  garmentLocalDataSource: 'garmentLocalDataSource',
  garmentRemoteDataSource: 'garmentRemoteDataSource',
  garmentRepository: 'garmentRepository',
  getGarmentsUseCase: 'getGarmentsUseCase',
  getGarmentByIdUseCase: 'getGarmentByIdUseCase',
  getGarmentCategoriesUseCase: 'getGarmentCategoriesUseCase',
  syncGarmentsUseCase: 'syncGarmentsUseCase',
  getGarmentSyncInfoUseCase: 'getGarmentSyncInfoUseCase',
} as const;

export function initDependencies(): void {
  if (getIt.isRegistered(DI_TOKENS.garmentRepository)) {
    return;
  }

  getIt.registerSingleton<GarmentLocalDataSource>(
    DI_TOKENS.garmentLocalDataSource,
    new GarmentLocalDataSourceImpl(),
  );

  getIt.registerSingleton<GarmentRemoteDataSource>(
    DI_TOKENS.garmentRemoteDataSource,
    new GarmentRemoteDataSourceImpl(),
  );

  getIt.registerSingleton<GarmentRepository>(
    DI_TOKENS.garmentRepository,
    new GarmentRepositoryImpl(
      getIt.get<GarmentLocalDataSource>(DI_TOKENS.garmentLocalDataSource),
      getIt.get<GarmentRemoteDataSource>(DI_TOKENS.garmentRemoteDataSource),
    ),
  );

  getIt.registerSingleton(
    DI_TOKENS.getGarmentsUseCase,
    new GetGarmentsUseCase(getIt.get<GarmentRepository>(DI_TOKENS.garmentRepository)),
  );

  getIt.registerSingleton(
    DI_TOKENS.getGarmentByIdUseCase,
    new GetGarmentByIdUseCase(getIt.get<GarmentRepository>(DI_TOKENS.garmentRepository)),
  );

  getIt.registerSingleton(
    DI_TOKENS.getGarmentCategoriesUseCase,
    new GetGarmentCategoriesUseCase(
      getIt.get<GarmentRepository>(DI_TOKENS.garmentRepository),
    ),
  );

  getIt.registerSingleton(
    DI_TOKENS.syncGarmentsUseCase,
    new SyncGarmentsUseCase(getIt.get<GarmentRepository>(DI_TOKENS.garmentRepository)),
  );

  getIt.registerSingleton(
    DI_TOKENS.getGarmentSyncInfoUseCase,
    new GetGarmentSyncInfoUseCase(
      getIt.get<GarmentRepository>(DI_TOKENS.garmentRepository),
    ),
  );
}
