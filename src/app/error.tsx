"use client";

import Link from "next/link";

// Last-resort page if something unexpected fails. Never shows error details to visitors.
export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
      <p className="text-sm uppercase tracking-[0.2em] text-orange">Something went wrong</p>
      <h1 className="display mt-4 text-4xl">Flat tire</h1>
      <p className="mt-5">This page hit a problem. Please try again in a moment.</p>
      {error.digest && <p className="mt-2 text-xs text-muted">Reference: {error.digest}</p>}
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button type="button" onClick={() => retry()} className="btn btn-red">Try again</button>
        <Link href="/" className="btn btn-dark">Back to home</Link>
      </div>
    </div>
  );
}
