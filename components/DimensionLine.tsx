/**
 * Architectural dimension-line device used to mark section transitions:
 * a hairline rule with small perpendicular end ticks, a burnt-orange index
 * numeral and a sentence-case label. Deliberately not a tracked-caps eyebrow.
 */
export function DimensionLine({
  index,
  label,
  className = "",
}: {
  index: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={`dimline ${className}`}>
      <span className="dimline__label font-sans">
        <span className="dimline__index">{index}</span>
        {label}
      </span>
      <span className="dimline__rule" aria-hidden="true" />
    </div>
  );
}
