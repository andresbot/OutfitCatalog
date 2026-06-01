import { describe, it, expect } from 'vitest';
import { TryOnServiceStub } from './TryOnServiceStub';

describe('TryOnServiceStub', () => {
  it('devuelve una URL https válida', async () => {
    const stub = new TryOnServiceStub();
    const result = await stub.tryOn('https://user.jpg', 'https://garment.jpg');
    expect(result).toMatch(/^https:\/\//);
  });
});
