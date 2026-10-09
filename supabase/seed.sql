-- Sample data for local testing only. Do NOT run against the live database.
-- Dates are relative to today so the calendar always has something to show.

insert into public.events (title, kind, visibility, starts_at, ends_at, location_public, description, meeting_point, member_notes)
values
  ('Fall Colors Ride', 'ride', 'public',
   date_trunc('day', now()) + interval '5 days 9 hours', date_trunc('day', now()) + interval '5 days 15 hours',
   'Duluth, MN', 'A relaxed ride up the North Shore to catch the colors. All Indian riders welcome.',
   'Gas station on Hwy 61, north lot', 'Lunch stop in Two Harbors'),
  ('Members Breakfast Ride', 'ride', 'members',
   date_trunc('day', now()) + interval '9 days 8 hours', date_trunc('day', now()) + interval '9 days 12 hours',
   'Cloquet, MN', 'Breakfast and a short loop.', 'Diner parking lot', 'RSVP so we can reserve tables'),
  ('Toy Drive Kickoff', 'charity', 'public',
   date_trunc('day', now()) + interval '16 days 17 hours', date_trunc('day', now()) + interval '16 days 19 hours',
   'Superior, WI', 'Bring a new, unwrapped toy for regional youth programs.', null, null),
  ('Chapter Meeting', 'meeting', 'members',
   date_trunc('day', now()) + interval '20 days 18 hours 30 minutes', null,
   'Duluth, MN', 'Monthly chapter meeting.', 'Back room at the dealership', 'Officer reports, budget review'),
  ('Rain Date: Lake Loop', 'ride', 'public',
   date_trunc('day', now()) + interval '24 days 10 hours', null,
   'Two Harbors, MN', 'Cancelled due to weather forecast.', null, null);

update public.events set status = 'cancelled' where title = 'Rain Date: Lake Loop';

insert into public.announcements (title, body, visibility, pinned, publish_at, expires_at)
values
  ('Welcome to our new website', E'We''ve moved off our old Wix site.\nMember sign-in is coming soon.', 'public', true, now() - interval '1 day', null),
  ('Dues reminder', 'Annual dues are due at the next meeting.', 'members', false, now() - interval '1 day', null),
  ('Old notice', 'This one has expired and should not show.', 'public', false, now() - interval '30 days', now() - interval '1 day'),
  ('Scheduled notice', 'Not published yet, should not show.', 'public', false, now() + interval '3 days', null);
