import { TryOnService } from '../domain/TryOnService';

// Imagen de demostración estable (modelo con vestido, Unsplash).
const DEMO_RESULT_URL =
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80';

export class TryOnServiceStub implements TryOnService {
  async tryOn(_userPhotoUrl: string, _garmentImageUrl: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return DEMO_RESULT_URL;
  }
}
