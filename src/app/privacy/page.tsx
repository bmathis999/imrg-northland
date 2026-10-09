import type { Metadata } from "next";
import { PageHeading } from "@/components/PageHeading";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How IMRG Northland Chapter 2093 handles your information.",
};

// Draft written for the chapter to review. It is not legal advice.
export default function PrivacyPage() {
  return (
    <>
      <PageHeading eyebrow="Your information" title="Privacy Notice" />
      <div className="mx-auto max-w-3xl space-y-8 px-4 pb-10 leading-relaxed sm:px-6 [&_h2]:display [&_h2]:text-xl [&_h2]:mb-3">
        <section>
          <h2>What we collect</h2>
          <p>
            When you request membership we collect your name, email, city, and, if you choose, your phone number, bike
            and a short message. The contact form collects your name, email and message. We don&apos;t sell or share this
            information.
          </p>
        </section>
        <section>
          <h2>Who can see it</h2>
          <p>
            Only chapter officers responsible for membership can see membership requests. Once you&apos;re a member,
            you choose which of your details (such as phone and email) other members can see in the directory.
          </p>
        </section>
        <section>
          <h2>How it&apos;s protected</h2>
          <p>
            The site uses encrypted connections, stores data with a provider that encrypts it at rest, and checks
            permissions on the server and in the database for every private page. A spam check from Cloudflare
            (Turnstile) runs on our forms.
          </p>
        </section>
        <section>
          <h2>Cookies</h2>
          <p>
            Public pages don&apos;t use tracking or advertising cookies. Signing in to the member portal uses a secure
            cookie to keep you signed in.
          </p>
        </section>
        <section>
          <h2>Removing your information</h2>
          <p>
            To have your details corrected or removed, email{" "}
            <a href={`mailto:${site.email}`} className="text-white underline underline-offset-4">
              {site.email}
            </a>
            . Financial records keep amounts for the chapter&apos;s books, without your personal details.
          </p>
        </section>
      </div>
    </>
  );
}
