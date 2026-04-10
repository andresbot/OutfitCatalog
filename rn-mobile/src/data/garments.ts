import { Garment } from '../types';

export const garments: Garment[] = [
  {
    id: 'g-001',
    name: 'Top ribbed beige',
    category: 'Tops',
    price: 79000,
    imageUrl: 'https://images.unsplash.com/photo-1576566588528-025521a7fd1d?w=1200&h=1500&fit=crop',
    description: 'Top tejido para looks casuales.',
    size: 'M',
    color: 'Beige',
    stock: 18,
  },
  {
    id: 'g-002',
    name: 'Jean wide leg',
    category: 'Pantalones',
    price: 159000,
    imageUrl: 'https://images.unsplash.com/photo-1541099810657-40b6b3adc15d?w=1200&h=1500&fit=crop',
    description: 'Jean de tiro alto y silueta amplia.',
    size: 'L',
    color: 'Azul denim',
    stock: 9,
  },
  {
    id: 'g-003',
    name: 'Vestido midi fluido',
    category: 'Vestidos',
    price: 189000,
    imageUrl: 'https://images.unsplash.com/photo-1595887917093-11ec97efb475?w=1200&h=1500&fit=crop',
    description: 'Vestido ideal para vitrinas y ocasiones especiales.',
    size: 'S',
    color: 'Marfil',
    stock: 6,
  },
  {
    id: 'g-004',
    name: 'Falda plisada negra',
    category: 'Faldas',
    price: 99000,
    imageUrl: 'https://images.unsplash.com/photo-1583496538226-72f1e61dd1f4?w=1200&h=1500&fit=crop',
    description: 'Falda versatil para combinar con tops y blazers.',
    size: 'M',
    color: 'Negro',
    stock: 14,
  },
  {
    id: 'g-005',
    name: 'Sneakers blancas',
    category: 'Zapatos',
    price: 249000,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=1500&fit=crop',
    description: 'Zapatillas basicas para uso diario.',
    size: '39',
    color: 'Blanco',
    stock: 5,
  },
  {
    id: 'g-006',
    name: 'Bolso baguette',
    category: 'Accesorios',
    price: 129000,
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&h=1500&fit=crop',
    description: 'Accesorio compacto para elevar cualquier outfit.',
    size: 'Unica',
    color: 'Cafe',
    stock: 12,
  },
];

export const categories = ['Todas', ...Array.from(new Set(garments.map((g) => g.category)))];

export function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}
