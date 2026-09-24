"use client";

import { IconPhoto, IconPlus, IconSpeakerphone } from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { EmptyState } from "@/components/app/EmptyState";
import { PageHead } from "@/components/app/shell/PageHead";
import { DataTable, type Column } from "@/components/app/ui/DataTable";
import { ListToolbar } from "@/components/app/ui/ListToolbar";
import { StatusBadge } from "@/components/app/ui/StatusBadge";
import { useListParams } from "@/hooks/useListParams";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { useSession } from "@/lib/auth/useSession";
import { formatDate } from "@/lib/format";
import { enumLabel, enumOptions, LISTING_STATUS, LISTING_TYPE } from "@/lib/labels";

import { asListingStatus, asListingType, KEYS, MAX_PHOTOS, priceLabel, type Listing } from "./data";
import { ListingFormModal } from "./ListingFormModal";

function parseUnit(raw: string | null): number | undefined {
  return raw && /^\d+$/.test(raw) && Number(raw) > 0 ? Number(raw) : undefined;
}

/** Liste des annonces de l'agence : filtres statut / type, recherche, création en modale. */
export function ListingsScreen() {
  const { can, isReadOnly } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const list = useListParams(["status", "listing_type"] as const);

  // Lien « Créer une annonce » du module Biens : /espace/annonces?lot={id} ouvre la création.
  const lotFromUrl = parseUnit(searchParams.get("lot"));
  const [creating, setCreating] = useState(Boolean(lotFromUrl));
  const canCreate = can("listing.create") && !isReadOnly;

  const status = asListingStatus(list.filters.status);
  const listingType = asListingType(list.filters.listing_type);
  const query = { page: list.page > 1 ? list.page : undefined, search: list.search || undefined, status, listing_type: listingType };

  const listings = useQuery({
    queryKey: KEYS.list(list.query),
    queryFn: async () => unwrap(await api.GET("/api/v1/listings/", { params: { query } })),
    placeholderData: keepPreviousData,
  });

  const closeCreate = () => {
    setCreating(false);
    if (searchParams.has("lot")) {
      const next = new URLSearchParams(searchParams.toString());
      next.delete("lot");
      const rest = next.toString();
      router.replace(rest ? `/espace/annonces?${rest}` : "/espace/annonces", { scroll: false });
    }
  };

  const columns: Column<Listing>[] = [
    {
      key: "title",
      header: "Annonce",
      cell: (listing) => (
        <div className="flex min-w-0 items-center gap-3">
          <span className="bg-surface-subtle text-text-subtle relative flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md">
            {listing.cover ? (
              <Image src={listing.cover} alt="" fill sizes="64px" className="object-cover" />
            ) : (
              <IconPhoto size={20} stroke={1.5} aria-hidden="true" />
            )}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="text-text-strong line-clamp-2 font-medium">{listing.title}</span>
            <span className="text-text-subtle truncate text-xs">{listing.unit_label}</span>
          </span>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      hideOnMobile: true,
      cell: (listing) => enumLabel(LISTING_TYPE, listing.listing_type),
    },
    { key: "price", header: "Prix", numeric: true, cell: (listing) => <span className="whitespace-nowrap">{priceLabel(listing)}</span> },
    { key: "status", header: "Statut", cell: (listing) => <StatusBadge entries={LISTING_STATUS} value={listing.status} /> },
    {
      key: "photos",
      header: "Photos",
      numeric: true,
      hideOnMobile: true,
      cell: (listing) =>
        listing.photos_count === 0 ? (
          <span className="text-text-subtle">Aucune</span>
        ) : (
          <span>
            {listing.photos_count}
            <span className="text-text-subtle"> / {MAX_PHOTOS}</span>
          </span>
        ),
    },
    {
      key: "published",
      header: "Publiée le",
      hideOnMobile: true,
      cell: (listing) => (listing.published_at ? formatDate(listing.published_at, "short") : <span className="text-text-subtle">—</span>),
    },
  ];

  const addButton = canCreate && (
    <button type="button" className="ax-btn ax-btn--primary" onClick={() => setCreating(true)}>
      <IconPlus className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
      <span className="ax-btn__label">Nouvelle annonce</span>
    </button>
  );

  const filtered = Boolean(list.search || status || listingType);

  return (
    <>
      <PageHead
        title="Annonces"
        subtitle="Vos biens à louer ou à vendre sur le portail Dahoo. Une annonce publiée apparaît sur le portail en moins d'une minute."
        crumbs={[{ label: "Espace agence", href: "/espace" }, { label: "Annonces" }]}
        actions={addButton}
      />
      <section className="ax-card" aria-label="Liste des annonces">
        <div className="ax-card__body flex flex-col gap-5">
          <ListToolbar
            search={list.search}
            onSearch={list.setSearch}
            searchPlaceholder="Rechercher par titre ou description"
            filters={
              <>
                <FilterSelect
                  label="Statut"
                  value={list.filters.status}
                  onChange={(value) => list.setFilter("status", value)}
                  allLabel="Tous les statuts"
                  options={enumOptions(LISTING_STATUS)}
                />
                <FilterSelect
                  label="Type"
                  value={list.filters.listing_type}
                  onChange={(value) => list.setFilter("listing_type", value)}
                  allLabel="Location et vente"
                  options={enumOptions(LISTING_TYPE)}
                />
              </>
            }
            actions={
              filtered && (
                <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={list.reset}>
                  <span className="ax-btn__label">Effacer les filtres</span>
                </button>
              )
            }
          />
          <DataTable
            caption="Annonces de l'agence"
            columns={columns}
            rows={listings.data?.results}
            rowKey={(listing) => listing.id}
            rowHref={(listing) => `/espace/annonces/${listing.id}`}
            loading={listings.isLoading}
            error={listings.error}
            onRetry={() => listings.refetch()}
            count={listings.data?.count}
            page={list.page}
            onPageChange={list.setPage}
            empty={
              <EmptyState
                icon={IconSpeakerphone}
                title={filtered ? "Aucune annonce trouvée" : "Aucune annonce pour l'instant"}
                action={filtered ? undefined : addButton}
              >
                {filtered
                  ? "Modifiez la recherche ou les filtres."
                  : "Créez une annonce pour un lot libre, ajoutez des photos puis publiez-la : elle apparaîtra sur le portail Dahoo et vous recevrez les demandes de visite."}
              </EmptyState>
            }
          />
        </div>
      </section>

      {creating && canCreate && (
        <ListingFormModal
          listing={null}
          initialUnit={lotFromUrl}
          onClose={closeCreate}
          onCreated={(listing) => router.push(`/espace/annonces/${listing.id}#photos`)}
        />
      )}
    </>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  allLabel,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  allLabel: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex min-w-[160px] flex-col gap-1">
      <span className="sr-only">{label}</span>
      <select className="ax-select" value={value} onChange={(event) => onChange(event.target.value)} aria-label={label}>
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
