import { describe, it, expect, vi } from 'vitest';
import { TryOnUseCase } from './TryOnUseCase';
import type { TryOnService } from './TryOnService';

describe('TryOnUseCase', () => {
  it('delega al servicio y devuelve la URL resultado', async () => {
    const mockService: TryOnService = {
      tryOn: vi.fn().mockResolvedValue('https://resultado.jpg'),
    };
    const useCase = new TryOnUseCase(mockService);
    const result = await useCase.execute('https://usuario.jpg', 'https://prenda.jpg');
    expect(result).toBe('https://resultado.jpg');
    expect(mockService.tryOn).toHaveBeenCalledWith(
      'https://usuario.jpg',
      'https://prenda.jpg',
    );
  });

  it('deja propagar el error del servicio', async () => {
    const mockService: TryOnService = {
      tryOn: vi.fn().mockRejectedValue(new Error('API caída')),
    };
    const useCase = new TryOnUseCase(mockService);
    await expect(useCase.execute('a', 'b')).rejects.toThrow('API caída');
  });
});
