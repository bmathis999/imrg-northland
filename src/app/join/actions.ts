"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import { adminDb } from "@/lib/supabase/admin";
import { verifyTurnstile } from "@/lib/turnstile";
import { notifyChapter } from "@/lib/notify";
import { fieldErrors, joinSchema, pick, type FormState } from "@/lib/validation";

const FIELDS = ["first_name", "last_name", "email", "phone", "city", "bike", "heard_from", "message", "agree"] as const;

const SUCCESS: FormState = {
  status: "success",
  message:
    "Thanks! Your request is in. Our Membership Coordinator will review it and email you. Approved members get an invitation to sign in.",
};

export async function requestMembership(_prev: FormState, formData: FormData): Promise<FormState> {
  // Hidden "company" field: people never see it, bots often fill it in. Pretend success.
  if (typeof formData.get("company") === "string" && formData.get("company") !== "") return SUCCESS;

  const raw = pick(formData, FIELDS);
  // Values echoed back to the form on error (the checkbox is left for the person to tick again).
  const values = { ...raw };
  delete values.agree;

  const h = await headers();
  const ip = h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const token = formData.get("cf-turnstile-response");
  if (!(await verifyTurnstile(typeof token === "string" ? token : null, ip))) {
    return { status: "error", message: "We couldn't confirm you're not a bot. Please try the check again.", values };
  }

  const parsed = joinSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error), values };
  }

  const db = adminDb();
  if (!db) {
    console.error("requestMembership: database not configured");
    return { status: "error", message: "Sign-ups aren't open yet. Please email us instead.", values };
  }

  // Explicit column list: only these fields can ever be written by the public form.
  const d = parsed.data;
  const row = {
    first_name: d.first_name,
    last_name: d.last_name,
    email: d.email,
    phone: d.phone,
    city: d.city,
    bike: d.bike,
    heard_from: d.heard_from,
    message: d.message,
  };
  const { error } = await db.from("membership_requests").insert(row);
  if (error) {
    // 23505 = this email already has a pending request. Same reply either way,
    // so the form can't be used to discover who has applied.
    if (error.code === "23505") return SUCCESS;
    console.error("requestMembership insert failed", error.code);
    return { status: "error", message: "Something went wrong saving your request. Please try again shortly.", values };
  }

  after(() =>
    notifyChapter(
      "New membership request",
      `${row.first_name} ${row.last_name} (${row.city}) asked to join. Review it in the member portal once Phase 2 is live, or in Supabase under membership_requests.`,
    ),
  );
  return SUCCESS;
}
