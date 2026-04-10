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
      createdAt: '2026-04-09T10:00:00.000Z',
      updatedAt: '2026-04-09T10:00:00.000Z',
    });

    expect((await dao.getById('g-100'))?.name).toBe('Blazer noir');

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
      createdAt: '2026-04-09T10:00:00.000Z',
      updatedAt: '2026-04-09T11:00:00.000Z',
    });

    expect((await dao.getById('g-100'))?.name).toBe('Blazer noir premium');
    expect(await dao.listCategories()).toEqual(['Todas', 'Blazers']);
    expect((await dao.list()).length).toBe(1);

    await dao.delete('g-100');
    expect(await dao.getById('g-100')).toBeNull();
  });
});