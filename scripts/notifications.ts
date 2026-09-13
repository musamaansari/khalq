import { flushNotifications } from "../src/lib/notifications.ts";
import { database, closeDatabase } from "../src/lib/db.ts";
import { validateRuntime, positiveInt } from "../src/lib/config.ts";
import { log } from "../src/lib/logger.ts";
import { setTimeout as delay } from "node:timers/promises";
const loop = process.argv.includes("--loop");
let stopping = false;
const shutdown = new AbortController();
process.on("SIGTERM", () => {
  stopping = true;
  shutdown.abort();
});
process.on("SIGINT", () => {
  stopping = true;
  shutdown.abort();
});
try {
  validateRuntime();
  do {
    try {
      const result = await flushNotifications();
      if (!loop) console.info(JSON.stringify(result));
      const db = await database();
      await db.query("DELETE FROM rate_limits WHERE expires<$1", [Date.now()]);
      await db.query(
        "UPDATE leads SET abuse_hash=NULL,abuse_expires=NULL WHERE abuse_expires<$1",
        [Date.now()],
      );
      await db.query("DELETE FROM analytics_events WHERE created_at<$1", [
        new Date(
          Date.now() -
            positiveInt(process.env.ANALYTICS_RETENTION_DAYS, 90, 365) *
              86400000,
        ).toISOString(),
      ]);
    } catch {
      log("notification_failed");
      if (!loop) process.exitCode = 1;
    }
    if (loop && !stopping)
      await delay(60000, undefined, { signal: shutdown.signal }).catch(
        () => {},
      );
  } while (loop && !stopping);
} catch {
  log("configuration_invalid");
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
