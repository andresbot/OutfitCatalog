import { describe, expect, it } from 'vitest';
import { GarmentDao } from '../src/core/database/daos/GarmentDao';
import { createInMemorySqliteClient } from './helpers/createInMemorySqliteClient';

describe('GarmentDao', () => {
  it('creates, updates, lists and deletes garments', async () => {
    const database = createInMemorySqliteClient();
    const dao = new GarmentDao(async () => database);

    await dao.create({
      id: 'g-100',
      name: 'Blazer noir',
      category: 'Blazers',
      price: 220000,
      imageUrl: 'https://example.com/blazer.jpg',
      description: 'Blazer de prueba',
      size: 'M',
      color: 'Negro',
      stock: 4,
      vendorId: 'vendor-1',
      vendorName: 'Vendedor Uno',
      published: 1,
      createdAt: '2026-04-09T10:00:00.000Z',
      updatedAt: '2026-04-09T10:00:00.000Z',
    });
    await dao.create({
      id: 'sku-200',
      name: 'Pantalon arena',
      category: 'Pantalones',
      price: 180000,
      imageUrl: 'https://example.com/pants.jpg',
      description: 'Pantalon de prueba',
      size: 'L',
      color: 'Beige',
      stock: 6,
      vendorId: 'vendor-2',
      vendorName: 'Vendedor Dos',
      published: 0,
      createdAt: '2026-04-09T10:05:00.000Z',
      updatedAt: '2026-04-09T10:05:00.000Z',
    });

    expect(await dao.search('blazer')).toHaveLength(1);
    expect((await dao.search('blazer'))[0].id).toBe('g-100');
    expect(await dao.search('sku-')).toHaveLength(1);
    expect((await dao.search('sku-'))[0].name).toBe('Pantalon arena');

    expect((await dao.getById('g-100'))?.name).toBe('Blazer noir');
    expect(await dao.getByIdForVendor('g-100', 'vendor-2')).toBeNull();
    expect((await dao.listByIds(['sku-200', 'g-100', 'missing'])).map((g) => g.id)).toEqual([
      'g-100',
      'sku-200',
    ]);
    expect(await dao.listByVendorId('vendor-1')).toHaveLength(1);
    expect(await dao.listPublished()).toHaveLength(1);
    expect(await dao.searchPublished('vendedor uno')).toHaveLength(1);

    await dao.update({
      id: 'g-100',
      name: 'Blazer noir premium',
      category: 'Blazers',
      price: 250000,
      imageUrl: 'https://example.com/blazer-2.jpg',
      description: 'Blazer actualizado',
      size: 'M',
      color: 'Negro',
      stock: 2,
      vendorId: 'vendor-1',
      vendorName: 'Vendedor Uno',
      published: 1,
      createdAt: '2026-04-09T10:00:00.000Z',
      updatedAt: '2026-04-09T11:00:00.000Z',
    });

    expect((await dao.getById('g-100'))?.name).toBe('Blazer noir premium');
    expect(await dao.listCategories()).toEqual(['Todas', 'Blazers', 'Pantalones']);
    expect((await dao.list()).length).toBe(2);

    await dao.deleteForVendor('g-100', 'vendor-2');
    expect(await dao.getById('g-100')).not.toBeNull();

    await dao.deleteForVendor('g-100', 'vendor-1');
    await dao.delete('sku-200');
    expect(await dao.getById('g-100')).toBeNull();
  });
});
