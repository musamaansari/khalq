CREATE TABLE analytics_events(id TEXT PRIMARY KEY,visitor_id TEXT NOT NULL,event TEXT NOT NULL,page TEXT NOT NULL,cta_location TEXT NOT NULL,project_type TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE INDEX analytics_funnel ON analytics_events(event,visitor_id,created_at);
CREATE FUNCTION update_lead_timestamp() RETURNS trigger AS $$
BEGIN NEW.updated_at=to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'); RETURN NEW; END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER leads_updated_at BEFORE UPDATE OF name,email,phone,company,requirement,requirement_type,project_type,status ON leads FOR EACH ROW EXECUTE FUNCTION update_lead_timestamp();
