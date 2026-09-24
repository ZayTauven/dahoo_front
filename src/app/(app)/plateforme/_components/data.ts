import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import type { Schema } from "@/lib/api/types";
import { daysUntil, formatDate, formatMoney } from "@/lib/format";
import type { EnumEntry, Tone } from "@/lib/labels";

/*
 * Données et libellés de l'espace plateforme (équipe Dahoo) : agences clientes, essais,
 * abonnements et demandes de démo.
 */

export type Organization = Schema<"PlatformOrganization">;
export type Subscription = Schema<"PlatformSubscription">;
export type SubscriptionStatus = Schema<"SubscriptionStatusEnum">;
export type DemoRequest = Schema<"PlatformDemoRequest">;
export type UnitsRange = Schema<"UnitsRangeEnum">;
export type Plan = Schema<"SubscriptionPlan">;
export type Member = Schema<"Membership">;

/** Clés React Query : invalider `organizations` rafraîchit la liste, les indicateurs et les fiches. */
export const KEYS = {
  organizations: ["platform-organizations"] as const,
  members: ["platform-members"] as const,
  subscriptions: ["platform-subscriptions"] as const,
  demoRequests: ["platform-demo-requests"] as const,
  plans: ["subscription-plans"] as const,
};

/** Durée de l'essai gratuit accordé à la création d'une agence (TRIAL_DAYS côté API). */
export const TRIAL_DAYS = 30;

export const PLATFORM_CRUMB = { label: "Plateforme Dahoo", href: "/plateforme/agences" };

export const UNITS_RANGE: Record<UnitsRange, EnumEntry> = {
  "1-20": { label: "1 à 20 lots", tone: "neutral" },
  "21-100": { label: "21 à 100 lots", tone: "neutral" },
  "101-500": { label: "101 à 500 lots", tone: "neutral" },
  "500+": { label: "Plus de 500 lots", tone: "neutral" },
};

/** Rôles des membres (codes de access.Role côté API). */
export const ROLE_LABELS: Record<string, string> = {
  ORG_ADMIN: "Administrateur",
  MANAGER: "Gestionnaire",
  ACCOUNTANT: "Comptable",
  VIEWER: "Lecture seule",
};

export const ORGANIZATION_STATE: Record<"active" | "suspended", EnumEntry> = {
  active: { label: "Active", tone: "success" },
  suspended: { label: "Suspendue", tone: "danger" },
};

/** Toutes les agences (pages successives) : sert aux indicateurs, l'API ne fournissant pas d'agrégats. */
export async function fetchAllOrganizations(): Promise<Organization[]> {
  const all: Organization[] = [];
  for (let page = 1; page <= 40; page += 1) {
    const data = unwrap(await api.GET("/api/v1/platform/organizations/", { params: { query: { page } } }));
    all.push(...data.results);
    if (!data.next) break;
  }
  return all;
}

/** Vrai si la date (ISO ou Date) est dépassée. */
export function isPast(value: string | Date): boolean {
  return new Date(value).getTime() <= Date.now();
}

export interface TrialInfo {
  label: string;
  tone: Tone;
  expired: boolean;
}

/** Fin d'essai lisible : « 12 jours restants », « Dernier jour », « Expiré ». */
export function trialInfo(organization: Pick<Organization, "trial_ends_at" | "is_internal">): TrialInfo | null {
  if (organization.is_internal) return { label: "Compte interne", tone: "neutral", expired: false };
  if (!organization.trial_ends_at) return null;
  const end = new Date(organization.trial_ends_at);
  if (end.getTime() <= Date.now()) return { label: "Expiré", tone: "danger", expired: true };
  const days = daysUntil(end);
  if (days <= 1) return { label: "Dernier jour", tone: "warning", expired: false };
  return { label: `${days} jours restants`, tone: days <= 7 ? "warning" : "neutral", expired: false };
}

export function planLabel(plan: Plan | undefined): string {
  return plan ? plan.name : "Offre supprimée";
}

/** Tarif d'une offre : « 25 000 FCFA / mois », « 8 % des encaissements ». */
export function planPrice(plan: Plan | undefined): string {
  if (!plan) return "";
  switch (plan.billing_type) {
    case "MONTHLY":
      return `${formatMoney(plan.price)} / mois`;
    case "YEARLY":
      return `${formatMoney(plan.price)} / an`;
    case "COMMISSION":
      return plan.commission_rate !== null && plan.commission_rate !== undefined
        ? `${String(plan.commission_rate).replace(".", ",")} % des encaissements`
        : "À la commission";
  }
}

/** Période d'un abonnement : « du 01/10/2026 au 30/09/2027 » ou « depuis le 01/10/2026 ». */
export function subscriptionPeriod(subscription: Pick<Subscription, "start_date" | "end_date">): string {
  const start = formatDate(subscription.start_date, "short");
  return subscription.end_date ? `du ${start} au ${formatDate(subscription.end_date, "short")}` : `depuis le ${start}, sans échéance`;
}

/** Date au format des champs <input type="date"> (AAAA-MM-JJ), en heure locale. */
export function toDateInput(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Fin de journée locale d'une date AAAA-MM-JJ, au format ISO attendu par l'API. */
export function endOfDayIso(value: string): string {
  return new Date(`${value}T23:59:59`).toISOString();
}
