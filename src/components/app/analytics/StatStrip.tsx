import type { Icon } from "@tabler/icons-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface Stat {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: Icon;
  tone?: 1 | 2 | 3 | 4;
  /** Visuel à droite de la valeur (courbe, logo, anneau). */
  visual?: ReactNode;
}

/**
 * Bandeau d'indicateurs en tête d'un écran métier (paiements, annonces…) : 2 à 4 cartes compactes,
 * alimentées par les analytics de l'agence. Squelettes tant que les données chargent.
 */
export function StatStrip({ stats, loading = false, className }: { stats: Stat[]; loading?: boolean; className?: string }) {
  return (
    <ul className={cn("m-0 grid list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-4", className)} aria-busy={loading}>
      {stats.map((stat) => {
        const StatIcon = stat.icon;
        return (
          <li key={stat.label} className="ax-card">
            <div className="flex items-center gap-3 p-4">
              <span className={`ax-kpi__icon ax-kpi__icon--c${stat.tone ?? 1} shrink-0`}>
                <StatIcon stroke={1.75} aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-text-muted truncate text-xs font-medium">{stat.label}</span>
                {loading ? (
                  <span className="ax-skeleton ax-skeleton--text mt-1" style={{ inlineSize: 90 }} />
                ) : (
                  <span className="ax-num text-text-strong truncate text-lg leading-tight font-semibold">{stat.value}</span>
                )}
                {stat.hint && !loading && <span className="text-text-subtle truncate text-xs">{stat.hint}</span>}
              </span>
              {!loading && stat.visual}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
