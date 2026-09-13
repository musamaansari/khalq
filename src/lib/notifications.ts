import { db } from "./db.ts";
export async function flushNotifications() {
  const url = process.env.LEAD_NOTIFICATION_WEBHOOK;
  if (!url) return { configured: false, sent: 0 };
  if (!url.startsWith("https://") && process.env.NODE_ENV === "production")
    throw new Error("Notification webhooks require HTTPS.");
  const database = db();
  let sent = 0;
  const pending = database
    .prepare(
      "SELECT id,lead_id FROM notification_outbox WHERE status='pending' AND next_attempt<=? ORDER BY created_at LIMIT 20",
    )
    .all(Date.now()) as { id: string; lead_id: string }[];
  for (const item of pending) {
    // Lease each job to avoid simultaneous workers delivering the same notification.
    const claim = database
      .prepare(
        "UPDATE notification_outbox SET next_attempt=?,attempts=attempts+1 WHERE id=? AND status='pending' AND next_attempt<=?",
      )
      .run(Date.now() + 60000, item.id, Date.now());
    if (!claim.changes) continue;
    const lead = database
      .prepare("SELECT * FROM leads WHERE id=?")
      .get(item.lead_id);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": item.id,
          ...(process.env.LEAD_NOTIFICATION_TOKEN
            ? { Authorization: `Bearer ${process.env.LEAD_NOTIFICATION_TOKEN}` }
            : {}),
        },
        body: JSON.stringify({ event: "project_enquiry.created", lead }),
        signal: AbortSignal.timeout(8000),
        redirect: "error",
      });
      if (!response.ok) throw new Error("Notification rejected");
      database
        .prepare("UPDATE notification_outbox SET status='sent' WHERE id=?")
        .run(item.id);
      sent++;
    } catch {
      database
        .prepare("UPDATE notification_outbox SET next_attempt=? WHERE id=?")
        .run(Date.now() + 300000, item.id);
    }
  }
  return { configured: true, sent };
}
