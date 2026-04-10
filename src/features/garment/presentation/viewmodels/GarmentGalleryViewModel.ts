import { useCallback, useEffect, useMemo, useState } from 'react';
import { getIt } from '../../../../core/di/getIt';
import { DI_TOKENS } from '../../../../core/di/injectionContainer';
import { Garment } from '../../domain/entities/Garment';
import { GetGarmentCategoriesUseCase } from '../../domain/usecases/GetGarmentCategoriesUseCase';
import { GetGarmentsUseCase } from '../../domain/usecases/GetGarmentsUseCase';

class GarmentGalleryViewModel {
  constructor(
    private readonly getGarmentsUseCase: GetGarmentsUseCase,
    private readonly getCategoriesUseCase: GetGarmentCategoriesUseCase,
  ) {}

  loadGarments(): Promise<Garment[]> {
    return this.getGarmentsUseCase.execute();
  }

  loadCategories(): Promise<string[]> {
    return this.getCategoriesUseCase.execute();
  }
}

export type GarmentGalleryState = {
  garments: Garment[];
  categories: string[];
  selectedCategory: string;
  loading: boolean;
};

export function useGarmentGalleryViewModel() {
  const viewModel = useMemo(
    () =>
      new GarmentGalleryViewModel(
        getIt.get<GetGarmentsUseCase>(DI_TOKENS.getGarmentsUseCase),
        getIt.get<GetGarmentCategoriesUseCase>(DI_TOKENS.getGarmentCategoriesUseCase),
      ),
    [],
  );

  const [state, setState] = useState<GarmentGalleryState>({
    garments: [],
    categories: ['Todas'],
    selectedCategory: 'Todas',
    loading: true,
  });

  const reload = useCallback(async () => {
    const [garments, categories] = await Promise.all([
      viewModel.loadGarments(),
      viewModel.loadCategories(),
    ]);

    setState((current) => ({
      ...current,
      garments,
      categories,
      loading: false,
    }));
  }, [viewModel]);

  useEffect(() => {
    reload();
  }, [reload]);

  const filteredGarments = useMemo(() => {
    if (state.selectedCategory === 'Todas') {
      return state.garments;
    }
    return state.garments.filter((item) => item.category === state.selectedCategory);
  }, [state.garments, state.selectedCategory]);

  const setCategory = useCallback((category: string) => {
    setState((current) => ({ ...current, selectedCategory: category }));
  }, []);

  return {
    ...state,
    filteredGarments,
    setCategory,
    reload,
  };
}
