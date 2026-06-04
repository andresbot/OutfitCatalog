import { describe, expect, it } from 'vitest';
import { buildPurchaseRequestMessage } from './purchaseRequestService';

describe('buildPurchaseRequestMessage', () => {
  it('crea un mensaje de solicitud con prendas y total estimado', () => {
    const message = buildPurchaseRequestMessage({
      buyerName: 'Camilo',
      buyerPhone: '3104221496',
      source: 'garment',
      sourceName: 'Camisa lino',
      total: 120000,
      items: [
        {
          garmentId: 'g1',
          name: 'Camisa lino',
          category: 'Camisas',
          price: 120000,
          size: 'M',
          color: 'Blanco',
          imageUrl: 'https://example.com/camisa.jpg',
          vendorId: 'v1',
          vendorName: 'Atelier Norte',
        },
      ],
    });

    expect(message).toContain('Camilo');
    expect(message).toContain('Camisa lino');
    expect(message).toContain('3104221496');
    expect(message).toContain('Total estimado');
  });
});
