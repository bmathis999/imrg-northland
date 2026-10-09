"use client";

import Script from "next/script";
import { useEffect, useId, useRef } from "react";
import type { FormState } from "@/lib/validation";

declare global {
  interface Window {
    turnstile?: { reset: (el?: HTMLElement) => void };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/** Cloudflare Turnstile spam check. Resets after each failed submit, since tokens are single-use. */
export function SpamCheck({ state }: { state: FormState }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.status === "error" && ref.current) window.turnstile?.reset(ref.current);
  }, [state]);

  if (!SITE_KEY) {
    return process.env.NODE_ENV === "production" ? null : (
      <p className="text-xs text-muted">Spam check is off locally (no Turnstile site key set).</p>
    );
  }
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" async defer />
      <div ref={ref} className="cf-turnstile" data-sitekey={SITE_KEY} data-theme="dark" />
    </>
  );
}

/** Hidden trap field. Humans never see it; bots that fill it are ignored. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Company
        <input type="text" name="company" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}

type FieldProps = {
  name: string;
  label: string;
  state: FormState;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  hint?: string;
  maxLength?: number;
  textarea?: boolean;
};

export function Field({ name, label, state, type = "text", required, autoComplete, hint, maxLength, textarea }: FieldProps) {
  const id = useId();
  const error = state.errors?.[name];
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-err` : null].filter(Boolean).join(" ") || undefined;
  const common = {
    id,
    name,
    required,
    autoComplete,
    maxLength,
    defaultValue: state.values?.[name] ?? "",
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    className: `field ${error ? "border-[#ff6b6b]" : ""}`,
  } as const;

  return (
    <div>
      <label htmlFor={id} className="label">
        {label} {required ? <span aria-hidden="true" className="text-orange">*</span> : <span className="normal-case tracking-normal">(optional)</span>}
      </label>
      {textarea ? <textarea rows={5} {...common} /> : <input type={type} {...common} />}
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="mt-1 text-sm text-[#ff8a8a]">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (state.status === "idle" || !state.message) return null;
  const ok = state.status === "success";
  return (
    <div role={ok ? "status" : "alert"} className={`border p-4 ${ok ? "border-[#4caf50] bg-[#0f1f12] text-[#c8f0cb]" : "border-[#ff6b6b] bg-[#2a1212] text-[#ffd0d0]"}`}>
      {state.message}
    </div>
  );
}
