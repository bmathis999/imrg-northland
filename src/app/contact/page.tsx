import type { Metadata } from "next";
import { PageHeading } from "@/components/PageHeading";
import { site } from "@/lib/site";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with IMRG Northland Chapter 2093.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeading eyebrow="Get in touch" title="Contact Us">
        <p>
          Questions about rides, charity drives or membership? Send a message, or email{" "}
          <a href={`mailto:${site.email}`} className="text-white underline underline-offset-4">
            {site.email}
          </a>
          .
        </p>
      </PageHeading>
      <div className="mx-auto max-w-2xl px-4 pb-10 sm:px-6">
        <ContactForm />
      </div>
    </>
  );
}
