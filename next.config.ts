import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  outputFileTracingIncludes: { "/api/*": ["./migrations/**/*.sql"] },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.khalq.io" }],
        destination: "https://khalq.io/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...(process.env.NODE_ENV === "production" &&
          process.env.APP_ENV !== "local"
            ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }]
            : []),
          {
            key: "Content-Security-Policy",
            value:
              "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
export default config;
