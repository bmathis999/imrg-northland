import { describe, expect, it } from "vitest";
import { contactSchema, fieldErrors, joinSchema } from "@/lib/validation";

const good = {
  first_name: " Pat ",
  last_name: "Rider",
  email: " Pat@Example.COM ",
  phone: "",
  city: "Duluth",
  agree: "on",
};

describe("join form", () => {
  it("accepts a valid request and normalizes it", () => {
    const r = joinSchema.safeParse(good);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.first_name).toBe("Pat");
    expect(r.data.email).toBe("pat@example.com");
    expect(r.data.phone).toBeNull();
    expect(r.data.bike).toBeNull();
  });

  it("requires the privacy checkbox", () => {
    const r = joinSchema.safeParse({ ...good, agree: undefined });
    expect(r.success).toBe(false);
    if (!r.success) expect(fieldErrors(r.error).agree).toBeTruthy();
  });

  it("rejects bad email, phone and over-long fields", () => {
    const r = joinSchema.safeParse({ ...good, email: "not-an-email", phone: "call me", message: "x".repeat(1501) });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = fieldErrors(r.error);
      expect(e.email).toBeTruthy();
      expect(e.phone).toBeTruthy();
      expect(e.message).toBeTruthy();
    }
  });

  it("drops fields that aren't part of the form", () => {
    const r = joinSchema.safeParse({ ...good, status: "approved", role: "president" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect("status" in r.data).toBe(false);
      expect("role" in r.data).toBe(false);
    }
  });
});

describe("contact form", () => {
  it("needs a real message", () => {
    expect(contactSchema.safeParse({ name: "A", email: "a@b.co", message: "hi" }).success).toBe(false);
    expect(contactSchema.safeParse({ name: "A", email: "a@b.co", message: "When is the next ride?" }).success).toBe(true);
  });
});
