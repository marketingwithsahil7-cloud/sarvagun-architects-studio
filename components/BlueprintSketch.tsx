/**
 * Fallback for project tiles that don't have a video yet: a thin-line
 * elevation / plan sketch drawn in ivory on the raised panel, with a couple
 * of burnt-orange dimension ticks. Never a stock photo, never an empty box.
 */
export function BlueprintSketch({
  variant = "elevation",
  label,
}: {
  variant?: "elevation" | "plan" | "section" | "gate";
  label?: string;
}) {
  return (
    <svg
      viewBox="0 0 400 300"
      role="img"
      aria-label={label ? `${label} — line sketch` : "Line sketch"}
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="400" height="300" fill="#141209" />
      <rect width="400" height="300" fill="url(#bp-fade)" />
      <defs>
        <linearGradient id="bp-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c1a10" />
          <stop offset="1" stopColor="#100e08" />
        </linearGradient>
      </defs>
      <g
        stroke="#CFC7B4"
        strokeWidth="1.25"
        fill="none"
        strokeLinecap="square"
        opacity="0.92"
      >
        {variant === "elevation" && (
          <>
            <path d="M60 240 H340" />
            <path d="M90 240 V110 L200 70 L310 110 V240" />
            <path d="M90 110 H310" />
            <rect x="120" y="135" width="34" height="44" />
            <rect x="183" y="135" width="34" height="44" />
            <rect x="246" y="135" width="34" height="44" />
            <rect x="180" y="188" width="40" height="52" />
            <path d="M150 240 V150 M250 240 V150" opacity="0.4" />
          </>
        )}
        {variant === "plan" && (
          <>
            <rect x="70" y="60" width="260" height="180" />
            <path d="M70 150 H210 M210 60 V240 M210 150 H330" />
            <path d="M150 150 V60 M260 150 V240" opacity="0.5" />
            <path d="M196 240 h28" stroke="#141209" strokeWidth="3" />
            <path d="M210 120 v28" stroke="#141209" strokeWidth="3" />
          </>
        )}
        {variant === "section" && (
          <>
            <path d="M60 250 H340 V90 L200 40 L60 90 Z" />
            <path d="M60 150 H340" />
            <path d="M60 90 H340" opacity="0.5" />
            <rect x="110" y="165" width="30" height="85" />
            <rect x="260" y="165" width="30" height="85" />
            <path d="M180 250 V175 h40 v75" />
          </>
        )}
        {variant === "gate" && (
          <>
            <path d="M50 250 H350" />
            <path d="M80 250 V120 H150 V250 M250 250 V120 H320 V250" />
            <path d="M150 150 H250 M150 150 V250 M250 150 V250" />
            <path d="M160 150 V250 M180 150 V250 M200 150 V250 M220 150 V250 M240 150 V250" opacity="0.4" />
            <path d="M80 120 H150 M250 120 H320" />
          </>
        )}
      </g>
      {/* dimension ticks */}
      <g stroke="#E2672B" strokeWidth="1.25">
        <path d="M60 270 H340" opacity="0.9" />
        <path d="M60 265 V275 M340 265 V275" />
      </g>
    </svg>
  );
}
