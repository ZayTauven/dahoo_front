"use client";

import {
  IconAlertTriangle,
  IconCalendarDollar,
  IconCashBanknote,
  type Icon,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

import {
  addDaysIso,
  collectPages,
  currentMonth,
  KEYS,
  todayIso,
} from "@/app/(app)/espace/paiements/_components/data";
import {
  formatCents,
  toCents,
} from "@/app/(app)/espace/paiements/_components/money";

const shortDay = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
});
const dayLabel = (iso: string) => {
  const [year, month, day] = iso.split("-").map(Number);
  return shortDay.format(new Date(year, month - 1, day));
};

function plural(count: number, word: string) {
  return `${formatNumber(count)} ${word}${count > 1 ? "s" : ""}`;
}

/**
 * Indicateurs de la page Échéances, calculés à partir des listes de l'API (toutes les pages,
 * dans la limite de 500 éléments) : à encaisser ce mois, en retard, encaissé ce mois.
 * Les montants dus sont ceux des échéances non soldées (un règlement partiel n'est pas déduit).
 */
export function ScheduleIndicators({
  showCollected,
}: {
  showCollected: boolean;
}) {
  const today = todayIso();
  const yesterday = addDaysIso(today, -1);
  const month = currentMonth();

  const dueThisMonth = useQuery({
    queryKey: [
      ...KEYS.schedules,
      "indicateurs",
      "mois",
      month.start,
      month.end,
    ],
    queryFn: () =>
      collectPages(async (page) =>
        unwrap(
          await api.GET("/api/v1/payments/schedules/", {
            params: {
              query: {
                page,
                is_paid: false,
                due_date_after: month.start,
                due_date_before: month.end,
              },
            },
          }),
        ),
      ),
  });
  const late = useQuery({
    queryKey: [...KEYS.schedules, "indicateurs", "retard", yesterday],
    queryFn: () =>
      collectPages(async (page) =>
        unwrap(
          await api.GET("/api/v1/payments/schedules/", {
            params: {
              query: { page, is_paid: false, due_date_before: yesterday },
            },
          }),
        ),
      ),
  });
  const collected = useQuery({
    queryKey: [...KEYS.payments, "indicateurs", month.start, today],
    queryFn: () =>
      collectPages(async (page) =>
        unwrap(
          await api.GET("/api/v1/payments/payments/", {
            params: {
              query: {
                page,
                payment_date_after: month.start,
                payment_date_before: today,
              },
            },
          }),
        ),
      ),
    enabled: showCollected,
  });

  const sumDue = (items: { amount_due: string }[] = []) =>
    items.reduce((sum, item) => sum + toCents(item.amount_due), 0);
  const atLeast = (data: { items: unknown[]; count: number } | undefined) =>
    data && data.items.length < data.count ? "Au moins " : "";

  const lateCount = late.data?.count ?? 0;

  return (
    <section
      aria-label="Indicateurs des échéances"
      className={cn(
        "grid gap-4",
        showCollected ? "sm:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2",
      )}
    >
      <MoneyKpi
        label="À encaisser ce mois"
        icon={IconCalendarDollar}
        tone={1}
        loading={dueThisMonth.isLoading}
        error={dueThisMonth.error}
        value={
          dueThisMonth.data &&
          `${atLeast(dueThisMonth.data)}${formatCents(sumDue(dueThisMonth.data.items))}`
        }
        caption={
          dueThisMonth.data &&
          `${plural(dueThisMonth.data.count, "échéance")} non payée${dueThisMonth.data.count > 1 ? "s" : ""} du ${dayLabel(month.start)} au ${dayLabel(month.end)}`
        }
      />
      <MoneyKpi
        label="En retard"
        icon={IconAlertTriangle}
        tone={4}
        danger={lateCount > 0}
        loading={late.isLoading}
        error={late.error}
        value={
          late.data &&
          `${atLeast(late.data)}${formatCents(sumDue(late.data.items))}`
        }
        caption={
          late.data &&
          (lateCount
            ? `${plural(lateCount, "échéance")} non payée${lateCount > 1 ? "s" : ""}, échue${lateCount > 1 ? "s" : ""} avant le ${dayLabel(today)}`
            : `Aucune échéance impayée avant le ${dayLabel(today)}`)
        }
      />
      {showCollected && (
        <MoneyKpi
          label="Encaissé ce mois"
          icon={IconCashBanknote}
          tone={2}
          loading={collected.isLoading}
          error={collected.error}
          value={
            collected.data &&
            `${atLeast(collected.data)}${formatCents(collected.data.items.reduce((sum, payment) => sum + toCents(payment.amount_paid), 0))}`
          }
          caption={
            collected.data &&
            `${plural(collected.data.count, "paiement")} du ${dayLabel(month.start)} au ${dayLabel(today)}`
          }
        />
      )}
    </section>
  );
}

function MoneyKpi({
  label,
  icon: KpiIcon,
  tone,
  value,
  caption,
  loading,
  error,
  danger = false,
}: {
  label: string;
  icon: Icon;
  tone: 1 | 2 | 3 | 4;
  value: string | undefined;
  caption: string | undefined;
  loading: boolean;
  error: Error | null;
  danger?: boolean;
}) {
  return (
    <div className="ax-card ax-kpi">
      <div className="ax-card__body">
        <div className="ax-kpi__top">
          <span className={`ax-kpi__icon ax-kpi__icon--c${tone}`}>
            <KpiIcon stroke={1.75} aria-hidden="true" />
          </span>
        </div>
        <div className="ax-kpi__label">{label}</div>
        <div
          className={cn("ax-kpi__value ax-num", danger && "text-danger")}
          aria-busy={loading}
        >
          {loading ? (
            <span
              className="ax-skeleton ax-skeleton--text"
              style={{ inlineSize: 120 }}
            />
          ) : error ? (
            "—"
          ) : (
            value
          )}
        </div>
        <p className="ax-kpi__caption col-span-full m-0">
          {error ? `Indisponible : ${error.message}` : loading ? " " : caption}
        </p>
      </div>
    </div>
  );
}
