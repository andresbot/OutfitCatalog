import { describe, it, expect } from 'vitest';
import {
  buildGarmentShareMessage,
  buildPersonalLookMessage,
  buildWhatsAppUrls,
  normalizeWhatsAppPhone,
} from './lookShareService';

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
    expect(msg).not.toContain('Asi me veria');
  });

  it('incluye la URL del try-on cuando hay resultImageUrl', () => {
    const msg = buildGarmentShareMessage({
      ...base,
      resultImageUrl: 'https://cloudinary.com/tryon-result.jpg',
    });
    expect(msg).toContain('Asi me veria con esta prenda');
    expect(msg).toContain('https://cloudinary.com/tryon-result.jpg');
    expect(msg).not.toContain('https://cloudinary.com/garment.jpg');
  });

  it('personaliza el mensaje con datos del cliente cuando existen', () => {
    const msg = buildGarmentShareMessage({
      ...base,
      buyerName: 'Camilo',
      buyerPhone: '+573104221496',
    });

    expect(msg).toContain('soy Camilo');
    expect(msg).toContain('+573104221496');
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

describe('buildWhatsAppUrls', () => {
  it('prioriza el chat nativo del vendedor cuando hay telefono', () => {
    const urls = buildWhatsAppUrls('+57 310 422 1496', 'Hola vendedor');

    expect(normalizeWhatsAppPhone('+57 310 422 1496')).toBe('573104221496');
    expect(urls[0]).toContain('whatsapp://send?phone=573104221496');
    expect(urls[1]).toContain('https://wa.me/573104221496');
    expect(urls.join(' ')).not.toContain('web.whatsapp.com');
  });
});
