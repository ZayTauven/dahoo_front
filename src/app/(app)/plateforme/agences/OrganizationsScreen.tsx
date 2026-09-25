"use client";

import { IconBuildingCommunity, IconCircleCheck, IconClockX, IconHourglassHigh, IconPlayerPause, IconPlus } from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/app/EmptyState";
import { KpiCard } from "@/components/app/KpiCard";
import { PageHead } from "@/components/app/shell/PageHead";
import { DataTable, type Column } from "@/components/app/ui/DataTable";
import { ListToolbar } from "@/components/app/ui/ListToolbar";
import { StatusBadge } from "@/components/app/ui/StatusBadge";
import { useListParams } from "@/hooks/useListParams";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { formatDate } from "@/lib/format";
import { ACCESS_STATUS } from "@/lib/labels";

import { CreateOrganizationModal } from "../_components/CreateOrganizationModal";
import { fetchAllOrganizations, KEYS, ORGANIZATION_STATE, PLATFORM_CRUMB, trialInfo, type Organization } from "../_components/data";

export function OrganizationsScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  // `?nouvelle=1` (raccourci de la vue d'ensemble) ouvre directement la création d'une agence.
  const wantsNew = params.get("nouvelle") === "1";
  const list = useListParams([] as const);
  const [creating, setCreating] = useState(false);

  const organizations = useQuery({
    queryKey: [...KEYS.organizations, "list", list.query],
    queryFn: async () => unwrap(await api.GET("/api/v1/platform/organizations/", { params: { query: list.query } })),
    placeholderData: keepPreviousData,
  });

  // Indicateurs calculés sur l'ensemble des agences clientes (hors comptes internes Dahoo).
  const all = useQuery({ queryKey: [...KEYS.organizations, "all"], queryFn: fetchAllOrganizations });
  const stats = useMemo(() => {
    if (!all.data) return undefined;
    const clients = all.data.filter((organization) => !organization.is_internal);
    const running = clients.filter((organization) => organization.is_active !== false);
    return {
      trial: running.filter((organization) => organization.access_status === "TRIAL").length,
      active: running.filter((organization) => organization.access_status === "ACTIVE").length,
      expired: running.filter((organization) => organization.access_status === "EXPIRED").length,
      suspended: clients.length - running.length,
    };
  }, [all.data]);

  const columns: Column<Organization>[] = [
    {
      key: "name",
      header: "Agence",
      cell: (organization) => (
        <div className="flex flex-col gap-0.5">
          <span className="flex flex-wrap items-center gap-2">
            <Link
              href={`/plateforme/agences/${organization.id}`}
              className="text-text-strong font-medium no-underline hover:underline"
              onClick={(event) => event.stopPropagation()}
            >
              {organization.name}
            </Link>
            {organization.is_internal && <span className="ax-badge ax-badge--soft ax-badge--info">Interne</span>}
          </span>
          <span className="text-text-subtle text-xs">
            {organization.city || "Ville non renseignée"} · créée le {formatDate(organization.created_at, "short")}
          </span>
        </div>
      ),
    },
    { key: "access", header: "Accès", cell: (organization) => <StatusBadge entries={ACCESS_STATUS} value={organization.access_status} /> },
    {
      key: "trial",
      header: "Fin d'essai",
      hideOnMobile: true,
      cell: (organization) => {
        const trial = trialInfo(organization);
        if (!trial) return <span className="text-text-subtle">—</span>;
        return (
          <div className="flex flex-col">
            <span className={trial.expired ? "text-danger font-medium" : trial.tone === "warning" ? "text-text-strong font-medium" : "text-text"}>
              {trial.label}
            </span>
            {!organization.is_internal && <span className="text-text-subtle text-xs">{formatDate(organization.trial_ends_at, "short")}</span>}
          </div>
        );
      },
    },
    { key: "members", header: "Membres actifs", numeric: true, hideOnMobile: true, cell: (organization) => organization.member_count },
    {
      key: "state",
      header: "État",
      cell: (organization) => <StatusBadge entries={ORGANIZATION_STATE} value={organization.is_active === false ? "suspended" : "active"} />,
    },
  ];

  const createButton = (
    <button type="button" className="ax-btn ax-btn--primary" onClick={() => setCreating(true)}>
      <IconPlus className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
      <span className="ax-btn__label">Créer une agence</span>
    </button>
  );

  return (
    <>
      <PageHead
        title="Agences clientes"
        subtitle="Les agences qui utilisent Dahoo : suivi des essais, des abonnements et des accès."
        crumbs={[PLATFORM_CRUMB, { label: "Agences clientes" }]}
        actions={createButton}
      />

      <section aria-label="Indicateurs des agences clientes" className="mb-6 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="En essai" value={stats?.trial} icon={IconHourglassHigh} tone={1} loading={all.isLoading} />
          <KpiCard label="Abonnement actif" value={stats?.active} icon={IconCircleCheck} tone={2} loading={all.isLoading} />
          <KpiCard label="Essai expiré" value={stats?.expired} icon={IconClockX} tone={3} loading={all.isLoading} />
          <KpiCard label="Suspendues" value={stats?.suspended} icon={IconPlayerPause} tone={4} loading={all.isLoading} />
        </div>
        <p className="text-text-subtle m-0 text-xs">
          {all.error ? "Indicateurs indisponibles pour le moment." : "Hors comptes internes Dahoo. Une agence suspendue n'est comptée que dans « Suspendues »."}
        </p>
      </section>

      <section className="ax-card" aria-label="Liste des agences clientes">
        <div className="ax-card__body flex flex-col gap-5">
          <ListToolbar search={list.search} onSearch={list.setSearch} searchPlaceholder="Rechercher par nom ou ville" />
          <DataTable
            caption="Agences clientes de Dahoo"
            columns={columns}
            rows={organizations.data?.results}
            rowKey={(organization) => organization.id}
            rowHref={(organization) => `/plateforme/agences/${organization.id}`}
            loading={organizations.isLoading}
            error={organizations.error}
            onRetry={() => organizations.refetch()}
            count={organizations.data?.count}
            page={list.page}
            onPageChange={list.setPage}
            empty={
              <EmptyState
                icon={IconBuildingCommunity}
                title={list.search ? "Aucune agence trouvée" : "Aucune agence pour l'instant"}
                action={!list.search && createButton}
              >
                {list.search
                  ? "Essayez un autre nom ou une autre ville."
                  : "Créez la première agence cliente : son essai gratuit démarrera aussitôt."}
              </EmptyState>
            }
          />
        </div>
      </section>

      {(creating || wantsNew) && (
        <CreateOrganizationModal
          onClose={() => {
            setCreating(false);
            if (wantsNew) router.replace(pathname, { scroll: false });
          }}
          onCreated={(organization) => router.push(`/plateforme/agences/${organization.id}`)}
        />
      )}
    </>
  );
}
