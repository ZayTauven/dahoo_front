"use client";

import {
  IconArrowLeft,
  IconBuilding,
  IconDoor,
  IconDoorEnter,
  IconKey,
  IconMapPin,
  IconPencil,
  IconPlus,
  IconTool,
  IconTrash,
} from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/app/EmptyState";
import { KpiCard } from "@/components/app/KpiCard";
import { PageHead } from "@/components/app/shell/PageHead";
import { ConfirmDialog } from "@/components/app/ui/Modal";
import { useToast } from "@/components/app/ui/Toast";
import { api } from "@/lib/api/client";
import { ApiError, unwrap } from "@/lib/api/errors";
import { useApiMutation } from "@/lib/api/useApiMutation";
import { useSession } from "@/lib/auth/useSession";
import { formatDate, formatNumber } from "@/lib/format";
import { enumLabel, UNIT_STATUS } from "@/lib/labels";

import { BuildingFormModal } from "../_components/BuildingFormModal";
import { BuildingSection, type BuildingRights } from "../_components/BuildingSection";
import {
  BUILDINGS_KEY,
  buildingsKey,
  fetchBuildings,
  fetchUnits,
  PROPERTIES_KEY,
  propertyKey,
  removeWithLeaseGuard,
  UNITS_KEY,
  unitsKey,
  type Building,
  type Unit,
  type UnitStatus,
} from "../_components/data";
import { DeletePropertyDialog } from "../_components/DeletePropertyDialog";
import { OccupancyBar } from "../_components/OccupancyBar";
import { PropertyFormModal } from "../_components/PropertyFormModal";
import { UnitFormModal } from "../_components/UnitFormModal";

const CRUMBS = [
  { label: "Espace agence", href: "/espace" },
  { label: "Biens", href: "/espace/biens" },
];

export function PropertyScreen({ id }: { id: number }) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { can, isReadOnly } = useSession();

  const [editingProperty, setEditingProperty] = useState(false);
  const [deletingProperty, setDeletingProperty] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | "new" | null>(null);
  const [deletingBuilding, setDeletingBuilding] = useState<Building | null>(null);
  const [editingUnit, setEditingUnit] = useState<{ building: Building; unit: Unit | null } | null>(null);
  const [deletingUnit, setDeletingUnit] = useState<Unit | null>(null);

  const property = useQuery({
    queryKey: propertyKey(id),
    queryFn: async () => unwrap(await api.GET("/api/v1/properties/properties/{id}/", { params: { path: { id } } })),
    retry: (count, error) => !(error instanceof ApiError && error.status === 404) && count < 2,
  });
  const found = Boolean(property.data);
  const buildings = useQuery({ queryKey: buildingsKey(id), queryFn: () => fetchBuildings(id), enabled: found });
  const units = useQuery({ queryKey: unitsKey(id), queryFn: () => fetchUnits(id), enabled: found });

  const unitsByBuilding = useMemo(() => {
    const groups = new Map<number, Unit[]>();
    for (const unit of units.data ?? []) groups.set(unit.building, [...(groups.get(unit.building) ?? []), unit]);
    return groups;
  }, [units.data]);

  const counts = useMemo(() => {
    const byStatus: Record<UnitStatus, number> = { FREE: 0, RENTED: 0, MAINTENANCE: 0, SOLD: 0 };
    for (const unit of units.data ?? []) byStatus[unit.status] += 1;
    return byStatus;
  }, [units.data]);

  const canWrite = !isReadOnly;
  const rights: BuildingRights = {
    renameBuilding: can("building.update") && canWrite,
    deleteBuilding: can("building.delete") && canWrite,
    createUnit: can("unit.create") && canWrite,
    updateUnit: can("unit.update") && canWrite,
    deleteUnit: can("unit.delete") && canWrite,
    changeStatus: can("unit.change_status") && canWrite,
    createListing: can("listing.create") && canWrite,
  };

  // Changement de statut : affiché tout de suite, annulé si l'API refuse.
  const changeStatus = useApiMutation({
    mutationFn: async ({ unit, status }: { unit: Unit; status: UnitStatus }) => {
      const key = unitsKey(id);
      const previous = queryClient.getQueryData<Unit[]>(key);
      queryClient.setQueryData<Unit[]>(key, (current) => current?.map((item) => (item.id === unit.id ? { ...item, status } : item)));
      try {
        return unwrap(await api.POST("/api/v1/properties/units/{id}/status/", { params: { path: { id: unit.id } }, body: { status } }));
      } catch (error) {
        queryClient.setQueryData(key, previous);
        throw error;
      }
    },
    invalidate: [UNITS_KEY, PROPERTIES_KEY],
    success: (saved) => `Lot ${saved.reference} : ${enumLabel(UNIT_STATUS, saved.status).toLowerCase()}.`,
  });
  const onChangeStatus = (unit: Unit, status: UnitStatus) => {
    if (status === unit.status) return;
    changeStatus.mutate(
      { unit, status },
      { onError: (error) => toast.error(error instanceof ApiError ? error.message : "Le statut n'a pas pu être modifié.") },
    );
  };

  const removeBuilding = useApiMutation({
    mutationFn: (building: Building) =>
      removeWithLeaseGuard(
        () => api.DELETE("/api/v1/properties/buildings/{id}/", { params: { path: { id: building.id } } }),
        "Ce bâtiment ne peut pas être supprimé : des baux sont enregistrés sur certains de ses lots.",
      ),
    invalidate: [BUILDINGS_KEY, UNITS_KEY, PROPERTIES_KEY],
    success: "Bâtiment supprimé.",
    onSuccess: () => setDeletingBuilding(null),
  });

  const removeUnit = useApiMutation({
    mutationFn: (unit: Unit) =>
      removeWithLeaseGuard(
        () => api.DELETE("/api/v1/properties/units/{id}/", { params: { path: { id: unit.id } } }),
        "Ce lot ne peut pas être supprimé : des baux y sont enregistrés. Vous pouvez le passer en maintenance ou le marquer comme vendu.",
      ),
    invalidate: [UNITS_KEY, PROPERTIES_KEY],
    success: "Lot supprimé.",
    onSuccess: () => setDeletingUnit(null),
  });

  if (property.error) {
    const notFound = property.error instanceof ApiError && property.error.status === 404;
    return (
      <>
        <PageHead title={notFound ? "Bien introuvable" : "Bien"} crumbs={[...CRUMBS, { label: "Fiche du bien" }]} />
        {notFound ? (
          <section className="ax-card">
            <div className="ax-card__body">
              <EmptyState
                icon={IconBuilding}
                title="Ce bien n'existe pas ou plus"
                action={
                  <Link href="/espace/biens" className="ax-btn ax-btn--secondary">
                    <IconArrowLeft className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
                    <span className="ax-btn__label">Retour aux biens</span>
                  </Link>
                }
              >
                Il a peut-être été supprimé, ou il appartient à une autre agence.
              </EmptyState>
            </div>
          </section>
        ) : (
          <div className="ax-alert ax-alert--danger" role="alert">
            <div className="ax-alert__content">
              <p className="ax-alert__message">{property.error.message}</p>
            </div>
            <div className="ax-alert__actions">
              <button type="button" className="ax-btn ax-btn--sm ax-btn--ghost" onClick={() => property.refetch()}>
                <span className="ax-btn__label">Réessayer</span>
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  const data = property.data;
  const place = data ? [data.address, [data.neighborhood, data.city].filter(Boolean).join(", ")].filter(Boolean).join(" · ") : undefined;
  const mapUrl =
    data?.latitude && data.longitude
      ? `https://www.openstreetmap.org/?mlat=${data.latitude}&mlon=${data.longitude}#map=17/${data.latitude}/${data.longitude}`
      : undefined;
  const unitCount = units.data?.length ?? data?.units_count;
  const buildingList = buildings.data;
  // En cas d'erreur sur les lots, les indicateurs affichent « — » (l'erreur est détaillée dans chaque bâtiment).
  const kpiLoading = !units.data && !units.error;

  const addBuildingButton = (variant: "primary" | "secondary") =>
    can("building.create") &&
    canWrite && (
      <button type="button" className={`ax-btn ax-btn--${variant}`} onClick={() => setEditingBuilding("new")}>
        <IconPlus className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
        <span className="ax-btn__label">Ajouter un bâtiment</span>
      </button>
    );

  const headActions = data && (
    <>
      {can("property.update") && canWrite && (
        <button type="button" className="ax-btn ax-btn--secondary" onClick={() => setEditingProperty(true)}>
          <IconPencil className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
          <span className="ax-btn__label">Modifier</span>
        </button>
      )}
      {can("property.delete") && canWrite && (
        <button type="button" className="ax-btn ax-btn--ghost ax-btn--danger" onClick={() => setDeletingProperty(true)}>
          <IconTrash className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
          <span className="ax-btn__label">Supprimer</span>
        </button>
      )}
      {addBuildingButton("primary")}
    </>
  );

  return (
    <>
      <PageHead
        title={data?.name ?? "Chargement du bien…"}
        subtitle={
          data ? (
            <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-1">
                <IconMapPin className="size-4 shrink-0" stroke={1.75} aria-hidden="true" />
                {place}
              </span>
              {mapUrl && (
                <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="text-link text-sm">
                  Voir sur la carte<span className="sr-only"> (nouvel onglet)</span>
                </a>
              )}
              <span className="text-text-subtle text-sm">Ajouté le {formatDate(data.created_at)}</span>
            </span>
          ) : (
            <span className="ax-skeleton ax-skeleton--text inline-block" style={{ inlineSize: 260 }} />
          )
        }
        crumbs={[...CRUMBS, { label: data?.name ?? "Fiche du bien" }]}
        actions={headActions}
      />

      <div className="flex flex-col gap-6">
        <section aria-label="Occupation des lots" className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard label="Lots" value={unitCount} icon={IconDoor} tone={1} loading={kpiLoading && !data} />
            <KpiCard label="Occupés" value={units.data ? counts.RENTED : data?.occupied_units_count} icon={IconKey} tone={2} loading={kpiLoading && !data} />
            <KpiCard label="Libres" value={units.data ? counts.FREE : undefined} icon={IconDoorEnter} tone={3} loading={kpiLoading} />
            <KpiCard label="En maintenance" value={units.data ? counts.MAINTENANCE : undefined} icon={IconTool} tone={4} loading={kpiLoading} />
          </div>
          {units.data && units.data.length > 0 && (
            <div className="ax-card">
              <div className="ax-card__body flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-text m-0 text-sm">
                  <strong className="text-text-strong">Taux d&apos;occupation</strong>
                  <span className="text-text-subtle"> · lots loués sur l&apos;ensemble des lots du bien</span>
                  {counts.SOLD > 0 && (
                    <span className="text-text-subtle">
                      {" "}
                      · {formatNumber(counts.SOLD)} lot{counts.SOLD > 1 ? "s" : ""} vendu{counts.SOLD > 1 ? "s" : ""}
                    </span>
                  )}
                </p>
                <OccupancyBar occupied={counts.RENTED} total={units.data.length} className="sm:w-72" />
              </div>
            </div>
          )}
        </section>

        <section aria-labelledby="batiments-titre" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="batiments-titre" className="font-display text-text-strong m-0 text-xl font-semibold">
              Bâtiments et lots
            </h2>
            {buildingList && buildingList.length > 0 && (
              <span className="text-text-muted text-sm">
                {formatNumber(buildingList.length)} bâtiment{buildingList.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {buildings.error ? (
            <div className="ax-alert ax-alert--danger" role="alert">
              <div className="ax-alert__content">
                <p className="ax-alert__message">{buildings.error.message}</p>
              </div>
              <div className="ax-alert__actions">
                <button type="button" className="ax-btn ax-btn--sm ax-btn--ghost" onClick={() => buildings.refetch()}>
                  <span className="ax-btn__label">Réessayer</span>
                </button>
              </div>
            </div>
          ) : !buildingList ? (
            <div className="ax-card" aria-busy="true">
              <div className="ax-card__body flex flex-col gap-3">
                <span className="ax-skeleton ax-skeleton--text" style={{ inlineSize: "30%" }} />
                <span className="ax-skeleton ax-skeleton--text" style={{ inlineSize: "80%" }} />
                <span className="ax-skeleton ax-skeleton--text" style={{ inlineSize: "65%" }} />
              </div>
            </div>
          ) : buildingList.length === 0 ? (
            <div className="ax-card">
              <div className="ax-card__body">
                <EmptyState icon={IconBuilding} title="Aucun bâtiment pour l'instant" action={addBuildingButton("primary")}>
                  Ajoutez un premier bâtiment, puis ses lots. Pour une villa ou une maison seule, un bâtiment
                  « Bâtiment principal » suffit.
                </EmptyState>
              </div>
            </div>
          ) : (
            buildingList.map((building) => (
              <BuildingSection
                key={building.id}
                building={building}
                units={units.data ? (unitsByBuilding.get(building.id) ?? []) : undefined}
                loading={units.isLoading}
                error={units.error}
                onRetry={() => units.refetch()}
                rights={rights}
                statusPendingId={changeStatus.isPending ? (changeStatus.variables?.unit.id ?? null) : null}
                onRename={() => setEditingBuilding(building)}
                onDelete={() => setDeletingBuilding(building)}
                onAddUnit={() => setEditingUnit({ building, unit: null })}
                onEditUnit={(unit) => setEditingUnit({ building, unit })}
                onDeleteUnit={(unit) => setDeletingUnit(unit)}
                onChangeStatus={onChangeStatus}
              />
            ))
          )}
        </section>
      </div>

      {editingProperty && data && <PropertyFormModal property={data} onClose={() => setEditingProperty(false)} />}
      <DeletePropertyDialog
        property={deletingProperty && data ? data : null}
        onClose={() => setDeletingProperty(false)}
        onDeleted={() => router.replace("/espace/biens")}
      />

      {editingBuilding && (
        <BuildingFormModal
          propertyId={id}
          building={editingBuilding === "new" ? null : editingBuilding}
          suggestion={editingBuilding === "new" && buildingList?.length === 0 ? "Bâtiment principal" : undefined}
          onClose={() => setEditingBuilding(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deletingBuilding)}
        onClose={() => {
          removeBuilding.resetErrors();
          setDeletingBuilding(null);
        }}
        onConfirm={() => deletingBuilding && removeBuilding.mutate(deletingBuilding)}
        pending={removeBuilding.isPending}
        title="Supprimer ce bâtiment ?"
        confirmLabel="Supprimer le bâtiment"
        danger
      >
        <p className="m-0">
          <strong className="text-text-strong">{deletingBuilding?.name}</strong> sera supprimé avec{" "}
          {(() => {
            const count = deletingBuilding ? (unitsByBuilding.get(deletingBuilding.id)?.length ?? 0) : 0;
            return count > 0 ? `ses ${formatNumber(count)} lot${count > 1 ? "s" : ""}` : "ses lots";
          })()}
          , ainsi que les annonces et les tickets de maintenance liés.
        </p>
        <p className="text-text-muted mt-2 mb-0 text-sm">Un bâtiment dont des lots ont des baux ne peut pas être supprimé.</p>
        {removeBuilding.formError && (
          <p className="text-danger mt-3 mb-0" role="alert">
            {removeBuilding.formError}
          </p>
        )}
      </ConfirmDialog>

      {editingUnit && (
        <UnitFormModal
          building={editingUnit.building}
          unit={editingUnit.unit}
          canSetStatus={rights.changeStatus}
          onClose={() => setEditingUnit(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deletingUnit)}
        onClose={() => {
          removeUnit.resetErrors();
          setDeletingUnit(null);
        }}
        onConfirm={() => deletingUnit && removeUnit.mutate(deletingUnit)}
        pending={removeUnit.isPending}
        title="Supprimer ce lot ?"
        confirmLabel="Supprimer le lot"
        danger
      >
        <p className="m-0">
          Le lot <strong className="text-text-strong">{deletingUnit?.reference}</strong> sera supprimé, ainsi que ses annonces et
          ses tickets de maintenance. Un lot qui a des baux ne peut pas être supprimé.
        </p>
        {removeUnit.formError && (
          <p className="text-danger mt-3 mb-0" role="alert">
            {removeUnit.formError}
          </p>
        )}
      </ConfirmDialog>
    </>
  );
}
