import type { Metadata } from "next";
import { Text } from "@/cms/Text";
import { CONTENT_DEFAULTS } from "@/cms/contentSchema";
import { EnquiryForm, type EnquiryPrefill } from "@/components/enquiry/EnquiryForm";
import { Reveal } from "@/components/fx/Reveal";
import { BlockSlot } from "@/components/sections/BlockSlot";
import { HeroBackdrop } from "@/components/showcase/HeroBackdrop";
import { EyebrowPill } from "@/components/ui/EyebrowPill";
import { getSiteBundle } from "@/server/cache";
import { ContactLines } from "./ContactLines";

export async function generateMetadata(): Promise<Metadata> {
  const text = (await getSiteBundle()).text ?? {};
  const title = text["ex.enquiry.meta.title"] || CONTENT_DEFAULTS["ex.enquiry.meta.title"];
  const description = text["ex.enquiry.body"] || CONTENT_DEFAULTS["ex.enquiry.body"];
  return { title, description, alternates: { canonical: "/contact" }, openGraph: { title, description, url: "/contact" } };
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const product = one(params.product);
  const prefill: EnquiryPrefill = {
    productSlug: product && /^[a-z0-9-]{1,80}$/.test(product) ? product : undefined,
    proposal: one(params.proposal) === "1",
    preview: one(params.preview) === "1",
    path: product ? "configure" : undefined,
  };

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <HeroBackdrop page="contact" background="dark-hero-02" />
        <div className="ax-container relative pb-10 pt-[128px] md:pt-[152px]">
          <Reveal trigger="load" direction="fade" duration={0.6}>
            <EyebrowPill>
              <Text id="ex.enquiry.eyebrow" />
            </EyebrowPill>
          </Reveal>
          <Reveal trigger="load" delay={0.06}>
            <h1 className="ax-display ax-text-balance mt-7 max-w-4xl text-[clamp(2.4rem,4.8vw,4rem)] leading-[1.05]">
              <Text id="ex.enquiry.title" />
            </h1>
          </Reveal>
          <Reveal trigger="load" delay={0.12}>
            <p className="ax-text-pretty mt-6 max-w-[44rem] text-[16px] leading-[1.75] text-[var(--ax-ink-muted)]">
              <Text id="ex.enquiry.body" />
            </p>
          </Reveal>
          <ContactLines />
        </div>
      </section>

      <BlockSlot page="contact" slot="after-hero" />

      <section className="pb-24 pt-6">
        <div className="ax-container">
          <EnquiryForm prefill={prefill} />
        </div>
      </section>

      <BlockSlot page="contact" slot="before-cta" />
    </>
  );
}
