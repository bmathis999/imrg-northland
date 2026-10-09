import type { Metadata } from "next";
import { PageHeading } from "@/components/PageHeading";
import { JoinForm } from "./JoinForm";

export const metadata: Metadata = {
  title: "Join the Brotherhood",
  description: "Request membership in IMRG Northland Chapter 2093.",
};

export default function JoinPage() {
  return (
    <>
      <PageHeading eyebrow="Membership" title="Join the Brotherhood">
        <p>
          Ride with IMRG Northland Chapter 2093. Send a request below and our Membership Coordinator will be in touch.
          Once approved, you&apos;ll get access to the member portal: the full ride calendar, member messages and
          chapter documents.
        </p>
      </PageHeading>
      <div className="mx-auto max-w-2xl px-4 pb-10 sm:px-6">
        <JoinForm />
      </div>
    </>
  );
}
