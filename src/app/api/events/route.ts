import { NextResponse } from "next/server";
import { allowRequest, recordEvent } from "@/lib/db";
import { sameOrigin, rateKey, readBody } from "@/lib/request";
const allowed = new Set([
  "requirement_interaction",
  "start_project",
  "requirement_submitted",
  "product_interest",
  "contact_conversion",
]);
export async function POST(request: Request) {
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  if (request.headers.get("dnt") === "1")
    return new NextResponse(null, { status: 204 });
  try {
    if (!allowRequest(rateKey(request, "events"), 120, 60000))
      return new NextResponse(null, { status: 429 });
    const data = await readBody(request);
    if (
      !allowed.has(data.event) ||
      ![
        "/",
        "/solutions",
        "/products",
        "/about",
        "/privacy",
        "/terms",
      ].includes(data.page)
    )
      return new NextResponse(null, { status: 400 });
    recordEvent(data.event, data.page);
    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 400 });
  }
}
