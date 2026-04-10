import { FavoriteRow, GarmentRow, LookItemRow, LookRow } from '../../src/core/database/types';
import { SqliteClient } from '../../src/core/database/sqliteClient';

type DatabaseState = {
  garments: GarmentRow[];
  looks: LookRow[];
  lookItems: LookItemRow[];
  favorites: FavoriteRow[];
  schemaMeta: Record<string, string>;
};

type TableName = keyof Pick<DatabaseState, 'garments' | 'looks' | 'lookItems' | 'favorites'>;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isSameFavorite(favorite: FavoriteRow, entityType: string, entityId: string): boolean {
  return favorite.entityType === entityType && favorite.entityId === entityId;
}

function normalizeSql(sql: string): string {
  return sql.replace(/\s+/g, ' ').trim();
}

export function createInMemorySqliteClient(initialState?: Partial<DatabaseState>): SqliteClient & { state: DatabaseState } {
  const state: DatabaseState = {
    garments: initialState?.garments ? clone(initialState.garments) : [],
    looks: initialState?.looks ? clone(initialState.looks) : [],
    lookItems: initialState?.lookItems ? clone(initialState.lookItems) : [],
    favorites: initialState?.favorites ? clone(initialState.favorites) : [],
    schemaMeta: initialState?.schemaMeta ? clone(initialState.schemaMeta) : {},
  };

  const orderGarments = (rows: GarmentRow[]): GarmentRow[] =>
    [...rows].sort((left, right) => {
      const categoryComparison = left.category.localeCompare(right.category);
      if (categoryComparison !== 0) {
        return categoryComparison;
      }

      return left.name.localeCompare(right.name);
    });

  const orderLooks = (rows: LookRow[]): LookRow[] =>
    [...rows].sort((left, right) => {
      const updatedComparison = right.updatedAt.localeCompare(left.updatedAt);
      if (updatedComparison !== 0) {
        return updatedComparison;
      }

      return left.name.localeCompare(right.name);
    });

  const orderFavorites = (rows: FavoriteRow[]): FavoriteRow[] =>
    [...rows].sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  const getTable = (tableName: TableName): Array<GarmentRow | LookRow | LookItemRow | FavoriteRow> => {
    return state[tableName] as Array<GarmentRow | LookRow | LookItemRow | FavoriteRow>;
  };

  return {
    state,
    async execAsync(sql: string): Promise<void> {
      const normalizedSql = normalizeSql(sql);

      if (normalizedSql.includes('BEGIN') || normalizedSql.includes('COMMIT') || normalizedSql.includes('ROLLBACK')) {
        return;
      }
    },
    async runAsync(sql: string, ...params: Array<string | number | null>): Promise<{ rowsAffected: number; lastInsertRowId: number }> {
      const normalizedSql = normalizeSql(sql);

      if (normalizedSql.includes('INSERT INTO garments')) {
        const row: GarmentRow = {
          id: String(params[0]),
          name: String(params[1]),
          category: String(params[2]),
          price: Number(params[3]),
          imageUrl: String(params[4]),
          description: String(params[5]),
          size: String(params[6]),
          color: String(params[7]),
          stock: Number(params[8]),
          createdAt: String(params[9]),
          updatedAt: String(params[10]),
        };

        const existingIndex = state.garments.findIndex((garment) => garment.id === row.id);
        if (existingIndex >= 0) {
          state.garments[existingIndex] = row;
        } else {
          state.garments.push(row);
        }

        return { rowsAffected: 1, lastInsertRowId: 1 };
      }

      if (normalizedSql.includes('UPDATE garments')) {
        const id = String(params[9]);
        const index = state.garments.findIndex((garment) => garment.id === id);
        if (index >= 0) {
          state.garments[index] = {
            ...state.garments[index],
            name: String(params[0]),
            category: String(params[1]),
            price: Number(params[2]),
            imageUrl: String(params[3]),
            description: String(params[4]),
            size: String(params[5]),
            color: String(params[6]),
            stock: Number(params[7]),
            updatedAt: String(params[8]),
          };
        }

        return { rowsAffected: index >= 0 ? 1 : 0, lastInsertRowId: 0 };
      }

      if (normalizedSql.includes('DELETE FROM garments')) {
        const id = String(params[0]);
        const before = state.garments.length;
        state.garments = state.garments.filter((garment) => garment.id !== id);
        return { rowsAffected: before - state.garments.length, lastInsertRowId: 0 };
      }

      if (normalizedSql.includes('INSERT INTO looks')) {
        const row: LookRow = {
          id: String(params[0]),
          name: String(params[1]),
          description: String(params[2]),
          coverImageUrl: params[3] == null ? null : String(params[3]),
          createdAt: String(params[4]),
          updatedAt: String(params[5]),
        };

        const existingIndex = state.looks.findIndex((look) => look.id === row.id);
        if (existingIndex >= 0) {
          state.looks[existingIndex] = row;
        } else {
          state.looks.push(row);
        }

        return { rowsAffected: 1, lastInsertRowId: 1 };
      }

      if (normalizedSql.includes('UPDATE looks')) {
        const id = String(params[4]);
        const index = state.looks.findIndex((look) => look.id === id);
        if (index >= 0) {
          state.looks[index] = {
            ...state.looks[index],
            name: String(params[0]),
            description: String(params[1]),
            coverImageUrl: params[2] == null ? null : String(params[2]),
            updatedAt: String(params[3]),
          };
        }

        return { rowsAffected: index >= 0 ? 1 : 0, lastInsertRowId: 0 };
      }

      if (normalizedSql.includes('DELETE FROM looks')) {
        const id = String(params[0]);
        state.looks = state.looks.filter((look) => look.id !== id);
        state.lookItems = state.lookItems.filter((item) => item.lookId !== id);
        return { rowsAffected: 1, lastInsertRowId: 0 };
      }

      if (normalizedSql.includes('INSERT INTO look_items')) {
        const row: LookItemRow = {
          id: String(params[0]),
          lookId: String(params[1]),
          garmentId: String(params[2]),
          position: Number(params[3]),
        };

        const existingIndex = state.lookItems.findIndex((item) => item.id === row.id);
        if (existingIndex >= 0) {
          state.lookItems[existingIndex] = row;
        } else {
          state.lookItems.push(row);
        }

        return { rowsAffected: 1, lastInsertRowId: 1 };
      }

      if (normalizedSql.includes('UPDATE look_items')) {
        const id = String(params[3]);
        const index = state.lookItems.findIndex((item) => item.id === id);
        if (index >= 0) {
          state.lookItems[index] = {
            id,
            lookId: String(params[0]),
            garmentId: String(params[1]),
            position: Number(params[2]),
          };
        }

        return { rowsAffected: index >= 0 ? 1 : 0, lastInsertRowId: 0 };
      }

      if (normalizedSql.includes('DELETE FROM look_items WHERE look_id = ?')) {
        const lookId = String(params[0]);
        const before = state.lookItems.length;
        state.lookItems = state.lookItems.filter((item) => item.lookId !== lookId);
        return { rowsAffected: before - state.lookItems.length, lastInsertRowId: 0 };
      }

      if (normalizedSql.includes('DELETE FROM look_items WHERE id = ?')) {
        const id = String(params[0]);
        const before = state.lookItems.length;
        state.lookItems = state.lookItems.filter((item) => item.id !== id);
        return { rowsAffected: before - state.lookItems.length, lastInsertRowId: 0 };
      }

      if (normalizedSql.includes('INSERT INTO favorites')) {
        const row: FavoriteRow = {
          id: String(params[0]),
          entityType: String(params[1]),
          entityId: String(params[2]),
          createdAt: String(params[3]),
        };

        const existingIndex = state.favorites.findIndex((favorite) => favorite.id === row.id);
        if (existingIndex >= 0) {
          state.favorites[existingIndex] = row;
        } else {
          state.favorites.push(row);
        }

        return { rowsAffected: 1, lastInsertRowId: 1 };
      }

      if (normalizedSql.includes('DELETE FROM favorites WHERE entity_type = ? AND entity_id = ?')) {
        const entityType = String(params[0]);
        const entityId = String(params[1]);
        const before = state.favorites.length;
        state.favorites = state.favorites.filter((favorite) => !isSameFavorite(favorite, entityType, entityId));
        return { rowsAffected: before - state.favorites.length, lastInsertRowId: 0 };
      }

      if (normalizedSql.includes('DELETE FROM favorites WHERE id = ?')) {
        const id = String(params[0]);
        const before = state.favorites.length;
        state.favorites = state.favorites.filter((favorite) => favorite.id !== id);
        return { rowsAffected: before - state.favorites.length, lastInsertRowId: 0 };
      }

      if (normalizedSql.includes('DELETE FROM schema_meta')) {
        state.schemaMeta = {};
      }

      return { rowsAffected: 0, lastInsertRowId: 0 };
    },
    async getFirstAsync<T>(sql: string, ...params: Array<string | number | null>): Promise<T | null> {
      const normalizedSql = normalizeSql(sql);

      if (normalizedSql.includes('FROM garments WHERE id = ?')) {
        return (state.garments.find((garment) => garment.id === String(params[0])) ?? null) as T | null;
      }

      if (normalizedSql.includes('FROM looks WHERE id = ?')) {
        return (state.looks.find((look) => look.id === String(params[0])) ?? null) as T | null;
      }

      if (normalizedSql.includes('FROM look_items WHERE id = ?')) {
        return (state.lookItems.find((item) => item.id === String(params[0])) ?? null) as T | null;
      }

      if (normalizedSql.includes('FROM favorites WHERE id = ?')) {
        return (state.favorites.find((favorite) => favorite.id === String(params[0])) ?? null) as T | null;
      }

      if (normalizedSql.includes('FROM favorites WHERE entity_type = ? AND entity_id = ?')) {
        return (
          state.favorites.find((favorite) => isSameFavorite(favorite, String(params[0]), String(params[1]))) ?? null
        ) as T | null;
      }

      if (normalizedSql.includes('SELECT value FROM schema_meta WHERE key = ?')) {
        const value = state.schemaMeta[String(params[0])];
        return (value ? ({ value } as T) : null) as T | null;
      }

      if (normalizedSql.includes('SELECT COUNT(*) AS count FROM garments')) {
        return ({ count: state.garments.length } as T) as T | null;
      }

      if (normalizedSql.includes('SELECT COUNT(*) AS count FROM looks')) {
        return ({ count: state.looks.length } as T) as T | null;
      }

      if (normalizedSql.includes('SELECT COUNT(*) AS count FROM look_items')) {
        return ({ count: state.lookItems.length } as T) as T | null;
      }

      if (normalizedSql.includes('SELECT COUNT(*) AS count FROM favorites')) {
        return ({ count: state.favorites.length } as T) as T | null;
      }

      return null;
    },
    async getAllAsync<T>(sql: string, ...params: Array<string | number | null>): Promise<T[]> {
      const normalizedSql = normalizeSql(sql);

      if (normalizedSql.includes('FROM garments')) {
        return orderGarments(clone(state.garments)) as T[];
      }

      if (normalizedSql.includes('FROM looks')) {
        return orderLooks(clone(state.looks)) as T[];
      }

      if (normalizedSql.includes('FROM look_items WHERE look_id = ?')) {
        return clone(state.lookItems.filter((item) => item.lookId === String(params[0]))).sort((left, right) => left.position - right.position) as T[];
      }

      if (normalizedSql.includes('FROM look_items')) {
        return clone(state.lookItems) as T[];
      }

      if (normalizedSql.includes('FROM favorites')) {
        return orderFavorites(clone(state.favorites)) as T[];
      }

      if (normalizedSql.includes('FROM sqlite_master')) {
        return [
          { name: 'garments' },
          { name: 'looks' },
          { name: 'look_items' },
          { name: 'favorites' },
        ] as T[];
      }

      return [] as T[];
    },
  };
}