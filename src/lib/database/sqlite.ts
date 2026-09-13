import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { Database, Queryable, Row, SqlValue } from "./types.ts";
export function openSqlite(path: string): Database {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const raw = new DatabaseSync(path);
  raw.exec(
    "PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;",
  );
  const connection: Queryable = {
    async query<T extends Row>(sql: string, values: SqlValue[] = []) {
      const parameters: SqlValue[] = [];
      const statement = raw.prepare(
        sql.replace(/\$(\d+)/g, (_, n) => {
          parameters.push(values[Number(n) - 1]);
          return "?";
        }),
      );
      return statement.all(...parameters) as T[];
    },
    async exec(sql) {
      raw.exec(sql);
    },
  };
  // Serialize complete transactions, not individual statements, on one SQLite connection.
  let queue: Promise<unknown> = Promise.resolve();
  function exclusive<T>(work: () => Promise<T>) {
    const result = queue.then(work);
    queue = result.catch(() => {});
    return result;
  }
  return {
    dialect: "sqlite",
    query: (sql, values) => exclusive(() => connection.query(sql, values)),
    exec: (sql) => exclusive(() => connection.exec(sql)),
    transaction: (work) =>
      exclusive(async () => {
        raw.exec("BEGIN IMMEDIATE");
        try {
          const result = await work(connection);
          raw.exec("COMMIT");
          return result;
        } catch (error) {
          raw.exec("ROLLBACK");
          throw error;
        }
      }),
    close: () => exclusive(async () => raw.close()),
  };
}
