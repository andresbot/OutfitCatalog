import { describe, expect, it } from 'vitest';
import { FavoriteDao } from '../src/core/database/daos/FavoriteDao';
import { createInMemorySqliteClient } from './helpers/createInMemorySqliteClient';

describe('FavoriteDao', () => {
  it('creates, queries and deletes favorites', async () => {
    const database = createInMemorySqliteClient();
    const dao = new FavoriteDao(async () => database);

    await dao.create({
      id: 'f-001',
      entityType: 'garment',
      entityId: 'g-001',
      createdAt: '2026-04-09T10:00:00.000Z',
    });

    expect((await dao.getByEntity('garment', 'g-001'))?.id).toBe('f-001');

    await dao.upsert({
      id: 'f-002',
      entityType: 'garment',
      entityId: 'g-001',
      createdAt: '2026-04-09T11:00:00.000Z',
    });

    expect((await dao.getByEntity('garment', 'g-001'))?.id).toBe('f-002');
    expect((await dao.list()).length).toBe(1);

    await dao.deleteByEntity('garment', 'g-001');
    expect(await dao.getByEntity('garment', 'g-001')).toBeNull();
  });
});