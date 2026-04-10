import { useCallback, useEffect, useMemo, useState } from 'react';
import { getIt } from '../../../../core/di/getIt';
import { DI_TOKENS } from '../../../../core/di/injectionContainer';
import { Garment } from '../../domain/entities/Garment';
import { GarmentSyncInfo } from '../../domain/entities/GarmentSyncInfo';
import { GetGarmentCategoriesUseCase } from '../../domain/usecases/GetGarmentCategoriesUseCase';
import { GetGarmentSyncInfoUseCase } from '../../domain/usecases/GetGarmentSyncInfoUseCase';
import { GetGarmentsUseCase } from '../../domain/usecases/GetGarmentsUseCase';
import { SearchGarmentsUseCase } from '../../domain/usecases/SearchGarmentsUseCase';
import { SyncGarmentsUseCase } from '../../domain/usecases/SyncGarmentsUseCase';

const SEARCH_DEBOUNCE_MS = 300;

class GarmentGalleryViewModel {
  constructor(
    private readonly getGarmentsUseCase: GetGarmentsUseCase,
    private readonly getCategoriesUseCase: GetGarmentCategoriesUseCase,
    private readonly searchGarmentsUseCase: SearchGarmentsUseCase,
    private readonly syncGarmentsUseCase: SyncGarmentsUseCase,
    private readonly getGarmentSyncInfoUseCase: GetGarmentSyncInfoUseCase,
  ) {}

  loadGarments(): Promise<Garment[]> {
    return this.getGarmentsUseCase.execute();
  }

  loadCategories(): Promise<string[]> {
    return this.getCategoriesUseCase.execute();
  }

  searchGarments(query: string): Promise<Garment[]> {
    return this.searchGarmentsUseCase.execute(query);
  }

  syncGarments(): Promise<GarmentSyncInfo> {
    return this.syncGarmentsUseCase.execute();
  }

  loadSyncInfo(): Promise<GarmentSyncInfo> {
    return this.getGarmentSyncInfoUseCase.execute();
  }
}

export type GarmentGalleryState = {
  garments: Garment[];
  categories: string[];
  selectedCategory: string;
  searchQuery: string;
  loading: boolean;
  syncInfo: GarmentSyncInfo;
};

const INITIAL_SYNC_INFO: GarmentSyncInfo = {
  source: 'cache',
  lastSyncedAt: null,
};

export function useGarmentGalleryViewModel() {
  const viewModel = useMemo(
    () =>
      new GarmentGalleryViewModel(
        getIt.get<GetGarmentsUseCase>(DI_TOKENS.getGarmentsUseCase),
        getIt.get<GetGarmentCategoriesUseCase>(DI_TOKENS.getGarmentCategoriesUseCase),
        getIt.get<SearchGarmentsUseCase>(DI_TOKENS.searchGarmentsUseCase),
        getIt.get<SyncGarmentsUseCase>(DI_TOKENS.syncGarmentsUseCase),
        getIt.get<GetGarmentSyncInfoUseCase>(DI_TOKENS.getGarmentSyncInfoUseCase),
      ),
    [],
  );

  const [state, setState] = useState<GarmentGalleryState>({
    garments: [],
    categories: ['Todas'],
    selectedCategory: 'Todas',
    searchQuery: '',
    loading: true,
    syncInfo: INITIAL_SYNC_INFO,
  });

  const reload = useCallback(async () => {
    let syncInfo: GarmentSyncInfo;

    try {
      syncInfo = await viewModel.syncGarments();
    } catch {
      syncInfo = await viewModel.loadSyncInfo();
    }

    const [garments, categories] = await Promise.all([
      viewModel.loadGarments(),
      viewModel.loadCategories(),
    ]);

    setState((current) => ({
      ...current,
      garments,
      categories,
      loading: false,
      syncInfo,
    }));
  }, [viewModel]);

  const syncNow = useCallback(async () => {
    const syncInfo = await viewModel.syncGarments();
    const [garments, categories] = await Promise.all([
      viewModel.loadGarments(),
      viewModel.loadCategories(),
    ]);

    setState((current) => ({
      ...current,
      garments,
      categories,
      syncInfo,
      loading: false,
    }));
  }, [viewModel]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const garments = state.searchQuery.trim()
        ? await viewModel.searchGarments(state.searchQuery)
        : await viewModel.loadGarments();

      setState((current) => ({
        ...current,
        garments,
      }));
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [state.searchQuery, viewModel]);

  const filteredGarments = useMemo(() => {
    if (state.selectedCategory === 'Todas') {
      return state.garments;
    }
    return state.garments.filter((item) => item.category === state.selectedCategory);
  }, [state.garments, state.selectedCategory]);

  const setCategory = useCallback((category: string) => {
    setState((current) => ({ ...current, selectedCategory: category }));
  }, []);

  const setSearchQuery = useCallback((searchQuery: string) => {
    setState((current) => ({ ...current, searchQuery }));
  }, []);

  return {
    ...state,
    filteredGarments,
    setCategory,
    setSearchQuery,
    reload,
    syncNow,
  };
}
