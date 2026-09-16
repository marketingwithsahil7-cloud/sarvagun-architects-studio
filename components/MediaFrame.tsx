import Image from "next/image";
import type { Media } from "@/lib/content";
import { BlueprintSketch } from "./BlueprintSketch";
import { VideoPoster } from "./VideoPoster";

/**
 * Renders a `Media` union entry as an absolutely-positioned fill layer:
 * a real photo, a tap-to-play video, or — where the client hasn't supplied
 * media for a category yet — a hand-coded blueprint line sketch. Swapping a
 * placeholder for real media later is a one-line edit in lib/content.ts;
 * no component changes required.
 */
export function MediaFrame({
  media,
  sizes = "100vw",
  priority = false,
  cursorLabel = false,
  objectPosition,
}: {
  media: Media;
  sizes?: string;
  priority?: boolean;
  cursorLabel?: boolean;
  /** Overrides object-cover's default center crop — for a landscape photo
   *  sitting in a tall/narrow well, "center" crops down to mostly sky;
   *  biasing lower keeps the actual building in frame. */
  objectPosition?: string;
}) {
  if (media.kind === "image") {
    return (
      <Image
        src={media.src}
        alt={media.alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className="object-cover"
        style={objectPosition ? { objectPosition } : undefined}
        data-cursor={cursorLabel ? "view" : undefined}
      />
    );
  }

  if (media.kind === "video") {
    return (
      <VideoPoster src={media.src} poster={media.poster} alt={media.alt} sizeMB={media.sizeMB} sizes={sizes} />
    );
  }

  return <BlueprintSketch variant={media.variant} label={media.label} />;
}
