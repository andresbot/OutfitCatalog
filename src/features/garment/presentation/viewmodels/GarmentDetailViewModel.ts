import { useEffect, useMemo, useState } from 'react';
import { getIt } from '../../../../core/di/getIt';
import { DI_TOKENS } from '../../../../core/di/injectionContainer';
import { Garment } from '../../domain/entities/Garment';
import { GetGarmentByIdUseCase } from '../../domain/usecases/GetGarmentByIdUseCase';

class GarmentDetailViewModel {
  constructor(private readonly getGarmentByIdUseCase: GetGarmentByIdUseCase) {}

  load(id: string): Promise<Garment | null> {
    return this.getGarmentByIdUseCase.execute(id);
  }
}

export function useGarmentDetailViewModel(id: string) {
  const viewModel = useMemo(
    () =>
      new GarmentDetailViewModel(
        getIt.get<GetGarmentByIdUseCase>(DI_TOKENS.getGarmentByIdUseCase),
      ),
    [],
  );

  const [garment, setGarment] = useState<Garment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const result = await viewModel.load(id);
      if (mounted) {
        setGarment(result);
        setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [id, viewModel]);

  return { garment, loading };
}
