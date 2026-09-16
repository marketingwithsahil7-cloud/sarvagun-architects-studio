import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { AboutIntro } from "@/components/AboutIntro";
import { AboutStory } from "@/components/AboutStory";
import { AboutStats } from "@/components/AboutStats";
import { ClosingCta } from "@/components/ClosingCta";
import { Footer } from "@/components/Footer";
import { aboutClosing } from "@/lib/about-content";

export const metadata: Metadata = {
  title: "About",
  description:
    "Sarvagun Architects Studio — a practice led by Apoorv Gupta, working across architecture, interiors, structure and site supervision out of Saharanpur.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main id="main" className="relative z-10">
        <AboutIntro />
        <AboutStory />
        <AboutStats />
        <ClosingCta index={aboutClosing.index} label={aboutClosing.label} />
      </main>
      <Footer />
    </>
  );
}
