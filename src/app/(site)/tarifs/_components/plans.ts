import type { Schema } from "@/lib/api/types";
import { formatMoney, formatNumber } from "@/lib/format";

export type Plan = Schema<"PublicPlan">;

export interface PlanPrice {
  /** Montant principal (« 25 000 F CFA », « 5 % »), ou libellé si aucun prix n'est fixé. */
  amount: string;
  /** Période ou base de calcul (« / mois », « de commission »). */
  unit?: string;
  /** Précision sous le prix (équivalent mensuel d'une offre annuelle, base de la commission). */
  note?: string;
}

const percent = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

/** Prix lisible d'une offre selon son mode de facturation (mensuel, annuel ou commission). */
export function planPrice(plan: Plan): PlanPrice {
  if (plan.billing_type === "COMMISSION") {
    if (plan.commission_rate == null) return { amount: "Sur devis", note: "Commission définie avec vous" };
    return {
      amount: `${percent.format(plan.commission_rate)} %`,
      unit: "de commission",
      note: "Sur les loyers ou les ventes gérés dans Dahoo",
    };
  }

  const price = plan.price == null || plan.price === "" ? null : Number(plan.price);
  if (price == null || Number.isNaN(price)) return { amount: "Sur devis" };
  if (price === 0) return { amount: "Gratuit" };

  if (plan.billing_type === "YEARLY") {
    return { amount: formatMoney(price), unit: "/ an", note: `Soit ${formatMoney(Math.round(price / 12))} par mois` };
  }
  return { amount: formatMoney(price), unit: "/ mois", note: "Facturé chaque mois" };
}

export const LIMITS: { key: "max_properties" | "max_units" | "max_users"; label: string; one: string; many: string; unlimited: string }[] = [
  { key: "max_properties", label: "Biens", one: "bien", many: "biens", unlimited: "Biens illimités" },
  { key: "max_units", label: "Lots", one: "lot", many: "lots", unlimited: "Lots illimités" },
  { key: "max_users", label: "Utilisateurs", one: "utilisateur", many: "utilisateurs", unlimited: "Utilisateurs illimités" },
];

/** « Jusqu'à 50 lots », ou « Lots illimités » quand la limite vaut `null`. */
export function limitLabel(value: number | null | undefined, limit: (typeof LIMITS)[number]): string {
  if (value == null) return limit.unlimited;
  return `Jusqu'à ${formatNumber(value)} ${value > 1 ? limit.many : limit.one}`;
}

/** Valeur courte pour le tableau comparatif. */
export function limitShort(value: number | null | undefined): string {
  return value == null ? "Illimité" : formatNumber(value);
}
