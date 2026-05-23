import { describe, expect, it } from 'vitest';
import { FavoriteDao } from '../src/core/database/daos/FavoriteDao';
import { createInMemorySqliteClient } from './helpers/createInMemorySqliteClient';

describe('FavoriteDao', () => {
  it('creates, queries and deletes favorites', async () => {
    const database = createInMemorySqliteClient();
    const dao = new FavoriteDao(async () => database);

    await dao.create({
      id: 'f-001',
      userId: 'user-1',
      entityType: 'garment',
      entityId: 'g-001',
      createdAt: '2026-04-09T10:00:00.000Z',
    });

    expect((await dao.getByUserEntity('user-1', 'garment', 'g-001'))?.id).toBe('f-001');
    expect(await dao.getByUserEntity('user-2', 'garment', 'g-001')).toBeNull();

    await dao.upsert({
      id: 'f-002',
      userId: 'user-1',
      entityType: 'garment',
      entityId: 'g-001',
      createdAt: '2026-04-09T11:00:00.000Z',
    });

    await dao.upsert({
      id: 'f-003',
      userId: 'user-2',
      entityType: 'garment',
      entityId: 'g-001',
      createdAt: '2026-04-09T12:00:00.000Z',
    });

    expect((await dao.getByUserEntity('user-1', 'garment', 'g-001'))?.id).toBe('f-002');
    expect((await dao.getByUserEntity('user-2', 'garment', 'g-001'))?.id).toBe('f-003');
    expect((await dao.list()).length).toBe(2);
    expect((await dao.listByUserId('user-1')).length).toBe(1);

    await dao.deleteByUserEntity('user-1', 'garment', 'g-001');
    expect(await dao.getByUserEntity('user-1', 'garment', 'g-001')).toBeNull();
    expect((await dao.getByUserEntity('user-2', 'garment', 'g-001'))?.id).toBe('f-003');
  });
});
