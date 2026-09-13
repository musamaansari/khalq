// Test-process preload only. The production start command never imports this file.
const originalFetch = globalThis.fetch;
if (process.env.KHALQ_QA_EMAIL_URL) {
  const target = new URL(process.env.KHALQ_QA_EMAIL_URL);
  if (!["localhost", "127.0.0.1"].includes(target.hostname))
    throw new Error("QA email capture must stay on loopback");
  globalThis.fetch = (input, options) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    return originalFetch(
      url === "https://api.resend.com/emails" ? target : input,
      options,
    );
  };
}
