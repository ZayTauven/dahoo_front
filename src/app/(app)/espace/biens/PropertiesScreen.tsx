"use client";

import { IconBuildingCommunity, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo, useState, type SyntheticEvent } from "react";

import { EmptyState } from "@/components/app/EmptyState";
import { PageHead } from "@/components/app/shell/PageHead";
import { DataTable, type Column } from "@/components/app/ui/DataTable";
import { SelectField } from "@/components/app/ui/fields";
import { ListToolbar } from "@/components/app/ui/ListToolbar";
import { useListParams } from "@/hooks/useListParams";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { useSession } from "@/lib/auth/useSession";
import { formatDate, formatNumber } from "@/lib/format";

import { PROPERTIES_KEY, SENEGAL_CITIES, type Property } from "./_components/data";
import { DeletePropertyDialog } from "./_components/DeletePropertyDialog";
import { OccupancyBar } from "./_components/OccupancyBar";
import { PropertyFormModal } from "./_components/PropertyFormModal";

/** Les boutons d'une ligne cliquable ne doivent pas ouvrir la fiche. */
const stop = (event: SyntheticEvent) => event.stopPropagation();

export function PropertiesScreen() {
  const { can, isReadOnly } = useSession();
  const list = useListParams(["city"] as const);
  const [editing, setEditing] = useState<Property | "new" | null>(null);
  const [deleting, setDeleting] = useState<Property | null>(null);

  const properties = useQuery({
    queryKey: [...PROPERTIES_KEY, list.query],
    queryFn: async () => unwrap(await api.GET("/api/v1/properties/properties/", { params: { query: list.query } })),
    placeholderData: keepPreviousData,
  });

  // Villes proposées : les principales villes du pays, celles des biens affichés et le filtre en cours.
  const results = properties.data?.results;
  const cityOptions = useMemo(() => {
    const cities = new Set(SENEGAL_CITIES);
    for (const property of results ?? []) if (property.city) cities.add(property.city);
    if (list.filters.city) cities.add(list.filters.city);
    return [...cities].sort((a, b) => a.localeCompare(b, "fr")).map((city) => ({ value: city, label: city }));
  }, [results, list.filters.city]);

  const canWrite = !isReadOnly;
  const canEdit = can("property.update") && canWrite;
  const canDelete = can("property.delete") && canWrite;
  const filtered = Boolean(list.search || list.filters.city);

  const columns: Column<Property>[] = [
    {
      key: "name",
      header: "Bien",
      cell: (property) => (
        <div className="flex flex-col">
          <span className="text-text-strong font-medium">{property.name}</span>
          <span className="text-text-subtle text-xs">
            {[property.neighborhood, property.city].filter(Boolean).join(", ")}
          </span>
        </div>
      ),
    },
    { key: "buildings", header: "Bâtiments", numeric: true, hideOnMobile: true, cell: (property) => formatNumber(property.buildings_count) },
    { key: "units", header: "Lots", numeric: true, hideOnMobile: true, cell: (property) => formatNumber(property.units_count) },
    {
      key: "occupancy",
      header: "Occupation",
      cell: (property) => <OccupancyBar occupied={property.occupied_units_count} total={property.units_count} />,
    },
    { key: "created", header: "Ajouté le", hideOnMobile: true, cell: (property) => formatDate(property.created_at, "short") },
  ];

  if (canEdit || canDelete) {
    columns.push({
      key: "actions",
      header: "Actions",
      cell: (property) => (
        // Conteneur neutre : il empêche seulement le clic et Entrée sur un bouton d'ouvrir la fiche.
        <div className="flex justify-end gap-1" onClick={stop} onKeyDown={stop}>
          {canEdit && (
            <button type="button" className="ax-btn ax-btn--ghost ax-btn--icon ax-btn--sm" onClick={() => setEditing(property)} aria-label={`Modifier ${property.name}`}>
              <IconPencil className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
            </button>
          )}
          {canDelete && (
            <button type="button" className="ax-btn ax-btn--ghost ax-btn--icon ax-btn--sm" onClick={() => setDeleting(property)} aria-label={`Supprimer ${property.name}`}>
              <IconTrash className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
            </button>
          )}
        </div>
      ),
    });
  }

  const addButton = can("property.create") && canWrite && (
    <button type="button" className="ax-btn ax-btn--primary" onClick={() => setEditing("new")}>
      <IconPlus className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
      <span className="ax-btn__label">Ajouter un bien</span>
    </button>
  );

  return (
    <>
      <PageHead
        title="Biens"
        subtitle="Votre patrimoine géré : chaque bien regroupe des bâtiments, eux-mêmes découpés en lots (appartements, bureaux, commerces…)."
        crumbs={[{ label: "Espace agence", href: "/espace" }, { label: "Biens" }]}
        actions={addButton}
      />
      <section className="ax-card" aria-label="Liste des biens">
        <div className="ax-card__body flex flex-col gap-5">
          <ListToolbar
            search={list.search}
            onSearch={list.setSearch}
            searchPlaceholder="Rechercher par nom, adresse ou quartier"
            filters={
              <SelectField
                label="Ville"
                className="min-w-[160px] flex-1 sm:flex-none"
                value={list.filters.city}
                onChange={(event) => list.setFilter("city", event.target.value)}
                placeholder="Toutes les villes"
                options={cityOptions}
              />
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
            caption="Biens de l'agence"
            columns={columns}
            rows={properties.data?.results}
            rowKey={(property) => property.id}
            rowHref={(property) => `/espace/biens/${property.id}`}
            loading={properties.isLoading}
            error={properties.error}
            onRetry={() => properties.refetch()}
            count={properties.data?.count}
            page={list.page}
            onPageChange={list.setPage}
            empty={
              <EmptyState
                icon={IconBuildingCommunity}
                title={filtered ? "Aucun bien trouvé" : "Aucun bien pour l'instant"}
                action={
                  filtered ? (
                    <button type="button" className="ax-btn ax-btn--secondary" onClick={list.reset}>
                      <span className="ax-btn__label">Effacer les filtres</span>
                    </button>
                  ) : (
                    addButton
                  )
                }
              >
                {filtered
                  ? "Aucun bien ne correspond à cette recherche. Essayez un autre nom, quartier ou une autre ville."
                  : "Ajoutez votre premier bien (immeuble, résidence, villa…), puis ses bâtiments et ses lots : vous pourrez ensuite créer des baux et publier des annonces."}
              </EmptyState>
            }
          />
        </div>
      </section>

      {editing && <PropertyFormModal property={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
      <DeletePropertyDialog property={deleting} onClose={() => setDeleting(null)} />
    </>
  );
}
