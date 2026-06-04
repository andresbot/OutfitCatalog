import { describe, it, expect } from 'vitest';
import { buildGarmentShareMessage, buildPersonalLookMessage } from './lookShareService';

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

describe('buildPersonalLookMessage', () => {
  it('resume el look para enviarlo al numero personal del cliente', () => {
    const msg = buildPersonalLookMessage('Look noche', [
      {
        name: base.name,
        category: base.category,
        price: base.price,
        size: base.size,
        color: base.color,
        vendorName: base.vendorName,
      },
    ]);

    expect(msg).toContain('Mi look en ATELIER');
    expect(msg).toContain('Look noche');
    expect(msg).toContain(base.name);
    expect(msg).toContain(base.vendorName);
    expect(msg).toContain('Total estimado');
  });
});
