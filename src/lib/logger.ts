type LogCode =
  | "configuration_invalid"
  | "database_error"
  | "submission_failed"
  | "notification_failed"
  | "notification_sent"
  | "notification_unconfigured"
  | "rate_limited"
  | "migration_failed"
  | "application_error"
  | "health_failed";
// Only allow low-cardinality codes and opaque identifiers. Never accept Error objects or arbitrary payloads.
export function log(
  code: LogCode,
  metadata: {
    requestId?: string;
    leadId?: string;
    jobId?: string;
    provider?: string;
    attempt?: number;
  } = {},
) {
  const entry = { time: new Date().toISOString(), code, ...metadata };
  if (code === "notification_sent") console.info(JSON.stringify(entry));
  else console.error(JSON.stringify(entry));
}
