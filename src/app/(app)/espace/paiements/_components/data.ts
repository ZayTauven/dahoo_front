import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import type { Schema } from "@/lib/api/types";

import { toCents } from "./money";

/*
 * Accès aux données partagé par les pages Échéances et Paiements : clés React Query,
 * lectures complètes (sélecteurs, indicateurs), dates locales et échéances restant à régler.
 */

export type Schedule = Schema<"PaymentSchedule">;
export type ScheduleType = Schema<"ScheduleTypeEnum">;
export type Payment = Schema<"Payment">;
export type PaymentMethod = Schema<"PaymentMethod">;
export type Lease = Schema<"LeaseContract">;
export type Tenant = Schema<"Tenant">;

/** Premier élément = ressource, pour que `invalidate` rafraîchisse toutes les vues concernées. */
export const KEYS = {
  schedules: ["schedules"] as const,
  payments: ["payments"] as const,
  methods: ["payment-methods"] as const,
  leases: ["leases"] as const,
  tenants: ["tenants"] as const,
};

/** Après un encaissement ou une affectation : listes de paiements et états des échéances. */
export const PAYMENT_INVALIDATE = [KEYS.payments, KEYS.schedules];

/* ------------------------------------------------------------------ Dates (jour local, AAAA-MM-JJ) */

function isoDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function todayIso(): string {
  return isoDay(new Date());
}

export function addDaysIso(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  return isoDay(new Date(year, month - 1, day + days));
}

/** Premier et dernier jour du mois en cours. */
export function currentMonth(): { start: string; end: string; label: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const label = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(now);
  return { start: isoDay(start), end: isoDay(end), label };
}

/** Échéance non payée dont la date est dépassée (strictement avant aujourd'hui). */
export function isLate(
  schedule: Pick<Schedule, "is_paid" | "due_date">,
  today: string,
): boolean {
  return !schedule.is_paid && schedule.due_date < today;
}

/* ------------------------------------------------------------------ Lectures complètes */

/** Nombre maximal de pages lues (25 éléments par page côté API). */
const MAX_PAGES = 20;

export interface Collected<T> {
  items: T[];
  /** Nombre total annoncé par l'API : supérieur à items.length si la lecture a été plafonnée. */
  count: number;
}

/** Page de liste telle que typée par OpenAPI (`next` facultatif). */
interface ApiPage<T> {
  count: number;
  next?: string | null;
  results: T[];
}

export async function collectPages<T>(
  load: (page: number) => Promise<ApiPage<T>>,
): Promise<Collected<T>> {
  const items: T[] = [];
  let count = 0;
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const result = await load(page);
    count = result.count;
    items.push(...result.results);
    if (!result.next) break;
  }
  return { items, count };
}

export async function fetchAllTenants(): Promise<Tenant[]> {
  const { items } = await collectPages(async (page) =>
    unwrap(
      await api.GET("/api/v1/leases/tenants/", {
        params: { query: { page, ordering: "last_name" } },
      }),
    ),
  );
  return items;
}

export async function fetchAllLeases(tenant?: number): Promise<Lease[]> {
  const { items } = await collectPages(async (page) =>
    unwrap(
      await api.GET("/api/v1/leases/", { params: { query: { page, tenant } } }),
    ),
  );
  return items;
}

export function tenantName(
  tenant: Pick<Tenant, "first_name" | "last_name">,
): string {
  return `${tenant.first_name} ${tenant.last_name}`.trim();
}

export function leaseLabel(
  lease: Pick<Lease, "id" | "tenant_name" | "unit_label">,
): string {
  return `Bail n°${lease.id} · ${lease.tenant_name} · ${lease.unit_label}`;
}

/** Moyens de paiement (référentiel commun géré par Dahoo, rarement modifié). */
export function usePaymentMethods() {
  return useQuery({
    queryKey: KEYS.methods,
    queryFn: async () => unwrap(await api.GET("/api/v1/payments/methods/")),
    staleTime: 10 * 60_000,
  });
}

/* ------------------------------------------------------------------ Échéances à régler d'un payeur */

export interface OpenSchedule {
  schedule: Schedule;
  /** Reste dû, en centimes. */
  remaining: number;
}

/**
 * Échéances non payées des baux d'un locataire, par ordre d'échéance, avec leur reste dû.
 *
 * L'API n'expose pas le montant déjà réglé d'une échéance : il est recalculé à partir des
 * affectations des paiements de ce payeur (cas normal). Si un autre payeur a réglé une partie de
 * l'échéance, l'API refusera un montant trop élevé et le message s'affichera sur l'affectation.
 */
export async function fetchOpenSchedules(
  payer: number,
): Promise<OpenSchedule[]> {
  const leases = await fetchAllLeases(payer);
  const [scheduleLists, payments] = await Promise.all([
    Promise.all(
      leases.map((lease) =>
        collectPages(async (page) =>
          unwrap(
            await api.GET("/api/v1/payments/schedules/", {
              params: {
                query: {
                  page,
                  lease_contract: lease.id,
                  is_paid: false,
                  ordering: "due_date",
                },
              },
            }),
          ),
        ),
      ),
    ),
    collectPages(async (page) =>
      unwrap(
        await api.GET("/api/v1/payments/payments/", {
          params: { query: { page, payer } },
        }),
      ),
    ),
  ]);

  const allocated = new Map<number, number>();
  for (const payment of payments.items) {
    for (const allocation of payment.allocations) {
      allocated.set(
        allocation.schedule,
        (allocated.get(allocation.schedule) ?? 0) +
          toCents(allocation.allocated_amount),
      );
    }
  }

  return scheduleLists
    .flatMap((list) => list.items)
    .map((schedule) => ({
      schedule,
      remaining:
        toCents(schedule.amount_due) - (allocated.get(schedule.id) ?? 0),
    }))
    .filter((entry) => entry.remaining > 0)
    .sort(
      (a, b) =>
        a.schedule.due_date.localeCompare(b.schedule.due_date) ||
        a.schedule.id - b.schedule.id,
    );
}

export function useOpenSchedules(payer: number | null) {
  return useQuery({
    queryKey: [...KEYS.schedules, "a-regler", payer],
    queryFn: () =>
      payer === null ? Promise.resolve([]) : fetchOpenSchedules(payer),
    enabled: payer !== null,
  });
}
