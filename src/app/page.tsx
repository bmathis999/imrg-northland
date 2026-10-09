import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import { getPublicAnnouncements, getUpcomingPublicEvents } from "@/lib/data/public";
import { SafeSection } from "@/components/SafeSection";
import { EventList } from "@/components/EventCard";
import { FacebookIcon } from "@/components/FacebookIcon";

// Rebuilt in the background at most every 15 minutes (matches REFRESH_SECONDS).
export const revalidate = 900;

export default function HomePage() {
  return (
    <>
      <SafeSection what="the latest notification" fallback={null} quiet>
        <PinnedNotice />
      </SafeSection>
      <Hero />
      <Legacy />
      <MeetChapter />
      <CharityRow />
      <UpcomingRides />
    </>
  );
}

async function PinnedNotice() {
  const { items } = await getPublicAnnouncements(1);
  const notice = items[0];
  if (!notice) return null;
  return (
    <div className="border-b border-orange/40 bg-[#1f160f]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm sm:px-6">
        <span className="uppercase tracking-widest text-orange">Notice</span>
        <span className="font-semibold text-white">{notice.title}</span>
        <Link href="/announcements" className="ml-auto text-white underline underline-offset-4 hover:text-orange">
          Read more
        </Link>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <Image
        src={site.heroImage}
        alt="Indian motorcycles lined up in a field at sunset"
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div className="-z-10 absolute inset-0 bg-black/20" aria-hidden="true" />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex min-h-[340px] flex-col items-center justify-between border border-white/80 bg-black/10 px-5 py-10 text-center sm:min-h-[400px] sm:py-14">
          <div>
            <h1 id="hero-title" className="display text-[clamp(2.4rem,8.5vw,5.4rem)] drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
              IMRG
              <br />
              NORTHLAND
            </h1>
            {/* Dark backing keeps the orange tagline readable over any photo, including orange sunset skies. */}
            <p className="mt-8 inline-block bg-black/55 px-3 py-1.5 text-[clamp(0.85rem,2vw,1rem)] uppercase tracking-wide text-orange">
              {site.tagline}
            </p>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/join" className="btn btn-red">
              Join the Brotherhood
            </Link>
            <Link href="#our-story" className="btn btn-dark">
              Our Story
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Legacy() {
  return (
    <section id="our-story" aria-labelledby="legacy-title" className="scroll-mt-6">
      <div className="mx-auto grid max-w-6xl md:grid-cols-2">
        <div className="flex flex-col justify-end px-4 py-14 sm:px-6 md:border-r md:border-line md:py-20 md:pr-10">
          <h2 id="legacy-title" className="display text-[clamp(1.9rem,4.4vw,2.6rem)]">
            Our Riding Legacy
          </h2>
          <div className="mt-6 h-px w-16 bg-orange" />
          <p className="mt-6 max-w-md leading-relaxed">
            Since our founding, IMRG Northland Chapter 2093 has been a professional brotherhood of Indian Motorcycle
            enthusiasts in the Northland region. We ride with purpose, fostering community connection while supporting
            regional charitable activities through local participation and shared loyalty.
          </p>
        </div>
        <div className="px-4 pb-14 sm:px-6 md:py-8 md:pl-10">
          <Image
            src={site.legacyImage}
            alt="A chapter member riding a highway under a blue sky"
            width={900}
            height={1100}
            sizes="(min-width: 768px) 480px, 100vw"
            className="aspect-[4/3] w-full max-w-md object-cover md:aspect-[4/5]"
          />
        </div>
      </div>
    </section>
  );
}

function MeetChapter() {
  return (
    <section aria-labelledby="meet-title" className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl border-y border-line bg-panel px-5 py-10 sm:px-10">
        <h2 id="meet-title" className="display text-center text-[clamp(1.3rem,3.6vw,2rem)] text-orange">
          MEET IMRG NORTHLAND 2093
        </h2>
        <div className="mx-auto mt-8 max-w-xl border-x border-line px-3 py-4 sm:px-6">
          <a
            href={site.facebookGroupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block"
            aria-label="Watch our chapter video on Facebook (opens in a new tab)"
          >
            <Image
              src={site.videoPoster}
              alt=""
              width={1280}
              height={720}
              sizes="(min-width: 640px) 560px, 100vw"
              className="h-auto w-full"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/70 transition group-hover:bg-red">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="ml-1 h-6 w-6 fill-white">
                  <path d="M7 4.5v15l12-7.5z" />
                </svg>
              </span>
            </span>
          </a>
          <p className="mt-3 text-center text-xs text-muted">Video opens on Facebook</p>
        </div>
        <div className="mt-8 border-t border-dotted border-[#666]" />
        <div className="mt-5 flex justify-center">
          <a
            href={site.facebookGroupUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Our Facebook group (opens in a new tab)"
          >
            <FacebookIcon className="h-7 w-7" />
          </a>
        </div>
      </div>
    </section>
  );
}

function CharityRow() {
  return (
    <section aria-labelledby="charity-title" className="px-4 sm:px-6">
      <div className="mx-auto grid max-w-5xl border border-line md:grid-cols-3">
        <div className="p-7 md:p-8">
          <h2 id="charity-title" className="display text-xl leading-[1.05]">
            CHARITABLE
            <br />
            INITIATIVES
          </h2>
          <p className="mt-5 text-[0.92rem] leading-relaxed">
            We are dedicated to supporting the Northland community through targeted charitable drives. Your
            contributions help us give back to veteran organizations and regional youth programs, ensuring our ride
            makes a real difference in the lives of those we serve.
          </p>
        </div>
        <div className="flex items-center justify-center border-t border-line p-8 md:border-t-0 md:border-l">
          <Link href="/login" className="btn btn-red min-w-48">
            Member Login
          </Link>
        </div>
        <div className="flex items-center justify-center border-t border-line p-8 md:border-t-0 md:border-l">
          <div
            role="img"
            aria-label="I am IMRG"
            className="flex h-36 w-52 items-center justify-center bg-black text-center font-[family-name:var(--font-display)] text-[1.7rem] leading-[1.05] font-extrabold text-white uppercase"
          >
            I am
            <br />
            IMRG
          </div>
        </div>
      </div>
    </section>
  );
}

async function UpcomingList() {
  const { items } = await getUpcomingPublicEvents(3);
  if (items.length === 0) {
    return <p className="display text-center text-sm font-bold text-[#cfcfcf]">No events at the moment</p>;
  }
  return (
    <>
      <h2 className="display mb-8 text-center text-[clamp(1.4rem,3.5vw,2rem)]">Upcoming Rides</h2>
      <EventList events={items} />
      <p className="mt-8 text-center">
        <Link href="/calendar" className="text-white underline underline-offset-4 hover:text-orange">
          See the full calendar
        </Link>
      </p>
    </>
  );
}

function UpcomingRides() {
  return (
    <section aria-label="Upcoming rides" className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
      <SafeSection what="upcoming rides">
        <UpcomingList />
      </SafeSection>
      <div className="mt-14 text-center">
        <p>Ride more, miss less. Log in to view every scheduled event and chapter ride.</p>
        <Link href="/login" className="btn btn-red mt-5">
          Member Login
        </Link>
      </div>
    </section>
  );
}
