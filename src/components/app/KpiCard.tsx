import type { Icon } from "@tabler/icons-react";
import Link from "next/link";

import { formatNumber } from "@/lib/format";

/** Indicateur chiffré (classes .ax-kpi de Vireo). */
export function KpiCard({
  label,
  value,
  icon: KpiIcon,
  href,
  tone = 1,
  loading = false,
}: {
  label: string;
  value: number | undefined;
  icon: Icon;
  href?: string;
  tone?: 1 | 2 | 3 | 4;
  loading?: boolean;
}) {
  const body = (
    <div className="ax-card__body">
      <div className="ax-kpi__top">
        <span className={`ax-kpi__icon ax-kpi__icon--c${tone}`}>
          <KpiIcon stroke={1.75} aria-hidden="true" />
        </span>
      </div>
      <div className="ax-kpi__label">{label}</div>
      <div className="ax-kpi__value ax-num" aria-busy={loading}>
        {loading ? <span className="ax-skeleton ax-skeleton--text" style={{ inlineSize: 64 }} /> : formatNumber(value)}
      </div>
    </div>
  );
  return (
    <div className="ax-card ax-kpi">
      {href ? (
        <Link href={href} className="block text-inherit no-underline">
          {body}
        </Link>
      ) : (
        body
      )}
    </div>
  );
}
