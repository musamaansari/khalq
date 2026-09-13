export type SqlValue = string | number | null;
export type Row = Record<string, unknown>;
export interface Queryable {
  query<T extends Row = Row>(sql: string, values?: SqlValue[]): Promise<T[]>;
  exec(sql: string): Promise<void>;
}
export interface Database extends Queryable {
  dialect: "sqlite" | "postgres";
  transaction<T>(work: (connection: Queryable) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}
