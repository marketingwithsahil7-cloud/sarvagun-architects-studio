"use client";

import { useState } from "react";
import { contactForm, buildEnquiryWhatsAppUrl, type EnquiryFields } from "@/lib/content";

// Same underlined-field treatment used across the site's other form-shaped
// UI: a plain hairline, no box, burnt on focus.
const fieldBase =
  "w-full border-0 border-b border-ivory/25 bg-transparent px-0 py-2.5 font-sans text-[0.95rem] text-ivory placeholder:text-dim/60 focus:border-burnt focus:outline-none focus-visible:outline-none";

const EMPTY: EnquiryFields = { name: "", phone: "", city: "", projectType: "", message: "" };

/**
 * No backend, no API — "submit" builds a wa.me URL from the field values
 * and opens it. Desktop gets a new tab; on a touch/coarse pointer we
 * navigate the same tab instead, since that's where the WhatsApp app takes
 * over immediately (matches the pointer-capability check already used in
 * components/PointerFX.tsx, rather than sniffing the user agent).
 */
export function ContactForm() {
  const [values, setValues] = useState<EnquiryFields>(EMPTY);

  const set =
    <K extends keyof EnquiryFields>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const url = buildEnquiryWhatsAppUrl(values);
    const isDesktop =
      typeof matchMedia === "function" && matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (isDesktop) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = url;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid gap-2">
        <label htmlFor="c-name" className="font-sans text-[0.8rem] text-dim">
          Name
        </label>
        <input
          id="c-name"
          name="name"
          required
          autoComplete="name"
          value={values.name}
          onChange={set("name")}
          className={fieldBase}
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="c-phone" className="font-sans text-[0.8rem] text-dim">
          Phone
        </label>
        <input
          id="c-phone"
          name="phone"
          type="tel"
          required
          inputMode="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={set("phone")}
          className={fieldBase}
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="c-city" className="font-sans text-[0.8rem] text-dim">
          City
        </label>
        <div className="relative">
          <select
            id="c-city"
            name="city"
            required
            value={values.city}
            onChange={set("city")}
            className={`${fieldBase} appearance-none pr-6`}
          >
            <option value="" disabled>
              Select a city
            </option>
            {contactForm.cities.map((c) => (
              <option key={c} value={c} className="bg-panel">
                {c}
              </option>
            ))}
            <option value="Other" className="bg-panel">
              Somewhere else nearby
            </option>
          </select>
          <SelectChevron />
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="c-type" className="font-sans text-[0.8rem] text-dim">
          Project type
        </label>
        <div className="relative">
          <select
            id="c-type"
            name="projectType"
            required
            value={values.projectType}
            onChange={set("projectType")}
            className={`${fieldBase} appearance-none pr-6`}
          >
            <option value="" disabled>
              Select a project type
            </option>
            {contactForm.projectTypes.map((t) => (
              <option key={t} value={t} className="bg-panel">
                {t}
              </option>
            ))}
          </select>
          <SelectChevron />
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="c-message" className="font-sans text-[0.8rem] text-dim">
          Message <span className="text-dim/60">(optional)</span>
        </label>
        <textarea
          id="c-message"
          name="message"
          rows={3}
          placeholder="Plot size, location, what you're planning…"
          value={values.message}
          onChange={set("message")}
          className={`${fieldBase} resize-none`}
        />
      </div>

      <button
        type="submit"
        data-magnet
        className="mt-2 inline-block justify-self-start bg-burnt px-6 py-3.5 font-sans text-[0.95rem] font-medium text-ink"
      >
        Send on WhatsApp
      </button>
    </form>
  );
}

function SelectChevron() {
  return (
    <svg
      className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-dim"
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      aria-hidden="true"
    >
      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
