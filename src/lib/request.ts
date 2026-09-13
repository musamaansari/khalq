import { createHmac, randomBytes, randomUUID } from "node:crypto";
import { isIP } from "node:net";
import { appUrl, isProduction, positiveInt } from "./config.ts";
import { allowRequest } from "./db.ts";
import { log } from "./logger.ts";
const localSecret = randomBytes(32).toString("hex");
export function sameOrigin(request: Request) {
  return (
    request.headers.get("origin") === appUrl() &&
    request.headers.get("sec-fetch-site") !== "cross-site"
  );
}
function hash(value: string) {
  const secret = process.env.RATE_LIMIT_SECRET;
  if (isProduction() && (!secret || secret.length < 32))
    throw Error("Rate-limit configuration unavailable");
  return createHmac("sha256", secret || localSecret)
    .update(value)
    .digest("hex");
}
export function rateKey(request: Request, scope: string) {
  let address = "local";
  if (process.env.TRUST_PROXY === "true" && process.env.TRUSTED_IP_HEADER) {
    const raw = request.headers.get(process.env.TRUSTED_IP_HEADER) || "";
    const chain = raw.split(",").map((v) => v.trim());
    const hops = positiveInt(process.env.TRUSTED_PROXY_HOPS, 1, 10);
    address = chain[chain.length - hops] || "";
    if (!isIP(address)) throw Error("Trusted client address unavailable");
  } else if (isProduction())
    throw Error("Trusted proxy configuration unavailable");
  return hash(scope + ":" + address);
}
export function visitorHash(visitorId: string) {
  return hash("analytics:" + visitorId);
}
export function requestId() {
  return randomUUID();
}
export async function permitted(
  request: Request,
  scope: "leads" | "events" | "attribution",
) {
  const limit =
    scope === "leads"
      ? positiveInt(process.env.RATE_LIMIT_MAX, 5, 1000)
      : scope === "events"
        ? 120
        : 60;
  const windowMs =
    scope === "leads"
      ? positiveInt(process.env.RATE_LIMIT_WINDOW_SECONDS, 3600, 86400) * 1000
      : 60000;
  const key = rateKey(request, scope);
  const allowed = await allowRequest(key, limit, windowMs);
  if (!allowed) log("rate_limited");
  return allowed;
}
export async function readBody(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw Error("Expected JSON");
  const reader = request.body?.getReader();
  if (!reader) throw Error("Missing body");
  let size = 0;
  const parts: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 20000) {
        await reader.cancel();
        throw Error("Request too large");
      }
      parts.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const all = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    all.set(part, offset);
    offset += part.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(all));
}
