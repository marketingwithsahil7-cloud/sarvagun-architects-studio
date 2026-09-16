import { studio } from "@/lib/content";
import { CornerMarks } from "./CornerMarks";

/**
 * No-API-key query-based embed (`output=embed`) — a static, billing-free
 * iframe rather than the Maps JavaScript/Embed API, which needs a
 * billing-enabled key this site has no other reason to hold. Framed with
 * the same CornerMarks crosshairs as every other feature media well on the
 * site, so it reads as part of the page rather than a bare dropped-in
 * iframe.
 *
 * Coordinates, not place_id, in the query: a place_id-only query on this
 * endpoint doesn't reliably auto-zoom (verified — it renders a full-world
 * view), whereas `lat,lng` + an explicit `z` zoom level does.
 */
export function ContactMap() {
  return (
    <div className="media-well relative aspect-[16/9] w-full border border-[var(--hairline)] lg:aspect-[21/9]">
      <iframe
        src={`https://maps.google.com/maps?q=${studio.geo.latitude},${studio.geo.longitude}&z=16&output=embed`}
        title={`${studio.name} — location on Google Maps`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 h-full w-full"
        style={{ border: 0 }}
      />
      <CornerMarks />
    </div>
  );
}
