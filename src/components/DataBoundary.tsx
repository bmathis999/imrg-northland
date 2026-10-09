"use client";

import { catchError, type ErrorInfo } from "next/error";

/** Wraps a data section so a database hiccup shows a message instead of breaking the page. */
function Fallback(props: { what: string; quiet?: boolean }, { retry }: ErrorInfo) {
  // Small extras (like the home page notice bar) just disappear on failure.
  if (props.quiet) return null;
  return (
    <div role="status" className="panel bg-panel p-6 text-center">
      <p className="text-white">We couldn&apos;t load {props.what} right now.</p>
      <p className="mt-1 text-sm text-muted">Please try again in a minute, or check our Facebook group.</p>
      <button type="button" onClick={() => retry()} className="btn btn-dark mt-4">
        Try again
      </button>
    </div>
  );
}

export default catchError(Fallback);
