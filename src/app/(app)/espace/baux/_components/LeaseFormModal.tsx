"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { SelectField, TextField } from "@/components/app/ui/fields";
import { FormModal } from "@/components/app/ui/Modal";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import type { Schema } from "@/lib/api/types";
import { useApiMutation } from "@/lib/api/useApiMutation";
import { formatMoney } from "@/lib/format";
import { enumOptions, PAYMENT_FREQUENCY } from "@/lib/labels";

import { fetchAllTenants, fetchAllUnits, KEYS, tenantOptionLabel, todayIso, unitOptionLabel } from "./data";

type LeaseRequest = Schema<"LeaseContractRequest">;
type Frequency = NonNullable<LeaseRequest["payment_frequency"]>;

interface LeaseForm {
  unit: string;
  tenant: string;
  start_date: string;
  end_date: string;
  rent_amount: string;
  charges_amount: string;
  deposit_amount: string;
  payment_frequency: Frequency;
}

const REQUIRED = "Ce champ est obligatoire.";

function validate(form: LeaseForm): Partial<Record<keyof LeaseForm, string>> {
  const errors: Partial<Record<keyof LeaseForm, string>> = {};
  if (!form.unit) errors.unit = "Choisissez le lot loué.";
  if (!form.tenant) errors.tenant = "Choisissez le locataire.";
  if (!form.start_date) errors.start_date = REQUIRED;
  if (form.end_date && form.start_date && form.end_date <= form.start_date)
    errors.end_date = "La date de fin doit être postérieure au début.";
  if (!form.rent_amount) errors.rent_amount = REQUIRED;
  for (const field of ["rent_amount", "charges_amount", "deposit_amount"] as const) {
    if (form[field] && !(Number(form[field]) >= 0)) errors[field] = "Montant invalide.";
  }
  return errors;
}

/** Création d'un bail (en brouillon) ; redirige vers sa fiche une fois créé. */
export function LeaseFormModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState<LeaseForm>({
    unit: "",
    tenant: "",
    start_date: todayIso(),
    end_date: "",
    rent_amount: "",
    charges_amount: "",
    deposit_amount: "",
    payment_frequency: "MONTHLY",
  });
  const [localErrors, setLocalErrors] = useState<Partial<Record<keyof LeaseForm, string>>>({});
  const set = (field: keyof LeaseForm) => (event: { target: { value: string } }) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setLocalErrors((current) => ({ ...current, [field]: undefined }));
  };

  const units = useQuery({ queryKey: [...KEYS.units, "options", "FREE"], queryFn: () => fetchAllUnits("FREE") });
  const tenants = useQuery({ queryKey: [...KEYS.tenants, "options"], queryFn: fetchAllTenants });

  const save = useApiMutation({
    mutationFn: async (body: LeaseRequest) => unwrap(await api.POST("/api/v1/leases/", { body })),
    invalidate: [KEYS.leases],
    success: "Bail créé en brouillon.",
    onSuccess: (lease) => {
      onClose();
      router.push(`/espace/baux/${lease.id}`);
    },
  });

  const submit = () => {
    const errors = validate(form);
    setLocalErrors(errors);
    if (Object.keys(errors).length) return;
    save.mutate({
      unit: Number(form.unit),
      tenant: Number(form.tenant),
      start_date: form.start_date,
      end_date: form.end_date || null,
      rent_amount: form.rent_amount,
      charges_amount: form.charges_amount || "0",
      deposit_amount: form.deposit_amount || "0",
      payment_frequency: form.payment_frequency,
    });
  };

  const errors = { ...save.fieldErrors, ...Object.fromEntries(Object.entries(localErrors).filter(([, value]) => value)) };
  const monthly = Number(form.rent_amount || 0) + Number(form.charges_amount || 0);
  const noFreeUnit = units.isSuccess && units.data.length === 0;
  const noTenant = tenants.isSuccess && tenants.data.length === 0;

  return (
    <FormModal
      open
      onClose={onClose}
      title="Nouveau bail"
      submitLabel="Créer le brouillon"
      onSubmit={submit}
      pending={save.isPending}
      error={save.formError ?? (units.error || tenants.error ? "Impossible de charger les lots ou les locataires. Fermez et réessayez." : undefined)}
      size="lg"
    >
      <p className="text-text-muted m-0 text-sm">
        Le bail est créé en <strong className="text-text-strong">brouillon</strong> : le lot reste libre jusqu&apos;à son activation,
        depuis la fiche du bail.
      </p>

      <SelectField
        label="Lot"
        required
        value={form.unit}
        onChange={set("unit")}
        error={errors.unit}
        disabled={units.isLoading}
        placeholder={units.isLoading ? "Chargement des lots…" : "Choisir un lot libre"}
        options={(units.data ?? []).map((unit) => ({ value: unit.id, label: unitOptionLabel(unit) }))}
        hint={
          noFreeUnit ? (
            <>
              Aucun lot libre pour l&apos;instant.{" "}
              <Link href="/espace/biens" className="text-link">
                Voir les biens
              </Link>
            </>
          ) : (
            "Seuls les lots libres sont proposés."
          )
        }
      />

      <SelectField
        label="Locataire"
        required
        value={form.tenant}
        onChange={set("tenant")}
        error={errors.tenant}
        disabled={tenants.isLoading}
        placeholder={tenants.isLoading ? "Chargement des locataires…" : "Choisir un locataire"}
        options={(tenants.data ?? []).map((tenant) => ({ value: tenant.id, label: tenantOptionLabel(tenant) }))}
        hint={
          <>
            {noTenant ? "Aucun locataire enregistré. " : "Locataire absent de la liste ? "}
            <Link href="/espace/locataires" className="text-link">
              Ajouter un locataire
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Date de début" required type="date" value={form.start_date} onChange={set("start_date")} error={errors.start_date} />
        <TextField
          label="Date de fin"
          type="date"
          value={form.end_date}
          min={form.start_date || undefined}
          onChange={set("end_date")}
          error={errors.end_date}
          hint="Facultative : laissez vide pour un bail sans terme fixé."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Loyer mensuel (FCFA)"
          required
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          placeholder="250000"
          value={form.rent_amount}
          onChange={set("rent_amount")}
          error={errors.rent_amount}
        />
        <TextField
          label="Charges mensuelles (FCFA)"
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          placeholder="0"
          value={form.charges_amount}
          onChange={set("charges_amount")}
          error={errors.charges_amount}
          hint="Eau, gardiennage, entretien des parties communes…"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Dépôt de garantie (FCFA)"
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          placeholder="0"
          value={form.deposit_amount}
          onChange={set("deposit_amount")}
          error={errors.deposit_amount}
          hint="Caution versée à l'entrée dans les lieux."
        />
        <SelectField
          label="Fréquence de paiement"
          value={form.payment_frequency}
          onChange={(event) => setForm((current) => ({ ...current, payment_frequency: event.target.value === "QUARTERLY" ? "QUARTERLY" : "MONTHLY" }))}
          error={errors.payment_frequency}
          options={enumOptions(PAYMENT_FREQUENCY)}
        />
      </div>

      {monthly > 0 && (
        <p className="bg-surface-subtle text-text m-0 rounded-md px-4 py-3 text-sm" aria-live="polite">
          Total mensuel : <strong className="text-text-strong ax-num">{formatMoney(monthly)}</strong>
          {form.payment_frequency === "QUARTERLY" && (
            <>
              {" "}
              · par trimestre : <strong className="text-text-strong ax-num">{formatMoney(monthly * 3)}</strong>
            </>
          )}
        </p>
      )}
    </FormModal>
  );
}
