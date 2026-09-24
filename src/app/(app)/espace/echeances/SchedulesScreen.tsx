"use client";

import {
  IconCalendarPlus,
  IconCalendarTime,
  IconCash,
  IconFilterOff,
  IconX,
} from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { EmptyState } from "@/components/app/EmptyState";
import { PageHead } from "@/components/app/shell/PageHead";
import { DataTable, type Column } from "@/components/app/ui/DataTable";
import { SelectField, TextField } from "@/components/app/ui/fields";
import { ListToolbar } from "@/components/app/ui/ListToolbar";
import { useListParams } from "@/hooks/useListParams";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { useSession } from "@/lib/auth/useSession";
import { formatDate, formatNumber } from "@/lib/format";
import { enumLabel, enumOptions, SCHEDULE_TYPE } from "@/lib/labels";
import { cn } from "@/lib/utils";

import {
  addDaysIso,
  isLate,
  KEYS,
  todayIso,
  type Schedule,
  type ScheduleType,
} from "@/app/(app)/espace/paiements/_components/data";
import {
  formatCents,
  toCents,
} from "@/app/(app)/espace/paiements/_components/money";
import {
  RecordPaymentModal,
  type PaymentPreset,
} from "@/app/(app)/espace/paiements/_components/RecordPaymentModal";

import { ScheduleIndicators } from "./_components/Indicators";
import { ScheduleFormModal } from "./_components/ScheduleFormModal";

/** Filtre d'état (paramètre d'URL `etat`), traduit en filtres de l'API. */
const STATES = [
  { value: "non_payee", label: "Non payées" },
  { value: "retard", label: "En retard" },
  { value: "a_venir", label: "À venir" },
  { value: "payee", label: "Payées" },
] as const;

const SCHEDULE_TYPES: readonly ScheduleType[] = ["RENT", "CHARGE", "SALE"];
const asScheduleType = (value: string) =>
  SCHEDULE_TYPES.find((type) => type === value);

const laterOf = (a: string, b: string) => (!a ? b : !b ? a : a > b ? a : b);
const earlierOf = (a: string, b: string) => (!a ? b : !b ? a : a < b ? a : b);

function daysLate(dueDate: string, today: string): number {
  const [y1, m1, d1] = dueDate.split("-").map(Number);
  const [y2, m2, d2] = today.split("-").map(Number);
  return Math.round(
    (Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000,
  );
}

export function SchedulesScreen() {
  const { can, isReadOnly } = useSession();
  const list = useListParams([
    "etat",
    "schedule_type",
    "due_date_after",
    "due_date_before",
    "lease_contract",
  ] as const);
  const [creating, setCreating] = useState(false);
  const [paying, setPaying] = useState<PaymentPreset | "nouveau" | null>(null);
  const today = todayIso();
  const yesterday = addDaysIso(today, -1);

  const {
    etat,
    schedule_type,
    due_date_after,
    due_date_before,
    lease_contract,
  } = list.filters;
  let after = due_date_after;
  let before = due_date_before;
  let isPaid: boolean | undefined;
  if (etat === "payee") isPaid = true;
  if (etat === "non_payee" || etat === "retard" || etat === "a_venir")
    isPaid = false;
  if (etat === "retard") before = earlierOf(before, yesterday);
  if (etat === "a_venir") after = laterOf(after, today);

  const query = {
    page: list.page > 1 ? list.page : undefined,
    is_paid: isPaid,
    schedule_type: asScheduleType(schedule_type),
    due_date_after: after || undefined,
    due_date_before: before || undefined,
    lease_contract: Number(lease_contract) || undefined,
    // Vue « payées » : les plus récentes d'abord ; sinon les plus urgentes d'abord.
    ordering: etat === "payee" ? "-due_date" : "due_date",
  };
  // Période incohérente (ex. « en retard » avec une date de début dans le futur) : rien à chercher.
  const emptyRange = Boolean(
    query.due_date_after &&
    query.due_date_before &&
    query.due_date_after > query.due_date_before,
  );

  const schedules = useQuery({
    queryKey: [...KEYS.schedules, query],
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/payments/schedules/", { params: { query } }),
      ),
    placeholderData: keepPreviousData,
    enabled: !emptyRange,
  });

  const canRecord = can("payment.create") && !isReadOnly;
  const canCreate = can("payment.schedule.create") && !isReadOnly;
  const filtered = Boolean(
    etat ||
    schedule_type ||
    due_date_after ||
    due_date_before ||
    lease_contract,
  );

  const columns: Column<Schedule>[] = [
    {
      key: "contract",
      header: "Contrat",
      cell: (schedule) => (
        <div className="flex min-w-0 flex-col">
          <span className="text-text-strong font-medium">
            {schedule.contract_label}
          </span>
          <span className="text-text-subtle text-xs md:hidden">
            {enumLabel(SCHEDULE_TYPE, schedule.schedule_type)}
          </span>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      hideOnMobile: true,
      cell: (schedule) => enumLabel(SCHEDULE_TYPE, schedule.schedule_type),
    },
    {
      key: "due",
      header: "Échéance",
      cell: (schedule) => {
        const late = isLate(schedule, today);
        const days = late ? daysLate(schedule.due_date, today) : 0;
        return (
          <div className="flex flex-col">
            <span
              className={cn(
                "ax-num whitespace-nowrap",
                late ? "text-danger font-semibold" : "text-text-strong",
              )}
            >
              {formatDate(schedule.due_date, "short")}
            </span>
            {late && (
              <span className="text-danger text-xs">
                depuis {formatNumber(days)} jour{days > 1 ? "s" : ""}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "amount",
      header: "Montant",
      numeric: true,
      cell: (schedule) => (
        <span className="text-text-strong font-medium">
          {formatCents(toCents(schedule.amount_due))}
        </span>
      ),
    },
    {
      key: "state",
      header: "État",
      cell: (schedule) => <ScheduleState schedule={schedule} today={today} />,
    },
    {
      key: "actions",
      header: "Actions",
      cell: (schedule) => {
        const leaseId = schedule.lease_contract;
        // Échéances de vente : l'acquéreur n'est pas un locataire, l'encaissement se fait depuis Paiements.
        if (!canRecord || schedule.is_paid || !leaseId) return null;
        return (
          <div className="flex justify-end">
            <button
              type="button"
              className="ax-btn ax-btn--secondary ax-btn--sm"
              onClick={() => setPaying({ scheduleId: schedule.id, leaseId })}
              aria-label={`Enregistrer un paiement pour l'échéance du ${formatDate(schedule.due_date)} (${schedule.contract_label})`}
            >
              <IconCash
                className="ax-btn__icon"
                stroke={1.75}
                aria-hidden="true"
              />
              <span className="ax-btn__label max-sm:sr-only">Encaisser</span>
            </button>
          </div>
        );
      },
    },
  ];

  const createButton = canCreate && (
    <button
      type="button"
      className="ax-btn ax-btn--secondary"
      onClick={() => setCreating(true)}
    >
      <IconCalendarPlus
        className="ax-btn__icon"
        stroke={1.75}
        aria-hidden="true"
      />
      <span className="ax-btn__label">Nouvelle échéance</span>
    </button>
  );
  const recordButton = canRecord && (
    <button
      type="button"
      className="ax-btn ax-btn--primary"
      onClick={() => setPaying("nouveau")}
    >
      <IconCash className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
      <span className="ax-btn__label">Enregistrer un paiement</span>
    </button>
  );
  const headActions = (createButton || recordButton) && (
    <div className="flex flex-wrap gap-2">
      {createButton}
      {recordButton}
    </div>
  );

  const filters = (
    <>
      <SelectField
        label="État"
        className="w-[calc(50%-0.375rem)] sm:w-40"
        value={etat}
        onChange={(event) => list.setFilter("etat", event.target.value)}
        options={STATES.map((state) => ({
          value: state.value,
          label: state.label,
        }))}
        placeholder="Tous"
      />
      <SelectField
        label="Type"
        className="w-[calc(50%-0.375rem)] sm:w-36"
        value={schedule_type}
        onChange={(event) =>
          list.setFilter("schedule_type", event.target.value)
        }
        options={enumOptions(SCHEDULE_TYPE)}
        placeholder="Tous"
      />
      <TextField
        label="Échéance du"
        type="date"
        className="w-[calc(50%-0.375rem)] sm:w-40"
        value={due_date_after}
        max={due_date_before || undefined}
        onChange={(event) =>
          list.setFilter("due_date_after", event.target.value)
        }
      />
      <TextField
        label="au"
        type="date"
        className="w-[calc(50%-0.375rem)] sm:w-40"
        value={due_date_before}
        min={due_date_after || undefined}
        onChange={(event) =>
          list.setFilter("due_date_before", event.target.value)
        }
      />
    </>
  );

  const rows = emptyRange ? [] : schedules.data?.results;

  return (
    <>
      <PageHead
        title="Échéances"
        subtitle="Les loyers et charges attendus pour chaque bail, et leur état de paiement. Encaissez une échéance en un clic."
        crumbs={[
          { label: "Espace agence", href: "/espace" },
          { label: "Échéances" },
        ]}
        actions={headActions}
      />

      <div className="flex flex-col gap-6">
        <ScheduleIndicators showCollected={can("payment.view")} />

        <section className="ax-card" aria-label="Liste des échéances">
          <div className="ax-card__body flex flex-col gap-5">
            <ListToolbar
              filters={filters}
              actions={
                filtered && (
                  <button
                    type="button"
                    className="ax-btn ax-btn--ghost"
                    onClick={list.reset}
                  >
                    <IconFilterOff
                      className="ax-btn__icon"
                      stroke={1.75}
                      aria-hidden="true"
                    />
                    <span className="ax-btn__label">Effacer les filtres</span>
                  </button>
                )
              }
            />
            {lease_contract && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-text-muted">
                  Filtré sur le bail n°{lease_contract}
                </span>
                <button
                  type="button"
                  className="ax-btn ax-btn--ghost ax-btn--sm"
                  onClick={() => list.setFilter("lease_contract", "")}
                >
                  <IconX
                    className="ax-btn__icon"
                    stroke={1.75}
                    aria-hidden="true"
                  />
                  <span className="ax-btn__label">Tous les baux</span>
                </button>
              </div>
            )}
            <DataTable
              caption="Échéances de l'agence"
              columns={columns}
              rows={rows}
              rowKey={(schedule) => schedule.id}
              loading={!emptyRange && schedules.isLoading}
              error={emptyRange ? null : schedules.error}
              onRetry={() => schedules.refetch()}
              count={emptyRange ? 0 : schedules.data?.count}
              page={list.page}
              onPageChange={list.setPage}
              empty={
                <EmptyState
                  icon={IconCalendarTime}
                  title={
                    filtered
                      ? etat === "retard"
                        ? "Aucune échéance en retard"
                        : "Aucune échéance trouvée"
                      : "Aucune échéance pour l'instant"
                  }
                  action={!filtered && createButton}
                >
                  {filtered
                    ? etat === "retard"
                      ? "Tous les loyers et charges échus sont réglés pour ces critères."
                      : "Aucune échéance ne correspond à ces critères. Élargissez la période ou effacez les filtres."
                    : "Les échéances de loyer et de charges sont créées à partir des baux. Ajoutez-en une pour commencer le suivi des encaissements."}
                </EmptyState>
              }
            />
          </div>
        </section>
      </div>

      {creating && (
        <ScheduleFormModal
          onClose={() => setCreating(false)}
          defaultLease={Number(lease_contract) || undefined}
        />
      )}
      {paying && (
        <RecordPaymentModal
          onClose={() => setPaying(null)}
          preset={paying === "nouveau" ? undefined : paying}
        />
      )}
    </>
  );
}

function ScheduleState({
  schedule,
  today,
}: {
  schedule: Schedule;
  today: string;
}) {
  if (schedule.is_paid) return <Badge tone="success">Payée</Badge>;
  if (isLate(schedule, today)) return <Badge tone="danger">En retard</Badge>;
  if (schedule.due_date === today)
    return <Badge tone="warning">Aujourd&apos;hui</Badge>;
  return <Badge tone="info">À venir</Badge>;
}

function Badge({
  tone,
  children,
}: {
  tone: "success" | "danger" | "warning" | "info";
  children: ReactNode;
}) {
  return (
    <span
      className={`ax-badge ax-badge--soft ax-badge--${tone} whitespace-nowrap`}
    >
      <span className="ax-badge__dot" aria-hidden="true" />
      {children}
    </span>
  );
}
