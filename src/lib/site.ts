/**
 * Chapter details used across the public site.
 * Edit these values to change contact info, links and navigation.
 */
export const site = {
  name: "IMRG Northland Chapter 2093",
  shortName: "IMRG Northland",
  tagline: "Chapter 2093 • Ride With Pride",
  description:
    "IMRG Northland Chapter 2093 is a brotherhood of Indian Motorcycle riders in the Northland region, riding with purpose and supporting regional charities.",
  email: "info@northlandimrg.com",
  region: "Northland Region",
  facebookGroupUrl: "https://www.facebook.com/groups/651913063842033/",
  timeZone: "America/Chicago",
  // Replace these files in /public/images with real photos (same names), or edit the paths.
  heroImage: "/images/hero.jpg",
  legacyImage: "/images/legacy.jpg",
  videoPoster: "/images/video-poster.jpg",
} as const;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/calendar", label: "Events" },
  { href: "/rides", label: "Rides" },
  { href: "/announcements", label: "Notifications" },
  { href: "/about", label: "Our Story" },
] as const;
