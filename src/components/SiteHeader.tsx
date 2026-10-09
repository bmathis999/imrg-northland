"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { nav } from "@/lib/site";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  // The phone menu remembers which page it was opened on, so it closes itself after navigating.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (fn: (v: boolean) => boolean) => setOpenOn(fn(open) ? pathname : null);

  return (
    <header className="border-b border-[#2c2c2c] bg-ink">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
        <Link href="/" className="shrink-0" aria-label="IMRG Northland Chapter 2093 home">
          <Image src="/brand/logo-240.png" alt="" width={189} height={240} className="h-16 w-auto sm:h-24" priority />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-8 text-[0.9rem] uppercase tracking-wide text-white">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className="underline-offset-4 hover:underline aria-[current=page]:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden items-center gap-2 text-red-400 hover:text-red-300 sm:flex">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7 fill-white">
              <circle cx="12" cy="12" r="12" />
              <circle cx="12" cy="9.5" r="4" className="fill-ink" />
              <path d="M4.5 19.5c1.6-3 4.3-4.5 7.5-4.5s5.9 1.5 7.5 4.5" className="fill-ink" />
            </svg>
            <span className="text-[0.95rem] text-[#e04b4b]">Log In</span>
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center border border-[#444] text-white lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-[#2c2c2c] lg:hidden">
          <ul className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className="block py-3 text-base uppercase tracking-wide text-white aria-[current=page]:text-orange"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/login" className="block py-3 text-base uppercase tracking-wide text-[#e04b4b]">
                Log In
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
