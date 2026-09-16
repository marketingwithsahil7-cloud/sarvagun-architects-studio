import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { ContactIntro } from "@/components/ContactIntro";
import { ContactSplit } from "@/components/ContactSplit";
import { Testimonials } from "@/components/Testimonials";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach Sarvagun Architects Studio on WhatsApp or send an enquiry — planning, elevations, interiors and construction across Saharanpur, Dehradun, Roorkee, Haridwar, Rishikesh and Meerut.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main id="main" className="relative z-10">
        <ContactIntro />
        <ContactSplit />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
