import { LookDao } from '../../../../core/database/daos/LookDao';
import { LookItemDao } from '../../../../core/database/daos/LookItemDao';
import { Look } from '../../domain/entities/Look';
import { LookItem } from '../../domain/entities/LookItem';
import { CreateLookInput, LookRepository } from '../../domain/repositories/LookRepository';

export class LookRepositoryImpl implements LookRepository {
  constructor(
    private readonly lookDao: LookDao,
    private readonly lookItemDao: LookItemDao,
  ) {}

  async create(input: CreateLookInput): Promise<Look> {
    const now = new Date();
    const id = `look-${now.getTime()}`;
    const nowIso = now.toISOString();

    const lookRow = {
      id,
      name: input.name,
      description: input.description,
      coverImageUrl: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await this.lookDao.create(lookRow);

    await this.lookItemDao.replaceForLook(
      id,
      input.garmentIds.map((garmentId, index) => ({
        id: `${id}-item-${index + 1}`,
        lookId: id,
        garmentId,
        position: index + 1,
      })),
    );

    return lookRow;
  }

  async list(): Promise<Look[]> {
    const rows = await this.lookDao.list();
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      coverImageUrl: row.coverImageUrl,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  async getById(id: string): Promise<Look | null> {
    const row = await this.lookDao.getById(id);
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      coverImageUrl: row.coverImageUrl,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async getItemsByLookId(lookId: string): Promise<LookItem[]> {
    const rows = await this.lookItemDao.listByLookId(lookId);
    return rows.map((row) => ({
      id: row.id,
      lookId: row.lookId,
      garmentId: row.garmentId,
      position: row.position,
    }));
  }

  async delete(id: string): Promise<void> {
    await this.lookDao.delete(id);
  }
}
