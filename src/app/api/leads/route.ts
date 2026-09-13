import { after, NextResponse } from "next/server";
import { validateLead, InputError } from "@/lib/validation";
import { saveLead } from "@/lib/db";
import {
  sameOrigin,
  rateKey,
  readBody,
  permitted,
  visitorHash,
  requestId,
} from "@/lib/request";
import { requestAttribution } from "@/lib/attribution";
import { validateRuntime, positiveInt } from "@/lib/config";
import { flushNotifications } from "@/lib/notifications";
import { log } from "@/lib/logger";
import { uuidPattern, ctaLocations } from "@/lib/tracking";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const id = requestId();
  try {
    validateRuntime();
    if (!sameOrigin(request))
      return NextResponse.json(
        { error: "This request could not be verified." },
        { status: 403 },
      );
    if (!(await permitted(request, "leads")))
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              positiveInt(process.env.RATE_LIMIT_WINDOW_SECONDS, 3600, 86400),
            ),
          },
        },
      );
    let input;
    try {
      input = await readBody(request);
    } catch {
      return NextResponse.json(
        { error: "Please send a valid enquiry under 20 KB." },
        { status: 400 },
      );
    }
    const lead = validateLead(input);
    const attribution = requestAttribution(request);
    if (!attribution)
      return NextResponse.json(
        { error: "Please allow essential cookies and try again." },
        { status: 400 },
      );
    if (
      Date.now() - attribution.issuedAt <
      positiveInt(process.env.SPAM_MIN_FORM_MS, 2000, 60000)
    )
      throw new InputError(
        "Please take a moment to review your enquiry and try again.",
      );
    if (!lead.submissionKey)
      throw new InputError(
        "Please refresh the page and start your enquiry again.",
      );
    const analytics =
      process.env.ANALYTICS_ENABLED !== "false" &&
      request.headers.get("dnt") !== "1" &&
      request.headers.get("sec-gpc") !== "1" &&
      input.analyticsAllowed === true &&
      typeof input.visitorId === "string" &&
      uuidPattern.test(input.visitorId);
    const result = await saveLead(
      { ...lead, ...attribution },
      {
        abuseHash: rateKey(
          request,
          "abuse:" + new Date().toISOString().slice(0, 10),
        ),
        event: analytics
          ? {
              id: "",
              visitorId: visitorHash(input.visitorId),
              event: "lead_submitted",
              page: lead.sourcePage,
              ctaLocation: ctaLocations.includes(input.ctaLocation)
                ? input.ctaLocation
                : "page",
              projectType: lead.projectType,
            }
          : undefined,
      },
    );
    after(async () => {
      try {
        await flushNotifications();
      } catch {
        log("notification_failed", { requestId: id });
      }
    });
    return NextResponse.json(
      { success: true, reference: result.reference },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof InputError)
      return NextResponse.json({ error: error.message }, { status: 400 });
    log("submission_failed", { requestId: id });
    return NextResponse.json(
      { error: "We couldn’t save your enquiry. Please try again shortly." },
      { status: 503 },
    );
  }
}
