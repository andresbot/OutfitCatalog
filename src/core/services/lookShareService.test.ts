import { describe, it, expect } from 'vitest';
import { buildGarmentShareMessage } from './lookShareService';

const base = {
  name: 'Vestido Noir',
  category: 'Vestidos',
  price: 320000,
  size: 'M',
  color: 'Negro',
  stock: 10,
  imageUrl: 'https://cloudinary.com/garment.jpg',
  vendorId: 'v1',
  vendorName: 'Atelier Sur',
};

describe('buildGarmentShareMessage', () => {
  it('incluye la URL de la prenda cuando no hay resultImageUrl', () => {
    const msg = buildGarmentShareMessage(base);
    expect(msg).toContain('https://cloudinary.com/garment.jpg');
    expect(msg).not.toContain('Así me vería');
  });

  it('incluye la URL del try-on cuando hay resultImageUrl', () => {
    const msg = buildGarmentShareMessage({
      ...base,
      resultImageUrl: 'https://cloudinary.com/tryon-result.jpg',
    });
    expect(msg).toContain('Así me vería con esta prenda');
    expect(msg).toContain('https://cloudinary.com/tryon-result.jpg');
    expect(msg).not.toContain('https://cloudinary.com/garment.jpg');
  });
});
