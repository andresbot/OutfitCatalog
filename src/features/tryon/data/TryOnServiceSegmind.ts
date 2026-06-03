import { TryOnService } from '../domain/TryOnService';
import { uploadBase64ToCloudinary } from '../../../core/services/cloudinaryUpload';

const SEGMIND_API = 'https://api.segmind.com/v1/segfit';

function getToken(): string {
  const token = process.env.EXPO_PUBLIC_SEGMIND_API_KEY;
  if (!token) throw new Error('Falta EXPO_PUBLIC_SEGMIND_API_KEY en el .env');
  return token;
}

export class TryOnServiceSegmind implements TryOnService {
  async tryOn(userPhotoUrl: string, garmentImageUrl: string): Promise<string> {
    const resp = await fetch(SEGMIND_API, {
      method: 'POST',
      headers: {
        'x-api-key': getToken(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_image: userPhotoUrl,
        outfit_image: garmentImageUrl,
        num_inference_steps: 35,
        guidance_scale: 2,
        seed: 12467,
        base64: true,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      if (resp.status === 401) throw new Error('API key de Segmind inválida. Verifica EXPO_PUBLIC_SEGMIND_API_KEY.');
      if (resp.status === 406) throw new Error('Sin créditos en Segmind. Recarga tu cuenta en segmind.com.');
      throw new Error(`Segmind respondió ${resp.status}: ${text.slice(0, 150)}`);
    }

    const data = (await resp.json()) as { image: string };
    if (!data.image) throw new Error('Segmind no devolvió imagen.');

    return uploadBase64ToCloudinary(data.image);
  }
}
