import "server-only";
import { unstable_cache } from "next/cache";
import { publicDb } from "@/lib/supabase/public";
import { monthRange, type YearMonth } from "@/lib/time";

/**
 * Public data only. Every query here runs with the anon key, and the database
 * restricts that key to rows marked Public and to the columns listed below.
 * Results are cached for 15 minutes (REFRESH_SECONDS). If a refresh fails, the
 * error is thrown rather than cached, so the last good copy keeps being served.
 */

export type PublicEvent = {
  id: string;
  title: string;
  kind: "ride" | "event" | "meeting" | "charity";
  status: "scheduled" | "cancelled";
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  location_public: string | null;
  description: string | null;
};

export type PublicAnnouncement = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  publish_at: string;
};

export type Result<T> = { configured: boolean; items: T[] };

/** Must match `export const revalidate` on the public pages. */
export const REFRESH_SECONDS = 900;
const cacheOptions = (tag: string) => ({ revalidate: REFRESH_SECONDS, tags: [tag] });

const EVENT_COLUMNS = "id,title,kind,status,starts_at,ends_at,all_day,location_public,description";
const ANNOUNCEMENT_COLUMNS = "id,title,body,pinned,publish_at";

async function loadUpcomingPublicEvents(limit: number): Promise<Result<PublicEvent>> {
  const db = publicDb();
  if (!db) return { configured: false, items: [] };

  // Rounded to the hour so the query (and cache entry) stays stable within an hour.
  const since = new Date(Math.floor(Date.now() / 3_600_000) * 3_600_000 - 12 * 3_600_000).toISOString();
  const { data, error } = await db
    .from("events")
    .select(EVENT_COLUMNS)
    .eq("visibility", "public")
    .gte("starts_at", since)
    .order("starts_at", { ascending: true })
    .limit(Math.min(Math.max(limit, 1), 50));
  if (error) throw new Error(`Could not load events (${error.code ?? "unknown"})`);
  return { configured: true, items: (data ?? []) as PublicEvent[] };
}

async function loadPublicEventsForMonth(year: number, monthNumber: number): Promise<Result<PublicEvent>> {
  const month: YearMonth = { year, month: monthNumber };
  const db = publicDb();
  if (!db) return { configured: false, items: [] };

  const { start, end } = monthRange(month);
  const { data, error } = await db
    .from("events")
    .select(EVENT_COLUMNS)
    .eq("visibility", "public")
    .gte("starts_at", start.toISOString())
    .lt("starts_at", end.toISOString())
    .order("starts_at", { ascending: true })
    .limit(200);
  if (error) throw new Error(`Could not load the calendar (${error.code ?? "unknown"})`);
  return { configured: true, items: (data ?? []) as PublicEvent[] };
}

async function loadPublicAnnouncements(limit: number): Promise<Result<PublicAnnouncement>> {
  const db = publicDb();
  if (!db) return { configured: false, items: [] };

  // Expired and scheduled-for-later messages are filtered by the database policy itself.
  const { data, error } = await db
    .from("announcements")
    .select(ANNOUNCEMENT_COLUMNS)
    .eq("visibility", "public")
    .order("pinned", { ascending: false })
    .order("publish_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 50));
  if (error) throw new Error(`Could not load notifications (${error.code ?? "unknown"})`);
  return { configured: true, items: (data ?? []) as PublicAnnouncement[] };
}

const cachedUpcoming = unstable_cache(loadUpcomingPublicEvents, ["public-events-upcoming"], cacheOptions("public-events"));
const cachedMonth = unstable_cache(loadPublicEventsForMonth, ["public-events-month"], cacheOptions("public-events"));
const cachedAnnouncements = unstable_cache(loadPublicAnnouncements, ["public-announcements"], cacheOptions("public-announcements"));

export const getUpcomingPublicEvents = (limit = 6) => cachedUpcoming(limit);
export const getPublicEventsForMonth = (m: YearMonth) => cachedMonth(m.year, m.month);
export const getPublicAnnouncements = (limit = 20) => cachedAnnouncements(limit);
