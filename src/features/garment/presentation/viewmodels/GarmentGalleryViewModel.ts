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

export type PriceRange = {
  label: string;
  min: number | null;
  max: number | null;
};

export const PRICE_RANGES: PriceRange[] = [
  { label: 'Hasta $50.000',         min: null,   max: 50000  },
  { label: '$50.000 – $150.000',    min: 50000,  max: 150000 },
  { label: '$150.000 – $300.000',   min: 150000, max: 300000 },
  { label: '$300.000 – $600.000',   min: 300000, max: 600000 },
  { label: 'Más de $600.000',       min: 600000, max: null   },
];

export const PREDEFINED_SIZES = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL',
  '36', '37', '38', '39', '40', '41', '42', '43', '44',
  'Única',
];

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
  selectedSizes: string[];
  selectedPriceRange: string | null;
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
    selectedSizes: [],
    selectedPriceRange: null,
  });

  const reload = useCallback(async () => {
    const [garments, categories, syncInfo] = await Promise.all([
      viewModel.loadGarments(),
      viewModel.loadCategories(),
      viewModel.loadSyncInfo(),
    ]);

    setState((current) => ({
      ...current,
      garments,
      categories,
      loading: false,
      syncInfo,
    }));

    try {
      const newSyncInfo = await viewModel.syncGarments();
      const [syncedGarments, syncedCategories] = await Promise.all([
        viewModel.loadGarments(),
        viewModel.loadCategories(),
      ]);
      setState((current) => ({
        ...current,
        garments: syncedGarments,
        categories: syncedCategories,
        syncInfo: newSyncInfo,
      }));
    } catch {
      // Remote sync failed — cached data is already shown
    }
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

      setState((current) => ({ ...current, garments }));
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [state.searchQuery, viewModel]);

  // AND logic: category + price range + sizes
  const filteredGarments = useMemo(() => {
    let result = state.garments;

    if (state.selectedCategory !== 'Todas') {
      result = result.filter((item) => item.category === state.selectedCategory);
    }

    if (state.selectedPriceRange !== null) {
      const range = PRICE_RANGES.find((r) => r.label === state.selectedPriceRange);
      if (range) {
        if (range.min !== null) result = result.filter((item) => item.price >= range.min!);
        if (range.max !== null) result = result.filter((item) => item.price <= range.max!);
      }
    }

    if (state.selectedSizes.length > 0) {
      result = result.filter((item) => {
        // Support vendors who entered multiple sizes as "S, M, L"
        const itemSizes = item.size.split(',').map((s) => s.trim());
        return state.selectedSizes.some((sel) => itemSizes.includes(sel));
      });
    }

    return result;
  }, [state.garments, state.selectedCategory, state.selectedPriceRange, state.selectedSizes]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (state.selectedPriceRange !== null) count++;
    count += state.selectedSizes.length;
    return count;
  }, [state.selectedPriceRange, state.selectedSizes]);

  const setCategory = useCallback((category: string) => {
    setState((current) => ({ ...current, selectedCategory: category }));
  }, []);

  const setSearchQuery = useCallback((searchQuery: string) => {
    setState((current) => ({ ...current, searchQuery }));
  }, []);

  const setSelectedPriceRange = useCallback((label: string | null) => {
    setState((current) => ({ ...current, selectedPriceRange: label }));
  }, []);

  const toggleSize = useCallback((size: string) => {
    setState((current) => ({
      ...current,
      selectedSizes: current.selectedSizes.includes(size)
        ? current.selectedSizes.filter((s) => s !== size)
        : [...current.selectedSizes, size],
    }));
  }, []);

  const resetAdvancedFilters = useCallback(() => {
    setState((current) => ({
      ...current,
      selectedPriceRange: null,
      selectedSizes: [],
    }));
  }, []);

  return {
    ...state,
    filteredGarments,
    activeFilterCount,
    setCategory,
    setSearchQuery,
    setSelectedPriceRange,
    toggleSize,
    resetAdvancedFilters,
    reload,
    syncNow,
  };
}
