import { TryOnService } from './TryOnService';

export class TryOnUseCase {
  constructor(private readonly service: TryOnService) {}

  execute(userPhotoUrl: string, garmentImageUrl: string): Promise<string> {
    return this.service.tryOn(userPhotoUrl, garmentImageUrl);
  }
}
