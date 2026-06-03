import { LookDao } from '../../../../core/database/daos/LookDao';
import { LookItemDao } from '../../../../core/database/daos/LookItemDao';
import { Look } from '../../domain/entities/Look';
import { LookItem } from '../../domain/entities/LookItem';
import { CreateLookInput, UpdateLookInput, LookRepository } from '../../domain/repositories/LookRepository';
import { LookRemoteDataSource } from '../datasources/LookRemoteDataSource';

export class LookRepositoryImpl implements LookRepository {
  constructor(
    private readonly lookDao: LookDao,
    private readonly lookItemDao: LookItemDao,
    private readonly remote?: LookRemoteDataSource,
  ) {}

  async create(input: CreateLookInput): Promise<Look> {
    const now = new Date();
    const id = `look-${now.getTime()}`;
    const nowIso = now.toISOString();

    const lookRow = {
      id,
      userId: input.userId,
      name: input.name,
      description: input.description,
      coverImageUrl: input.coverImageUrl ?? null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await this.lookDao.create(lookRow);

    const items = input.garmentIds.map((garmentId, index) => ({
      id: `${id}-item-${index + 1}`,
      lookId: id,
      garmentId,
      position: index + 1,
    }));

    await this.lookItemDao.replaceForLook(id, items);

    this.remote?.upsertLook(lookRow, input.garmentIds).catch(() => {});

    return lookRow;
  }

  async update(input: UpdateLookInput): Promise<void> {
    const existing = await this.lookDao.getById(input.id);
    if (!existing) throw new Error(`Look ${input.id} no encontrado.`);

    const updated = {
      ...existing,
      name: input.name,
      description: input.description,
      coverImageUrl: input.coverImageUrl !== undefined ? input.coverImageUrl : existing.coverImageUrl,
      updatedAt: new Date().toISOString(),
    };

    await this.lookDao.update(updated);

    const newItems = input.garmentIds.map((garmentId, i) => ({
      id: `${input.id}-item-${i + 1}`,
      lookId: input.id,
      garmentId,
      position: i,
    }));
    await this.lookItemDao.replaceForLook(input.id, newItems);

    this.remote?.upsertLook(updated, input.garmentIds).catch(() => {});
  }

  async list(): Promise<Look[]> {
    return (await this.lookDao.list()).map(rowToLook);
  }

  async listByUserId(userId: string): Promise<Look[]> {
    return (await this.lookDao.listByUserId(userId)).map(rowToLook);
  }

  async getById(id: string): Promise<Look | null> {
    const row = await this.lookDao.getById(id);
    return row ? rowToLook(row) : null;
  }

  async getItemsByLookId(lookId: string): Promise<LookItem[]> {
    return (await this.lookItemDao.listByLookId(lookId)).map((row) => ({
      id: row.id,
      lookId: row.lookId,
      garmentId: row.garmentId,
      position: row.position,
    }));
  }

  async delete(id: string): Promise<void> {
    await this.lookDao.delete(id);
    this.remote?.deleteLook(id).catch(() => {});
  }
}

function rowToLook(row: {
  id: string;
  userId: string;
  name: string;
  description: string;
  coverImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}): Look {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    description: row.description,
    coverImageUrl: row.coverImageUrl,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
