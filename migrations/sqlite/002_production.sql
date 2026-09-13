CREATE TABLE leads_next (
 id TEXT PRIMARY KEY,reference TEXT NOT NULL UNIQUE,submission_key TEXT UNIQUE,
 name TEXT NOT NULL,email TEXT NOT NULL,phone TEXT NOT NULL,company TEXT NOT NULL,
 requirement TEXT NOT NULL,requirement_type TEXT NOT NULL,project_type TEXT NOT NULL DEFAULT 'not-sure',
 source_page TEXT NOT NULL,landing_page TEXT NOT NULL DEFAULT '/',referrer TEXT NOT NULL,
 utm_source TEXT NOT NULL,utm_medium TEXT NOT NULL,utm_campaign TEXT NOT NULL,utm_term TEXT NOT NULL DEFAULT '',utm_content TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','reviewing','contacted','qualified','proposal','won','lost')),
 abuse_hash TEXT,abuse_expires INTEGER,user_agent TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL,updated_at TEXT NOT NULL
);
INSERT INTO leads_next(id,reference,name,email,phone,company,requirement,requirement_type,source_page,landing_page,referrer,utm_source,utm_medium,utm_campaign,status,created_at,updated_at)
SELECT id,'KHQ-'||upper(replace(id,'-','')),name,email,phone,company,requirement,requirement_type,source_page,source_page,referrer,utm_source,utm_medium,utm_campaign,lower(status),created_at,created_at FROM leads;
DROP TABLE leads;
ALTER TABLE leads_next RENAME TO leads;
ALTER TABLE notification_outbox ADD COLUMN last_error_code TEXT;
ALTER TABLE notification_outbox ADD COLUMN delivered_at TEXT;
CREATE INDEX leads_status ON leads(status,created_at);
CREATE INDEX IF NOT EXISTS notifications_pending ON notification_outbox(status,next_attempt);
CREATE TABLE analytics_events(id TEXT PRIMARY KEY,visitor_id TEXT NOT NULL,event TEXT NOT NULL,page TEXT NOT NULL,cta_location TEXT NOT NULL,project_type TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE INDEX analytics_funnel ON analytics_events(event,visitor_id,created_at);
CREATE TRIGGER leads_updated_at AFTER UPDATE OF name,email,phone,company,requirement,requirement_type,project_type,status ON leads
BEGIN UPDATE leads SET updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=NEW.id; END;
