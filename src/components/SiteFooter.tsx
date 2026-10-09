import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import { FacebookIcon } from "./FacebookIcon";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-ink pt-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-[1fr_1.4fr_auto]">
        <Link href="/" aria-label="Home" className="w-fit">
          <Image src="/brand/logo-120.png" alt="IMRG Northland Chapter 2093 logo" width={95} height={120} className="h-[120px] w-auto" />
        </Link>
        <div>
          <h2 className="display text-lg font-extrabold">Contact Us</h2>
          <ul className="mt-6 space-y-2 text-[0.95rem]">
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-white hover:underline">
                {site.email}
              </a>
            </li>
            <li>{site.region}</li>
            <li>
              <Link href="/contact" className="hover:text-white hover:underline">
                Send us a message
              </Link>
            </li>
          </ul>
        </div>
        <div className="md:text-right">
          <a
            href={site.facebookGroupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
            aria-label="Our Facebook group (opens in a new tab)"
          >
            <FacebookIcon className="h-7 w-7" />
          </a>
        </div>
      </div>

      <div aria-hidden="true" className="mx-auto mt-14 max-w-6xl overflow-hidden px-4 text-center sm:px-6">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="font-[family-name:var(--font-display)] text-[clamp(2.6rem,10.5vw,6.2rem)] font-extrabold leading-[1.02] tracking-tight text-watermark select-none"
          >
            NORTHLAND
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mt-14 border-t border-orange/80" />
        <div className="flex flex-col gap-3 py-8 text-sm text-muted sm:flex-row sm:justify-between">
          <p>© 2026 {site.name}. All rights reserved.</p>
          <p>
            <Link href="/privacy" className="hover:text-white hover:underline">
              Privacy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
