"use client";

import { IconAlertTriangle, IconCalendarStats, IconCash, IconWallet } from "@tabler/icons-react";
import Image from "next/image";

import { StatStrip } from "@/components/app/analytics/StatStrip";
import { useDashboard } from "@/components/app/analytics/useDashboard";
import { METHOD_LOGOS, Sparkline } from "@/components/app/analytics/visuals";
import { useSession } from "@/lib/auth/useSession";
import { formatMoney, formatNumber } from "@/lib/format";

const pct = (value: number) => `${formatNumber(Math.round(value * 10) / 10)} %`;

/** Indicateurs de trésorerie en tête de l'écran Paiements (analytics de l'agence). */
export function PaymentsStats() {
  const { can } = useSession();
  const dashboard = useDashboard();
  const finance = dashboard.data?.finance;
  if (!can("analytics.kpi.view") || (dashboard.data && !finance)) return null;

  const month = finance?.monthly.at(-1);
  const collected = Number(finance?.period_collected ?? 0);
  const expected = Number(finance?.period_expected ?? 0);
  const top = finance?.by_method[0];

  return (
    <StatStrip
      className="mb-6"
      loading={!finance}
      stats={[
        {
          label: "Encaissé ce mois",
          value: formatMoney(month?.collected ?? 0),
          hint: month ? `sur ${formatMoney(month.expected)} attendus` : undefined,
          icon: IconCash,
          tone: 1,
          visual: finance ? (
            <Sparkline data={finance.monthly.map((m) => Number(m.collected))} color="--ax-brand" label="Encaissements des derniers mois" width={64} />
          ) : undefined,
        },
        {
          label: "Encaissé sur 12 mois",
          value: formatMoney(collected),
          hint: expected ? `${pct((collected / expected) * 100)} des loyers attendus` : undefined,
          icon: IconCalendarStats,
          tone: 2,
        },
        {
          label: "Moyen le plus utilisé",
          value: top?.label ?? "—",
          hint: top && collected ? `${pct((Number(top.amount) / collected) * 100)} des montants` : undefined,
          icon: IconWallet,
          tone: 4,
          visual:
            top && METHOD_LOGOS[top.code] ? (
              <Image src={METHOD_LOGOS[top.code]} alt="" width={36} height={36} className="size-9 shrink-0 rounded-full object-cover" />
            ) : undefined,
        },
        {
          label: "Impayés",
          value: formatMoney(finance?.overdue.amount ?? 0),
          hint: finance
            ? finance.overdue.count
              ? `${finance.overdue.count} échéance${finance.overdue.count > 1 ? "s" : ""} en retard`
              : "Aucun retard"
            : undefined,
          icon: IconAlertTriangle,
          tone: 3,
        },
      ]}
    />
  );
}
