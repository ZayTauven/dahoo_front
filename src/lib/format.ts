const money = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("fr-FR");
const date = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const shortDate = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

/** Montant en francs CFA : les montants de l'API arrivent en chaînes décimales ("150000.00"). */
export function formatMoney(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  return money.format(Number(value));
}

export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  return number.format(Number(value));
}

export function formatDate(value: string | Date | null | undefined, style: "long" | "short" = "long"): string {
  if (!value) return "—";
  const parsed = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(parsed.getTime())) return "—";
  return (style === "long" ? date : shortDate).format(parsed);
}

/** Nombre de jours restants jusqu'à une date (négatif si dépassée). */
export function daysUntil(value: string | Date): number {
  const target = typeof value === "string" ? new Date(value) : value;
  return Math.ceil((target.getTime() - Date.now()) / 86_400_000);
}
