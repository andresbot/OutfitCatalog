import { describe, expect, it } from 'vitest';
import { LookDao } from '../src/core/database/daos/LookDao';
import { createInMemorySqliteClient } from './helpers/createInMemorySqliteClient';

describe('LookDao', () => {
  it('creates, updates, lists and deletes looks', async () => {
    const database = createInMemorySqliteClient();
    const dao = new LookDao(async () => database);

    await dao.create({
      id: 'l-001',
      name: 'Look oficina',
      description: 'Combinacion formal',
      coverImageUrl: 'https://example.com/look.jpg',
      createdAt: '2026-04-09T10:00:00.000Z',
      updatedAt: '2026-04-09T10:00:00.000Z',
    });

    expect((await dao.getById('l-001'))?.name).toBe('Look oficina');

    await dao.update({
      id: 'l-001',
      name: 'Look oficina premium',
      description: 'Combinacion formal actualizada',
      coverImageUrl: null,
      createdAt: '2026-04-09T10:00:00.000Z',
      updatedAt: '2026-04-09T11:00:00.000Z',
    });

    expect((await dao.getById('l-001'))?.coverImageUrl).toBeNull();
    expect((await dao.list()).length).toBe(1);

    await dao.delete('l-001');
    expect(await dao.getById('l-001')).toBeNull();
  });
});