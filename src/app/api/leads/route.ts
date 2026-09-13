import { after, NextResponse } from "next/server";
import { validateLead, InputError } from "@/lib/validation";
import { allowRequest, saveLead } from "@/lib/db";
import { sameOrigin, rateKey, readBody } from "@/lib/request";
import { flushNotifications } from "@/lib/notifications";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "This request could not be verified." },
      { status: 403 },
    );
  try {
    if (!allowRequest(rateKey(request, "leads"), 5))
      return NextResponse.json(
        { error: "Too many enquiries. Please try again in an hour." },
        { status: 429, headers: { "Retry-After": "3600" } },
      );
    let value;
    try {
      value = await readBody(request);
    } catch {
      return NextResponse.json(
        { error: "Please send a valid enquiry under 20 KB." },
        { status: 400 },
      );
    }
    const lead = validateLead(value);
    saveLead(lead);
    after(async () => {
      try {
        await flushNotifications();
      } catch {
        console.error("Notification worker failed; enquiry remains saved.");
      }
    });
    return NextResponse.json(
      { success: true },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof InputError)
      return NextResponse.json({ error: error.message }, { status: 400 });
    console.error(
      "Unable to save enquiry. Check server database and configuration.",
    );
    return NextResponse.json(
      { error: "We couldn’t save your enquiry. Please try again shortly." },
      { status: 503 },
    );
  }
}
