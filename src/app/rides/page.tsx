import type { Metadata } from "next";
import Link from "next/link";
import { getUpcomingPublicEvents } from "@/lib/data/public";
import { SafeSection } from "@/components/SafeSection";
import { EventList } from "@/components/EventCard";
import { PageHeading } from "@/components/PageHeading";

// Rebuilt in the background at most every 15 minutes (matches REFRESH_SECONDS).
export const revalidate = 900;

export const metadata: Metadata = {
  title: "Rides",
  description: "Upcoming public rides and events with IMRG Northland Chapter 2093.",
};

export default function RidesPage() {
  return (
    <>
      <PageHeading eyebrow="Ride with us" title="Upcoming Rides">
        <p>
          These rides are open to the public. Meeting points and members-only rides are shared in the member portal
          after you join and sign in.
        </p>
      </PageHeading>
      <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <SafeSection what="upcoming rides">
          <Upcoming />
        </SafeSection>
        <div className="mt-12 flex flex-wrap gap-4">
          <Link href="/calendar" className="btn btn-dark">
            Monthly calendar
          </Link>
          <Link href="/join" className="btn btn-red">
            Request membership
          </Link>
        </div>
      </div>
    </>
  );
}

async function Upcoming() {
  const { items } = await getUpcomingPublicEvents(24);
  if (items.length === 0) {
    return <p className="panel bg-panel p-6 text-center">No public rides are scheduled right now. Check back soon.</p>;
  }
  return <EventList events={items} />;
}
