import { DimensionLine } from "@/components/DimensionLine";
import { Reveal } from "@/components/Reveal";
import { projectsIntro } from "@/lib/projects-content";

/** The page's own h1 — same top-of-page pattern as ContactIntro. */
export function ProjectsIntro() {
  return (
    <section className="shell pb-[clamp(3rem,7vh,5rem)] pt-[clamp(7rem,17vh,10.5rem)]">
      <DimensionLine index={projectsIntro.index} label={projectsIntro.label} />

      <Reveal blur className="mt-10 max-w-[42rem]">
        <p className="font-sans text-[0.85rem] text-dim">{projectsIntro.tagline}</p>
        <h1 className="font-display mt-4 text-[clamp(2.4rem,5.6vw,4.2rem)] font-medium leading-[1.03] text-ivory">
          {projectsIntro.heading}
        </h1>
        <p className="mt-5 font-sans text-[1.05rem] leading-relaxed text-dim">{projectsIntro.body}</p>
      </Reveal>
    </section>
  );
}
