import { TryOnService } from '../domain/TryOnService';

const HF_SPACE_URL = 'https://kwai-kolors-kolors-virtual-try-on.hf.space';
// fn_index 0 corresponde al primer endpoint del espacio Gradio.
// Si el espacio lo cambia, verificar con: GET ${HF_SPACE_URL}/info
const FN_INDEX = 0;

function getToken(): string {
  const token = process.env.EXPO_PUBLIC_HF_TOKEN;
  if (!token) throw new Error('Falta EXPO_PUBLIC_HF_TOKEN en el .env');
  return token;
}

export class TryOnServiceImpl implements TryOnService {
  async tryOn(userPhotoUrl: string, garmentImageUrl: string): Promise<string> {
    const token = getToken();

    // Gradio v4 acepta imágenes como objetos { url, orig_name }.
    const body = {
      fn_index: FN_INDEX,
      data: [
        { url: userPhotoUrl, orig_name: 'person.jpg' },
        { url: garmentImageUrl, orig_name: 'garment.jpg' },
        'upper_body',
      ],
    };

    let response: Response;
    try {
      response = await fetch(`${HF_SPACE_URL}/run/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
    } catch (networkError: unknown) {
      const msg = networkError instanceof Error ? networkError.message : 'sin detalles';
      throw new Error(`No se pudo conectar con HF Kolors: ${msg}`);
    }

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      if (response.status === 503) {
        throw new Error('El servicio de IA está iniciando. Intenta en 1–2 minutos.');
      }
      throw new Error(`HF Kolors respondió ${response.status}: ${text.slice(0, 200)}`);
    }

    type GradioResponse = {
      data: Array<{ url?: string; path?: string } | string>;
    };

    const json = (await response.json()) as GradioResponse;
    const first = json.data?.[0];

    if (typeof first === 'string') return first;
    if (first && typeof first === 'object' && first.url) return first.url;

    throw new Error(
      'HF Kolors devolvió un formato inesperado. Verifica el fn_index con /info.',
    );
  }
}
