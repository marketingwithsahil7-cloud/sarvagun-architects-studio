import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { ProjectsIntro } from "@/components/projects/ProjectsIntro";
import { FeaturedWalkthroughs } from "@/components/projects/FeaturedWalkthroughs";
import { MidPageCta } from "@/components/projects/MidPageCta";
import { ProjectsGallery } from "@/components/projects/ProjectsGallery";
import { ClosingCta } from "@/components/ClosingCta";
import { Footer } from "@/components/Footer";
import { projectsClosing } from "@/lib/projects-content";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "The full Sarvagun Architects Studio archive — front elevations, home design, interiors, hotels, commercial and hospital work, and site supervision, straight from the studio's own record of every project.",
};

export default function ProjectsPage() {
  return (
    <>
      <Header />
      <main id="main" className="relative z-10">
        <ProjectsIntro />
        <FeaturedWalkthroughs />
        <MidPageCta />
        <ProjectsGallery />
        <ClosingCta index={projectsClosing.index} label={projectsClosing.label} />
      </main>
      <Footer />
    </>
  );
}
