"use client";

import { useQuery } from "@tanstack/react-query";
import { useId, useState } from "react";

import {
  SelectField,
  TextareaField,
  TextField,
} from "@/components/app/ui/fields";
import { Modal } from "@/components/app/ui/Modal";
import { api } from "@/lib/api/client";
import { unwrap, type FieldErrors } from "@/lib/api/errors";
import type { Schema } from "@/lib/api/types";
import { useApiMutation } from "@/lib/api/useApiMutation";

import { AllocationPicker, useAllocation } from "./Allocation";
import {
  fetchAllTenants,
  KEYS,
  PAYMENT_INVALIDATE,
  tenantName,
  useOpenSchedules,
  usePaymentMethods,
} from "./data";
import {
  centsToDecimal,
  centsToInput,
  formatCents,
  parseAmountInput,
} from "./money";

type PaymentBody = Schema<"PaymentCreateRequest">;

export interface PaymentPreset {
  /** Échéance à régler (paiement lancé depuis la liste des échéances). */
  scheduleId: number;
  /** Bail de l'échéance : son locataire devient le payeur. */
  leaseId: number;
}

type FormField = "payer" | "amount_paid" | "payment_method";

/**
 * Enregistrement d'un encaissement : payeur, montant, moyen, référence, note, puis affectation
 * aux échéances non payées des baux du payeur. Partagée par les pages Échéances et Paiements.
 */
export function RecordPaymentModal({
  onClose,
  preset,
}: {
  onClose: () => void;
  preset?: PaymentPreset;
}) {
  const idPrefix = useId();
  const [payerChoice, setPayerChoice] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState<string | null>(null);
  const [method, setMethod] = useState("");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});

  const tenants = useQuery({
    queryKey: [...KEYS.tenants, "selecteur-paiements"],
    queryFn: fetchAllTenants,
  });
  const methods = usePaymentMethods();
  const presetLease = useQuery({
    queryKey: [...KEYS.leases, "detail-paiement", preset?.leaseId],
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/leases/{id}/", {
          params: { path: { id: preset?.leaseId ?? 0 } },
        }),
      ),
    enabled: preset !== undefined,
  });

  // Payeur : choix de l'utilisateur, sinon le locataire du bail de l'échéance de départ.
  const presetPayer = presetLease.data ? String(presetLease.data.tenant) : "";
  const payerValue = payerChoice ?? presetPayer;
  const payer = payerValue ? Number(payerValue) : null;
  const usingPreset = preset !== undefined && payerChoice === null;

  const open = useOpenSchedules(payer);
  const presetRemaining = usingPreset
    ? open.data?.find((entry) => entry.schedule.id === preset.scheduleId)
        ?.remaining
    : undefined;

  // Montant : saisie de l'utilisateur, sinon le reste dû de l'échéance de départ.
  const amountText =
    amountInput ??
    (presetRemaining !== undefined ? centsToInput(presetRemaining) : "");
  const amount = parseAmountInput(amountText);
  const allocation = useAllocation({
    open: open.data,
    budget: amount,
    presetId: usingPreset ? preset.scheduleId : undefined,
  });

  const noMethods = methods.isSuccess && methods.data.length === 0;

  const save = useApiMutation({
    mutationFn: async (body: PaymentBody) =>
      unwrap(await api.POST("/api/v1/payments/payments/", { body })),
    invalidate: PAYMENT_INVALIDATE,
    success: (payment) => {
      const count = payment.allocations.length;
      return count
        ? `Paiement de ${formatCents(amount ?? 0)} enregistré et affecté à ${count} échéance${count > 1 ? "s" : ""}.`
        : `Paiement de ${formatCents(amount ?? 0)} enregistré, sans affectation.`;
    },
    onSuccess: onClose,
  });

  const errors: FieldErrors = { ...clientErrors, ...save.fieldErrors };
  // L'API ne reconnaît comme payeur qu'un locataire ayant un bail dans l'agence (« clé primaire non valide »).
  if (save.fieldErrors.payer)
    errors.payer =
      "Ce locataire n'a aucun bail dans votre agence : il ne peut pas être enregistré comme payeur.";
  const clearError = (field: FormField) =>
    setClientErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });

  const submit = () => {
    const found: FieldErrors = {};
    if (payer === null) found.payer = "Choisissez le locataire qui a payé.";
    if (amount === null) found.amount_paid = "Indiquez le montant encaissé.";
    else if (Number.isNaN(amount))
      found.amount_paid = "Montant invalide (exemple : 150000).";
    else if (amount <= 0) found.amount_paid = "Le montant doit être positif.";
    if (!method) found.payment_method = "Choisissez le moyen de paiement.";
    if (allocation.hasErrors)
      found.allocations = "Corrigez l'affectation avant d'enregistrer.";
    setClientErrors(found);
    save.resetErrors();
    if (Object.keys(found).length || payer === null || amount === null) return;
    save.mutate({
      payer,
      amount_paid: centsToDecimal(amount),
      payment_method: Number(method),
      reference: reference.trim() || null,
      note: note.trim(),
      allocations: allocation.items,
    });
  };

  const tenantOptions = (tenants.data ?? []).map((tenant) => ({
    value: tenant.id,
    label: `${tenantName(tenant)} · ${tenant.phone}`,
  }));
  // Payeur prérempli pas encore dans la liste chargée (liste plafonnée) : on l'ajoute pour l'afficher.
  if (
    presetLease.data &&
    !tenantOptions.some((option) => String(option.value) === presetPayer)
  ) {
    tenantOptions.unshift({
      value: presetLease.data.tenant,
      label: presetLease.data.tenant_name,
    });
  }
  const methodOptions = (methods.data ?? []).map((entry) => ({
    value: entry.id,
    label: entry.label,
  }));

  const blocked = noMethods || save.isPending;
  const formError =
    save.formError ??
    (tenants.error
      ? `Impossible de charger les locataires : ${tenants.error.message}`
      : undefined) ??
    (presetLease.error
      ? `Impossible de charger le bail de l'échéance : ${presetLease.error.message}`
      : undefined);

  return (
    <Modal open onClose={onClose} title="Enregistrer un paiement" size="lg">
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (!blocked) submit();
        }}
      >
        <div className="ax-modal__body flex flex-col gap-4">
          {formError && (
            <div className="ax-alert ax-alert--danger" role="alert">
              <div className="ax-alert__content">
                <p className="ax-alert__message">{formError}</p>
              </div>
            </div>
          )}
          {noMethods && (
            <div className="ax-alert ax-alert--warning" role="alert">
              <div className="ax-alert__content">
                <p className="ax-alert__title">
                  Aucun moyen de paiement configuré
                </p>
                <p className="ax-alert__message">
                  Aucun moyen de paiement configuré, contactez Dahoo pour
                  activer Wave, Orange Money, espèces…
                </p>
              </div>
            </div>
          )}

          <SelectField
            label="Payeur"
            required
            value={payerValue}
            onChange={(event) => {
              setPayerChoice(event.target.value);
              allocation.reset();
              clearError("payer");
            }}
            options={tenantOptions}
            placeholder={
              tenants.isLoading || presetLease.isLoading
                ? "Chargement des locataires…"
                : "Choisir un locataire"
            }
            disabled={tenants.isLoading}
            error={errors.payer}
            hint="Le payeur doit être locataire d'un bail de l'agence."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Montant encaissé (FCFA)"
              required
              inputMode="decimal"
              autoComplete="off"
              placeholder="150 000"
              className="ax-num"
              value={amountText}
              onChange={(event) => {
                setAmountInput(event.target.value);
                clearError("amount_paid");
              }}
              error={errors.amount_paid}
              hint={
                amount !== null && !Number.isNaN(amount) && amount > 0
                  ? formatCents(amount)
                  : undefined
              }
            />
            <SelectField
              label="Moyen de paiement"
              required
              value={method}
              onChange={(event) => {
                setMethod(event.target.value);
                clearError("payment_method");
              }}
              options={methodOptions}
              placeholder={methods.isLoading ? "Chargement…" : "Choisir"}
              disabled={methods.isLoading || noMethods}
              error={
                errors.payment_method ??
                (methods.error
                  ? `Moyens indisponibles : ${methods.error.message}`
                  : undefined)
              }
            />
          </div>

          <TextField
            label="Référence de transaction"
            placeholder="Ex. : identifiant Wave ou Orange Money"
            autoComplete="off"
            maxLength={100}
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            error={errors.reference}
          />
          <TextareaField
            label="Note"
            rows={2}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            error={errors.note}
            hint="Visible uniquement par votre agence."
          />

          {payer === null ? (
            <p className="border-border-default text-text-muted m-0 rounded-md border border-dashed p-3 text-sm">
              Choisissez le payeur pour afficher ses échéances à régler.
            </p>
          ) : (
            <AllocationPicker
              state={allocation}
              query={open}
              budget={amount}
              error={
                save.fieldErrors.allocations ??
                (allocation.hasErrors ? clientErrors.allocations : undefined)
              }
              idPrefix={idPrefix}
            />
          )}
        </div>
        <div className="ax-modal__footer">
          <button
            type="button"
            className="ax-btn ax-btn--ghost"
            onClick={onClose}
          >
            <span className="ax-btn__label">Annuler</span>
          </button>
          <button
            type="submit"
            className={`ax-btn ax-btn--primary${save.isPending ? " is-loading" : ""}`}
            disabled={blocked}
            aria-busy={save.isPending}
          >
            <span className="ax-btn__spinner" aria-hidden="true" />
            <span className="ax-btn__label">Enregistrer le paiement</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
