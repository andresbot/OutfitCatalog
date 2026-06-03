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
import { SearchGarmentsUseCase } from '../../features/garment/domain/usecases/SearchGarmentsUseCase';
import { SyncGarmentsUseCase } from '../../features/garment/domain/usecases/SyncGarmentsUseCase';
import { LookDao } from '../../core/database/daos/LookDao';
import { LookItemDao } from '../../core/database/daos/LookItemDao';
import { FavoriteDao } from '../../core/database/daos/FavoriteDao';
import { getDatabase } from '../../core/database/database';
import { LookRepositoryImpl } from '../../features/look/data/repositories/LookRepositoryImpl';
import { LookRepository } from '../../features/look/domain/repositories/LookRepository';
import { CreateLookUseCase } from '../../features/look/domain/usecases/CreateLookUseCase';
import { GetAllLooksUseCase } from '../../features/look/domain/usecases/GetAllLooksUseCase';
import { FavoriteRepositoryImpl } from '../../features/favorite/data/repositories/FavoriteRepositoryImpl';
import { FavoriteRepository } from '../../features/favorite/domain/repositories/FavoriteRepository';
import { AddFavoriteUseCase } from '../../features/favorite/domain/usecases/AddFavoriteUseCase';
import { RemoveFavoriteUseCase } from '../../features/favorite/domain/usecases/RemoveFavoriteUseCase';
import { IsFavoriteUseCase } from '../../features/favorite/domain/usecases/IsFavoriteUseCase';
import { UpdateLookUseCase } from '../../features/look/domain/usecases/UpdateLookUseCase';
import { DeleteLookUseCase } from '../../features/look/domain/usecases/DeleteLookUseCase';
import { LookRemoteDataSourceImpl } from '../../features/look/data/datasources/LookRemoteDataSource';
import { TryOnUseCase } from '../../features/tryon/domain/TryOnUseCase';
import { TryOnServiceHuggingFace } from '../../features/tryon/data/TryOnServiceHuggingFace';
import { TryOnServiceSegmind } from '../../features/tryon/data/TryOnServiceSegmind';
import { TryOnServiceImpl } from '../../features/tryon/data/TryOnServiceImpl';
import { TryOnServiceStub } from '../../features/tryon/data/TryOnServiceStub';
import { getIt } from './getIt';

export const DI_TOKENS = {
  garmentLocalDataSource: 'garmentLocalDataSource',
  garmentRemoteDataSource: 'garmentRemoteDataSource',
  garmentRepository: 'garmentRepository',
  getGarmentsUseCase: 'getGarmentsUseCase',
  getGarmentByIdUseCase: 'getGarmentByIdUseCase',
  getGarmentCategoriesUseCase: 'getGarmentCategoriesUseCase',
  searchGarmentsUseCase: 'searchGarmentsUseCase',
  syncGarmentsUseCase: 'syncGarmentsUseCase',
  getGarmentSyncInfoUseCase: 'getGarmentSyncInfoUseCase',
  lookRepository: 'lookRepository',
  createLookUseCase: 'createLookUseCase',
  getAllLooksUseCase: 'getAllLooksUseCase',
  favoriteRepository: 'favoriteRepository',
  addFavoriteUseCase: 'addFavoriteUseCase',
  removeFavoriteUseCase: 'removeFavoriteUseCase',
  isFavoriteUseCase: 'isFavoriteUseCase',
  updateLookUseCase: 'updateLookUseCase',
  deleteLookUseCase: 'deleteLookUseCase',
  tryOnUseCase: 'tryOnUseCase',
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
    DI_TOKENS.searchGarmentsUseCase,
    new SearchGarmentsUseCase(getIt.get<GarmentRepository>(DI_TOKENS.garmentRepository)),
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

  getIt.registerSingleton<LookRepository>(
    DI_TOKENS.lookRepository,
    new LookRepositoryImpl(
      new LookDao(getDatabase),
      new LookItemDao(getDatabase),
      new LookRemoteDataSourceImpl(),
    ),
  );

  getIt.registerSingleton(
    DI_TOKENS.createLookUseCase,
    new CreateLookUseCase(getIt.get<LookRepository>(DI_TOKENS.lookRepository)),
  );

  getIt.registerSingleton(
    DI_TOKENS.getAllLooksUseCase,
    new GetAllLooksUseCase(getIt.get<LookRepository>(DI_TOKENS.lookRepository)),
  );

  getIt.registerSingleton(
    DI_TOKENS.updateLookUseCase,
    new UpdateLookUseCase(getIt.get<LookRepository>(DI_TOKENS.lookRepository)),
  );

  getIt.registerSingleton(
    DI_TOKENS.deleteLookUseCase,
    new DeleteLookUseCase(getIt.get<LookRepository>(DI_TOKENS.lookRepository)),
  );

  getIt.registerSingleton<FavoriteRepository>(
    DI_TOKENS.favoriteRepository,
    new FavoriteRepositoryImpl(new FavoriteDao(getDatabase)),
  );

  getIt.registerSingleton(
    DI_TOKENS.addFavoriteUseCase,
    new AddFavoriteUseCase(getIt.get<FavoriteRepository>(DI_TOKENS.favoriteRepository)),
  );

  getIt.registerSingleton(
    DI_TOKENS.removeFavoriteUseCase,
    new RemoveFavoriteUseCase(getIt.get<FavoriteRepository>(DI_TOKENS.favoriteRepository)),
  );

  getIt.registerSingleton(
    DI_TOKENS.isFavoriteUseCase,
    new IsFavoriteUseCase(getIt.get<FavoriteRepository>(DI_TOKENS.favoriteRepository)),
  );

  const tryOnService = new TryOnServiceStub();

  getIt.registerSingleton(
    DI_TOKENS.tryOnUseCase,
    new TryOnUseCase(tryOnService),
  );
}
