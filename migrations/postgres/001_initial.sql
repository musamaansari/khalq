CREATE TABLE leads (
 id TEXT PRIMARY KEY,reference TEXT NOT NULL UNIQUE,submission_key TEXT UNIQUE,
 name TEXT NOT NULL,email TEXT NOT NULL,phone TEXT NOT NULL,company TEXT NOT NULL,
 requirement TEXT NOT NULL,requirement_type TEXT NOT NULL,project_type TEXT NOT NULL DEFAULT 'not-sure',
 source_page TEXT NOT NULL,landing_page TEXT NOT NULL DEFAULT '/',referrer TEXT NOT NULL,
 utm_source TEXT NOT NULL,utm_medium TEXT NOT NULL,utm_campaign TEXT NOT NULL,utm_term TEXT NOT NULL DEFAULT '',utm_content TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','reviewing','contacted','qualified','proposal','won','lost')),
 abuse_hash TEXT,abuse_expires BIGINT,user_agent TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL,updated_at TEXT NOT NULL
);
CREATE TABLE notification_outbox(id TEXT PRIMARY KEY,lead_id TEXT NOT NULL REFERENCES leads(id),status TEXT NOT NULL DEFAULT 'pending',attempts INTEGER NOT NULL DEFAULT 0,next_attempt BIGINT NOT NULL DEFAULT 0,created_at TEXT NOT NULL,last_error_code TEXT,delivered_at TEXT);
CREATE TABLE rate_limits(key TEXT PRIMARY KEY,hits INTEGER NOT NULL,expires BIGINT NOT NULL);
CREATE TABLE events(day TEXT NOT NULL,event TEXT NOT NULL,page TEXT NOT NULL,count INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(day,event,page));
CREATE INDEX leads_status ON leads(status,created_at);
CREATE INDEX notifications_pending ON notification_outbox(status,next_attempt);
