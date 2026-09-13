import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { appUrl, isProduction } from "./config.ts";
import { pages } from "./tracking.ts";
export const attributionCookie = "khq_attribution";
const localSecret = randomBytes(32).toString("hex");
export type Attribution = {
  landingPage: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
  issuedAt: number;
};
function campaign(value: unknown) {
  return typeof value === "string"
    ? value
        .trim()
        .replace(/[\u0000-\u001f\u007f<>]/g, "")
        .slice(0, 200)
    : "";
}
export function cleanAttribution(value: unknown): Attribution {
  const v =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  let referrer = "";
  try {
    const u = new URL(typeof v.referrer === "string" ? v.referrer : "");
    if (["https:", "http:"].includes(u.protocol) && u.origin !== appUrl())
      referrer = u.origin.slice(0, 300);
  } catch {}
  return {
    landingPage:
      typeof v.landingPage === "string" && pages.includes(v.landingPage)
        ? v.landingPage
        : "/",
    referrer,
    utmSource: campaign(v.utmSource),
    utmMedium: campaign(v.utmMedium),
    utmCampaign: campaign(v.utmCampaign),
    utmTerm: campaign(v.utmTerm),
    utmContent: campaign(v.utmContent),
    issuedAt: Date.now(),
  };
}
function secret() {
  const value = process.env.ATTRIBUTION_SECRET;
  if (isProduction() && (!value || value.length < 32))
    throw Error("Attribution configuration unavailable");
  return value || localSecret;
}
export function signAttribution(value: Attribution) {
  const body = Buffer.from(JSON.stringify(value)).toString("base64url");
  return (
    body + "." + createHmac("sha256", secret()).update(body).digest("base64url")
  );
}
export function verifyAttribution(
  token: string | undefined,
): Attribution | null {
  if (!token || token.length > 5000) return null;
  const [body, signature, ...extra] = token.split(".");
  if (!signature || extra.length) return null;
  const expected = createHmac("sha256", secret()).update(body).digest();
  const supplied = Buffer.from(signature, "base64url");
  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  )
    return null;
  try {
    const value = JSON.parse(
      Buffer.from(body, "base64url").toString(),
    ) as Attribution;
    if (
      !Number.isFinite(value.issuedAt) ||
      value.issuedAt > Date.now() ||
      Date.now() - value.issuedAt > 86400000
    )
      return null;
    return value;
  } catch {
    return null;
  }
}
export function requestAttribution(request: Request) {
  const entry = request.headers
    .get("cookie")
    ?.split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith(attributionCookie + "="));
  return verifyAttribution(entry?.slice(attributionCookie.length + 1));
}
