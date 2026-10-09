import type { Metadata } from "next";
import { getPublicAnnouncements } from "@/lib/data/public";
import { SafeSection } from "@/components/SafeSection";
import { PageHeading } from "@/components/PageHeading";
import { formatLongDate } from "@/lib/time";

// Rebuilt in the background at most every 15 minutes (matches REFRESH_SECONDS).
export const revalidate = 900;

export const metadata: Metadata = {
  title: "Notifications",
  description: "Public announcements from IMRG Northland Chapter 2093.",
};

export default function AnnouncementsPage() {
  return (
    <>
      <PageHeading eyebrow="Chapter news" title="Notifications" />
      <div className="mx-auto max-w-3xl px-4 pb-10 sm:px-6">
        <SafeSection what="notifications">
          <List />
        </SafeSection>
      </div>
    </>
  );
}

async function List() {
  const { items } = await getPublicAnnouncements(30);
  if (items.length === 0) {
    return <p className="panel bg-panel p-6 text-center">No announcements right now.</p>;
  }
  return (
    <ul className="space-y-6">
      {items.map((a) => (
        <li key={a.id}>
          <article className={`panel bg-panel p-6 ${a.pinned ? "border-orange" : ""}`}>
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest text-muted">
              {a.pinned && <span className="text-orange">Pinned</span>}
              <time dateTime={a.publish_at}>{formatLongDate(a.publish_at)}</time>
            </div>
            <h2 className="display mt-3 text-xl font-bold">{a.title}</h2>
            {/* Plain text only: line breaks are kept, nothing is rendered as HTML. */}
            <p className="mt-4 whitespace-pre-line leading-relaxed">{a.body}</p>
          </article>
        </li>
      ))}
    </ul>
  );
}
