"use client";

import { IconCalendarPlus, IconCalendarTime } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { EmptyState } from "@/components/app/EmptyState";
import { DataTable, type Column } from "@/components/app/ui/DataTable";
import { SelectField, TextField } from "@/components/app/ui/fields";
import { FormModal } from "@/components/app/ui/Modal";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import type { Schema } from "@/lib/api/types";
import { useApiMutation } from "@/lib/api/useApiMutation";
import { cn } from "@/lib/utils";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";
import { enumLabel, SCHEDULE_TYPE } from "@/lib/labels";

import { addMonths, daysBetween, fetchLeaseSchedules, isLate, KEYS, monthlyTotal, monthsPerPeriod, todayIso, type Lease, type Schedule } from "./data";

type ScheduleType = "RENT" | "CHARGE";

/** Échéancier d'un bail : résumé (dû, payé, reste), liste des échéances et ajout d'une échéance. */
export function ScheduleSection({ lease, canCreate }: { lease: Lease; canCreate: boolean }) {
  const [adding, setAdding] = useState(false);
  const today = todayIso();

  const schedules = useQuery({
    queryKey: [...KEYS.schedules, { lease_contract: lease.id }],
    queryFn: () => fetchLeaseSchedules(lease.id),
  });

  const rows = schedules.data;
  const totals = (rows ?? []).reduce(
    (sum, schedule) => {
      const amount = Number(schedule.amount_due);
      sum.due += amount;
      if (schedule.is_paid) sum.paid += amount;
      if (isLate(schedule, today)) {
        sum.late += amount;
        sum.lateCount += 1;
      }
      return sum;
    },
    { due: 0, paid: 0, late: 0, lateCount: 0 },
  );

  const columns: Column<Schedule>[] = [
    {
      key: "date",
      header: "Échéance",
      cell: (schedule) => (
        <div className="flex flex-col">
          <span className={cn("ax-num font-medium", isLate(schedule, today) ? "text-danger" : "text-text-strong")}>{formatDate(schedule.due_date)}</span>
          <span className="text-text-subtle text-xs sm:hidden">{enumLabel(SCHEDULE_TYPE, schedule.schedule_type)}</span>
        </div>
      ),
    },
    { key: "type", header: "Type", hideOnMobile: true, cell: (schedule) => enumLabel(SCHEDULE_TYPE, schedule.schedule_type) },
    { key: "amount", header: "Montant", numeric: true, cell: (schedule) => formatMoney(schedule.amount_due) },
    { key: "state", header: "État", cell: (schedule) => <ScheduleState schedule={schedule} today={today} /> },
  ];

  const addButton = canCreate && (
    <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={() => setAdding(true)}>
      <IconCalendarPlus className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
      <span className="ax-btn__label">Ajouter une échéance</span>
    </button>
  );

  return (
    <section className="ax-card" aria-labelledby="echeancier-titre">
      <div className="ax-card__header flex-wrap">
        <div className="ax-card__titles">
          <h2 className="ax-card__title" id="echeancier-titre">
            Échéancier
          </h2>
          <p className="ax-card__subtitle">Loyers et charges attendus pour ce bail. Un paiement enregistré marque l&apos;échéance comme payée.</p>
        </div>
        {addButton && <div className="ax-card__actions">{addButton}</div>}
      </div>
      <div className="ax-card__body flex flex-col gap-5">
        {rows && rows.length > 0 && (
          <dl className="m-0 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Tile label="Total dû" value={formatMoney(totals.due)} />
            <Tile label="Total payé" value={formatMoney(totals.paid)} tone="success" />
            <Tile label="Reste à percevoir" value={formatMoney(totals.due - totals.paid)} />
            <Tile
              label="En retard"
              value={formatMoney(totals.late)}
              detail={totals.lateCount ? `${formatNumber(totals.lateCount)} échéance${totals.lateCount > 1 ? "s" : ""}` : "Aucune"}
              tone={totals.lateCount ? "danger" : undefined}
            />
          </dl>
        )}

        <DataTable
          caption={`Échéancier du bail n°${lease.id}`}
          columns={columns}
          rows={rows}
          rowKey={(schedule) => schedule.id}
          loading={schedules.isLoading}
          error={schedules.error}
          onRetry={() => schedules.refetch()}
          empty={
            <EmptyState icon={IconCalendarTime} title="Aucune échéance" action={addButton}>
              {canCreate
                ? "Ajoutez les échéances de loyer et de charges pour suivre les paiements de ce bail."
                : "Aucune échéance n'a encore été créée pour ce bail."}
            </EmptyState>
          }
        />

        {rows && rows.length > 0 && (
          <p className="text-text-subtle m-0 text-xs">
            Pour enregistrer un encaissement, rendez-vous dans{" "}
            <Link href="/espace/paiements" className="text-link">
              Paiements
            </Link>
            .
          </p>
        )}
      </div>

      {adding && <ScheduleFormModal lease={lease} schedules={rows ?? []} onClose={() => setAdding(false)} />}
    </section>
  );
}

function Tile({ label, value, detail, tone }: { label: string; value: string; detail?: string; tone?: "success" | "danger" }) {
  return (
    <div
      className={cn(
        "bg-surface-subtle flex min-w-0 flex-col gap-1 rounded-md border px-4 py-3",
        tone === "danger" ? "border-danger" : "border-border-default",
      )}
    >
      <dt className="text-text-muted text-xs font-medium">{label}</dt>
      <dd className={cn("ax-num m-0 font-display text-base font-semibold sm:text-lg", tone === "danger" ? "text-danger" : "text-text-strong")}>
        {value}
      </dd>
      {detail && <dd className="text-text-subtle m-0 text-xs">{detail}</dd>}
    </div>
  );
}

function ScheduleState({ schedule, today }: { schedule: Schedule; today: string }) {
  if (schedule.is_paid) {
    return (
      <span className="ax-badge ax-badge--soft ax-badge--success">
        <span className="ax-badge__dot" aria-hidden="true" />
        Payée
      </span>
    );
  }
  if (isLate(schedule, today)) {
    const days = daysBetween(schedule.due_date, today);
    return (
      <span className="ax-badge ax-badge--soft ax-badge--danger font-semibold">
        <span className="ax-badge__dot" aria-hidden="true" />
        En retard · {formatNumber(days)} j
      </span>
    );
  }
  return (
    <span className="ax-badge ax-badge--soft ax-badge--neutral">
      <span className="ax-badge__dot" aria-hidden="true" />
      {schedule.due_date === today ? "Due aujourd'hui" : "À venir"}
    </span>
  );
}

function defaultAmount(lease: Lease, type: ScheduleType): string {
  const months = monthsPerPeriod(lease.payment_frequency);
  const monthly = type === "RENT" ? monthlyTotal(lease) : Number(lease.charges_amount || 0);
  return monthly > 0 ? String(Math.round(monthly * months)) : "";
}

/** Prochaine date logique : une période après la dernière échéance, sinon le début du bail. */
function nextDueDate(lease: Lease, schedules: Schedule[]): string {
  const last = schedules.reduce<string | undefined>((latest, schedule) => (!latest || schedule.due_date > latest ? schedule.due_date : latest), undefined);
  return last ? addMonths(last, monthsPerPeriod(lease.payment_frequency)) : lease.start_date;
}

function ScheduleFormModal({ lease, schedules, onClose }: { lease: Lease; schedules: Schedule[]; onClose: () => void }) {
  const [type, setType] = useState<ScheduleType>("RENT");
  const [dueDate, setDueDate] = useState(() => nextDueDate(lease, schedules));
  const [amount, setAmount] = useState(() => defaultAmount(lease, "RENT"));
  const [amountEdited, setAmountEdited] = useState(false);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const save = useApiMutation({
    mutationFn: async (body: Schema<"PaymentScheduleRequest">) => unwrap(await api.POST("/api/v1/payments/schedules/", { body })),
    invalidate: [KEYS.schedules],
    success: "Échéance ajoutée.",
    onSuccess: onClose,
  });

  const submit = () => {
    const errors: Record<string, string> = {};
    if (!dueDate) errors.due_date = "Ce champ est obligatoire.";
    if (!(Number(amount) > 0)) errors.amount_due = "Indiquez un montant supérieur à 0.";
    setLocalErrors(errors);
    if (Object.keys(errors).length) return;
    save.mutate({ lease_contract: lease.id, schedule_type: type, due_date: dueDate, amount_due: amount });
  };

  const errors = { ...save.fieldErrors, ...localErrors };
  const quarterly = lease.payment_frequency === "QUARTERLY";

  return (
    <FormModal open onClose={onClose} title="Nouvelle échéance" submitLabel="Ajouter" onSubmit={submit} pending={save.isPending} error={save.formError}>
      <SelectField
        label="Type"
        required
        value={type}
        onChange={(event) => {
          const next: ScheduleType = event.target.value === "CHARGE" ? "CHARGE" : "RENT";
          setType(next);
          if (!amountEdited) setAmount(defaultAmount(lease, next));
        }}
        error={errors.schedule_type}
        options={[
          { value: "RENT", label: "Loyer (charges comprises)" },
          { value: "CHARGE", label: "Charges seules" },
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Date d'échéance"
          required
          type="date"
          value={dueDate}
          onChange={(event) => {
            setDueDate(event.target.value);
            setLocalErrors((current) => ({ ...current, due_date: "" }));
          }}
          error={errors.due_date || undefined}
        />
        <TextField
          label="Montant (FCFA)"
          required
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          value={amount}
          onChange={(event) => {
            setAmount(event.target.value);
            setAmountEdited(true);
            setLocalErrors((current) => ({ ...current, amount_due: "" }));
          }}
          error={errors.amount_due || undefined}
          hint={
            quarterly
              ? `Prérempli pour un trimestre (3 × ${formatMoney(type === "RENT" ? monthlyTotal(lease) : lease.charges_amount)}).`
              : type === "RENT"
                ? "Prérempli avec le loyer et les charges du bail."
                : "Prérempli avec les charges mensuelles du bail."
          }
        />
      </div>
      {errors.lease_contract && <p className="text-danger m-0 text-sm">{errors.lease_contract}</p>}
    </FormModal>
  );
}
