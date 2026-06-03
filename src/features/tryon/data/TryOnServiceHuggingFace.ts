import { TryOnService } from '../domain/TryOnService';

const HF_SPACE = 'https://kwai-kolors-kolors-virtual-try-on.hf.space';
const PREDICT_URL = `${HF_SPACE}/run/predict`;
const TIMEOUT_MS = 120_000;

function getToken(): string {
  const token = process.env.EXPO_PUBLIC_HF_TOKEN;
  if (!token) throw new Error('Falta EXPO_PUBLIC_HF_TOKEN en el .env');
  return token;
}

export class TryOnServiceHuggingFace implements TryOnService {
  async tryOn(userPhotoUrl: string, garmentImageUrl: string): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const resp = await fetch(PREDICT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          fn_index: 0,
          data: [
            { url: userPhotoUrl, orig_name: 'person.jpg' },
            { url: garmentImageUrl, orig_name: 'garment.jpg' },
            'upper_body',
          ],
        }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        if (resp.status === 503) {
          throw new Error('El espacio de HuggingFace está arrancando (cold start ~2 min). Intenta de nuevo.');
        }
        throw new Error(`HuggingFace respondió ${resp.status}: ${text.slice(0, 150)}`);
      }

      const result = (await resp.json()) as { data: Array<{ url: string } | string> };
      const item = result.data?.[0];

      if (typeof item === 'string') {
        return item.startsWith('http') ? item : `${HF_SPACE}${item}`;
      }
      if (item && typeof item === 'object' && 'url' in item) {
        return item.url;
      }
      throw new Error(`Formato inesperado de HuggingFace: ${JSON.stringify(result.data)}`);
    } finally {
      clearTimeout(timer);
    }
  }
}
