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

  const start = useCallback(async (source: 'camera' | 'gallery'): Promise<string | null> => {
    setState({ status: 'picking' });

    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setState({
          status: 'error',
          message: 'Necesitamos permiso para usar la cámara. Ve a Configuración > OutfitCatalog > Cámara.',
        });
        return null;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setState({
          status: 'error',
          message: 'Necesitamos permiso para acceder a tu galería. Ve a Configuración > OutfitCatalog > Fotos.',
        });
        return null;
      }
    }

    const pickerResult = source === 'camera'
      ? await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [3, 4],
          quality: 0.85,
        })
      : await ImagePicker.launchImageLibraryAsync({
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
    } catch (e: unknown) {
      const detail = e instanceof Error ? e.message : 'error desconocido';
      setState({ status: 'error', message: `No se pudo subir tu foto: ${detail}` });
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
