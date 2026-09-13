import { database, type Database, type StoredLead } from "./db.ts";
import { deliverEmail } from "./email.ts";
import { emailProvider } from "./config.ts";
import { log } from "./logger.ts";
export async function flushNotifications(connection?: Database) {
  const provider = emailProvider();
  if (provider === "disabled") return { configured: false, sent: 0, failed: 0 };
  const db = connection || (await database());
  let sent = 0,
    failed = 0;
  const jobs = await db.query<{
    id: string;
    lead_id: string;
    attempts: number;
  }>(
    "SELECT id,lead_id,attempts FROM notification_outbox WHERE status='pending' AND next_attempt<=$1 ORDER BY created_at LIMIT 20",
    [Date.now()],
  );
  for (const job of jobs) {
    const claimed = await db.query(
      "UPDATE notification_outbox SET next_attempt=$1,attempts=attempts+1 WHERE id=$2 AND status='pending' AND next_attempt<=$3 RETURNING id",
      [Date.now() + 120000, job.id, Date.now()],
    );
    if (!claimed.length) continue;
    try {
      const [lead] = await db.query<StoredLead>(
        "SELECT * FROM leads WHERE id=$1",
        [job.lead_id],
      );
      if (!lead) throw Error("Missing lead");
      await deliverEmail(lead, job.id);
      await db.query(
        "UPDATE notification_outbox SET status='sent',last_error_code=NULL,delivered_at=$1 WHERE id=$2",
        [new Date().toISOString(), job.id],
      );
      sent++;
      log("notification_sent", { jobId: job.id, provider });
    } catch {
      failed++;
      await db.query(
        "UPDATE notification_outbox SET next_attempt=$1,last_error_code=$2 WHERE id=$3",
        [
          Date.now() +
            Math.min(3600000, 60000 * 2 ** Math.min(job.attempts, 6)),
          "delivery_failed",
          job.id,
        ],
      );
      log("notification_failed", {
        jobId: job.id,
        provider,
        attempt: job.attempts + 1,
      });
    }
  }
  return { configured: true, sent, failed };
}
