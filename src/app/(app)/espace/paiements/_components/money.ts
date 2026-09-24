import { formatMoney } from "@/lib/format";

/*
 * Montants en centimes entiers : l'API envoie et reçoit des chaînes décimales ("150000.00").
 * Aucun calcul d'argent ne passe par des nombres à virgule flottante.
 */

const DECIMAL = /^(\d+)(?:[.,](\d{0,2}))?$/;

/** "150000.00" → 15000000. Renvoie NaN si la chaîne n'est pas un montant positif valide. */
export function toCents(value: string | null | undefined): number {
  if (value === null || value === undefined) return Number.NaN;
  const match = DECIMAL.exec(value.trim());
  if (!match) return Number.NaN;
  const units = Number(match[1]);
  const fraction = Number((match[2] ?? "").padEnd(2, "0"));
  return units * 100 + fraction;
}

/** 15000000 → "150000.00" (format attendu par l'API). */
export function centsToDecimal(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const absolute = Math.abs(cents);
  return `${sign}${Math.trunc(absolute / 100)}.${String(absolute % 100).padStart(2, "0")}`;
}

/** Montant en FCFA à partir de centimes. */
export function formatCents(cents: number): string {
  return formatMoney(centsToDecimal(cents));
}

/** 15000000 → "150000" ; 15000050 → "150000,50" (valeur d'un champ de saisie). */
export function centsToInput(cents: number): string {
  const units = Math.trunc(cents / 100);
  const fraction = cents % 100;
  return fraction
    ? `${units},${String(fraction).padStart(2, "0")}`
    : String(units);
}

/**
 * Saisie utilisateur → centimes : espaces ignorés ("150 000"), virgule ou point décimal.
 * `null` si le champ est vide, NaN si la saisie est invalide.
 */
export function parseAmountInput(text: string): number | null {
  // \s couvre aussi les espaces insécables (U+00A0, U+202F) insérés par les formats français.
  const compact = text.replace(/\s/g, "");
  if (!compact) return null;
  return toCents(compact);
}

/** Répartit `budget` sur des montants dus, dans l'ordre : chaque ligne reçoit au plus son reste. */
export function distribute(
  budget: number,
  remainders: readonly number[],
): number[] {
  let left = Math.max(0, budget);
  return remainders.map((remaining) => {
    const part = Math.min(left, Math.max(0, remaining));
    left -= part;
    return part;
  });
}
