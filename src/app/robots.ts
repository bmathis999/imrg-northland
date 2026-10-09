import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://northlandimrg.com";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/portal", "/login"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
