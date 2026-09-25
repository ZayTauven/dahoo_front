import type { Schema } from "@/lib/api/types";

export type Dashboard = Schema<"Dashboard">;
export type Finance = Schema<"FinanceSummary">;
export type Portfolio = Schema<"Portfolio">;
export type Maintenance = Schema<"MaintenanceSummary">;
export type Listings = Schema<"ListingsSummary">;
export type LeasesSummary = Schema<"LeasesSummary">;
export type Insight = Schema<"InsightItem">;

const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const MONTHS_LONG = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

const nbsp = (text: string) => text.replace(/ /g, " ");
const compact = new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 1 });
const decimal = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

/** « 2026-09 » → « sept. » (ou « sept. 26 » pour distinguer les années). */
export function monthLabel(key: string, withYear = false): string {
  const [year, month] = key.split("-").map(Number);
  return withYear ? `${MONTHS[month - 1]} ${String(year).slice(2)}` : MONTHS[month - 1];
}

export function monthLong(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return `${MONTHS_LONG[month - 1]} ${year}`;
}

/** Montant compact pour les axes et les tuiles : « 3,8 M », « 450 k ». */
export function compactMoney(value: number | string): string {
  return nbsp(compact.format(Number(value)).replace(/\s?k$/i, " k"));
}

export function percent(value: number | null | undefined): string {
  return value === null || value === undefined ? "—" : `${nbsp(decimal.format(value))} %`;
}

export function toNumber(value: string | number | null | undefined): number {
  return value === null || value === undefined ? 0 : Number(value);
}

/** Variation relative entre deux valeurs, en %, ou null si la base est nulle. */
export function delta(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

/** « aujourd'hui », « dans 3 j », « il y a 12 j ». */
export function relativeDays(days: number): string {
  if (days === 0) return "aujourd'hui";
  if (days === 1) return "demain";
  if (days === -1) return "hier";
  return days > 0 ? `dans ${days} j` : `il y a ${-days} j`;
}

export function daysFromToday(iso: string): number {
  const target = new Date(`${iso.slice(0, 10)}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function dayAndMonth(iso: string): { day: string; month: string } {
  const date = new Date(`${iso.slice(0, 10)}T00:00:00`);
  return { day: String(date.getDate()).padStart(2, "0"), month: MONTHS[date.getMonth()] };
}

export function todayLabel(): string {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
}
