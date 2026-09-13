import { flushNotifications } from "../src/lib/notifications.ts";
const result = await flushNotifications();
if (!result.configured) {
  console.error(
    "Set LEAD_NOTIFICATION_WEBHOOK before running the notification worker.",
  );
  process.exitCode = 1;
} else console.log(`Delivered ${result.sent} notification(s).`);
