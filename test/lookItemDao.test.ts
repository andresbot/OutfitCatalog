import { describe, expect, it } from 'vitest';
import { LookItemDao } from '../src/core/database/daos/LookItemDao';
import { createInMemorySqliteClient } from './helpers/createInMemorySqliteClient';

describe('LookItemDao', () => {
  it('creates, updates, replaces and deletes look items', async () => {
    const database = createInMemorySqliteClient();
    const dao = new LookItemDao(async () => database);

    await dao.create({
      id: 'li-001',
      lookId: 'l-001',
      garmentId: 'g-001',
      position: 1,
    });

    await dao.create({
      id: 'li-002',
      lookId: 'l-001',
      garmentId: 'g-002',
      position: 2,
    });

    expect((await dao.listByLookId('l-001')).map((item) => item.id)).toEqual(['li-001', 'li-002']);

    await dao.update({
      id: 'li-002',
      lookId: 'l-001',
      garmentId: 'g-003',
      position: 1,
    });

    expect((await dao.getById('li-002'))?.garmentId).toBe('g-003');

    await dao.replaceForLook('l-001', [
      {
        id: 'li-003',
        lookId: 'l-001',
        garmentId: 'g-004',
        position: 1,
      },
    ]);

    expect((await dao.listByLookId('l-001')).map((item) => item.id)).toEqual(['li-003']);

    await dao.delete('li-003');
    expect(await dao.getById('li-003')).toBeNull();
  });
});