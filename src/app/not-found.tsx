import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
      <p className="text-sm uppercase tracking-[0.2em] text-orange">404</p>
      <h1 className="display mt-4 text-4xl">Wrong turn</h1>
      <p className="mt-5">That page doesn&apos;t exist. It may have moved when we left our old site.</p>
      <Link href="/" className="btn btn-red mt-8">Back to home</Link>
    </div>
  );
}
