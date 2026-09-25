"use client";

import { IconFilterOff, IconPlus, IconTool, IconX } from "@tabler/icons-react";
import { keepPreviousData, useQueries, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { EmptyState } from "@/components/app/EmptyState";
import { PageHead } from "@/components/app/shell/PageHead";
import { DataTable, type Column } from "@/components/app/ui/DataTable";
import { SelectField } from "@/components/app/ui/fields";
import { ListToolbar } from "@/components/app/ui/ListToolbar";
import { StatusBadge } from "@/components/app/ui/StatusBadge";
import { useListParams } from "@/hooks/useListParams";
import { useNewParam } from "@/hooks/useNewParam";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { useSession } from "@/lib/auth/useSession";
import { formatDate, formatNumber } from "@/lib/format";
import { TICKET_PRIORITY, TICKET_STATUS } from "@/lib/labels";
import { cn } from "@/lib/utils";

import {
  KEYS,
  TICKET_ORDERINGS,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  asId,
  asOrdering,
  asPriority,
  asStatus,
  splitUnitLabel,
  useCategories,
  type Ticket,
  type TicketQuery,
  type TicketStatus,
} from "./data";
import { TicketFormModal } from "./TicketFormModal";

const FILTERS = ["status", "priority", "category", "unit", "ordering"] as const;

export function TicketsScreen() {
  const { can, isReadOnly } = useSession();
  const list = useListParams(FILTERS);
  const [creating, setCreating] = useState(false);
  const shortcut = useNewParam();
  const categories = useCategories();

  // Filtres communs à la liste et aux compteurs (le statut est appliqué séparément).
  const scope: TicketQuery = {
    search: list.search || undefined,
    priority: asPriority(list.filters.priority),
    category: asId(list.filters.category),
    unit: asId(list.filters.unit),
  };
  const status = asStatus(list.filters.status);
  const query: TicketQuery = { ...scope, status, ordering: asOrdering(list.filters.ordering), page: list.page > 1 ? list.page : undefined };

  const tickets = useQuery({
    queryKey: [...KEYS.tickets, "list", query],
    queryFn: async () => unwrap(await api.GET("/api/v1/maintenance/tickets/", { params: { query } })),
    placeholderData: keepPreviousData,
  });

  const canCreate = can("maintenance.ticket.create") && !isReadOnly;
  const addButton = canCreate && (
    <button type="button" className="ax-btn ax-btn--primary" onClick={() => setCreating(true)}>
      <IconPlus className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
      <span className="ax-btn__label">Nouveau ticket</span>
    </button>
  );

  const categoryList = categories.data ?? [];
  const filtered = Boolean(list.search || scope.priority || scope.category || scope.unit || status);
  const unitId = scope.unit;
  const unitLabel = unitId ? (tickets.data?.results.find((ticket) => ticket.unit === unitId)?.unit_label ?? `Lot n°${unitId}`) : null;

  const columns: Column<Ticket>[] = [
    {
      key: "id",
      header: "N°",
      cell: (ticket) => <span className="ax-num text-text-strong font-medium">#{ticket.id}</span>,
    },
    {
      key: "unit",
      header: "Lot",
      cell: (ticket) => {
        const { reference, context } = splitUnitLabel(ticket.unit_label);
        return (
          <div className="flex min-w-[8rem] flex-col">
            <span className="text-text-strong font-medium">{reference}</span>
            {context && <span className="text-text-subtle max-w-[16rem] truncate text-xs">{context}</span>}
          </div>
        );
      },
    },
    {
      key: "category",
      header: "Catégorie",
      hideOnMobile: true,
      cell: (ticket) => ticket.category_label ?? <span className="text-text-subtle">—</span>,
    },
    {
      key: "description",
      header: "Description",
      cell: (ticket) => <span className="line-clamp-2 min-w-[10rem] max-w-[22rem]">{ticket.description}</span>,
    },
    { key: "priority", header: "Priorité", cell: (ticket) => <StatusBadge entries={TICKET_PRIORITY} value={ticket.priority} /> },
    { key: "status", header: "Statut", cell: (ticket) => <StatusBadge entries={TICKET_STATUS} value={ticket.status} /> },
    { key: "created", header: "Signalé le", hideOnMobile: true, cell: (ticket) => <span className="ax-num">{formatDate(ticket.created_at, "short")}</span> },
  ];

  return (
    <>
      <PageHead
        title="Maintenance"
        subtitle="Les demandes d'intervention sur vos lots : signalement, affectation à un membre de l'équipe et suivi jusqu'à la clôture."
        crumbs={[{ label: "Espace agence", href: "/espace" }, { label: "Maintenance" }]}
        actions={addButton}
      />

      <StatusCounters scope={scope} active={status} onSelect={(next) => list.setFilter("status", next ?? "")} />

      <section className="ax-card mt-5" aria-label="Liste des tickets">
        <div className="ax-card__body flex flex-col gap-5">
          <ListToolbar
            search={list.search}
            onSearch={list.setSearch}
            searchPlaceholder="Rechercher dans la description ou la référence du lot"
            filters={
              <>
                <SelectField
                  label="Priorité"
                  className="min-w-[9rem] max-sm:flex-1"
                  value={scope.priority ?? ""}
                  onChange={(event) => list.setFilter("priority", event.target.value)}
                  options={TICKET_PRIORITIES.map((priority) => ({ value: priority, label: TICKET_PRIORITY[priority].label }))}
                  placeholder="Toutes"
                />
                {categoryList.length > 0 && (
                  <SelectField
                    label="Catégorie"
                    className="min-w-[10rem] max-sm:flex-1"
                    value={scope.category ? String(scope.category) : ""}
                    onChange={(event) => list.setFilter("category", event.target.value)}
                    options={categoryList.map((category) => ({ value: category.id, label: category.label }))}
                    placeholder="Toutes"
                  />
                )}
                <SelectField
                  label="Trier par"
                  className="min-w-[10rem] max-sm:flex-1"
                  value={asOrdering(list.filters.ordering) ?? ""}
                  onChange={(event) => list.setFilter("ordering", event.target.value)}
                  options={TICKET_ORDERINGS.map((option) => ({ value: option.value, label: option.label }))}
                />
              </>
            }
          />

          {(unitLabel || filtered) && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {unitLabel && (
                <span className="ax-badge ax-badge--soft ax-badge--neutral">
                  Lot : {unitLabel}
                  <button
                    type="button"
                    className="-mr-1 ml-1 inline-flex rounded-full p-0.5 hover:bg-surface-subtle"
                    onClick={() => list.setFilter("unit", "")}
                    aria-label="Retirer le filtre sur le lot"
                  >
                    <IconX className="size-3.5" stroke={2} aria-hidden="true" />
                  </button>
                </span>
              )}
              {filtered && (
                <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={list.reset}>
                  <IconFilterOff className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
                  <span className="ax-btn__label">Réinitialiser les filtres</span>
                </button>
              )}
            </div>
          )}

          <DataTable
            caption="Tickets de maintenance de l'agence"
            columns={columns}
            rows={tickets.data?.results}
            rowKey={(ticket) => ticket.id}
            rowHref={(ticket) => `/espace/maintenance/${ticket.id}`}
            loading={tickets.isLoading}
            error={tickets.error}
            onRetry={() => tickets.refetch()}
            count={tickets.data?.count}
            page={list.page}
            onPageChange={list.setPage}
            empty={
              filtered ? (
                <EmptyState
                  icon={IconTool}
                  title="Aucun ticket ne correspond"
                  action={
                    <button type="button" className="ax-btn ax-btn--secondary" onClick={list.reset}>
                      <span className="ax-btn__label">Réinitialiser les filtres</span>
                    </button>
                  }
                >
                  Modifiez la recherche ou les filtres pour élargir la liste.
                </EmptyState>
              ) : (
                <EmptyState icon={IconTool} title="Aucun ticket pour l'instant" action={addButton}>
                  Signalez ici les pannes et travaux à réaliser dans vos lots (plomberie, électricité, climatisation…) pour suivre
                  chaque intervention jusqu&apos;à sa clôture.
                </EmptyState>
              )
            }
          />
        </div>
      </section>

      {(creating || (shortcut.requested && canCreate)) && (
        <TicketFormModal
          ticket={null}
          onClose={() => {
            setCreating(false);
            shortcut.clear();
          }}
        />
      )}
    </>
  );
}

/**
 * Compteurs par statut, calculés avec les autres filtres (recherche, priorité, catégorie, lot)
 * pour rester cohérents avec la liste. Un clic filtre la liste ; un second clic retire le filtre.
 */
function StatusCounters({
  scope,
  active,
  onSelect,
}: {
  scope: TicketQuery;
  active: TicketStatus | undefined;
  onSelect: (status: TicketStatus | undefined) => void;
}) {
  const entries: (TicketStatus | undefined)[] = [undefined, ...TICKET_STATUSES];
  const counts = useQueries({
    queries: entries.map((status) => ({
      queryKey: [...KEYS.tickets, "count", status ?? "ALL", scope],
      queryFn: async () => unwrap(await api.GET("/api/v1/maintenance/tickets/", { params: { query: { ...scope, status } } })).count,
      placeholderData: keepPreviousData,
    })),
  });

  return (
    <div role="group" aria-label="Filtrer par statut" className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
      {entries.map((status, index) => {
        const selected = status === active;
        const count = counts[index];
        return (
          <button
            key={status ?? "ALL"}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(selected || !status ? undefined : status)}
            className={cn(
              "ax-card ax-card--interactive min-w-0 cursor-pointer gap-2 px-3 py-3 text-left sm:px-4",
              selected && "is-selected",
            )}
          >
            {status ? (
              <StatusBadge entries={TICKET_STATUS} value={status} />
            ) : (
              <span className="text-text-muted text-xs font-medium">Tous les statuts</span>
            )}
            <span className="font-display text-text-strong ax-num text-2xl font-semibold leading-none" aria-busy={count.isLoading}>
              {count.isLoading ? (
                <span className="ax-skeleton ax-skeleton--text inline-block w-8" />
              ) : count.isError ? (
                <span className="text-text-subtle" title="Compteur indisponible">
                  —
                </span>
              ) : (
                formatNumber(count.data)
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
