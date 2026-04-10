export type SqlValue = string | number | null;

export type SqliteRunResult = {
  rowsAffected: number;
  lastInsertRowId: number;
};

export interface SqliteClient {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, ...params: SqlValue[]): Promise<SqliteRunResult>;
  getFirstAsync<T>(sql: string, ...params: SqlValue[]): Promise<T | null>;
  getAllAsync<T>(sql: string, ...params: SqlValue[]): Promise<T[]>;
}

export type SqliteClientProvider = () => Promise<SqliteClient>;