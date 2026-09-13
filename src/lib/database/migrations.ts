import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";
import type { Database } from "./types.ts";
export const migrationNames = ["001_initial", "002_production"];
export async function migrate(database: Database) {
  // The local V1 upgrade rebuilds the status CHECK constraint. FK verification occurs before commit.
  if (database.dialect === "sqlite")
    await database.exec("PRAGMA foreign_keys=OFF");
  try {
    await database.transaction(async (tx) => {
      if (database.dialect === "postgres")
        await tx.query("SELECT pg_advisory_xact_lock(732194016)");
      await tx.exec(
        "CREATE TABLE IF NOT EXISTS schema_migrations(name TEXT PRIMARY KEY,checksum TEXT NOT NULL,applied_at TEXT NOT NULL)",
      );
      for (const name of migrationNames) {
        const sql = await readFile(
          join(process.cwd(), "migrations", database.dialect, name + ".sql"),
          "utf8",
        );
        const checksum = createHash("sha256")
          .update(sql.replace(/\r\n/g, "\n"))
          .digest("hex");
        const previous = await tx.query(
          "SELECT checksum FROM schema_migrations WHERE name=$1",
          [name],
        );
        if (previous.length) {
          if (previous[0].checksum !== checksum)
            throw new Error("Applied migration checksum mismatch");
          continue;
        }
        await tx.exec(sql);
        await tx.query(
          "INSERT INTO schema_migrations(name,checksum,applied_at) VALUES($1,$2,$3)",
          [name, checksum, new Date().toISOString()],
        );
      }
      if (
        database.dialect === "sqlite" &&
        (await tx.query("PRAGMA foreign_key_check")).length
      )
        throw new Error("Foreign-key verification failed");
    });
  } finally {
    if (database.dialect === "sqlite")
      await database.exec("PRAGMA foreign_keys=ON");
  }
}
