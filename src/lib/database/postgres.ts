import { Pool, type PoolClient } from "pg";
import type { Database, Queryable, Row, SqlValue } from "./types.ts";
import { log } from "../logger.ts";
export function openPostgres(connectionString: string): Database {
  const pool = new Pool({
    connectionString,
    max: 5,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    statement_timeout: 10000,
  });
  pool.on("error", () => log("database_error"));
  function connection(client: Pool | PoolClient): Queryable {
    return {
      async query<T extends Row>(sql: string, values: SqlValue[] = []) {
        return (await client.query(sql, values)).rows as T[];
      },
      async exec(sql) {
        await client.query(sql);
      },
    };
  }
  return {
    dialect: "postgres",
    ...connection(pool),
    async transaction(work) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const result = await work(connection(client));
        await client.query("COMMIT");
        return result;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    async close() {
      await pool.end();
    },
  };
}
