import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/solutions", "/products", "/about", "/privacy", "/terms"].map(
    (path) => ({
      url: `${process.env.SITE_URL || "https://khalq.io"}${path}`,
      changeFrequency: "monthly",
      priority: path ? 0.7 : 1,
    }),
  );
}
