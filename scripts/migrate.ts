import { database, closeDatabase } from "../src/lib/db.ts";
import { migrate } from "../src/lib/database/migrations.ts";
import { log } from "../src/lib/logger.ts";
try {
  await migrate(await database());
  console.info("Database migrations applied.");
} catch {
  log("migration_failed");
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
