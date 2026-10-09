# IMRG Northland Chapter 2093 website

Phase 1: the public site, rebuilt from the Wix Harmony design, with rides, a monthly
calendar, notifications, a membership request form and a contact form.
Phase 2 adds Google sign-in, roles and the member portal.

Stack (all free tiers): Next.js 16 · Tailwind CSS · Supabase (Postgres) · Cloudflare Workers ·
Cloudflare Turnstile · Resend (optional email alerts).

## What's in Phase 1

| Page | What it shows |
| --- | --- |
| `/` | Home, matching the Harmony layout: hero, Our Riding Legacy, Meet IMRG Northland, Charitable Initiatives, upcoming public rides, pinned notice |
| `/calendar` | Month grid of **public** rides and events (`?month=2026-11` to jump) |
| `/rides` | List of upcoming public rides |
| `/announcements` | Public notifications (pinned first; expired and future ones hidden) |
| `/join` | Membership request form |
| `/contact` | Contact form |
| `/about`, `/privacy` | Our Story; privacy notice draft (not legal advice, have the board review it) |
| `/login` | Placeholder until Phase 2 |

Members-only rides never appear on public pages. The database enforces this, not just the website: see *Security*.

## Run it on your computer

Needs Node.js 22 or newer.

```bash
npm install          # also applies patches/ (see "Known issues")
cp .env.example .env.local
npm run dev          # http://localhost:3000
```

With no Supabase settings the site still runs: data sections show "No events at the moment".
The spam check is skipped in development only.

## Set up Supabase (database)

1. Create a free project at supabase.com under the chapter's Google account. Pick a US region.
2. **SQL Editor → New query**: paste all of `supabase/migrations/20261008000001_public_site.sql` and run it.
   (Or with the Supabase CLI: `supabase link --project-ref [PROJECT_REF]` then `supabase db push`.)
3. Optional, for a test project only: run `supabase/seed.sql` to add sample rides. **Don't run it on the live database.**
4. **Project Settings → API**: copy the URL, the `anon` key and the `service_role` key into `.env.local`.

Until the Phase 2 admin screens exist, add rides and notices in **Table Editor**:
- `events`: set `visibility` to `public` for rides anyone can see; new rows default to `members`.
  Put the general area in `location_public` (e.g. "Duluth, MN") and the exact meeting spot in `meeting_point`, which stays private.
- `announcements`: `visibility`, `pinned`, `publish_at`, optional `expires_at`.
- Join requests arrive in `membership_requests`; contact messages in `contact_messages`.

Changes appear on the public site within 15 minutes.

## Set up the spam check (Turnstile)

Cloudflare dashboard → **Turnstile → Add widget**, domain `northlandimrg.com` (add `localhost` for testing).
Put the site key in `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and the secret in `TURNSTILE_SECRET_KEY`.
In production, a missing secret makes the forms refuse submissions on purpose, so spam protection can't silently switch off.

## Deploy to Cloudflare (free)

```bash
npx wrangler login
npx wrangler kv namespace create NEXT_INC_CACHE_KV
#  → paste the printed id into wrangler.jsonc in place of [KV_NAMESPACE_ID]

# Secrets (you'll be prompted for each value; they're never stored in the repo)
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put RESEND_API_KEY        # optional
```

`NEXT_PUBLIC_*` values are built into the site, so set them in `.env.local` (or your CI) before deploying:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_SITE_URL`.

```bash
npm run deploy       # builds and uploads; prints a *.workers.dev address to check first
```

Then in Cloudflare: **Workers → imrg-northland → Settings → Domains & Routes → Add custom domain** `northlandimrg.com`.
This needs the domain's DNS on Cloudflare (free): add the domain to Cloudflare and change the nameservers at your registrar.
Keep the Wix site live until the new one checks out, then disconnect the domain from Wix.

Preview the production build locally in Cloudflare's runtime: copy `.env.example` to `.dev.vars`, then `npm run cf:preview`.
(Local preview can't reach a database on `localhost` because `global_fetch_strictly_public` blocks private addresses; use your real Supabase project.)

## Replace the photos and text

- Photos: put real images in `public/images/` with the same names: `hero.jpg` (wide, ~2400×1000),
  `legacy.jpg` (portrait, ~900×1100), `video-poster.jpg` (16:9). The current files are generated placeholders.
- Contact email, Facebook link, nav labels: `src/lib/site.ts`.
- Colors and fonts: the `@theme` block in `src/app/globals.css`.
- Logo: `public/brand/`. To regenerate from a new original, see `scripts/make-logo.py`.

## Tests

```bash
npm test             # unit tests + database security tests
npm run lint
npm run typecheck
npm run build
```

`tests/db/security.test.ts` runs the real migration in an in-process Postgres (PGlite), recreates
Supabase's default permissions, and proves the public key:
- sees only public events, and gets *permission denied* on `meeting_point`, `route_url`, `member_notes`;
- cannot insert, update or delete events;
- sees only published, unexpired public announcements;
- cannot read or write membership requests or contact messages.

### Manual checklist before launch

- [ ] Home page matches the Harmony screenshots on a phone, a tablet and a desktop; no sideways scrolling
- [ ] Phone menu opens, closes, and closes itself after tapping a link
- [ ] A ride marked `members` in Supabase never appears on `/`, `/rides`, `/calendar` or in the page source
- [ ] A ride changed from `members` to `public` appears within 15 minutes
- [ ] Join form: empty submit shows field errors; a real request lands in `membership_requests`; the same email again shows the same thank-you
- [ ] Join form refuses submissions when the Turnstile secret is missing (production)
- [ ] Contact form message lands in `contact_messages` (and in the inbox, if Resend is set up)
- [ ] With the database paused, pages still load and show "We couldn't load… right now"
- [ ] `https://securityheaders.com` scan of the live site shows CSP, HSTS, X-Frame-Options and nosniff

## Security notes

- **Database rules are the real lock.** Row-level security is on for every table. The public key can read only
  public rows and only safe columns; it can't write anything. The website's server uses the service-role key
  only inside the form handlers, after validation and the spam check. That key is server-only: importing
  `src/lib/supabase/admin.ts` into browser code fails the build.
- **Forms:** server-side validation (zod) with length limits, Turnstile, a hidden honeypot field, one pending request
  per email (enforced by the database), and identical replies for new and repeat emails so the form can't reveal who applied.
- **Headers:** Content-Security-Policy, HSTS, X-Frame-Options DENY, nosniff, strict referrer, Permissions-Policy (`next.config.ts`).
- **Text from the database is never rendered as HTML.** Notifications are plain text.
- **No trackers.** The Facebook video is a link out, not an embed, so Facebook can't track visitors on our pages.

## Known issues and decisions

- **Cache Components is off.** Next.js 16's new caching mode hung when run in Cloudflare's Workers runtime, so the site
  uses time-based refresh (`unstable_cache` + `revalidate = 900`) instead, which the Cloudflare adapter supports.
- **Adapter patch.** `@opennextjs/cloudflare` 1.20.9 doesn't bundle Next.js 16.4's `preview-props.json`, which made every
  page fail. `patches/@opennextjs+cloudflare+1.20.9.patch` adds it (one line). Delete the patch once a newer adapter fixes it.
- **Page cache uses Workers KV**, not R2, because R2 requires a payment method on file. KV's free write limit (1,000/day)
  is why public pages refresh every 15 minutes rather than every minute.
- `npm audit` reports issues in the ESLint toolchain only (development tools, never shipped to the site).
- **Not yet built (planned):** daily database keep-alive and nightly backup jobs, and uptime alerts, before launch;
  Google sign-in, roles, member portal, treasury and Drive in Phase 2 onward.
