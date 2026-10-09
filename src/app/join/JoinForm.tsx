"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestMembership } from "./actions";
import { Field, FormMessage, Honeypot, SpamCheck } from "@/components/forms";
import type { FormState } from "@/lib/validation";

const initial: FormState = { status: "idle" };

export function JoinForm() {
  const [state, action, pending] = useActionState(requestMembership, initial);

  if (state.status === "success") return <FormMessage state={state} />;

  return (
    <form action={action} noValidate className="relative space-y-5">
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="first_name" label="First name" state={state} required autoComplete="given-name" maxLength={60} />
        <Field name="last_name" label="Last name" state={state} required autoComplete="family-name" maxLength={60} />
      </div>
      <Field name="email" label="Email" type="email" state={state} required autoComplete="email" maxLength={254} hint="We'll send your approval and sign-in invitation here." />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="phone" label="Phone" type="tel" state={state} autoComplete="tel" maxLength={30} />
        <Field name="city" label="City or town" state={state} required autoComplete="address-level2" maxLength={80} />
      </div>
      <Field name="bike" label="Your bike" state={state} maxLength={120} hint="For example: 2023 Indian Chieftain" />
      <Field name="heard_from" label="How did you hear about us?" state={state} maxLength={200} />
      <Field name="message" label="Anything else we should know?" state={state} textarea maxLength={1500} />

      <div>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="agree" required className="mt-1 h-5 w-5 accent-[#b22a2a]" aria-invalid={state.errors?.agree ? true : undefined} />
          <span>
            I&apos;ve read the <Link href="/privacy" className="text-white underline underline-offset-4">privacy notice</Link> and agree
            to the chapter storing these details to review my request.
          </span>
        </label>
        {state.errors?.agree && <p className="mt-1 text-sm text-[#ff8a8a]">{state.errors.agree}</p>}
      </div>

      <Honeypot />
      <SpamCheck state={state} />
      <button type="submit" disabled={pending} className="btn btn-red w-full sm:w-auto disabled:opacity-60">
        {pending ? "Sending…" : "Request membership"}
      </button>
    </form>
  );
}
