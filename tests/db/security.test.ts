/**
 * Runs the real migration and seed in an in-process Postgres (PGlite) and checks
 * what the public "anon" key can and can't do. Supabase's default grants are
 * recreated first, so this proves the migration actually removes them.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const root = join(__dirname, "..", "..");
const migration = readFileSync(join(root, "supabase/migrations/20261008000001_public_site.sql"), "utf8");
const seed = readFileSync(join(root, "supabase/seed.sql"), "utf8");

let db: PGlite;

async function asRole<T>(role: "anon" | "authenticated" | "service_role", sql: string): Promise<T[]> {
  await db.exec(`set role ${role}`);
  try {
    return (await db.query<T>(sql)).rows;
  } finally {
    await db.exec("reset role");
  }
}

beforeAll(async () => {
  db = new PGlite();
  // Recreate the Supabase roles and their generous defaults.
  await db.exec(`
    create role anon nologin noinherit;
    create role authenticated nologin noinherit;
    create role service_role nologin noinherit bypassrls;
    grant usage on schema public to anon, authenticated, service_role;
    alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
    alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
  `);
  await db.exec(migration);
  await db.exec(seed);
});

afterAll(async () => {
  await db?.close();
});

describe("events", () => {
  it("anon sees only public events", async () => {
    const rows = await asRole<{ title: string; visibility: string }>(
      "anon",
      "select title, visibility from public.events order by starts_at",
    );
    expect(rows.length).toBe(3);
    expect(rows.every((r) => r.visibility === "public")).toBe(true);
    expect(rows.map((r) => r.title)).not.toContain("Members Breakfast Ride");
  });

  it("anon cannot read member-only columns, even on public rides", async () => {
    await expect(asRole("anon", "select meeting_point from public.events")).rejects.toThrow(/permission denied/);
    await expect(asRole("anon", "select member_notes from public.events")).rejects.toThrow(/permission denied/);
    await expect(asRole("anon", "select * from public.events")).rejects.toThrow(/permission denied/);
  });

  it("anon cannot write events", async () => {
    await expect(
      asRole("anon", "insert into public.events (title, starts_at, visibility) values ('x', now(), 'public')"),
    ).rejects.toThrow(/permission denied/);
    await expect(asRole("anon", "update public.events set title = 'hacked'")).rejects.toThrow(/permission denied/);
    await expect(asRole("anon", "delete from public.events")).rejects.toThrow(/permission denied/);
  });

  it("new events default to members-only", async () => {
    const [row] = await asRole<{ visibility: string }>(
      "service_role",
      "insert into public.events (title, starts_at) values ('Default check', now()) returning visibility",
    );
    expect(row.visibility).toBe("members");
  });

  it("rejects an end time before the start", async () => {
    await expect(
      asRole("service_role", "insert into public.events (title, starts_at, ends_at) values ('Bad', now(), now() - interval '1 hour')"),
    ).rejects.toThrow(/events_end_after_start/);
  });
});

describe("announcements", () => {
  it("anon sees only published, unexpired public announcements", async () => {
    const rows = await asRole<{ title: string }>("anon", "select title from public.announcements");
    expect(rows.map((r) => r.title)).toEqual(["Welcome to our new website"]);
  });
});

describe("membership requests and contact messages", () => {
  it("anon can neither read nor write them", async () => {
    await expect(asRole("anon", "select email from public.membership_requests")).rejects.toThrow(/permission denied/);
    await expect(
      asRole("anon", "insert into public.membership_requests (first_name,last_name,email,city) values ('a','b','a@b.co','c')"),
    ).rejects.toThrow(/permission denied/);
    await expect(asRole("anon", "select * from public.contact_messages")).rejects.toThrow(/permission denied/);
    await expect(asRole("authenticated", "select email from public.membership_requests")).rejects.toThrow(/permission denied/);
  });

  it("the server allows one pending request per email", async () => {
    const insert = "insert into public.membership_requests (first_name,last_name,email,city) values ('Pat','Rider','pat@example.com','Duluth')";
    await asRole("service_role", insert);
    await expect(asRole("service_role", insert)).rejects.toThrow(/membership_requests_one_pending/);
  });

  it("rejects emails that aren't lower-case", async () => {
    await expect(
      asRole("service_role", "insert into public.membership_requests (first_name,last_name,email,city) values ('A','B','Pat@Example.com','C')"),
    ).rejects.toThrow(/check constraint/);
  });
});
