import { DatabaseSync } from "node:sqlite";
import { resolve } from "node:path";
import { openPostgres } from "../src/lib/database/postgres.ts";
import { migrate } from "../src/lib/database/migrations.ts";
import type { SqlValue } from "../src/lib/database/types.ts";
import { log } from "../src/lib/logger.ts";

// Explicit maintenance operation: freeze writes and take a backup first. Never runs during deployment.
const sourcePath = process.env.SQLITE_IMPORT_PATH;
if (!sourcePath || !process.env.DATABASE_URL) {
  console.error("Set SQLITE_IMPORT_PATH and DATABASE_URL.");
  process.exit(1);
}
const source = new DatabaseSync(resolve(sourcePath), { readOnly: true });
const destination = openPostgres(process.env.DATABASE_URL);
try {
  const versions = source.prepare("SELECT name FROM schema_migrations").all();
  if (!versions.some((row) => row.name === "002_production"))
    throw Error("Upgrade the source SQLite database first");
  await migrate(destination);
  await destination.transaction(async (tx) => {
    const existing = await tx.query("SELECT id FROM leads LIMIT 1");
    if (existing.length)
      throw Error("Import destination must contain no leads");
    for (const table of [
      "leads",
      "notification_outbox",
      "analytics_events",
      "events",
    ] as const) {
      const rows = source.prepare(`SELECT * FROM ${table}`).all();
      for (const row of rows) {
        const keys = Object.keys(row);
        if (keys.some((key) => !/^[a-z_]+$/.test(key)))
          throw Error("Unexpected source schema");
        await tx.query(
          `INSERT INTO ${table}(${keys.join(",")}) VALUES(${keys.map((_, i) => "$" + (i + 1)).join(",")})`,
          keys.map((key) => row[key] as SqlValue),
        );
      }
      const [result] = await tx.query(`SELECT COUNT(*) AS count FROM ${table}`);
      if (Number(result.count) !== rows.length)
        throw Error("Import count verification failed");
      console.info(`${table}: ${rows.length} rows verified.`);
    }
  });
  console.info(
    "Import completed. Source unchanged. Keep the original backup until production verification.",
  );
} catch {
  log("migration_failed");
  console.error(
    "Import failed. Confirm the source is migrated, destination is empty, and credentials are valid.",
  );
  process.exitCode = 1;
} finally {
  source.close();
  await destination.close();
}
