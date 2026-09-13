import { randomBytes, randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { openPostgres } from "./database/postgres.ts";
import { migrate, migrationNames } from "./database/migrations.ts";
import type { Database, Queryable, Row, SqlValue } from "./database/types.ts";
import type { LeadInput } from "./validation.ts";
import { isProduction } from "./config.ts";
import { log } from "./logger.ts";
export type { Database, Queryable };
let active: Promise<Database> | undefined;
export async function database(): Promise<Database> {
  if (!active)
    active = (async () => {
      if (process.env.DATABASE_URL)
        return openPostgres(process.env.DATABASE_URL);
      if (isProduction())
        throw new Error("Production database configuration unavailable");
      const { openSqlite } = await import("./database/sqlite.ts");
      const db = openSqlite(
        resolve(
          /* turbopackIgnore: true */ process.env.DATABASE_PATH ||
            "data/khalq.sqlite",
        ),
      );
      await migrate(db);
      return db;
    })().catch((error) => {
      active = undefined;
      log("database_error");
      throw error;
    });
  return active;
}
export async function closeDatabase() {
  if (active) {
    const connection = await active;
    active = undefined;
    await connection.close();
  }
}
export type StoredLead = Row & {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  requirement: string;
  requirement_type: string;
  project_type: string;
  source_page: string;
  landing_page: string;
  referrer: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  status: string;
  created_at: string;
  updated_at: string;
};
export type AnalyticsEvent = {
  id: string;
  visitorId: string;
  event: string;
  page: string;
  ctaLocation: string;
  projectType: string;
};
export async function recordEvent(
  event: AnalyticsEvent,
  connection?: Queryable,
) {
  const tx = connection || (await database());
  await tx.query(
    "INSERT INTO analytics_events(id,visitor_id,event,page,cta_location,project_type,created_at) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(id) DO NOTHING",
    [
      event.id,
      event.visitorId,
      event.event,
      event.page,
      event.ctaLocation,
      event.projectType,
      new Date().toISOString(),
    ],
  );
}
export async function saveLead(
  lead: LeadInput,
  options: {
    database?: Database;
    abuseHash?: string;
    event?: AnalyticsEvent;
  } = {},
) {
  const db = options.database || (await database());
  return db.transaction(async (tx) => {
    const id = randomUUID(),
      reference = "KHQ-" + randomBytes(6).toString("hex").toUpperCase(),
      now = new Date().toISOString();
    const values: SqlValue[] = [
      id,
      reference,
      lead.submissionKey || null,
      lead.name,
      lead.email,
      lead.phone,
      lead.company,
      lead.requirement,
      lead.requirementType,
      lead.projectType,
      lead.sourcePage,
      lead.landingPage,
      lead.referrer,
      lead.utmSource,
      lead.utmMedium,
      lead.utmCampaign,
      lead.utmTerm,
      lead.utmContent,
      options.abuseHash || null,
      options.abuseHash ? Date.now() + 86400000 : null,
      now,
      now,
    ];
    const rows = await tx.query<{ reference: string }>(
      "INSERT INTO leads(id,reference,submission_key,name,email,phone,company,requirement,requirement_type,project_type,source_page,landing_page,referrer,utm_source,utm_medium,utm_campaign,utm_term,utm_content,abuse_hash,abuse_expires,created_at,updated_at) VALUES(" +
        values.map((_, i) => "$" + (i + 1)).join(",") +
        ") ON CONFLICT(submission_key) DO NOTHING RETURNING reference",
      values,
    );
    if (!rows.length) {
      const existing = await tx.query<{ reference: string }>(
        "SELECT reference FROM leads WHERE submission_key=$1",
        [lead.submissionKey],
      );
      return { reference: existing[0].reference, duplicate: true };
    }
    await tx.query(
      "INSERT INTO notification_outbox(id,lead_id,created_at) VALUES($1,$2,$3)",
      [randomUUID(), id, now],
    );
    if (options.event)
      await recordEvent({ ...options.event, event: "lead_submitted", id }, tx);
    return { reference, duplicate: false };
  });
}
export async function allowRequest(
  key: string,
  limit: number,
  windowMs = 3600000,
  connection?: Database,
) {
  const db = connection || (await database()),
    now = Date.now();
  const [row] = await db.query<{ hits: number }>(
    "INSERT INTO rate_limits(key,hits,expires) VALUES($1,1,$2) ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN rate_limits.expires<=$3 THEN 1 ELSE rate_limits.hits+1 END,expires=CASE WHEN rate_limits.expires<=$3 THEN $2 ELSE rate_limits.expires END RETURNING hits",
    [key, now + windowMs, now],
  );
  return row.hits <= limit;
}
export async function databaseHealthy(connection?: Database) {
  const db = connection || (await database());
  const rows = await db.query("SELECT name FROM schema_migrations");
  return migrationNames.every((name) => rows.some((row) => row.name === name));
}
