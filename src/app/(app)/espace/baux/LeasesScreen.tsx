"use client";

import { IconFileText, IconPlus } from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { EmptyState } from "@/components/app/EmptyState";
import { PageHead } from "@/components/app/shell/PageHead";
import { DataTable, type Column } from "@/components/app/ui/DataTable";
import { SelectField } from "@/components/app/ui/fields";
import { ListToolbar } from "@/components/app/ui/ListToolbar";
import { StatusBadge } from "@/components/app/ui/StatusBadge";
import { useListParams } from "@/hooks/useListParams";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { useSession } from "@/lib/auth/useSession";
import { formatDate, formatMoney } from "@/lib/format";
import { enumLabel, enumOptions, LEASE_STATUS, PAYMENT_FREQUENCY } from "@/lib/labels";

import { asLeaseStatus, fetchAllTenants, fetchAllUnits, KEYS, monthlyTotal, type Lease } from "./_components/data";
import { LeaseFormModal } from "./_components/LeaseFormModal";

export function LeasesScreen() {
  const { can, isReadOnly } = useSession();
  const list = useListParams(["status", "tenant", "unit"] as const);
  const [creating, setCreating] = useState(false);

  const query = {
    page: list.page > 1 ? list.page : undefined,
    status: asLeaseStatus(list.filters.status),
    tenant: Number(list.filters.tenant) || undefined,
    unit: Number(list.filters.unit) || undefined,
  };
  const filtered = Boolean(query.status || query.tenant || query.unit);

  const leases = useQuery({
    queryKey: [...KEYS.leases, query],
    queryFn: async () => unwrap(await api.GET("/api/v1/leases/", { params: { query } })),
    placeholderData: keepPreviousData,
  });

  // Options des filtres (toutes les pages : une agence gère rarement plus de quelques centaines de lots).
  const tenants = useQuery({ queryKey: [...KEYS.tenants, "options"], queryFn: fetchAllTenants });
  const units = useQuery({ queryKey: [...KEYS.units, "options", "all"], queryFn: () => fetchAllUnits() });

  const columns: Column<Lease>[] = [
    {
      key: "tenant",
      header: "Locataire",
      cell: (lease) => (
        <div className="flex min-w-0 flex-col">
          <span className="text-text-strong font-medium">{lease.tenant_name}</span>
          <span className="text-text-subtle text-xs">Bail n°{lease.id}</span>
          <span className="text-text-muted text-xs md:hidden">{lease.unit_label}</span>
        </div>
      ),
    },
    { key: "unit", header: "Lot", hideOnMobile: true, cell: (lease) => <span className="text-text">{lease.unit_label}</span> },
    {
      key: "amount",
      header: "Loyer + charges / mois",
      numeric: true,
      cell: (lease) => (
        <div className="flex flex-col items-end">
          <span className="text-text-strong font-medium">{formatMoney(monthlyTotal(lease))}</span>
          {Number(lease.charges_amount) > 0 && (
            <span className="text-text-subtle text-xs">dont {formatMoney(lease.charges_amount)} de charges</span>
          )}
        </div>
      ),
    },
    {
      key: "period",
      header: "Période",
      hideOnMobile: true,
      cell: (lease) => (
        <span className="ax-num whitespace-nowrap">
          {formatDate(lease.start_date, "short")} → {lease.end_date ? formatDate(lease.end_date, "short") : "sans terme"}
        </span>
      ),
    },
    { key: "frequency", header: "Fréquence", hideOnMobile: true, cell: (lease) => enumLabel(PAYMENT_FREQUENCY, lease.payment_frequency) },
    { key: "status", header: "Statut", cell: (lease) => <StatusBadge entries={LEASE_STATUS} value={lease.status} /> },
  ];

  const addButton = can("lease.create") && !isReadOnly && (
    <button type="button" className="ax-btn ax-btn--primary" onClick={() => setCreating(true)}>
      <IconPlus className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
      <span className="ax-btn__label">Nouveau bail</span>
    </button>
  );

  const filters = (
    <>
      <SelectField
        label="Statut"
        className="min-w-[160px] flex-1 sm:flex-none"
        value={list.filters.status}
        onChange={(event) => list.setFilter("status", event.target.value)}
        placeholder="Tous les statuts"
        options={enumOptions(LEASE_STATUS)}
      />
      <SelectField
        label="Locataire"
        className="min-w-[180px] flex-1 sm:flex-none"
        value={list.filters.tenant}
        onChange={(event) => list.setFilter("tenant", event.target.value)}
        placeholder="Tous les locataires"
        options={(tenants.data ?? []).map((tenant) => ({ value: tenant.id, label: `${tenant.first_name} ${tenant.last_name}` }))}
      />
      <SelectField
        label="Lot"
        className="min-w-[180px] flex-1 sm:max-w-xs sm:flex-none"
        value={list.filters.unit}
        onChange={(event) => list.setFilter("unit", event.target.value)}
        placeholder="Tous les lots"
        options={(units.data ?? []).map((unit) => ({ value: unit.id, label: unit.label }))}
      />
    </>
  );

  return (
    <>
      <PageHead
        title="Baux"
        subtitle="Les contrats de location de votre agence : créez-les en brouillon, activez-les à la signature, suivez leurs échéances."
        crumbs={[{ label: "Espace agence", href: "/espace" }, { label: "Baux" }]}
        actions={addButton}
      />
      <section className="ax-card" aria-label="Liste des baux">
        <div className="ax-card__body flex flex-col gap-5">
          <ListToolbar
            filters={filters}
            actions={
              filtered && (
                <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={list.reset}>
                  <span className="ax-btn__label">Effacer les filtres</span>
                </button>
              )
            }
          />
          <DataTable
            caption="Baux de l'agence"
            columns={columns}
            rows={leases.data?.results}
            rowKey={(lease) => lease.id}
            rowHref={(lease) => `/espace/baux/${lease.id}`}
            loading={leases.isLoading}
            error={leases.error}
            onRetry={() => leases.refetch()}
            count={leases.data?.count}
            page={list.page}
            onPageChange={list.setPage}
            empty={
              <EmptyState icon={IconFileText} title={filtered ? "Aucun bail ne correspond" : "Aucun bail pour l'instant"} action={!filtered && addButton}>
                {filtered
                  ? "Modifiez ou effacez les filtres pour voir d'autres baux."
                  : "Créez un bail pour un lot libre et un locataire enregistré, puis activez-le à la signature."}
              </EmptyState>
            }
          />
        </div>
      </section>

      {creating && <LeaseFormModal onClose={() => setCreating(false)} />}
    </>
  );
}
