import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import type { Page, Schema } from "@/lib/api/types";

/*
 * Accès aux données du module Baux : clés React Query, chargements complets (sélecteurs, échéancier)
 * et petits calculs partagés par la liste et la fiche.
 */

export type Lease = Schema<"LeaseContract">;
export type LeaseStatus = Schema<"LeaseStatusEnum">;
export type Schedule = Schema<"PaymentSchedule">;
export type Tenant = Schema<"Tenant">;
export type Unit = Schema<"Unit">;

/** Premier élément = ressource, pour que `invalidate` rafraîchisse toutes les vues concernées. */
export const KEYS = {
  leases: ["leases"] as const,
  schedules: ["schedules"] as const,
  tenants: ["tenants"] as const,
  units: ["units"] as const,
};

const LEASE_STATUSES: readonly LeaseStatus[] = ["DRAFT", "ACTIVE", "TERMINATED", "COMPLETED", "CANCELLED"];

export function asLeaseStatus(value: string): LeaseStatus | undefined {
  return LEASE_STATUSES.find((status) => status === value);
}

/** Nombre maximal de pages lues pour un sélecteur (25 éléments par page côté API). */
const MAX_PAGES = 20;

/** Lit toutes les pages d'une liste paginée (sélecteurs, échéancier d'un bail). */
async function collectPages<T>(load: (page: number) => Promise<Pick<Page<T>, "results"> & { next?: string | null }>): Promise<T[]> {
  const items: T[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const result = await load(page);
    items.push(...result.results);
    if (!result.next) break;
  }
  return items;
}

export function fetchAllTenants(): Promise<Tenant[]> {
  return collectPages(async (page) =>
    unwrap(await api.GET("/api/v1/leases/tenants/", { params: { query: { page, ordering: "last_name" } } })),
  );
}

export function fetchAllUnits(status?: Unit["status"]): Promise<Unit[]> {
  return collectPages(async (page) => unwrap(await api.GET("/api/v1/properties/units/", { params: { query: { page, status } } })));
}

export function fetchLeaseSchedules(leaseId: number): Promise<Schedule[]> {
  return collectPages(async (page) =>
    unwrap(
      await api.GET("/api/v1/payments/schedules/", {
        params: { query: { page, lease_contract: leaseId, ordering: "due_date" } },
      }),
    ),
  );
}

/** Libellé lisible d'un lot dans un sélecteur : « Résidence · Bâtiment A · A101 — Appartement T2, 60 m² ». */
export function unitOptionLabel(unit: Unit): string {
  const details = [unit.category_label, unit.unit_type].filter(Boolean).join(" ");
  return `${unit.label} — ${details}, ${unit.surface} m²`;
}

export function tenantOptionLabel(tenant: Tenant): string {
  return `${tenant.first_name} ${tenant.last_name} · ${tenant.phone}`;
}

/** Montant mensuel total (loyer + charges) à partir des décimales de l'API. */
export function monthlyTotal(lease: Pick<Lease, "rent_amount" | "charges_amount">): number {
  return Number(lease.rent_amount || 0) + Number(lease.charges_amount || 0);
}

/** Nombre de mois couverts par une échéance selon la fréquence du bail. */
export function monthsPerPeriod(frequency: Lease["payment_frequency"]): number {
  return frequency === "QUARTERLY" ? 3 : 1;
}

/** Date du jour au format AAAA-MM-JJ (fuseau du navigateur ; Dakar = UTC). */
export function todayIso(): string {
  const now = new Date();
  return toIso(now.getFullYear(), now.getMonth(), now.getDate());
}

function toIso(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Ajoute des mois à une date AAAA-MM-JJ, en restant au dernier jour du mois si besoin (31 janv. + 1 → 28/29 févr.). */
export function addMonths(iso: string, months: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const target = new Date(year, month - 1 + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return toIso(target.getFullYear(), target.getMonth(), Math.min(day, lastDay));
}

/** Échéance non payée dont la date est dépassée. */
export function isLate(schedule: Schedule, today: string): boolean {
  return !schedule.is_paid && schedule.due_date < today;
}

/** Nombre de jours entre deux dates AAAA-MM-JJ. */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
}
