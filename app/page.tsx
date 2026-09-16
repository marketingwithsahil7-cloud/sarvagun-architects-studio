import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Proof } from "@/components/Proof";
import { Services } from "@/components/Services";
import { IndexFilmstrip } from "@/components/IndexFilmstrip";
import { ProjectSlider } from "@/components/ProjectSlider";
import { Process } from "@/components/Process";
import { ServiceAreas } from "@/components/ServiceAreas";
import { ClosingCta } from "@/components/ClosingCta";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Header transparentOverHero />
      <main id="main" className="relative z-10">
        <Hero />
        <Proof />
        <Services />
        <IndexFilmstrip />
        <ProjectSlider />
        <Process />
        <ServiceAreas />
        <ClosingCta />
      </main>
      <Footer />
    </>
  );
}
