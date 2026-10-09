import { z } from "zod";

const trimmed = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters.`);
/** Optional text: missing or blank becomes null. */
const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters.`)
    .optional()
    .transform((v) => (v ? v : null));

export const joinSchema = z.object({
  first_name: trimmed(60).min(1, "Enter your first name."),
  last_name: trimmed(60).min(1, "Enter your last name."),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email("Enter a valid email address.")),
  phone: optional(30).refine((v) => v === null || /^[0-9+().\-\s]{7,30}$/.test(v), "Enter a valid phone number."),
  city: trimmed(80).min(1, "Enter your city or town."),
  bike: optional(120),
  heard_from: optional(200),
  message: optional(1500),
  agree: z.literal("on", { error: "Please confirm you've read the privacy notice." }),
});

export const contactSchema = z.object({
  name: trimmed(100).min(1, "Enter your name."),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email("Enter a valid email address.")),
  message: trimmed(3000).min(10, "Write a little more so we can help (at least 10 characters)."),
});

export type FieldErrors = Partial<Record<string, string>>;

export type FormState = {
  status: "idle" | "error" | "success";
  message?: string;
  errors?: FieldErrors;
  values?: Record<string, string>;
};

/** Turns zod issues into one message per field for the form to display. */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Reads only the named fields from FormData as strings (files and extras are ignored). */
export function pick(formData: FormData, names: readonly string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of names) {
    const v = formData.get(name);
    if (typeof v === "string") out[name] = v;
  }
  return out;
}
