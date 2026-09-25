import { IconArrowDownRight, IconArrowUpRight, IconChevronRight, type Icon } from "@tabler/icons-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const percent = (value: number) => `${formatNumber(Math.round(value * 10) / 10)}\u00A0%`;


/** Carte de section du tableau de bord (en-tête Vireo : sur-titre, titre, sous-titre, actions). */
export function DashCard({
  eyebrow,
  title,
  subtitle,
  actions,
  href,
  hrefLabel = "Tout voir",
  className,
  bodyClassName,
  children,
  labelledBy,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  href?: string;
  hrefLabel?: string;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
  labelledBy: string;
}) {
  return (
    <section className={cn("ax-card", className)} aria-labelledby={labelledBy}>
      <div className="ax-card__header">
        <div className="ax-card__titles">
          {eyebrow && <span className="ax-card__eyebrow">{eyebrow}</span>}
          <h2 id={labelledBy} className="ax-card__title">
            {title}
          </h2>
          {subtitle && <p className="ax-card__subtitle">{subtitle}</p>}
        </div>
        {(actions || href) && (
          <div className="ax-card__actions">
            {actions}
            {href && (
              <Link href={href} className="ax-btn ax-btn--ghost ax-btn--sm">
                <span className="ax-btn__label">{hrefLabel}</span>
                <IconChevronRight className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
              </Link>
            )}
          </div>
        )}
      </div>
      <div className={cn("ax-card__body pt-0", bodyClassName)}>{children}</div>
    </section>
  );
}

/** Pastille de variation (hausse / baisse) ; `inverse` quand une hausse est défavorable. */
export function DeltaChip({ value, inverse = false }: { value: number | null; inverse?: boolean }) {
  if (value === null || !Number.isFinite(value)) return null;
  const up = value >= 0;
  const good = inverse ? !up : up;
  const Arrow = up ? IconArrowUpRight : IconArrowDownRight;
  return (
    <span className={cn("ax-kpi__delta", good ? "ax-kpi__delta--up" : "ax-kpi__delta--down")}>
      <Arrow stroke={2} aria-hidden="true" />
      {percent(Math.abs(value))}
      <span className="sr-only">{up ? " de plus que le mois précédent" : " de moins que le mois précédent"}</span>
    </span>
  );
}

/** Pastille de couleur de légende. */
export function Swatch({ color }: { color: string }) {
  return <span aria-hidden="true" className="inline-block size-2.5 shrink-0 rounded-[3px]" style={{ background: color }} />;
}

/** État vide d'une carte : icône, phrase et action facultative. */
export function CardEmpty({ icon: EmptyIcon, children, action }: { icon: Icon; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
      <span className="bg-surface-subtle text-text-subtle flex size-11 items-center justify-center rounded-full">
        <EmptyIcon size={22} stroke={1.5} aria-hidden="true" />
      </span>
      <p className="text-text-muted m-0 max-w-xs text-sm">{children}</p>
      {action}
    </div>
  );
}

/** Squelette d'une carte pendant le premier chargement. */
export function CardSkeleton({ height = 280, className }: { height?: number; className?: string }) {
  return (
    <div className={cn("ax-card", className)} aria-hidden="true">
      <div className="ax-card__body flex flex-col gap-4">
        <span className="ax-skeleton ax-skeleton--text" style={{ inlineSize: "40%" }} />
        <span className="ax-skeleton ax-skeleton--rect" style={{ blockSize: height, inlineSize: "100%" }} />
      </div>
    </div>
  );
}

/** Statistique compacte (libellé en petites capitales, valeur en chiffres tabulaires). */
export function MiniStat({ label, value, tone }: { label: string; value: ReactNode; tone?: "danger" | "success" }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-text-subtle text-[0.7rem] font-semibold tracking-[0.06em] uppercase">{label}</span>
      <span
        className={cn(
          "ax-num text-text-strong truncate text-lg font-semibold",
          tone === "danger" && "text-danger",
          tone === "success" && "text-success",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export interface Segment {
  label: string;
  value: number;
  color: string;
  display?: string;
}

/** Barre de répartition (impayés par ancienneté, lots par statut), avec sa légende. */
export function PartitionBar({ segments, legend = true, className }: { segments: Segment[]; legend?: boolean; className?: string }) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="bg-surface-subtle flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full" role="img" aria-label={segments.map((s) => `${s.label} : ${s.display ?? s.value}`).join(", ")}>
        {total > 0 &&
          segments
            .filter((segment) => segment.value > 0)
            .map((segment) => (
              <span key={segment.label} className="h-full first:rounded-l-full last:rounded-r-full" style={{ width: `${(segment.value / total) * 100}%`, background: segment.color }} />
            ))}
      </div>
      {legend && (
        <ul className="m-0 grid list-none grid-cols-1 gap-y-1.5 p-0">
          {segments.map((segment) => (
            <li key={segment.label} className="flex items-center gap-2 text-xs">
              <Swatch color={segment.color} />
              <span className="text-text-muted">{segment.label}</span>
              <span className="ax-num text-text-strong ml-auto font-medium">{segment.display ?? formatNumber(segment.value)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
