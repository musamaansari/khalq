import { validateRuntime } from "./config.ts";
import { databaseHealthy, type Database } from "./db.ts";
import { log } from "./logger.ts";
export async function healthResponse(connection?: Database) {
  try {
    validateRuntime();
    if (!(await databaseHealthy(connection))) throw Error("Migrations missing");
    return Response.json(
      { status: "ok" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    log("health_failed");
    return Response.json(
      { status: "unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
