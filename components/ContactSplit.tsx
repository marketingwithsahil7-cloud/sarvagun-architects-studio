import { DimensionLine } from "./DimensionLine";
import { Reveal } from "./Reveal";
import { CornerMarks } from "./CornerMarks";
import { MediaFrame } from "./MediaFrame";
import { AreaChips } from "./AreaChips";
import { ContactForm } from "./ContactForm";
import { SocialLinks } from "./SocialLinks";
import { ContactMap } from "./ContactMap";
import { Tagline } from "./Tagline";
import { contactDetails, studio, whatsappHref } from "@/lib/content";

/**
 * Direct-contact block + enquiry form on one side, a real project photo with
 * corner crosshairs on the other — so the page doesn't read as a bare form.
 * Mobile order (single column, DOM order): info → photo → form. At lg+ a
 * two-column grid puts info (row 1) and form (row 2) in column one, with the
 * photo spanning both rows in column two.
 */
export function ContactSplit() {
  return (
    <section className="shell border-t border-[var(--hairline)] py-[clamp(4.5rem,11vh,9rem)]">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal blur className="lg:col-start-1 lg:row-start-1">
          <DimensionLine index={contactDetails.index} label={contactDetails.label} />
          <Tagline className="mt-4">{contactDetails.tagline}</Tagline>

          <div className="mt-8">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              data-magnet
              className="inline-block bg-burnt px-6 py-3.5 font-sans text-[0.95rem] font-medium text-ink"
            >
              {contactDetails.whatsappLabel}
            </a>
            <p className="mt-3 font-sans text-[0.85rem] text-dim">{studio.phoneDisplay}</p>

            <dl className="mt-8 space-y-3 font-sans text-[0.92rem]">
              <div className="flex gap-3">
                <dt className="w-20 shrink-0 text-dim">Studio</dt>
                <dd className="text-ivory">{studio.hq}</dd>
              </div>
            </dl>

            <SocialLinks className="mt-5" />

            <AreaChips className="mt-8" />
          </div>
        </Reveal>

        <Reveal blur className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-start">
          {/* Fixed aspect ratio even at lg+, not lg:h-full matching the
              sibling column's full height — object-cover on a box this
              much taller than the photo's own aspect ratio shows 100% of
              the image's height no matter what (only width gets cropped),
              so an extreme lg:h-full well left no room to hide anything;
              see contactDetails.photo in lib/content.ts for the pre-cropped
              image that actually fixes the too-much-sky framing. */}
          <div className="media-well relative aspect-[4/5] w-full border border-[var(--hairline)] lg:aspect-[3/4]">
            <MediaFrame media={contactDetails.photo} sizes="(min-width: 1024px) 45vw, 100vw" />
            <CornerMarks />
          </div>
        </Reveal>

        <Reveal blur className="lg:col-start-1 lg:row-start-2">
          <div className="border border-[var(--hairline)] bg-panel p-6 sm:p-9">
            <h2 className="font-display text-[1.4rem] font-medium text-ivory">Send an enquiry</h2>
            <p className="mt-2 font-sans text-[0.88rem] text-dim">
              We&rsquo;ll open WhatsApp with your details filled in — send it from there.
            </p>
            <div className="mt-7">
              <ContactForm />
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal blur className="mt-14">
        <h2 className="font-display text-[1.4rem] font-medium text-ivory">Find us</h2>
        <Tagline className="mt-2">{contactDetails.findUsTagline}</Tagline>
        <p className="mt-1 font-sans text-[0.88rem] text-dim">{studio.address.street}, {studio.address.locality}.</p>
        <div className="mt-6">
          <ContactMap />
        </div>
      </Reveal>
    </section>
  );
}
