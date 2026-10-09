import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/PageHeading";

export const metadata: Metadata = {
  title: "Member Login",
  robots: { index: false },
};

// Phase 2 replaces this page with Sign in with Google and the emailed sign-in link.
export default function LoginPage() {
  return (
    <>
      <PageHeading eyebrow="Members" title="Member Login">
        <p>
          The member portal is being built. Soon you&apos;ll sign in here with your Google account (or an emailed
          sign-in link) to see the full ride calendar, member messages and chapter documents.
        </p>
      </PageHeading>
      <div className="mx-auto flex max-w-6xl flex-wrap gap-4 px-4 pb-10 sm:px-6">
        <Link href="/join" className="btn btn-red">Request membership</Link>
        <Link href="/calendar" className="btn btn-dark">Public calendar</Link>
      </div>
    </>
  );
}
