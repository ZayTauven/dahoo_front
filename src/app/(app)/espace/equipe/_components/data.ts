import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import type { Schema } from "@/lib/api/types";

/*
 * Données partagées de l'écran Équipe : rôles et capabilities (gérés par Dahoo, communs à toutes
 * les agences), regroupement des capabilities par domaine et petits utilitaires d'affichage.
 */

export type Member = Schema<"Membership">;
export type Role = Schema<"Role">;
export type Capability = Schema<"Capability">;

export const MEMBERS_KEY = ["members"] as const;

/** Ordre d'affichage des rôles, du plus large au plus restreint. */
const ROLE_ORDER = ["ORG_ADMIN", "MANAGER", "ACCOUNTANT", "VIEWER"];

/** Résumé en une phrase de chaque rôle système (le détail vient de l'API). */
export const ROLE_SUMMARY: Record<string, string> = {
  ORG_ADMIN: "Tous les droits, y compris la gestion de l'équipe et des informations de l'agence.",
  MANAGER: "Gère le patrimoine, les locataires, les baux, les paiements, la maintenance et les annonces, sans gérer l'équipe ni l'agence.",
  ACCOUNTANT: "Consulte toutes les données et gère les paiements et les échéances.",
  VIEWER: "Consulte toutes les données de l'agence, sans rien modifier.",
};

/** Tonalité de la pastille de rôle. */
export const ROLE_TONE: Record<string, "accent" | "info" | "success" | "neutral"> = {
  ORG_ADMIN: "accent",
  MANAGER: "info",
  ACCOUNTANT: "success",
  VIEWER: "neutral",
};

function roleRank(code: string): number {
  const index = ROLE_ORDER.indexOf(code);
  return index === -1 ? ROLE_ORDER.length : index;
}

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const page = unwrap(await api.GET("/api/v1/access/roles/"));
      return [...page.results].sort((a, b) => roleRank(a.code) - roleRank(b.code) || a.label.localeCompare(b.label, "fr"));
    },
    staleTime: 30 * 60_000,
  });
}

export function useCapabilities() {
  return useQuery({
    queryKey: ["capabilities"],
    queryFn: async () => unwrap(await api.GET("/api/v1/access/capabilities/")),
    staleTime: 30 * 60_000,
  });
}

/** Domaines fonctionnels (préfixe du code de capability), dans l'ordre du catalogue. */
const DOMAINS: { prefix: string; label: string }[] = [
  { prefix: "organization", label: "Agence" },
  { prefix: "member", label: "Équipe" },
  { prefix: "property", label: "Patrimoine" },
  { prefix: "building", label: "Patrimoine" },
  { prefix: "unit", label: "Patrimoine" },
  { prefix: "tenant", label: "Locataires et baux" },
  { prefix: "lease", label: "Locataires et baux" },
  { prefix: "payment", label: "Paiements et échéances" },
  { prefix: "maintenance", label: "Maintenance" },
  { prefix: "listing", label: "Annonces et prospects" },
  { prefix: "field_ops", label: "Terrain" },
  { prefix: "analytics", label: "Pilotage" },
  { prefix: "notification", label: "Notifications" },
  { prefix: "subscription", label: "Abonnement" },
];
const OTHER_DOMAIN = "Autres droits";

export interface CapabilityGroup {
  label: string;
  items: { code: string; description: string }[];
}

/** Regroupe des codes de capability par domaine, avec leur description française. */
export function groupCapabilities(codes: readonly string[], catalog: readonly Capability[]): CapabilityGroup[] {
  const descriptions = new Map(catalog.map((capability) => [capability.code, capability.description || capability.code]));
  const order = [...new Set(DOMAINS.map((domain) => domain.label)), OTHER_DOMAIN];
  const groups = new Map<string, CapabilityGroup["items"]>();

  for (const code of codes) {
    const prefix = code.split(".")[0];
    const label = DOMAINS.find((domain) => domain.prefix === prefix)?.label ?? OTHER_DOMAIN;
    const items = groups.get(label) ?? [];
    items.push({ code, description: descriptions.get(code) ?? code });
    groups.set(label, items);
  }

  return order
    .filter((label) => groups.has(label))
    .map((label) => ({
      label,
      // Consultation d'abord, puis les autres actions par ordre alphabétique.
      items: (groups.get(label) ?? []).sort(
        (a, b) => Number(!a.code.endsWith(".view")) - Number(!b.code.endsWith(".view")) || a.description.localeCompare(b.description, "fr"),
      ),
    }));
}

export function initials(first?: string, last?: string): string {
  return `${first?.trim()[0] ?? ""}${last?.trim()[0] ?? ""}`.toUpperCase() || "?";
}

export function fullName(member: Member): string {
  return `${member.user.first_name} ${member.user.last_name}`.trim() || member.user.phone;
}

/**
 * Numéro au format enregistré par l'API (« +221770000001 ») : l'API compare les numéros tels quels,
 * on retire donc espaces et séparateurs, « 00 » devient « + » et un numéro sénégalais à 9 chiffres
 * reçoit l'indicatif +221.
 */
export function normalizePhone(value: string): string {
  const compact = value.trim().replace(/[\s.\-()]/g, "");
  if (compact.startsWith("00")) return `+${compact.slice(2)}`;
  if (/^[37]\d{8}$/.test(compact)) return `+221${compact}`;
  return compact;
}
