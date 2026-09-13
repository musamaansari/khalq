import isEmail from "validator/lib/isEmail.js";
export type Environment = Record<string, string | undefined>;
export class ConfigurationError extends Error {
  readonly fields: string[];
  constructor(fields: string[]) {
    super(`Invalid configuration: ${fields.join(", ")}`);
    this.name = "ConfigurationError";
    this.fields = fields;
  }
}
export function appUrl(env: Environment = process.env) {
  const raw =
    env.APP_URL ||
    env.SITE_URL ||
    (env.NODE_ENV === "production"
      ? "https://khalq.io"
      : "http://localhost:3000");
  const url = new URL(raw);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw new ConfigurationError(["APP_URL"]);
  return url.origin;
}
export function isProduction(env: Environment = process.env) {
  return (
    env.NODE_ENV === "production" &&
    !(
      env.APP_ENV === "local" &&
      !env.RAILWAY_ENVIRONMENT_ID &&
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(appUrl(env))
    )
  );
}
export function positiveInt(
  value: string | undefined,
  fallback: number,
  max = 100000,
) {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > max)
    throw new ConfigurationError(["numeric setting"]);
  return parsed;
}
export function emailProvider(env: Environment = process.env) {
  return (
    env.EMAIL_PROVIDER ||
    (env.LEAD_NOTIFICATION_WEBHOOK ? "webhook" : "disabled")
  );
}
export function validateRuntime(env: Environment = process.env) {
  const errors: string[] = [];
  let origin = "";
  try {
    origin = appUrl(env);
  } catch {
    errors.push("APP_URL");
  }
  const production =
    env.NODE_ENV === "production" &&
    !(
      env.APP_ENV === "local" &&
      !env.RAILWAY_ENVIRONMENT_ID &&
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    );
  if (production) {
    if (!env.APP_URL || origin !== "https://khalq.io") errors.push("APP_URL");
    if (!env.DATABASE_URL) errors.push("DATABASE_URL");
    if ((env.RATE_LIMIT_SECRET || "").length < 32)
      errors.push("RATE_LIMIT_SECRET");
    if ((env.ATTRIBUTION_SECRET || "").length < 32)
      errors.push("ATTRIBUTION_SECRET");
    if (!env.TRUSTED_IP_HEADER || env.TRUST_PROXY !== "true")
      errors.push("TRUST_PROXY / TRUSTED_IP_HEADER");
  }
  if (env.DATABASE_URL) {
    try {
      const url = new URL(env.DATABASE_URL);
      if (!["postgres:", "postgresql:"].includes(url.protocol)) throw Error();
      if (production && url.searchParams.get("sslmode") === "no-verify")
        throw Error();
    } catch {
      errors.push("DATABASE_URL");
    }
  }
  const provider = emailProvider(env);
  if (!["disabled", "resend", "gmail", "webhook"].includes(provider))
    errors.push("EMAIL_PROVIDER");
  if (production && provider === "disabled") errors.push("EMAIL_PROVIDER");
  if (provider === "resend" || provider === "gmail") {
    for (const key of ["NOTIFICATION_EMAIL", "EMAIL_FROM"])
      if (!isEmail(env[key] || "", { allow_display_name: false }))
        errors.push(key);
    if (provider === "resend" && !env.EMAIL_API_KEY)
      errors.push("EMAIL_API_KEY");
    if (provider === "gmail")
      for (const key of [
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
        "GOOGLE_REFRESH_TOKEN",
      ])
        if (!env[key]) errors.push(key);
  }
  if (provider === "webhook") {
    try {
      const u = new URL(env.LEAD_NOTIFICATION_WEBHOOK || "");
      if (u.protocol !== "https:" && production) throw Error();
    } catch {
      errors.push("LEAD_NOTIFICATION_WEBHOOK");
    }
  }
  if (
    env.ANALYTICS_ENABLED &&
    !["true", "false"].includes(env.ANALYTICS_ENABLED)
  )
    errors.push("ANALYTICS_ENABLED");
  if (errors.length) throw new ConfigurationError([...new Set(errors)]);
  for (const [key, fallback, max] of [
    ["RATE_LIMIT_MAX", 5, 1000],
    ["RATE_LIMIT_WINDOW_SECONDS", 3600, 86400],
    ["SPAM_MIN_FORM_MS", 2000, 60000],
    ["TRUSTED_PROXY_HOPS", 1, 10],
    ["ANALYTICS_RETENTION_DAYS", 90, 365],
  ] as const) {
    try {
      positiveInt(env[key], fallback, max);
    } catch {
      throw new ConfigurationError([key]);
    }
  }
  if (
    env.CONTACT_EMAIL &&
    !isEmail(env.CONTACT_EMAIL, { allow_display_name: false })
  )
    throw new ConfigurationError(["CONTACT_EMAIL"]);
  return { production, origin, provider };
}
