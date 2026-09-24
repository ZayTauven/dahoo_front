"use client";

import { IconArrowBackUp, IconBuildingPlus, IconCheck, IconInbox, IconMail, IconMapPin, IconPhone } from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { EmptyState } from "@/components/app/EmptyState";
import { PageHead } from "@/components/app/shell/PageHead";
import { Pagination } from "@/components/app/ui/DataTable";
import { ListToolbar } from "@/components/app/ui/ListToolbar";
import { useToast } from "@/components/app/ui/Toast";
import { useListParams } from "@/hooks/useListParams";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { useApiMutation } from "@/lib/api/useApiMutation";
import { enumOptions } from "@/lib/labels";

import { CreateOrganizationModal, type OrganizationDraft } from "../_components/CreateOrganizationModal";
import { KEYS, PLATFORM_CRUMB, UNITS_RANGE, type DemoRequest, type Organization, type UnitsRange } from "../_components/data";

/** Filtre « traitée » dans l'URL : vide = à traiter (par défaut), `oui` = traitées, `toutes`. */
const HANDLED_FILTERS = [
  { value: "", label: "À traiter" },
  { value: "oui", label: "Traitées" },
  { value: "toutes", label: "Toutes" },
] as const;

const dateTime = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

function isUnitsRange(value: string): value is UnitsRange {
  return value in UNITS_RANGE;
}

/** Préremplissage de la création d'agence à partir d'une demande. */
function draftFrom(request: DemoRequest): Partial<OrganizationDraft> {
  const [firstName, ...rest] = request.contact_name.trim().split(/\s+/);
  return {
    name: request.agency_name,
    phone: request.phone,
    email: request.email,
    city: request.city,
    adminPhone: request.phone,
    adminFirstName: firstName ?? "",
    adminLastName: rest.join(" "),
    adminEmail: request.email,
  };
}

export function DemoRequestsScreen() {
  const toast = useToast();
  const list = useListParams(["traitees", "lots"] as const);
  const [converting, setConverting] = useState<DemoRequest | null>(null);

  const handledFilter = list.filters.traitees;
  const handled = handledFilter === "toutes" ? undefined : handledFilter === "oui";
  const unitsRange = isUnitsRange(list.filters.lots) ? list.filters.lots : undefined;

  const requests = useQuery({
    queryKey: [...KEYS.demoRequests, { page: list.page, search: list.search, handled, unitsRange }],
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/platform/demo-requests/", {
          params: {
            query: {
              page: list.page > 1 ? list.page : undefined,
              search: list.search || undefined,
              handled,
              units_range: unitsRange,
            },
          },
        }),
      ),
    placeholderData: keepPreviousData,
  });

  const setHandled = useApiMutation({
    mutationFn: async ({ request, value }: { request: DemoRequest; value: boolean }) =>
      unwrap(await api.PATCH("/api/v1/platform/demo-requests/{id}/", { params: { path: { id: request.id } }, body: { handled: value } })),
    invalidate: [KEYS.demoRequests],
    success: (result) => (result.handled ? `Demande de ${result.agency_name} marquée comme traitée.` : `Demande de ${result.agency_name} rouverte.`),
  });

  // Après création de l'agence : la demande est close sans notification supplémentaire.
  const closeAfterCreation = useApiMutation({
    mutationFn: async (request: DemoRequest) =>
      unwrap(await api.PATCH("/api/v1/platform/demo-requests/{id}/", { params: { path: { id: request.id } }, body: { handled: true } })),
    invalidate: [KEYS.demoRequests],
  });

  const onCreated = (request: DemoRequest, organization: Organization) => {
    if (request.handled) return;
    closeAfterCreation.mutate(request, {
      onError: () => toast.error(`L'agence ${organization.name} est créée, mais la demande n'a pas pu être marquée comme traitée.`),
    });
  };

  const filters = (
    <>
      <div className="ax-segment" role="group" aria-label="Filtrer les demandes">
        {HANDLED_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className="ax-segment__option"
            aria-pressed={handledFilter === filter.value || (filter.value === "" && !HANDLED_FILTERS.some((f) => f.value === handledFilter))}
            onClick={() => list.setFilter("traitees", filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <select
        className="ax-select w-auto"
        aria-label="Taille du parc"
        value={unitsRange ?? ""}
        onChange={(event) => list.setFilter("lots", event.target.value)}
      >
        <option value="">Toutes tailles de parc</option>
        {enumOptions(UNITS_RANGE).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </>
  );

  const filtered = Boolean(list.search || unitsRange);
  const results = requests.data?.results;

  return (
    <>
      <PageHead
        title="Demandes de démo"
        subtitle="Les agences qui ont demandé une démonstration depuis le site. Rappelez-les, puis créez leur espace pour lancer l'essai."
        crumbs={[PLATFORM_CRUMB, { label: "Demandes de démo" }]}
      />

      <section className="ax-card" aria-label="Demandes de démonstration">
        <div className="ax-card__body flex flex-col gap-5">
          <ListToolbar search={list.search} onSearch={list.setSearch} searchPlaceholder="Rechercher par agence, contact, téléphone ou ville" filters={filters} />

          {requests.error ? (
            <div className="ax-alert ax-alert--danger" role="alert">
              <div className="ax-alert__content">
                <p className="ax-alert__message">{requests.error.message}</p>
              </div>
              <div className="ax-alert__actions">
                <button type="button" className="ax-btn ax-btn--sm ax-btn--ghost" onClick={() => requests.refetch()}>
                  <span className="ax-btn__label">Réessayer</span>
                </button>
              </div>
            </div>
          ) : !results ? (
            <ul className="m-0 flex list-none flex-col gap-4 p-0" aria-busy="true" aria-label="Chargement des demandes">
              {Array.from({ length: 3 }, (_, index) => (
                <li key={index} className="border-border-default flex flex-col gap-3 rounded-lg border p-4">
                  <span className="ax-skeleton ax-skeleton--text" style={{ inlineSize: "40%" }} />
                  <span className="ax-skeleton ax-skeleton--text" style={{ inlineSize: "75%" }} />
                  <span className="ax-skeleton ax-skeleton--text" style={{ inlineSize: "60%" }} />
                </li>
              ))}
            </ul>
          ) : results.length === 0 ? (
            <EmptyState
              icon={IconInbox}
              title={filtered ? "Aucune demande trouvée" : handled === false ? "Aucune demande à traiter" : "Aucune demande"}
              action={
                handled === false && !filtered ? (
                  <button type="button" className="ax-btn ax-btn--secondary" onClick={() => list.setFilter("traitees", "toutes")}>
                    <span className="ax-btn__label">Voir toutes les demandes</span>
                  </button>
                ) : undefined
              }
            >
              {filtered
                ? "Essayez une autre recherche ou une autre taille de parc."
                : handled === false
                  ? "Toutes les demandes reçues ont été traitées. Les nouvelles demandes du formulaire « Pour les agences » apparaîtront ici."
                  : "Les demandes envoyées depuis le formulaire « Pour les agences » du site apparaîtront ici."}
            </EmptyState>
          ) : (
            <>
              <ul className="m-0 flex list-none flex-col gap-4 p-0" aria-busy={requests.isFetching}>
                {results.map((request) => (
                  <DemoRequestItem
                    key={request.id}
                    request={request}
                    pending={setHandled.isPending && setHandled.variables?.request.id === request.id}
                    onToggle={() => setHandled.mutate({ request, value: !request.handled })}
                    onConvert={() => setConverting(request)}
                  />
                ))}
              </ul>
              {requests.data && <Pagination count={requests.data.count} page={list.page} onPageChange={list.setPage} />}
            </>
          )}
        </div>
      </section>

      {converting && (
        <CreateOrganizationModal
          initial={draftFrom(converting)}
          context={
            <p className="text-text-muted m-0 text-sm">
              Formulaire prérempli avec la demande de {converting.contact_name} ({converting.agency_name}). Vérifiez les informations
              avant de créer l&apos;agence{converting.handled ? "." : " : la demande sera ensuite marquée comme traitée."}
            </p>
          }
          onClose={() => setConverting(null)}
          onCreated={(organization) => onCreated(converting, organization)}
        />
      )}
    </>
  );
}

function DemoRequestItem({
  request,
  pending,
  onToggle,
  onConvert,
}: {
  request: DemoRequest;
  pending: boolean;
  onToggle: () => void;
  onConvert: () => void;
}) {
  return (
    <li className={`border-border-default flex flex-col gap-3 rounded-lg border p-4 ${request.handled ? "bg-surface-subtle" : "bg-surface"}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-text-strong font-display m-0 text-base font-semibold">{request.agency_name}</h2>
          <p className="text-text m-0 text-sm">{request.contact_name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`ax-badge ax-badge--soft ${request.handled ? "ax-badge--success" : "ax-badge--accent"}`}>
            <span className="ax-badge__dot" aria-hidden="true" />
            {request.handled ? "Traitée" : "À traiter"}
          </span>
          <span className="ax-badge ax-badge--soft ax-badge--neutral">{UNITS_RANGE[request.units_range]?.label ?? request.units_range}</span>
        </div>
      </div>

      <ul className="text-text m-0 flex list-none flex-wrap gap-x-5 gap-y-1 p-0 text-sm">
        <li className="inline-flex items-center gap-1.5">
          <IconPhone className="text-text-subtle size-4 shrink-0" stroke={1.75} aria-hidden="true" />
          <span className="sr-only">Téléphone : </span>
          <a href={`tel:${request.phone.replace(/\s+/g, "")}`} className="ax-num text-link">
            {request.phone}
          </a>
        </li>
        {request.email && (
          <li className="inline-flex min-w-0 items-center gap-1.5">
            <IconMail className="text-text-subtle size-4 shrink-0" stroke={1.75} aria-hidden="true" />
            <span className="sr-only">Email : </span>
            <a href={`mailto:${request.email}`} className="text-link break-all">
              {request.email}
            </a>
          </li>
        )}
        {request.city && (
          <li className="inline-flex items-center gap-1.5">
            <IconMapPin className="text-text-subtle size-4 shrink-0" stroke={1.75} aria-hidden="true" />
            <span className="sr-only">Ville : </span>
            {request.city}
          </li>
        )}
      </ul>

      {request.message ? (
        <blockquote className="border-border-default text-text m-0 border-l-2 pl-3 text-sm whitespace-pre-line">{request.message}</blockquote>
      ) : (
        <p className="text-text-subtle m-0 text-sm italic">Aucun message.</p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-text-subtle m-0 text-xs">
          Reçue le <time dateTime={request.created_at}>{dateTime.format(new Date(request.created_at))}</time>
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`ax-btn ax-btn--sm ax-btn--ghost${pending ? " is-loading" : ""}`}
            onClick={onToggle}
            disabled={pending}
            aria-busy={pending}
          >
            <span className="ax-btn__spinner" aria-hidden="true" />
            {request.handled ? (
              <IconArrowBackUp className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
            ) : (
              <IconCheck className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
            )}
            <span className="ax-btn__label">{request.handled ? "Rouvrir" : "Marquer comme traitée"}</span>
          </button>
          <button type="button" className={`ax-btn ax-btn--sm ${request.handled ? "ax-btn--secondary" : "ax-btn--primary"}`} onClick={onConvert}>
            <IconBuildingPlus className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
            <span className="ax-btn__label">Créer l&apos;agence</span>
          </button>
        </div>
      </div>
    </li>
  );
}
