import type { PublicEvent } from "@/lib/data/public";
import { formatDate, formatTimeRange } from "@/lib/time";

const kindLabel: Record<PublicEvent["kind"], string> = {
  ride: "Ride",
  event: "Event",
  meeting: "Meeting",
  charity: "Charity",
};

export function EventCard({ event }: { event: PublicEvent }) {
  const cancelled = event.status === "cancelled";
  return (
    <article className="panel flex flex-col gap-3 bg-panel p-5">
      <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-widest">
        <span className="text-orange">{kindLabel[event.kind]}</span>
        {cancelled && <span className="border border-red px-2 py-0.5 text-[#ff7b7b]">Cancelled</span>}
      </div>
      <h3 className={`display text-lg font-bold ${cancelled ? "line-through decoration-2 opacity-70" : ""}`}>
        {event.title}
      </h3>
      <p className="text-sm text-white">
        <time dateTime={event.starts_at}>{formatDate(event.starts_at)}</time>
        <span className="text-muted"> · {formatTimeRange(event.starts_at, event.ends_at, event.all_day)}</span>
      </p>
      {event.location_public && <p className="text-sm">{event.location_public}</p>}
      {event.description && <p className="line-clamp-3 text-sm text-muted">{event.description}</p>}
    </article>
  );
}

export function EventList({ events }: { events: PublicEvent[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((e) => (
        <li key={e.id} className="contents">
          <EventCard event={e} />
        </li>
      ))}
    </ul>
  );
}
