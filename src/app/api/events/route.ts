import { NextResponse } from "next/server";
import { recordEvent } from "@/lib/db";
import { sameOrigin, readBody, permitted, visitorHash } from "@/lib/request";
import {
  events,
  pages,
  projectTypes,
  ctaLocations,
  uuidPattern,
} from "@/lib/tracking";
import { log } from "@/lib/logger";
export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
    if (
      process.env.ANALYTICS_ENABLED === "false" ||
      request.headers.get("dnt") === "1" ||
      request.headers.get("sec-gpc") === "1"
    )
      return new NextResponse(null, { status: 204 });
    if (!(await permitted(request, "events")))
      return new NextResponse(null, { status: 429 });
    const data = await readBody(request);
    if (
      !data ||
      typeof data !== "object" ||
      !events.includes(data.event) ||
      data.event === "lead_submitted" ||
      !pages.includes(data.page) ||
      !ctaLocations.includes(data.ctaLocation) ||
      !projectTypes.includes(data.projectType) ||
      !uuidPattern.test(data.id) ||
      !uuidPattern.test(data.visitorId)
    )
      return new NextResponse(null, { status: 400 });
    await recordEvent({
      id: data.id,
      visitorId: visitorHash(data.visitorId),
      event: data.event,
      page: data.page,
      ctaLocation: data.ctaLocation,
      projectType: data.projectType,
    });
    return new NextResponse(null, {
      status: 204,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    log("application_error");
    return new NextResponse(null, { status: 400 });
  }
}
