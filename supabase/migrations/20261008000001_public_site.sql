-- Phase 1: public site content and public forms.
--
-- Security model
--   * Row Level Security is on for every table.
--   * The public "anon" key may read ONLY rows marked public, and ONLY the columns
--     granted below. Member-only details (meeting point, route, notes) can't be
--     selected with it at all, even for public rides.
--   * Nobody but the server's service-role key can write. The website's server
--     actions validate input and run the spam check before writing.
--   * Phase 2 adds signed-in member/officer policies on top of this.

-- ---------------------------------------------------------------- types
create type public.visibility as enum ('public', 'members');
create type public.event_kind as enum ('ride', 'event', 'meeting', 'charity');
create type public.event_status as enum ('scheduled', 'cancelled');
create type public.request_status as enum ('pending', 'approved', 'declined');

-- ---------------------------------------------------------------- helpers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------- events (rides + calendar)
create table public.events (
  id                uuid primary key default gen_random_uuid(),
  title             text not null check (char_length(title) between 1 and 120),
  kind              public.event_kind not null default 'ride',
  -- Safe default: a new event is members-only until someone marks it public.
  visibility        public.visibility not null default 'members',
  status            public.event_status not null default 'scheduled',
  starts_at         timestamptz not null,
  ends_at           timestamptz,
  all_day           boolean not null default false,
  location_public   text check (char_length(location_public) <= 120),   -- general area, e.g. "Duluth, MN"
  description       text check (char_length(description) <= 4000),
  -- Member-only details: never granted to the anon key.
  meeting_point     text check (char_length(meeting_point) <= 300),
  route_url         text check (char_length(route_url) <= 500),
  member_notes      text check (char_length(member_notes) <= 4000),
  facebook_post_url text check (facebook_post_url is null or facebook_post_url ~ '^https://(www\.|m\.)?facebook\.com/'),
  created_by        uuid,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint events_end_after_start check (ends_at is null or ends_at >= starts_at)
);
create index events_starts_at_idx on public.events (starts_at);
create index events_public_starts_idx on public.events (starts_at) where visibility = 'public';
create trigger events_updated_at before update on public.events
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- announcements ("Notifications")
create table public.announcements (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) between 1 and 140),
  body        text not null check (char_length(body) between 1 and 8000),  -- plain text, never rendered as HTML
  visibility  public.visibility not null default 'members',
  pinned      boolean not null default false,
  publish_at  timestamptz not null default now(),
  expires_at  timestamptz,
  created_by  uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint announcements_expiry_after_publish check (expires_at is null or expires_at > publish_at)
);
create index announcements_publish_idx on public.announcements (publish_at desc);
create trigger announcements_updated_at before update on public.announcements
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- membership requests (join form)
create table public.membership_requests (
  id          uuid primary key default gen_random_uuid(),
  first_name  text not null check (char_length(first_name) between 1 and 60),
  last_name   text not null check (char_length(last_name) between 1 and 60),
  email       text not null check (char_length(email) <= 254 and email = lower(email) and email like '%_@_%'),
  phone       text check (char_length(phone) <= 30),
  city        text not null check (char_length(city) between 1 and 80),
  bike        text check (char_length(bike) <= 120),
  heard_from  text check (char_length(heard_from) <= 200),
  message     text check (char_length(message) <= 1500),
  status      public.request_status not null default 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at  timestamptz not null default now()
);
-- One open request per email address.
create unique index membership_requests_one_pending on public.membership_requests (email) where status = 'pending';
create index membership_requests_status_idx on public.membership_requests (status, created_at desc);

-- ---------------------------------------------------------------- contact form
create table public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 100),
  email      text not null check (char_length(email) <= 254),
  message    text not null check (char_length(message) between 1 and 3000),
  handled    boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- lock everything down
alter table public.events              enable row level security;
alter table public.announcements       enable row level security;
alter table public.membership_requests enable row level security;
alter table public.contact_messages    enable row level security;

-- Supabase grants broad table privileges to anon/authenticated by default.
-- Remove them, then grant back only what the public site needs.
revoke all on public.events, public.announcements, public.membership_requests, public.contact_messages
  from anon, authenticated;

-- Public pages: safe columns only.
grant select (id, title, kind, visibility, status, starts_at, ends_at, all_day, location_public, description)
  on public.events to anon, authenticated;
grant select (id, title, body, visibility, pinned, publish_at, expires_at)
  on public.announcements to anon, authenticated;

create policy "public events are readable by anyone"
  on public.events for select
  to anon, authenticated
  using (visibility = 'public');

create policy "published public announcements are readable by anyone"
  on public.announcements for select
  to anon, authenticated
  using (
    visibility = 'public'
    and publish_at <= now()
    and (expires_at is null or expires_at > now())
  );

-- membership_requests and contact_messages: no grants and no policies for anon or
-- authenticated, so they can't be read or written with the public key.
-- (Phase 2 adds officer policies, e.g. the Membership Coordinator reviewing requests.)
