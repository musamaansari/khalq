import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import type { LeadInput } from "./validation.ts";
let connection: DatabaseSync | undefined;
export function db() {
  if (connection) return connection;
  const path = resolve(
    /* turbopackIgnore: true */ process.env.DATABASE_PATH ||
      "data/khalq.sqlite",
  );
  mkdirSync(dirname(path), { recursive: true });
  connection = new DatabaseSync(path);
  connection.exec(`
 PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
 CREATE TABLE IF NOT EXISTS leads (
 id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL,phone TEXT NOT NULL,company TEXT NOT NULL,
 requirement TEXT NOT NULL,requirement_type TEXT NOT NULL,source_page TEXT NOT NULL,
 utm_source TEXT NOT NULL,utm_medium TEXT NOT NULL,utm_campaign TEXT NOT NULL,referrer TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'New' CHECK(status IN ('New','Reviewing','Contacted','Qualified','Proposal','Won','Lost')),
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));
 CREATE TABLE IF NOT EXISTS notification_outbox (id TEXT PRIMARY KEY,lead_id TEXT NOT NULL REFERENCES leads(id),status TEXT NOT NULL DEFAULT 'pending',attempts INTEGER NOT NULL DEFAULT 0,next_attempt INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));
 CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY,hits INTEGER NOT NULL,expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS events (day TEXT NOT NULL,event TEXT NOT NULL,page TEXT NOT NULL,count INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(day,event,page));
 CREATE INDEX IF NOT EXISTS leads_status ON leads(status,created_at);
 CREATE INDEX IF NOT EXISTS notifications_pending ON notification_outbox(status,next_attempt);
 `);
  return connection;
}
export function saveLead(lead: LeadInput) {
  const database = db(),
    id = randomUUID();
  database.exec("BEGIN IMMEDIATE");
  try {
    database
      .prepare(
        "INSERT INTO leads(id,name,email,phone,company,requirement,requirement_type,source_page,utm_source,utm_medium,utm_campaign,referrer) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
      )
      .run(
        id,
        lead.name,
        lead.email,
        lead.phone,
        lead.company,
        lead.requirement,
        lead.requirementType,
        lead.sourcePage,
        lead.utmSource,
        lead.utmMedium,
        lead.utmCampaign,
        lead.referrer,
      );
    database
      .prepare("INSERT INTO notification_outbox(id,lead_id) VALUES(?,?)")
      .run(randomUUID(), id);
    database.exec("COMMIT");
    return id;
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}
export function allowRequest(key: string, limit: number, windowMs = 3600000) {
  const database = db(),
    now = Date.now();
  database.prepare("DELETE FROM rate_limits WHERE expires <= ?").run(now);
  const result = database
    .prepare(
      "INSERT INTO rate_limits(key,hits,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET hits=hits+1 RETURNING hits",
    )
    .get(key, now + windowMs) as { hits: number };
  return result.hits <= limit;
}
export function recordEvent(event: string, page: string) {
  db()
    .prepare(
      "INSERT INTO events(day,event,page,count) VALUES(date('now'),?,?,1) ON CONFLICT(day,event,page) DO UPDATE SET count=count+1",
    )
    .run(event, page);
}
