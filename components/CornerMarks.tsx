/**
 * Registration/crosshair tick marks at the four corners of a feature image —
 * a technical-drawing convention, echoing the studio's own drawing sheets.
 * Purely decorative: absolutely positioned, aria-hidden, no layout impact.
 */
export function CornerMarks({ inset = 14, arm = 16 }: { inset?: number; arm?: number }) {
  type Corner = {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    border: string;
  };

  const corners: Corner[] = [
    { top: inset, left: inset, border: "border-l border-t" },
    { top: inset, right: inset, border: "border-r border-t" },
    { bottom: inset, left: inset, border: "border-l border-b" },
    { bottom: inset, right: inset, border: "border-r border-b" },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
      {corners.map((c, i) => (
        <span
          key={i}
          className={`absolute border-burnt/80 ${c.border}`}
          style={{
            top: c.top,
            bottom: c.bottom,
            left: c.left,
            right: c.right,
            width: arm,
            height: arm,
          }}
        />
      ))}
    </div>
  );
}
