"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import { adminDb } from "@/lib/supabase/admin";
import { verifyTurnstile } from "@/lib/turnstile";
import { notifyChapter } from "@/lib/notify";
import { contactSchema, fieldErrors, pick, type FormState } from "@/lib/validation";

const SUCCESS: FormState = { status: "success", message: "Thanks for reaching out. A chapter officer will reply by email." };

export async function sendContactMessage(_prev: FormState, formData: FormData): Promise<FormState> {
  if (typeof formData.get("company") === "string" && formData.get("company") !== "") return SUCCESS;

  const values = pick(formData, ["name", "email", "message"]);

  const h = await headers();
  const ip = h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const token = formData.get("cf-turnstile-response");
  if (!(await verifyTurnstile(typeof token === "string" ? token : null, ip))) {
    return { status: "error", message: "We couldn't confirm you're not a bot. Please try the check again.", values };
  }

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error), values };
  }

  const db = adminDb();
  if (!db) {
    console.error("sendContactMessage: database not configured");
    return { status: "error", message: "The contact form isn't available yet. Please email us instead.", values };
  }

  const { error } = await db.from("contact_messages").insert(parsed.data);
  if (error) {
    console.error("sendContactMessage insert failed", error.code);
    return { status: "error", message: "Something went wrong sending your message. Please try again shortly.", values };
  }

  after(() => notifyChapter("New website message", `From ${parsed.data.name}:\n\n${parsed.data.message}\n\nReply to: ${parsed.data.email}`));
  return SUCCESS;
}
