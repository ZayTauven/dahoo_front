"use client";

import { IconCash, IconFilterOff, IconPlus } from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { EmptyState } from "@/components/app/EmptyState";
import { PageHead } from "@/components/app/shell/PageHead";
import { DataTable, type Column } from "@/components/app/ui/DataTable";
import { SelectField, TextField } from "@/components/app/ui/fields";
import { ListToolbar } from "@/components/app/ui/ListToolbar";
import { useListParams } from "@/hooks/useListParams";
import { useNewParam } from "@/hooks/useNewParam";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { useSession } from "@/lib/auth/useSession";
import { formatDate, formatNumber } from "@/lib/format";

import { KEYS, usePaymentMethods, type Payment } from "./_components/data";
import { formatCents, toCents } from "./_components/money";
import {
  AllocateRemainderModal,
  PaymentDetailModal,
  unallocatedCents,
} from "./_components/PaymentDetail";
import { PaymentsStats } from "./_components/PaymentsStats";
import { RecordPaymentModal } from "./_components/RecordPaymentModal";

/** Paramètre d'URL du paiement ouvert en détail (lien partageable, fermé par le retour arrière). */
const DETAIL_PARAM = "paiement";

export function PaymentsScreen() {
  const { can, isReadOnly } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const shortcut = useNewParam();
  const list = useListParams([
    "payment_method",
    "payment_date_after",
    "payment_date_before",
  ] as const);
  const [recording, setRecording] = useState(false);
  const [allocating, setAllocating] = useState<Payment | null>(null);

  const { payment_method, payment_date_after, payment_date_before } =
    list.filters;
  const query = {
    page: list.page > 1 ? list.page : undefined,
    search: list.search || undefined,
    payment_method: payment_method ? Number(payment_method) : undefined,
    payment_date_after: payment_date_after || undefined,
    payment_date_before: payment_date_before || undefined,
  };

  const payments = useQuery({
    queryKey: [...KEYS.payments, query],
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/payments/payments/", { params: { query } }),
      ),
    placeholderData: keepPreviousData,
  });
  const methods = usePaymentMethods();
  const methodLabel = (id: number) =>
    methods.data?.find((entry) => entry.id === id)?.label ?? "—";

  const detailId = Number(params.get(DETAIL_PARAM)) || null;
  const detailHref = (payment: Payment) => {
    const next = new URLSearchParams(params.toString());
    next.set(DETAIL_PARAM, String(payment.id));
    return `${pathname}?${next.toString()}`;
  };
  const closeDetail = () => {
    const next = new URLSearchParams(params.toString());
    next.delete(DETAIL_PARAM);
    const rest = next.toString();
    router.replace(rest ? `${pathname}?${rest}` : pathname, { scroll: false });
  };

  const canRecord = can("payment.create") && !isReadOnly;
  const canAllocate = can("payment.allocate") && !isReadOnly;
  const filtered = Boolean(
    list.search || payment_method || payment_date_after || payment_date_before,
  );

  const columns: Column<Payment>[] = [
    {
      key: "date",
      header: "Date",
      cell: (payment) => (
        <div className="flex flex-col">
          <span className="ax-num text-text-strong">
            {formatDate(payment.payment_date, "short")}
          </span>
          <span className="text-text-subtle text-xs md:hidden">
            {methodLabel(payment.payment_method)}
          </span>
        </div>
      ),
    },
    {
      key: "payer",
      header: "Payeur",
      cell: (payment) => (
        <div className="flex min-w-0 flex-col">
          <span className="text-text-strong font-medium">
            {payment.payer_name}
          </span>
          {payment.reference && (
            <span className="text-text-subtle font-mono text-xs break-all md:hidden">
              {payment.reference}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "amount",
      header: "Montant",
      numeric: true,
      cell: (payment) => (
        <span className="text-text-strong font-medium">
          {formatCents(toCents(payment.amount_paid))}
        </span>
      ),
    },
    {
      key: "method",
      header: "Moyen",
      hideOnMobile: true,
      cell: (payment) => methodLabel(payment.payment_method),
    },
    {
      key: "reference",
      header: "Référence",
      hideOnMobile: true,
      cell: (payment) =>
        payment.reference ? (
          <span className="font-mono text-xs break-all">
            {payment.reference}
          </span>
        ) : (
          <span className="text-text-subtle">—</span>
        ),
    },
    {
      key: "allocations",
      header: "Échéances",
      hideOnMobile: true,
      cell: (payment) => {
        const left = unallocatedCents(payment);
        const count = payment.allocations.length;
        return (
          <div className="flex flex-col items-start gap-1">
            <span className="ax-num">
              {count
                ? `${formatNumber(count)} échéance${count > 1 ? "s" : ""}`
                : "Aucune"}
            </span>
            {left > 0 && (
              <span className="ax-badge ax-badge--soft ax-badge--warning ax-badge--sm">
                <span className="ax-num">{formatCents(left)}</span>&nbsp;non
                affecté
              </span>
            )}
          </div>
        );
      },
    },
  ];

  const recordButton = canRecord && (
    <button
      type="button"
      className="ax-btn ax-btn--primary"
      onClick={() => setRecording(true)}
    >
      <IconPlus className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
      <span className="ax-btn__label">Enregistrer un paiement</span>
    </button>
  );

  const filters = (
    <>
      <SelectField
        label="Moyen"
        className="w-full sm:w-44"
        value={payment_method}
        onChange={(event) =>
          list.setFilter("payment_method", event.target.value)
        }
        options={(methods.data ?? []).map((entry) => ({
          value: entry.id,
          label: entry.label,
        }))}
        placeholder="Tous"
      />
      <TextField
        label="Du"
        type="date"
        className="w-[calc(50%-0.375rem)] sm:w-40"
        value={payment_date_after}
        max={payment_date_before || undefined}
        onChange={(event) =>
          list.setFilter("payment_date_after", event.target.value)
        }
      />
      <TextField
        label="Au"
        type="date"
        className="w-[calc(50%-0.375rem)] sm:w-40"
        value={payment_date_before}
        min={payment_date_after || undefined}
        onChange={(event) =>
          list.setFilter("payment_date_before", event.target.value)
        }
      />
    </>
  );

  return (
    <>
      <PageHead
        title="Paiements"
        subtitle="Les encaissements de l'agence (Wave, Orange Money, espèces…) et leur affectation aux échéances des baux."
        crumbs={[
          { label: "Espace agence", href: "/espace" },
          { label: "Paiements" },
        ]}
        actions={recordButton}
      />
      <PaymentsStats />
      <section className="ax-card" aria-label="Liste des paiements">
        <div className="ax-card__body flex flex-col gap-5">
          <ListToolbar
            search={list.search}
            onSearch={list.setSearch}
            searchPlaceholder="Rechercher une référence ou une note"
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
          <DataTable
            caption="Paiements de l'agence. Sélectionnez une ligne pour voir le détail."
            columns={columns}
            rows={payments.data?.results}
            rowKey={(payment) => payment.id}
            rowHref={detailHref}
            loading={payments.isLoading}
            error={payments.error}
            onRetry={() => payments.refetch()}
            count={payments.data?.count}
            page={list.page}
            onPageChange={list.setPage}
            empty={
              <EmptyState
                icon={IconCash}
                title={
                  filtered
                    ? "Aucun paiement trouvé"
                    : "Aucun paiement enregistré"
                }
                action={!filtered && recordButton}
              >
                {filtered
                  ? "Aucun encaissement ne correspond à ces critères. Élargissez la période ou effacez les filtres."
                  : "Enregistrez chaque encaissement reçu d'un locataire : il sera affecté à ses échéances de loyer ou de charges."}
              </EmptyState>
            }
          />
        </div>
      </section>

      {/* `?nouveau=1` (raccourci du tableau de bord) ouvre directement la saisie, dès que les droits sont connus. */}
      {(recording || (shortcut.requested && canRecord)) && (
        <RecordPaymentModal
          onClose={() => {
            setRecording(false);
            shortcut.clear();
          }}
        />
      )}

      {detailId !== null && !allocating && (
        <PaymentDetailModal
          paymentId={detailId}
          onClose={closeDetail}
          onAllocate={canAllocate ? setAllocating : undefined}
        />
      )}

      {allocating && (
        <AllocateRemainderModal
          payment={allocating}
          onClose={() => setAllocating(null)}
          onDone={() => setAllocating(null)}
        />
      )}
    </>
  );
}
