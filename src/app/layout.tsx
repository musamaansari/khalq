import type { Metadata } from "next";
import "@fontsource/geist/latin-400.css";
import "@fontsource/geist/latin-500.css";
import "@fontsource/geist/latin-600.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "./globals.css";
import { Header, Footer, InteractionAnalytics } from "@/components/shell";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://khalq.io"),
  title: { default: "Khalq — Create what’s next.", template: "%s — Khalq" },
  description:
    "Software, AI and automation built around your ideas. Khalq creates custom software, SaaS platforms, web and mobile applications, and integrations.",
  openGraph: {
    type: "website",
    siteName: "Khalq",
    title: "Khalq — Create what’s next.",
    description: "Software, AI and automation built around your ideas.",
    images: ["/opengraph-image"],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        {children}
        <Footer />
        <InteractionAnalytics />
      </body>
    </html>
  );
}
