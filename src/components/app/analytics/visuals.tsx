"use client";

import type { ApexOptions } from "apexcharts";

import { ApexChart } from "@/components/app/charts/ApexChart";

/** Couleurs des moyens de paiement : celles des marques quand elles existent (Wave, Orange Money). */
export const METHOD_COLORS: Record<string, string> = {
  WAVE: "#1DC8F2",
  ORANGE_MONEY: "#FF7900",
  FREE_MONEY: "#CD1719",
  BANK_TRANSFER: "var(--ax-brand)",
  CASH: "var(--ax-viz-emerald)",
};
export const METHOD_LOGOS: Record<string, string> = {
  WAVE: "/images/site/logos/wave.png",
  ORANGE_MONEY: "/images/site/logos/orange-money.png",
};
const FALLBACK_COLORS = ["var(--ax-viz-violet)", "var(--ax-viz-amber)", "var(--ax-viz-pink)"];

export function methodColor(code: string, index: number): string {
  return METHOD_COLORS[code] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

/** Courbe d'appoint des cartes indicateurs. */
export function Sparkline({ data, color, label, width = 120 }: { data: number[]; color: string; label: string; width?: number }) {
  return (
    <ApexChart
      className="ax-kpi__spark"
      type="area"
      sparkline
      tooltip={false}
      height={44}
      color={color}
      ariaLabel={label}
      series={[{ name: label, data }]}
      apex={{ stroke: { width: 2, curve: "smooth" }, fill: { type: "gradient", gradient: { opacityFrom: 0.25, opacityTo: 0 } } } as ApexOptions}
      style={{ minHeight: 44, width, flexShrink: 0 }}
    />
  );
}
