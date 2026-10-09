import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeading } from "@/components/PageHeading";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our Story",
  description: site.description,
};

export default function AboutPage() {
  return (
    <>
      <PageHeading eyebrow={site.tagline} title="Our Story">
        <p>
          Since our founding, IMRG Northland Chapter 2093 has been a professional brotherhood of Indian Motorcycle
          enthusiasts in the Northland region. We ride with purpose, fostering community connection while supporting
          regional charitable activities through local participation and shared loyalty.
        </p>
      </PageHeading>

      <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-10 sm:px-6 md:grid-cols-[1.3fr_1fr]">
        <section aria-labelledby="charity" className="panel bg-panel p-7">
          <h2 id="charity" className="display text-2xl">Charitable Initiatives</h2>
          <div className="mt-5 h-px w-16 bg-orange" />
          <p className="mt-5 leading-relaxed">
            We are dedicated to supporting the Northland community through targeted charitable drives. Your
            contributions help us give back to veteran organizations and regional youth programs, ensuring our ride
            makes a real difference in the lives of those we serve.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/join" className="btn btn-red">Join the Brotherhood</Link>
            <a href={site.facebookGroupUrl} target="_blank" rel="noopener noreferrer" className="btn btn-dark">
              Facebook group
            </a>
          </div>
        </section>
        <div className="flex items-start justify-center">
          <Image src="/brand/logo.png" alt="IMRG Northland Chapter 2093 logo" width={600} height={763} className="h-auto w-full max-w-xs" />
        </div>
      </div>
    </>
  );
}
