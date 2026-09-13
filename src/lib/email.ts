import { emailProvider, validateRuntime } from "./config.ts";
import type { StoredLead } from "./db.ts";
export type EnquiryEmail = { subject: string; text: string };
export function mimeSubject(subject: string) {
  const chunks: string[] = [];
  let current = "";
  for (const character of subject) {
    if (Buffer.byteLength(current + character) > 42) {
      chunks.push(current);
      current = "";
    }
    current += character;
  }
  if (current) chunks.push(current);
  return chunks
    .map((chunk) => "=?UTF-8?B?" + Buffer.from(chunk).toString("base64") + "?=")
    .join("\r\n ");
}
export function buildEnquiryEmail(lead: StoredLead): EnquiryEmail {
  const label = (lead.company || lead.name)
    .replace(/[\r\n]/g, " ")
    .slice(0, 120);
  return {
    subject: `New Khalq Project Enquiry — ${label}`,
    text: [
      `New Khalq project enquiry`,
      `Reference: ${lead.reference}`,
      `Lead ID: ${lead.id}`,
      `Submitted: ${lead.created_at} (UTC)`,
      `Name: ${lead.name}`,
      `Email: ${lead.email || "Not supplied"}`,
      `WhatsApp: ${lead.phone || "Not supplied"}`,
      `Company: ${lead.company || "Not supplied"}`,
      `Requirement type: ${lead.requirement_type}`,
      `Project type: ${lead.project_type}`,
      "",
      "Requirement:",
      lead.requirement,
      "",
      `Source page: ${lead.source_page}`,
      `Landing page: ${lead.landing_page}`,
      `Referrer: ${lead.referrer || "Direct / unavailable"}`,
      `UTM source: ${lead.utm_source}`,
      `UTM medium: ${lead.utm_medium}`,
      `UTM campaign: ${lead.utm_campaign}`,
      `UTM term: ${lead.utm_term}`,
      `UTM content: ${lead.utm_content}`,
    ].join("\n"),
  };
}
export async function deliverEmail(lead: StoredLead, jobId: string) {
  validateRuntime();
  const provider = emailProvider(),
    email = buildEnquiryEmail(lead);
  const headers = { "Content-Type": "application/json" };
  if (provider === "resend") {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        ...headers,
        Authorization: `Bearer ${process.env.EMAIL_API_KEY}`,
        "Idempotency-Key": jobId,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [process.env.NOTIFICATION_EMAIL],
        subject: email.subject,
        text: email.text,
      }),
      signal: AbortSignal.timeout(10000),
      redirect: "error",
    });
    if (!response.ok) throw Error("Provider delivery failed");
    return;
  }
  if (provider === "gmail") {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
        grant_type: "refresh_token",
      }),
      signal: AbortSignal.timeout(10000),
      redirect: "error",
    });
    if (!tokenResponse.ok) throw Error("Provider authorization failed");
    const token = await tokenResponse.json();
    if (typeof token.access_token !== "string")
      throw Error("Provider authorization failed");
    const encodedSubject = mimeSubject(email.subject);
    const body =
      Buffer.from(email.text)
        .toString("base64")
        .match(/.{1,76}/g)
        ?.join("\r\n") || "";
    const mime = [
      `From: ${process.env.EMAIL_FROM}`,
      `To: ${process.env.NOTIFICATION_EMAIL}`,
      `Subject: ${encodedSubject}`,
      `Message-ID: <${jobId}@${process.env.EMAIL_FROM!.split("@")[1]}>`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset=UTF-8`,
      `Content-Transfer-Encoding: base64`,
      "",
      body,
    ].join("\r\n");
    const response = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: { ...headers, Authorization: `Bearer ${token.access_token}` },
        body: JSON.stringify({ raw: Buffer.from(mime).toString("base64url") }),
        signal: AbortSignal.timeout(10000),
        redirect: "error",
      },
    );
    if (!response.ok) throw Error("Provider delivery failed");
    return;
  }
  if (provider === "webhook") {
    const response = await fetch(process.env.LEAD_NOTIFICATION_WEBHOOK!, {
      method: "POST",
      headers: {
        ...headers,
        "Idempotency-Key": jobId,
        ...(process.env.LEAD_NOTIFICATION_TOKEN
          ? { Authorization: `Bearer ${process.env.LEAD_NOTIFICATION_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        event: "project_enquiry.created",
        lead: {
          id: lead.id,
          reference: lead.reference,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          requirement: lead.requirement,
          requirement_type: lead.requirement_type,
          project_type: lead.project_type,
          source_page: lead.source_page,
          landing_page: lead.landing_page,
          referrer: lead.referrer,
          utm_source: lead.utm_source,
          utm_medium: lead.utm_medium,
          utm_campaign: lead.utm_campaign,
          utm_term: lead.utm_term,
          utm_content: lead.utm_content,
          created_at: lead.created_at,
        },
      }),
      signal: AbortSignal.timeout(10000),
      redirect: "error",
    });
    if (!response.ok) throw Error("Provider delivery failed");
    return;
  }
  throw Error("Email is not configured");
}
