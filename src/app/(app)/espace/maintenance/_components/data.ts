import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import type { paths } from "@/lib/api/schema";
import type { Schema } from "@/lib/api/types";
import type { Me } from "@/lib/auth/useSession";

/*
 * Accès aux données du module Maintenance : types, clés React Query, chargements complets
 * (sélecteurs, journal) et petits utilitaires partagés par la liste et la fiche d'un ticket.
 */

export type Ticket = Schema<"MaintenanceTicket">;
export type TicketStatus = Schema<"TicketStatusEnum">;
export type TicketPriority = Schema<"PriorityEnum">;
export type TicketLog = Schema<"MaintenanceLog">;
export type Category = Schema<"MaintenanceCategory">;
export type Member = Schema<"Membership">;
export type Unit = Schema<"Unit">;
export type TicketQuery = NonNullable<paths["/api/v1/maintenance/tickets/"]["get"]["parameters"]["query"]>;

/** Premier élément = ressource, pour que `invalidate` rafraîchisse toutes les vues concernées. */
export const KEYS = {
  /** Listes et compteurs. */
  tickets: ["tickets"] as const,
  /** Fiche d'un ticket (le journal est rangé dessous : invalider la fiche rafraîchit aussi le journal). */
  ticket: (id: number) => ["ticket", id] as const,
  logs: (id: number) => ["ticket", id, "logs"] as const,
  categories: ["maintenance-categories"] as const,
  units: ["units", "selecteur-maintenance"] as const,
  members: ["members", "selecteur-maintenance"] as const,
};

export const TICKET_STATUSES: readonly TicketStatus[] = ["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"];
/** Ordre d'affichage des priorités : de la plus urgente à la plus basse. */
export const TICKET_PRIORITIES: readonly TicketPriority[] = ["URGENT", "HIGH", "MEDIUM", "LOW"];

export function asStatus(value: string): TicketStatus | undefined {
  return TICKET_STATUSES.find((status) => status === value);
}

export function asPriority(value: string): TicketPriority | undefined {
  return TICKET_PRIORITIES.find((priority) => priority === value);
}

/** Tris proposés (`priority_rank` = ordre de gravité, calculé par l'API). */
export const TICKET_ORDERINGS = [
  { value: "", label: "Plus récents" },
  { value: "created_at", label: "Plus anciens" },
  { value: "-updated_at", label: "Dernière activité" },
  { value: "-priority_rank", label: "Plus urgents" },
] as const;

export function asOrdering(value: string): string | undefined {
  return TICKET_ORDERINGS.some((option) => option.value === value) && value ? value : undefined;
}

/** Identifiant positif lu dans l'URL (filtre `unit`, `category`). */
export function asId(value: string): number | undefined {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

/** Nombre maximal de pages lues pour un sélecteur (25 éléments par page côté API). */
const MAX_PAGES = 20;

/** Page DRF telle que typée par l'OpenAPI (`next` peut être absent). */
type ApiPage<T> = { results: T[]; next?: string | null };

async function collectPages<T>(load: (page: number) => Promise<ApiPage<T>>): Promise<T[]> {
  const items: T[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const result = await load(page);
    items.push(...result.results);
    if (!result.next) break;
  }
  return items;
}

function fetchAllUnits(): Promise<Unit[]> {
  return collectPages(async (page) => unwrap(await api.GET("/api/v1/properties/units/", { params: { query: { page } } })));
}

function fetchAllMembers(): Promise<Member[]> {
  return collectPages(async (page) => unwrap(await api.GET("/api/v1/organizations/members/", { params: { query: { page } } })));
}

export function fetchTicketLogs(id: number): Promise<TicketLog[]> {
  return collectPages(async (page) =>
    unwrap(await api.GET("/api/v1/maintenance/tickets/{id}/logs/", { params: { path: { id }, query: { page } } })),
  );
}

/**
 * Ajoute une entrée au journal sans bloquer l'action principale (changement de statut, affectation) :
 * si l'écriture échoue, l'action reste valide et l'utilisateur peut compléter le journal à la main.
 */
export async function addLogQuietly(id: number, message: string): Promise<void> {
  try {
    await api.POST("/api/v1/maintenance/tickets/{id}/logs/", { params: { path: { id } }, body: { message } });
  } catch {
    // Réseau indisponible : l'entrée de journal est facultative.
  }
}

const FIVE_MINUTES = 5 * 60_000;

/** Catégories d'intervention (référentiel commun, souvent vide au démarrage). */
export function useCategories() {
  return useQuery({
    queryKey: KEYS.categories,
    queryFn: async () => unwrap(await api.GET("/api/v1/maintenance/categories/")),
    staleTime: FIVE_MINUTES,
  });
}

/** Lots de l'agence, triés par libellé (sélecteur du formulaire de création). */
export function useUnits(enabled = true) {
  return useQuery({
    queryKey: KEYS.units,
    queryFn: async () => (await fetchAllUnits()).sort((a, b) => a.label.localeCompare(b.label, "fr")),
    enabled,
    staleTime: FIVE_MINUTES,
  });
}

/** Membres de l'équipe (noms des auteurs, personnes assignables). Nécessite `member.view`. */
export function useMembers(enabled: boolean) {
  return useQuery({
    queryKey: KEYS.members,
    queryFn: fetchAllMembers,
    enabled,
    staleTime: FIVE_MINUTES,
  });
}

export function memberName(user: Member["user"]): string {
  return `${user.first_name} ${user.last_name}`.trim() || user.phone;
}

/** Nom d'un utilisateur à partir de son identifiant (auteur d'un ticket ou d'une entrée de journal). */
export function personName(userId: number, members: Member[] | undefined, me: Me | undefined): string {
  if (me && me.id === userId) return `${`${me.first_name} ${me.last_name}`.trim() || me.phone} (vous)`;
  const member = members?.find((candidate) => candidate.user.id === userId);
  return member ? memberName(member.user) : `Utilisateur n°${userId}`;
}

/** Libellé d'un lot « Résidence · Bâtiment · A101 » découpé en référence (mise en avant) et contexte. */
export function splitUnitLabel(label: string): { reference: string; context: string } {
  const parts = label.split(" · ");
  const reference = parts.pop() ?? label;
  return { reference, context: parts.join(" · ") };
}

const dateTime = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** Date et heure (journal d'intervention) : « 24 sept. 2026 à 14:05 ». */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : dateTime.format(parsed);
}
