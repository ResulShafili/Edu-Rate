import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://edu-rate-nu.vercel.app").replace(/\/$/, "");
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/api-docs", "/profile", "/settings", "/technical-presentation"] },
    sitemap: `${origin}/sitemap.xml`,
  };
}
