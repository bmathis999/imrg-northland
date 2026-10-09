import type { MetadataRoute } from "next";

// Public pages only; member and officer pages are never listed.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://northlandimrg.com";
  return ["", "/about", "/rides", "/calendar", "/announcements", "/join", "/contact", "/privacy"].map((path) => ({
    url: `${base}${path}`,
  }));
}
