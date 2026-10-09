"use client";

import { useActionState } from "react";
import { sendContactMessage } from "./actions";
import { Field, FormMessage, Honeypot, SpamCheck } from "@/components/forms";
import type { FormState } from "@/lib/validation";

const initial: FormState = { status: "idle" };

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContactMessage, initial);
  if (state.status === "success") return <FormMessage state={state} />;
  return (
    <form action={action} noValidate className="relative space-y-5">
      <FormMessage state={state} />
      <Field name="name" label="Name" state={state} required autoComplete="name" maxLength={100} />
      <Field name="email" label="Email" type="email" state={state} required autoComplete="email" maxLength={254} />
      <Field name="message" label="Message" state={state} required textarea maxLength={3000} />
      <Honeypot />
      <SpamCheck state={state} />
      <button type="submit" disabled={pending} className="btn btn-red w-full sm:w-auto disabled:opacity-60">
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
