"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { SelectField, TextField } from "@/components/app/ui/fields";
import { FormModal } from "@/components/app/ui/Modal";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import type { Schema } from "@/lib/api/types";
import { useApiMutation } from "@/lib/api/useApiMutation";
import { enumLabel, LEASE_STATUS } from "@/lib/labels";

import {
  fetchAllLeases,
  KEYS,
  leaseLabel,
  type Lease,
} from "@/app/(app)/espace/paiements/_components/data";
import {
  centsToDecimal,
  centsToInput,
  formatCents,
  parseAmountInput,
  toCents,
} from "@/app/(app)/espace/paiements/_components/money";

type ScheduleBody = Schema<"PaymentScheduleRequest">;
type LeaseScheduleType = "RENT" | "CHARGE";

const TYPE_OPTIONS: { value: LeaseScheduleType; label: string }[] = [
  { value: "RENT", label: "Loyer" },
  { value: "CHARGE", label: "Charges" },
];

/** Baux proposés : actifs d'abord ; les baux annulés ne reçoivent plus d'échéances. */
const LEASE_ORDER: Record<string, number> = {
  ACTIVE: 0,
  DRAFT: 1,
  TERMINATED: 2,
  COMPLETED: 3,
};

/** Montant prévu au bail pour ce type d'échéance (proposé tant que l'utilisateur n'a rien saisi). */
function leaseAmount(
  lease: Lease | undefined,
  type: LeaseScheduleType,
): number | undefined {
  if (!lease) return undefined;
  const cents = toCents(
    type === "RENT" ? lease.rent_amount : (lease.charges_amount ?? ""),
  );
  return Number.isFinite(cents) && cents > 0 ? cents : undefined;
}

/** Création d'une échéance de bail : bail, type, date d'échéance, montant. */
export function ScheduleFormModal({
  onClose,
  defaultLease,
}: {
  onClose: () => void;
  defaultLease?: number;
}) {
  const [lease, setLease] = useState(defaultLease ? String(defaultLease) : "");
  const [type, setType] = useState<LeaseScheduleType>("RENT");
  const [dueDate, setDueDate] = useState("");
  const [amountInput, setAmountInput] = useState<string | null>(null);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const leases = useQuery({
    queryKey: [...KEYS.leases, "selecteur-echeances"],
    queryFn: () => fetchAllLeases(),
  });
  const options = (leases.data ?? [])
    .filter((entry) => entry.status !== "CANCELLED")
    .sort(
      (a, b) =>
        (LEASE_ORDER[a.status] ?? 9) - (LEASE_ORDER[b.status] ?? 9) ||
        b.id - a.id,
    )
    .map((entry) => ({
      value: entry.id,
      label: `${leaseLabel(entry)}${entry.status === "ACTIVE" ? "" : ` (${enumLabel(LEASE_STATUS, entry.status).toLowerCase()})`}`,
    }));

  const selectedLease = leases.data?.find(
    (entry) => String(entry.id) === lease,
  );
  const suggested = leaseAmount(selectedLease, type);
  const amountText =
    amountInput ?? (suggested !== undefined ? centsToInput(suggested) : "");
  const amount = parseAmountInput(amountText);

  const save = useApiMutation({
    mutationFn: async (body: ScheduleBody) =>
      unwrap(await api.POST("/api/v1/payments/schedules/", { body })),
    invalidate: [KEYS.schedules],
    success: "Échéance créée.",
    onSuccess: onClose,
  });
  const errors = { ...clientErrors, ...save.fieldErrors };

  const submit = () => {
    const found: Record<string, string> = {};
    if (!lease) found.lease_contract = "Choisissez le bail concerné.";
    if (!dueDate) found.due_date = "Indiquez la date d'échéance.";
    if (amount === null) found.amount_due = "Indiquez le montant dû.";
    else if (Number.isNaN(amount) || amount <= 0)
      found.amount_due = "Montant invalide (exemple : 150000).";
    setClientErrors(found);
    save.resetErrors();
    if (Object.keys(found).length || amount === null) return;
    save.mutate({
      lease_contract: Number(lease),
      schedule_type: type,
      due_date: dueDate,
      amount_due: centsToDecimal(amount),
    });
  };

  return (
    <FormModal
      open
      onClose={onClose}
      title="Nouvelle échéance"
      submitLabel="Créer l'échéance"
      onSubmit={submit}
      pending={save.isPending}
      error={
        save.formError ??
        (leases.error
          ? `Impossible de charger les baux : ${leases.error.message}`
          : undefined)
      }
    >
      <SelectField
        label="Bail"
        required
        value={lease}
        onChange={(event) => setLease(event.target.value)}
        options={options}
        placeholder={
          leases.isLoading
            ? "Chargement des baux…"
            : options.length
              ? "Choisir un bail"
              : "Aucun bail disponible"
        }
        disabled={leases.isLoading}
        error={errors.lease_contract}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Type"
          required
          value={type}
          onChange={(event) =>
            setType(event.target.value === "CHARGE" ? "CHARGE" : "RENT")
          }
          options={TYPE_OPTIONS}
          error={errors.schedule_type}
        />
        <TextField
          label="Date d'échéance"
          type="date"
          required
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          error={errors.due_date}
        />
      </div>
      <TextField
        label="Montant dû (FCFA)"
        required
        inputMode="decimal"
        autoComplete="off"
        placeholder="150 000"
        value={amountText}
        onChange={(event) => setAmountInput(event.target.value)}
        error={errors.amount_due}
        hint={
          amount !== null && !Number.isNaN(amount) && amount > 0
            ? `${formatCents(amount)}${amountInput === null && suggested !== undefined ? ` · montant prévu au bail` : ""}`
            : "Proposé à partir du loyer ou des charges du bail."
        }
      />
    </FormModal>
  );
}
