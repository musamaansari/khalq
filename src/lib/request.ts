import { createHmac, randomBytes } from "node:crypto";
const temporarySecret = randomBytes(32).toString("hex");
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const expected = process.env.SITE_URL || new URL(request.url).origin;
  return origin === expected;
}
export function rateKey(request: Request, scope: string) {
  const header = process.env.TRUSTED_IP_HEADER;
  const address = header ? request.headers.get(header) || "unknown" : "local";
  const secret = process.env.RATE_LIMIT_SECRET;
  if (process.env.NODE_ENV === "production" && !secret)
    throw new Error("RATE_LIMIT_SECRET is required in production.");
  return createHmac("sha256", secret || temporarySecret)
    .update(scope + ":" + address)
    .digest("hex");
}
export async function readBody(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new Error("Expected JSON");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing request body");
  let size = 0;
  const parts: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 20000) {
        await reader.cancel();
        throw new Error("Request too large");
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
