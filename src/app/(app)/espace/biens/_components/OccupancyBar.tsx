import { formatNumber } from "@/lib/format";

import { occupancy } from "./data";

/** Lots occupés sur le total, avec barre de progression (.ax-progress) et pourcentage. */
export function OccupancyBar({ occupied, total, className }: { occupied: number; total: number; className?: string }) {
  if (total === 0) return <span className="text-text-subtle text-sm">Aucun lot</span>;
  const rate = occupancy(occupied, total);
  return (
    <div className={`flex min-w-[150px] flex-col gap-1${className ? ` ${className}` : ""}`}>
      <span className="text-text-muted text-xs">
        <span className="ax-num text-text-strong font-medium">
          {formatNumber(occupied)} / {formatNumber(total)}
        </span>{" "}
        {occupied > 1 ? "lots occupés" : "lot occupé"}
      </span>
      <div
        className="ax-progress ax-progress--sm"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={rate}
        aria-label="Taux d'occupation"
      >
        <div className="ax-progress__track">
          <div className="ax-progress__fill" style={{ width: `${rate}%` }} />
        </div>
        <span className="ax-progress__value">{rate} %</span>
      </div>
    </div>
  );
}
