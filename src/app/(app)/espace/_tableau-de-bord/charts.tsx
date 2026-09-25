"use client";

import type { ApexOptions } from "apexcharts";

export { PartitionBar, type Segment } from "@/components/app/analytics/cards";
import { methodColor } from "@/components/app/analytics/visuals";
import { ApexChart } from "@/components/app/charts/ApexChart";
import { formatMoney, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

import { compactMoney, monthLabel, monthLong, percent, toNumber, type Finance, type Listings, type Maintenance } from "./format";

const moneyTooltip = (value: number) => formatMoney(value);

/** Loyers encaissés chaque mois (colonnes) face aux échéances attendues (courbe en tirets). */
export function CashflowChart({ finance }: { finance: Finance }) {
  const months = finance.monthly;
  return (
    <ApexChart
      type="line"
      height={300}
      legend="none"
      ariaLabel="Histogramme des loyers encaissés chaque mois, avec la courbe des montants attendus"
      colors={["--ax-brand", "--ax-accent"]}
      series={[
        { name: "Encaissé", type: "column", data: months.map((m) => toNumber(m.collected)) },
        { name: "Attendu", type: "line", data: months.map((m) => toNumber(m.expected)) },
      ]}
      apex={
        {
          stroke: { width: [0, 3], curve: "smooth", dashArray: [0, 6] },
          plotOptions: { bar: { borderRadius: 6, columnWidth: "48%" } },
          markers: { size: [0, 4], strokeWidth: 0, hover: { size: 6 } },
          xaxis: { categories: months.map((m) => monthLabel(m.month)) },
          yaxis: { labels: { formatter: (value: number) => compactMoney(value) } },
          tooltip: {
            shared: true,
            intersect: false,
            x: { formatter: (_: number, options: { dataPointIndex: number }) => monthLong(months[options.dataPointIndex]?.month ?? "") },
            y: { formatter: moneyTooltip },
          },
        } as ApexOptions
      }
    />
  );
}

/** Anneau des moyens de paiement, avec le total au centre. */
export function MethodsDonut({ finance }: { finance: Finance }) {
  const rows = finance.by_method;
  const total = rows.reduce((sum, row) => sum + toNumber(row.amount), 0);
  return (
    <div className="relative mx-auto w-full max-w-[240px]">
      <ApexChart
        type="donut"
        height={240}
        legend="none"
        ariaLabel="Répartition des encaissements par moyen de paiement"
        colors={rows.map((row, index) => methodColor(row.code, index))}
        series={rows.map((row) => toNumber(row.amount))}
        apex={
          {
            labels: rows.map((row) => row.label),
            stroke: { width: 3, colors: ["transparent"] },
            plotOptions: { pie: { donut: { size: "74%", labels: { show: false } } } },
            tooltip: { y: { formatter: moneyTooltip } },
          } as ApexOptions
        }
      />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-text-subtle text-xs">Encaissé</span>
        <span className="ax-num text-text-strong text-xl font-semibold">{compactMoney(total)}</span>
        <span className="text-text-subtle text-xs">FCFA</span>
      </div>
    </div>
  );
}

/** Tickets créés et résolus par mois. */
export function MaintenanceChart({ maintenance }: { maintenance: Maintenance }) {
  const months = maintenance.monthly;
  return (
    <ApexChart
      type="bar"
      height={250}
      legend="none"
      ariaLabel="Tickets de maintenance créés et résolus chaque mois"
      colors={["--ax-accent", "--ax-viz-emerald"]}
      series={[
        { name: "Signalés", data: months.map((m) => m.created) },
        { name: "Résolus", data: months.map((m) => m.resolved) },
      ]}
      apex={
        {
          plotOptions: { bar: { borderRadius: 4, columnWidth: "58%" } },
          xaxis: { categories: months.map((m) => monthLabel(m.month)) },
          yaxis: { min: 0, tickAmount: 3, labels: { formatter: (value: number) => formatNumber(Math.round(value)) } },
          tooltip: { shared: true, intersect: false },
        } as ApexOptions
      }
    />
  );
}

/** Demandes de visite reçues par mois (aire). */
export function InterestsChart({ listings }: { listings: Listings }) {
  const months = listings.monthly_interests;
  return (
    <ApexChart
      type="area"
      height={220}
      legend="none"
      ariaLabel="Demandes de visite reçues chaque mois"
      colors={["--ax-accent"]}
      series={[{ name: "Demandes de visite", data: months.map((m) => m.count) }]}
      apex={
        {
          stroke: { width: 3, curve: "smooth" },
          fill: { type: "gradient", gradient: { shadeIntensity: 0, opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 95] } },
          xaxis: { categories: months.map((m) => monthLabel(m.month)) },
          yaxis: { min: 0, tickAmount: 3, labels: { formatter: (value: number) => formatNumber(Math.round(value)) } },
        } as ApexOptions
      }
    />
  );
}

/** Mini-histogramme de la carte héros : 12 mois, le mois courant en orange. */
export function MonthBars({ finance }: { finance: Finance }) {
  const values = finance.monthly.map((m) => toNumber(m.collected));
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-24 items-end gap-1.5" role="img" aria-label="Encaissements des derniers mois">
      {finance.monthly.map((month, index) => {
        const current = index === finance.monthly.length - 1;
        return (
          <div key={month.month} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <span
              className={cn("w-full rounded-t-[5px] transition-opacity", current ? "bg-accent" : "bg-white/25 group-hover:bg-white/45")}
              style={{ height: `${Math.max(4, (values[index] / max) * 100)}%` }}
              title={`${monthLong(month.month)} : ${formatMoney(values[index])}`}
            />
            <span className={cn("text-[0.62rem] leading-none", current ? "text-white" : "text-white/55")}>{monthLabel(month.month).slice(0, 1).toUpperCase()}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Taux présenté en anneau SVG (occupation, recouvrement). */
export function RateRing({ value, size = 64, label }: { value: number | null; size?: number; label: string }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.max(0, Math.min(1, (value ?? 0) / 100));
  return (
    <div className="ax-progress ax-progress--circle" style={{ width: size, height: size }} role="img" aria-label={`${label} : ${percent(value)}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" style={{ transform: "rotate(-90deg)" }}>
        <circle className="ax-progress__ring-track" cx={size / 2} cy={size / 2} r={radius} strokeWidth={7} />
        <circle
          className="ax-progress__ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={7}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
        />
      </svg>
      <span className="ax-progress__center text-[0.72rem] font-semibold">{value === null ? "—" : `${Math.round(value)}%`}</span>
    </div>
  );
}

export { METHOD_COLORS, METHOD_LOGOS, methodColor, Sparkline } from "@/components/app/analytics/visuals";
