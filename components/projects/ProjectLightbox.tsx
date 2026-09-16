"use client";

import Lightbox, { type Slide, type GenericSlide } from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import { VideoPoster } from "@/components/VideoPoster";
import { CornerMarks } from "@/components/CornerMarks";

// Deliberately broader than lib/projects-content.ts's own ProjectMedia — this
// is the one lightbox shared by the /projects grid (full ProjectMedia, with
// width/height/sizeMB) AND Home's IndexFilmstrip (lib/content.ts's simpler
// Media union, image-only, no width/height). ProjectMedia already satisfies
// this structurally, so the /projects call site needed no changes; width/
// height are optional here specifically so the filmstrip's thinner item
// shape can pass through too — yarl treats them as an optional sizing hint,
// not a requirement.
export type LightboxItem =
  | { kind: "image"; src: string; alt: string; width?: number; height?: number }
  | { kind: "video"; src: string; poster: string; alt: string; sizeMB?: number; width?: number; height?: number };

// A custom slide type, not the library's own Video plugin — the Video
// plugin's slide shape wants a real <video><source></video> up front, and
// yarl preloads a couple of neighbouring slides for smooth swiping. Either
// of those would mean a video element (and its src) existing in the DOM
// for a slide the visitor hasn't tapped — exactly what the 200MB+ tier is
// built to prevent. Routing every video slide through our own VideoPoster
// via render.slide keeps the same tiered gate (and the same component)
// that's used everywhere else on the site, with nothing library-driven
// deciding when a <video> mounts.
interface GatedVideoSlide extends GenericSlide {
  type: "gated-video";
  src: string;
  poster: string;
  alt: string;
  sizeMB?: number;
  width?: number;
  height?: number;
}

declare module "yet-another-react-lightbox" {
  interface SlideTypes {
    "gated-video": GatedVideoSlide;
  }
}

function toSlide(item: LightboxItem): Slide {
  if (item.kind === "image") {
    return { type: "image", src: item.src, alt: item.alt, width: item.width, height: item.height };
  }
  return {
    type: "gated-video",
    src: item.src,
    poster: item.poster,
    alt: item.alt,
    sizeMB: item.sizeMB,
    width: item.width,
    height: item.height,
  } satisfies GatedVideoSlide;
}

export function ProjectLightbox({
  items,
  index,
  onClose,
  onIndexChange,
}: {
  items: LightboxItem[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}) {
  const slides = items.map(toSlide);

  return (
    <Lightbox
      open
      close={onClose}
      index={index}
      slides={slides}
      on={{ view: ({ index: i }) => onIndexChange(i) }}
      plugins={[Zoom, Counter]}
      carousel={{ finite: true, preload: 1 }}
      animation={{ fade: 220, swipe: 280 }}
      zoom={{ maxZoomPixelRatio: 3 }}
      styles={{
        root: {
          "--yarl__color_backdrop": "rgba(10, 9, 8, .97)",
          "--yarl__color_button": "#EDE7DA",
          "--yarl__color_button_active": "#E2672B",
          "--yarl__counter_color": "#B3AC9B",
          "--yarl__counter_filter": "none",
        },
      }}
      render={{
        slide: ({ slide }) => {
          if (slide.type !== "gated-video") return undefined;
          const v = slide as GatedVideoSlide;
          return (
            <div className="flex h-full w-full items-center justify-center p-4">
              <VideoPoster
                src={v.src}
                poster={v.poster}
                alt={v.alt}
                sizeMB={v.sizeMB}
                width={v.width}
                height={v.height}
                fit="contain"
                sizes="90vw"
              />
            </div>
          );
        },
        // Drafting-sheet framing instead of a plain dark overlay — the same
        // corner crosshairs used on every feature image site-wide.
        controls: () => <CornerMarks inset={20} arm={22} />,
      }}
    />
  );
}
