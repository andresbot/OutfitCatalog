import { useCallback, useMemo, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { getIt } from '../../../core/di/getIt';
import { DI_TOKENS } from '../../../core/di/injectionContainer';
import { uploadToCloudinary } from '../../../core/services/cloudinaryUpload';
import { TryOnUseCase } from '../domain/TryOnUseCase';

export type TryOnState =
  | { status: 'idle' }
  | { status: 'picking' }
  | { status: 'uploading' }
  | { status: 'generating' }
  | { status: 'error'; message: string };

export function useTryOnViewModel(garmentImageUrl: string) {
  const [state, setState] = useState<TryOnState>({ status: 'idle' });

  const useCase = useMemo(
    () => getIt.get<TryOnUseCase>(DI_TOKENS.tryOnUseCase),
    [],
  );

  const dismiss = useCallback(() => setState({ status: 'idle' }), []);

  /**
   * Inicia el flujo completo.
   * Devuelve la URL del resultado o null si el usuario canceló o hubo error.
   */
  const start = useCallback(async (): Promise<string | null> => {
    setState({ status: 'picking' });

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
    });

    if (pickerResult.canceled) {
      setState({ status: 'idle' });
      return null;
    }

    const localUri = pickerResult.assets[0].uri;

    setState({ status: 'uploading' });
    let userPhotoUrl: string;
    try {
      userPhotoUrl = await uploadToCloudinary(localUri);
    } catch {
      setState({ status: 'error', message: 'No se pudo subir tu foto. Verifica tu conexión.' });
      return null;
    }

    setState({ status: 'generating' });
    try {
      const resultUrl = await useCase.execute(userPhotoUrl, garmentImageUrl);
      setState({ status: 'idle' });
      return resultUrl;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al generar el look.';
      setState({ status: 'error', message: msg });
      return null;
    }
  }, [garmentImageUrl, useCase]);

  return { state, start, dismiss };
}
