"use client";

import { IconArrowsSplit2 } from "@tabler/icons-react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useId, useState, type ReactNode } from "react";

import { FormModal, Modal } from "@/components/app/ui/Modal";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { useApiMutation } from "@/lib/api/useApiMutation";
import { formatDate } from "@/lib/format";
import { enumLabel, SCHEDULE_TYPE } from "@/lib/labels";

import { AllocationPicker, useAllocation } from "./Allocation";
import {
  KEYS,
  PAYMENT_INVALIDATE,
  useOpenSchedules,
  usePaymentMethods,
  type Payment,
} from "./data";
import { formatCents, toCents } from "./money";

/** Montant d'un paiement qui n'est affecté à aucune échéance, en centimes. */
export function unallocatedCents(
  payment: Pick<Payment, "amount_paid" | "allocations">,
): number {
  return (
    toCents(payment.amount_paid) -
    payment.allocations.reduce(
      (sum, allocation) => sum + toCents(allocation.allocated_amount),
      0,
    )
  );
}

const dateTime = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(value: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : dateTime.format(parsed);
}

/** Fiche d'un paiement : informations, affectations et montant non affecté. */
export function PaymentDetailModal({
  paymentId,
  onClose,
  onAllocate,
}: {
  paymentId: number;
  onClose: () => void;
  /** Affiché seulement si l'utilisateur peut affecter (droit `payment.allocate`, accès non expiré). */
  onAllocate?: (payment: Payment) => void;
}) {
  const payment = useQuery({
    queryKey: [...KEYS.payments, "detail", paymentId],
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/payments/payments/{id}/", {
          params: { path: { id: paymentId } },
        }),
      ),
  });
  const methods = usePaymentMethods();
  const allocations = payment.data?.allocations ?? [];
  const schedules = useQueries({
    queries: allocations.map((allocation) => ({
      queryKey: [...KEYS.schedules, "detail", allocation.schedule],
      queryFn: async () =>
        unwrap(
          await api.GET("/api/v1/payments/schedules/{id}/", {
            params: { path: { id: allocation.schedule } },
          }),
        ),
      staleTime: 60_000,
    })),
  });

  const data = payment.data;
  const left = data ? unallocatedCents(data) : 0;
  const methodLabel =
    data &&
    (methods.data?.find((entry) => entry.id === data.payment_method)?.label ??
      `Moyen n°${data.payment_method}`);

  return (
    <Modal
      open
      onClose={onClose}
      title={data ? `Paiement de ${data.payer_name}` : "Paiement"}
      size="lg"
      footer={
        <>
          <button
            type="button"
            className="ax-btn ax-btn--ghost"
            onClick={onClose}
          >
            <span className="ax-btn__label">Fermer</span>
          </button>
          {data && left > 0 && onAllocate && (
            <button
              type="button"
              className="ax-btn ax-btn--primary"
              onClick={() => onAllocate(data)}
            >
              <IconArrowsSplit2
                className="ax-btn__icon"
                stroke={1.75}
                aria-hidden="true"
              />
              <span className="ax-btn__label">Affecter le reste</span>
            </button>
          )}
        </>
      }
    >
      <div
        className="ax-modal__body flex flex-col gap-5"
        aria-busy={payment.isLoading}
      >
        {payment.isLoading ? (
          <div className="flex flex-col gap-3">
            <span className="sr-only">Chargement du paiement…</span>
            {[0, 1, 2, 3].map((index) => (
              <span
                key={index}
                className="ax-skeleton ax-skeleton--text"
                style={{ inlineSize: `${80 - index * 12}%` }}
              />
            ))}
          </div>
        ) : payment.error || !data ? (
          <div className="ax-alert ax-alert--danger" role="alert">
            <div className="ax-alert__content">
              <p className="ax-alert__message">
                {payment.error?.message ?? "Paiement introuvable."}
              </p>
            </div>
            <div className="ax-alert__actions">
              <button
                type="button"
                className="ax-btn ax-btn--sm ax-btn--ghost"
                onClick={() => payment.refetch()}
              >
                <span className="ax-btn__label">Réessayer</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <dl className="m-0 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <Item label="Montant encaissé">
                <span className="ax-num font-display text-text-strong text-lg font-semibold">
                  {formatCents(toCents(data.amount_paid))}
                </span>
              </Item>
              <Item label="Date">{formatDateTime(data.payment_date ?? data.created_at)}</Item>
              <Item label="Payeur">{data.payer_name}</Item>
              <Item label="Moyen de paiement">{methodLabel}</Item>
              <Item label="Référence">
                {data.reference ? (
                  <span className="font-mono text-sm break-all">
                    {data.reference}
                  </span>
                ) : (
                  "—"
                )}
              </Item>
              {data.note && (
                <Item label="Note" wide>
                  <span className="whitespace-pre-line">{data.note}</span>
                </Item>
              )}
            </dl>

            <section
              className="flex flex-col gap-3"
              aria-labelledby="paiement-affectations"
            >
              <h3
                id="paiement-affectations"
                className="text-text-strong m-0 text-base font-semibold"
              >
                Échéances couvertes
              </h3>
              {allocations.length === 0 ? (
                <p className="text-text-muted m-0 text-sm">
                  Ce paiement n&apos;est affecté à aucune échéance.
                </p>
              ) : (
                <ul className="border-border-default m-0 flex list-none flex-col rounded-md border p-0">
                  {allocations.map((allocation, index) => {
                    const schedule = schedules[index]?.data;
                    return (
                      <li
                        key={allocation.id}
                        className="border-border-default flex items-start justify-between gap-3 border-b p-3 last:border-b-0"
                      >
                        <span className="flex min-w-0 flex-col">
                          {schedule ? (
                            <>
                              <span className="text-text-strong text-sm font-medium">
                                {enumLabel(
                                  SCHEDULE_TYPE,
                                  schedule.schedule_type,
                                )}{" "}
                                du {formatDate(schedule.due_date)}
                              </span>
                              <span className="text-text-subtle truncate text-xs">
                                {schedule.contract_label}
                              </span>
                            </>
                          ) : schedules[index]?.isLoading ? (
                            <span
                              className="ax-skeleton ax-skeleton--text"
                              style={{ inlineSize: 180 }}
                            />
                          ) : (
                            <span className="text-text text-sm">
                              Échéance n°{allocation.schedule}
                            </span>
                          )}
                        </span>
                        <span className="ax-num text-text-strong shrink-0 text-sm font-medium">
                          {formatCents(toCents(allocation.allocated_amount))}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
              <p
                className={`m-0 text-sm ${left > 0 ? "text-text-strong font-medium" : "text-text-muted"}`}
              >
                {left > 0 ? (
                  <>
                    Montant non affecté :{" "}
                    <span className="ax-num">{formatCents(left)}</span>
                  </>
                ) : (
                  "Le paiement est entièrement affecté."
                )}
              </p>
            </section>
          </>
        )}
      </div>
    </Modal>
  );
}

function Item({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-text-subtle text-xs font-medium tracking-wide uppercase">
        {label}
      </dt>
      <dd className="text-text m-0 mt-0.5">{children}</dd>
    </div>
  );
}

/** Affectation du montant restant d'un paiement à des échéances non payées de son payeur. */
export function AllocateRemainderModal({
  payment,
  onClose,
  onDone,
}: {
  payment: Payment;
  onClose: () => void;
  onDone: () => void;
}) {
  const idPrefix = useId();
  const budget = unallocatedCents(payment);
  const open = useOpenSchedules(payment.payer);
  const allocation = useAllocation({ open: open.data, budget });

  const save = useApiMutation({
    mutationFn: async () =>
      unwrap(
        await api.POST("/api/v1/payments/payments/{id}/allocate/", {
          params: { path: { id: payment.id } },
          body: { allocations: allocation.items },
        }),
      ),
    invalidate: PAYMENT_INVALIDATE,
    success: "Affectation enregistrée.",
    onSuccess: onDone,
  });

  const [attempted, setAttempted] = useState(false);
  const nothing = allocation.items.length === 0;
  const localError = allocation.hasErrors
    ? "Corrigez l'affectation avant d'enregistrer."
    : nothing
      ? "Cochez au moins une échéance."
      : undefined;

  return (
    <FormModal
      open
      onClose={onClose}
      title="Affecter le reste du paiement"
      submitLabel="Affecter"
      size="lg"
      pending={save.isPending}
      error={save.formError}
      onSubmit={() => {
        setAttempted(true);
        if (localError) return;
        save.mutate(undefined);
      }}
    >
      <p className="text-text m-0">
        Paiement de <strong>{payment.payer_name}</strong> du{" "}
        {formatDate(payment.payment_date)} : il reste{" "}
        <strong className="ax-num">{formatCents(budget)}</strong> à affecter sur{" "}
        {formatCents(toCents(payment.amount_paid))}.
      </p>
      <AllocationPicker
        state={allocation}
        query={open}
        budget={budget}
        budgetLabel="Montant disponible"
        error={
          save.fieldErrors.allocations ??
          (attempted && open.data?.length ? localError : undefined)
        }
        idPrefix={idPrefix}
      />
    </FormModal>
  );
}
