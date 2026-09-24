"use client";

import { IconPencil, IconPlus, IconReceipt } from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";

import { EmptyState } from "@/components/app/EmptyState";
import { DataTable, type Column } from "@/components/app/ui/DataTable";
import { SelectField, TextField } from "@/components/app/ui/fields";
import { ConfirmDialog, FormModal } from "@/components/app/ui/Modal";
import { StatusBadge } from "@/components/app/ui/StatusBadge";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { useApiMutation } from "@/lib/api/useApiMutation";
import { enumLabel, enumOptions, SUBSCRIPTION_STATUS } from "@/lib/labels";

import { KEYS, planLabel, planPrice, subscriptionPeriod, toDateInput, type Organization, type Plan, type Subscription, type SubscriptionStatus } from "./data";

const STATUS_CONSEQUENCE: Record<SubscriptionStatus, string> = {
  ACTIVE: "L'abonnement couvre de nouveau l'accès complet de l'agence pendant sa période.",
  SUSPENDED: "L'abonnement ne couvre plus l'accès : sans autre abonnement actif ni essai en cours, l'agence passe en lecture seule.",
  EXPIRED: "L'abonnement est considéré comme terminé : sans autre abonnement actif ni essai en cours, l'agence passe en lecture seule.",
};

/** Abonnements d'une agence : liste, attribution, modification et changement de statut. */
export function SubscriptionsCard({ organization }: { organization: Organization }) {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Subscription | "new" | null>(null);
  const [statusChange, setStatusChange] = useState<{ subscription: Subscription; status: SubscriptionStatus } | null>(null);

  const subscriptions = useQuery({
    queryKey: [...KEYS.subscriptions, organization.id, page],
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/platform/organizations/{id}/subscriptions/", {
          params: { path: { id: organization.id }, query: page > 1 ? { page } : undefined },
        }),
      ),
    placeholderData: keepPreviousData,
  });
  const plans = useQuery({
    queryKey: KEYS.plans,
    queryFn: async () => unwrap(await api.GET("/api/v1/subscriptions/plans/")),
    staleTime: 5 * 60_000,
  });
  const plansById = useMemo(() => new Map((plans.data ?? []).map((plan) => [plan.id, plan])), [plans.data]);

  const changeStatus = useApiMutation({
    mutationFn: async ({ subscription, status }: { subscription: Subscription; status: SubscriptionStatus }) =>
      unwrap(await api.PATCH("/api/v1/platform/subscriptions/{id}/", { params: { path: { id: subscription.id } }, body: { status } })),
    // Le statut d'accès de l'agence dépend de ses abonnements.
    invalidate: [KEYS.subscriptions, KEYS.organizations],
    success: (result) => `Abonnement passé en « ${enumLabel(SUBSCRIPTION_STATUS, result.status)} ».`,
    onSuccess: () => setStatusChange(null),
  });

  const columns: Column<Subscription>[] = [
    {
      key: "plan",
      header: "Offre",
      cell: (subscription) => {
        const plan = plansById.get(subscription.plan);
        return (
          <div className="flex flex-col">
            <span className="text-text-strong font-medium">{plans.isLoading ? "…" : planLabel(plan)}</span>
            {plan && <span className="text-text-subtle text-xs">{planPrice(plan)}</span>}
          </div>
        );
      },
    },
    { key: "period", header: "Période", hideOnMobile: true, cell: (subscription) => subscriptionPeriod(subscription) },
    { key: "status", header: "Statut", cell: (subscription) => <StatusBadge entries={SUBSCRIPTION_STATUS} value={subscription.status} /> },
    {
      key: "actions",
      header: "Actions",
      cell: (subscription) => (
        <div className="flex items-center justify-end gap-1">
          <select
            className="ax-select ax-select--sm w-auto"
            aria-label={`Changer le statut de l'abonnement ${planLabel(plansById.get(subscription.plan))}`}
            value={subscription.status ?? "ACTIVE"}
            onChange={(event) => setStatusChange({ subscription, status: event.target.value as SubscriptionStatus })}
          >
            {enumOptions(SUBSCRIPTION_STATUS).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="ax-btn ax-btn--ghost ax-btn--icon ax-btn--sm"
            onClick={() => setEditing(subscription)}
            aria-label={`Modifier l'abonnement ${planLabel(plansById.get(subscription.plan))}`}
          >
            <IconPencil className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ];

  const addButton = (
    <button type="button" className="ax-btn ax-btn--primary ax-btn--sm" onClick={() => setEditing("new")}>
      <IconPlus className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
      <span className="ax-btn__label">Attribuer un abonnement</span>
    </button>
  );

  return (
    <section className="ax-card" aria-labelledby="carte-abonnements">
      <div className="ax-card__header flex-wrap">
        <div className="ax-card__titles">
          <h2 id="carte-abonnements" className="ax-card__title">
            Abonnements
          </h2>
          <p className="ax-card__subtitle">Attribués par l&apos;équipe Dahoo après paiement. Un abonnement actif en cours débloque l&apos;accès complet.</p>
        </div>
        <div className="ax-card__actions">{addButton}</div>
      </div>
      <div className="ax-card__body">
        <DataTable
          caption={`Abonnements de ${organization.name}`}
          columns={columns}
          rows={subscriptions.data?.results}
          rowKey={(subscription) => subscription.id}
          loading={subscriptions.isLoading}
          error={subscriptions.error}
          onRetry={() => subscriptions.refetch()}
          count={subscriptions.data?.count}
          page={page}
          onPageChange={setPage}
          empty={
            <EmptyState icon={IconReceipt} title="Aucun abonnement">
              {organization.access_status === "TRIAL"
                ? "L'agence est en période d'essai. Attribuez un abonnement une fois l'offre choisie et réglée."
                : "Attribuez un abonnement pour donner à l'agence un accès complet."}
            </EmptyState>
          }
        />
      </div>

      {editing && (
        <SubscriptionFormModal
          organization={organization}
          subscription={editing === "new" ? null : editing}
          plans={plans.data}
          plansLoading={plans.isLoading}
          plansError={plans.error?.message}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(statusChange)}
        onClose={() => {
          setStatusChange(null);
          changeStatus.resetErrors();
        }}
        onConfirm={() => statusChange && changeStatus.mutate(statusChange)}
        pending={changeStatus.isPending}
        title={`Passer l'abonnement en « ${enumLabel(SUBSCRIPTION_STATUS, statusChange?.status)} » ?`}
        confirmLabel="Changer le statut"
        danger={statusChange?.status !== "ACTIVE"}
      >
        <p className="m-0">
          Abonnement {planLabel(statusChange ? plansById.get(statusChange.subscription.plan) : undefined)}{" "}
          {statusChange && subscriptionPeriod(statusChange.subscription)}.
        </p>
        {statusChange && <p className="mt-3 mb-0">{STATUS_CONSEQUENCE[statusChange.status]}</p>}
        {changeStatus.formError && <p className="text-danger mt-3 mb-0">{changeStatus.formError}</p>}
      </ConfirmDialog>
    </section>
  );
}

interface SubscriptionForm {
  plan: string;
  start_date: string;
  end_date: string;
  status: SubscriptionStatus;
}

function SubscriptionFormModal({
  organization,
  subscription,
  plans,
  plansLoading,
  plansError,
  onClose,
}: {
  organization: Organization;
  subscription: Subscription | null;
  plans: Plan[] | undefined;
  plansLoading: boolean;
  plansError?: string;
  onClose: () => void;
}) {
  const [form, setForm] = useState<SubscriptionForm>(
    subscription
      ? { plan: String(subscription.plan), start_date: subscription.start_date, end_date: subscription.end_date ?? "", status: subscription.status ?? "ACTIVE" }
      : { plan: "", start_date: toDateInput(new Date()), end_date: "", status: "ACTIVE" },
  );
  const set = (field: keyof SubscriptionForm) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const save = useApiMutation({
    mutationFn: async (body: { plan: number; start_date: string; end_date: string | null; status: SubscriptionStatus }) =>
      subscription
        ? unwrap(await api.PATCH("/api/v1/platform/subscriptions/{id}/", { params: { path: { id: subscription.id } }, body }))
        : unwrap(await api.POST("/api/v1/platform/organizations/{id}/subscriptions/", { params: { path: { id: organization.id } }, body })),
    invalidate: [KEYS.subscriptions, KEYS.organizations],
    success: subscription ? "Abonnement mis à jour." : `Abonnement attribué à ${organization.name}.`,
    onSuccess: onClose,
  });
  const errors = save.fieldErrors;
  const [planError, setPlanError] = useState<string>();

  // Offres proposées : les offres actives, plus l'offre actuelle de l'abonnement si elle a été retirée.
  const options = (plans ?? [])
    .filter((plan) => plan.active !== false || String(plan.id) === form.plan)
    .map((plan) => ({ value: plan.id, label: `${plan.name} · ${planPrice(plan)}${plan.active === false ? " (retirée)" : ""}` }));

  let notice: ReactNode = null;
  if (plansError) notice = <Notice tone="danger">Impossible de charger les offres : {plansError}</Notice>;
  else if (!plansLoading && options.length === 0)
    notice = <Notice tone="warning">Aucune offre active n&apos;est définie. Créez d&apos;abord une offre dans l&apos;administration Dahoo.</Notice>;

  return (
    <FormModal
      open
      onClose={onClose}
      title={subscription ? "Modifier l'abonnement" : "Attribuer un abonnement"}
      submitLabel={subscription ? "Enregistrer" : "Attribuer"}
      onSubmit={() => {
        if (!form.plan) return setPlanError("Choisissez une offre.");
        setPlanError(undefined);
        save.mutate({ plan: Number(form.plan), start_date: form.start_date, end_date: form.end_date || null, status: form.status });
      }}
      pending={save.isPending}
      error={save.formError}
    >
      {notice}
      <SelectField
        label="Offre"
        required
        options={options}
        placeholder={plansLoading ? "Chargement des offres…" : "Choisir une offre"}
        value={form.plan}
        onChange={set("plan")}
        error={planError ?? errors.plan}
        disabled={plansLoading}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Début" required type="date" value={form.start_date} onChange={set("start_date")} error={errors.start_date} />
        <TextField
          label="Fin"
          type="date"
          min={form.start_date || undefined}
          value={form.end_date}
          onChange={set("end_date")}
          error={errors.end_date}
          hint="Facultative : sans date de fin, l'abonnement court jusqu'à sa suspension."
        />
      </div>
      <SelectField
        label="Statut"
        required
        options={enumOptions(SUBSCRIPTION_STATUS)}
        value={form.status}
        onChange={set("status")}
        error={errors.status}
        hint="Seul un abonnement « Actif » dont la période est en cours donne accès à Dahoo."
      />
    </FormModal>
  );
}

function Notice({ tone, children }: { tone: "danger" | "warning"; children: ReactNode }) {
  return (
    <div className={`ax-alert ax-alert--${tone}`} role="status">
      <div className="ax-alert__content">
        <p className="ax-alert__message">{children}</p>
      </div>
    </div>
  );
}
