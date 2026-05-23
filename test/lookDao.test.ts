import { describe, expect, it } from 'vitest';
import { LookDao } from '../src/core/database/daos/LookDao';
import { createInMemorySqliteClient } from './helpers/createInMemorySqliteClient';

describe('LookDao', () => {
  it('creates, updates, lists and deletes looks', async () => {
    const database = createInMemorySqliteClient();
    const dao = new LookDao(async () => database);

    await dao.create({
      id: 'l-001',
      userId: 'user-1',
      name: 'Look oficina',
      description: 'Combinacion formal',
      coverImageUrl: 'https://example.com/look.jpg',
      createdAt: '2026-04-09T10:00:00.000Z',
      updatedAt: '2026-04-09T10:00:00.000Z',
    });

    expect((await dao.getById('l-001'))?.name).toBe('Look oficina');
    expect((await dao.getByIdForUser('l-001', 'user-2'))).toBeNull();

    await dao.update({
      id: 'l-001',
      userId: 'user-1',
      name: 'Look oficina premium',
      description: 'Combinacion formal actualizada',
      coverImageUrl: null,
      createdAt: '2026-04-09T10:00:00.000Z',
      updatedAt: '2026-04-09T11:00:00.000Z',
    });

    expect((await dao.getById('l-001'))?.coverImageUrl).toBeNull();
    expect((await dao.list()).length).toBe(1);
    expect((await dao.listByUserId('user-1')).length).toBe(1);
    expect((await dao.listByUserId('user-2')).length).toBe(0);

    await dao.deleteForUser('l-001', 'user-2');
    expect(await dao.getById('l-001')).not.toBeNull();

    await dao.deleteForUser('l-001', 'user-1');
    expect(await dao.getById('l-001')).toBeNull();
  });
});
