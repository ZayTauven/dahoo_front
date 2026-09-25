const money = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("fr-FR");
const date = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const shortDate = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

/**
 * Intl sépare les milliers par une espace fine insécable (U+202F), absente de plusieurs polices du
 * site (Instrument Serif) : « 15000 FCFA » s'affichait collé. On la remplace par l'espace insécable
 * classique (U+00A0), présente partout.
 */
const withNbsp = (text: string) => text.replace(/\u202F/g, "\u00A0");

/** Montant en francs CFA : les montants de l'API arrivent en chaînes décimales ("150000.00"). */
export function formatMoney(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  return withNbsp(money.format(Number(value)));
}

export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  return withNbsp(number.format(Number(value)));
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
