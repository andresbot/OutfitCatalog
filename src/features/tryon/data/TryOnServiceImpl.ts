import { TryOnService } from '../domain/TryOnService';

// Implementación de producción con Replicate IDM-VTON.
// Para activar: registrar TryOnServiceImpl en injectionContainer en vez de TryOnServiceStub.
// Requiere EXPO_PUBLIC_REPLICATE_TOKEN en el .env (replicate.com → Account → API tokens).
const REPLICATE_API = 'https://api.replicate.com/v1';
const IDMVTON_VERSION = 'c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4';
const POLL_INTERVAL_MS = 4000;
const TIMEOUT_MS = 180_000;

function getToken(): string {
  const token = process.env.EXPO_PUBLIC_REPLICATE_TOKEN;
  if (!token) throw new Error('Falta EXPO_PUBLIC_REPLICATE_TOKEN en el .env');
  return token;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export class TryOnServiceImpl implements TryOnService {
  // userPhotoUrl: URL pública de Cloudinary (foto del usuario).
  // garmentImageUrl: URL pública de Cloudinary de la prenda.
  async tryOn(userPhotoUrl: string, garmentImageUrl: string): Promise<string> {
    const token = getToken();

    const createResp = await fetch(`${REPLICATE_API}/predictions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'wait=5',
      },
      body: JSON.stringify({
        version: IDMVTON_VERSION,
        input: {
          human_img: userPhotoUrl,
          garm_img: garmentImageUrl,
          garment_des: '',
          category: 'upper_body',
          is_checked: true,
          is_checked_crop: false,
          denoise_steps: 30,
          seed: 42,
        },
      }),
    });

    if (!createResp.ok) {
      const text = await createResp.text().catch(() => '');
      if (createResp.status === 401) {
        throw new Error('Token de Replicate inválido. Verifica EXPO_PUBLIC_REPLICATE_TOKEN.');
      }
      throw new Error(`Replicate respondió ${createResp.status}: ${text.slice(0, 150)}`);
    }

    type Prediction = {
      id: string;
      status: string;
      output?: string | string[];
      error?: string;
      urls?: { get: string };
    };

    let prediction = (await createResp.json()) as Prediction;

    if (prediction.status === 'succeeded') return extractOutput(prediction.output);
    if (prediction.status === 'failed') {
      throw new Error(`Replicate falló: ${prediction.error ?? 'error desconocido'}`);
    }

    const pollUrl = prediction.urls?.get ?? `${REPLICATE_API}/predictions/${prediction.id}`;
    const deadline = Date.now() + TIMEOUT_MS;

    while (Date.now() < deadline) {
      await sleep(POLL_INTERVAL_MS);
      const pollResp = await fetch(pollUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (!pollResp.ok) continue;
      prediction = (await pollResp.json()) as Prediction;
      if (prediction.status === 'succeeded') return extractOutput(prediction.output);
      if (prediction.status === 'failed') {
        throw new Error(`Replicate falló: ${prediction.error ?? 'error desconocido'}`);
      }
    }

    throw new Error('El servicio tardó demasiado. Intenta de nuevo.');
  }
}

function extractOutput(output: string | string[] | undefined): string {
  if (typeof output === 'string') return output;
  if (Array.isArray(output) && output[0]) return output[0];
  throw new Error(`Formato inesperado de Replicate: ${JSON.stringify(output)}`);
}
