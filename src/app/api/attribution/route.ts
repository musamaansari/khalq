import { NextResponse } from "next/server";
import { sameOrigin, readBody, permitted } from "@/lib/request";
import {
  attributionCookie,
  cleanAttribution,
  requestAttribution,
  signAttribution,
} from "@/lib/attribution";
import { isProduction } from "@/lib/config";
import { log } from "@/lib/logger";
export async function POST(request: Request) {
  try {
    if (!sameOrigin(request))
      return NextResponse.json(
        { error: "Request could not be verified." },
        { status: 403 },
      );
    if (!(await permitted(request, "attribution")))
      return NextResponse.json(
        { error: "Please try again shortly." },
        { status: 429 },
      );
    const existing = requestAttribution(request);
    if (existing)
      return NextResponse.json(
        { ready: true },
        { headers: { "Cache-Control": "no-store" } },
      );
    let input;
    try {
      input = await readBody(request);
    } catch {
      return NextResponse.json(
        { error: "Please check your request." },
        { status: 400 },
      );
    }
    const attribution = cleanAttribution(input);
    const response = NextResponse.json(
      { ready: true },
      { headers: { "Cache-Control": "no-store" } },
    );
    response.cookies.set(attributionCookie, signAttribution(attribution), {
      httpOnly: true,
      secure: isProduction(),
      sameSite: "lax",
      path: "/",
      maxAge: 86400,
    });
    return response;
  } catch {
    log("application_error");
    return NextResponse.json(
      { error: "Please try again shortly." },
      { status: 503 },
    );
  }
}
