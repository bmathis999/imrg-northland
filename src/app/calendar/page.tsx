import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getPublicEventsForMonth, type PublicEvent } from "@/lib/data/public";
import { SafeSection } from "@/components/SafeSection";
import { PageHeading } from "@/components/PageHeading";
import { EventCard } from "@/components/EventCard";
import {
  currentMonth,
  formatTimeRange,
  localDayKey,
  monthGrid,
  monthLabel,
  monthParam,
  parseMonthParam,
  shiftMonth,
  type YearMonth,
} from "@/lib/time";

export const metadata: Metadata = {
  title: "Events Calendar",
  description: "Public rides and events from IMRG Northland Chapter 2093.",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage({ searchParams }: PageProps<"/calendar">) {
  return (
    <>
      <PageHeading eyebrow="Rides & events" title="Calendar">
        <p>
          Rides and events open to everyone. Members see the full chapter calendar, including members-only rides,
          after <Link href="/login" className="text-white underline underline-offset-4">signing in</Link>.
        </p>
      </PageHeading>
      <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <Suspense fallback={<CalendarSkeleton />}>
          <MonthFromParams searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function MonthFromParams({ searchParams }: Pick<PageProps<"/calendar">, "searchParams">) {
  const { month } = await searchParams;
  const ym = parseMonthParam(month) ?? currentMonth();
  return (
    <>
      <MonthNav month={ym} />
      <SafeSection what="the calendar">
        <MonthView month={ym} />
      </SafeSection>
    </>
  );
}

function MonthNav({ month }: { month: YearMonth }) {
  const prev = shiftMonth(month, -1);
  const next = shiftMonth(month, 1);
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <Link href={`/calendar?month=${monthParam(prev)}`} className="btn btn-dark" aria-label={`Previous month, ${monthLabel(prev)}`}>
        ‹ <span className="ml-1 hidden sm:inline">{monthLabel(prev)}</span>
      </Link>
      <h2 className="display text-center text-xl sm:text-2xl" aria-live="polite">
        {monthLabel(month)}
      </h2>
      <Link href={`/calendar?month=${monthParam(next)}`} className="btn btn-dark" aria-label={`Next month, ${monthLabel(next)}`}>
        <span className="mr-1 hidden sm:inline">{monthLabel(next)}</span> ›
      </Link>
    </div>
  );
}

async function MonthView({ month }: { month: YearMonth }) {
  const { items } = await getPublicEventsForMonth(month);
  const byDay = new Map<string, PublicEvent[]>();
  for (const e of items) {
    const key = localDayKey(e.starts_at);
    byDay.set(key, [...(byDay.get(key) ?? []), e]);
  }
  const weeks = monthGrid(month);

  return (
    <>
      {/* Month grid on tablet and desktop */}
      <table className="hidden w-full table-fixed border-collapse md:table">
        <caption className="sr-only">Public events in {monthLabel(month)}</caption>
        <thead>
          <tr>
            {WEEKDAYS.map((d) => (
              <th key={d} scope="col" className="border border-line-soft bg-panel py-2 text-xs font-normal uppercase tracking-widest text-muted">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week[0].key}>
              {week.map((day) => {
                const events = day.inMonth ? byDay.get(day.key) ?? [] : [];
                return (
                  <td key={day.key} className={`h-28 border border-line-soft p-1.5 align-top ${day.inMonth ? "" : "bg-black/40 text-[#555]"}`}>
                    <div className={`text-right text-sm ${day.inMonth ? "text-white" : ""}`}>{day.day}</div>
                    <ul className="mt-1 space-y-1">
                      {events.map((e) => (
                        <li
                          key={e.id}
                          className={`border-l-2 bg-[#241a12] px-1.5 py-1 text-xs leading-snug ${e.status === "cancelled" ? "border-[#666] line-through opacity-60" : "border-orange"}`}
                        >
                          <span className="block text-muted">{formatTimeRange(e.starts_at, null, e.all_day)}</span>
                          <span className="text-white">{e.title}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Agenda list on phones, and the detail list on larger screens */}
      <section aria-label={`Event details for ${monthLabel(month)}`} className="mt-0 md:mt-12">
        {items.length === 0 ? (
          <p className="panel bg-panel p-6 text-center">No public events scheduled for {monthLabel(month)} yet.</p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((e) => (
              <li key={e.id} className="contents">
                <EventCard event={e} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function CalendarSkeleton() {
  return <div className="h-[520px] animate-pulse bg-panel" aria-label="Loading calendar" />;
}
