"use client";

import { IconDoor, IconPencil, IconPlus, IconSpeakerphone, IconTrash } from "@tabler/icons-react";
import Link from "next/link";

import { DataTable, type Column } from "@/components/app/ui/DataTable";
import { formatNumber } from "@/lib/format";

import { formatSurface, type Building, type Unit, type UnitStatus } from "./data";
import { OccupancyBar } from "./OccupancyBar";
import { UnitStatusControl } from "./UnitStatusControl";

export interface BuildingRights {
  renameBuilding: boolean;
  deleteBuilding: boolean;
  createUnit: boolean;
  updateUnit: boolean;
  deleteUnit: boolean;
  changeStatus: boolean;
  createListing: boolean;
}

/** Un bâtiment du bien : en-tête (nom, occupation, actions) et tableau de ses lots. */
export function BuildingSection({
  building,
  units,
  loading,
  error,
  onRetry,
  rights,
  statusPendingId,
  onRename,
  onDelete,
  onAddUnit,
  onEditUnit,
  onDeleteUnit,
  onChangeStatus,
}: {
  building: Building;
  units: Unit[] | undefined;
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
  rights: BuildingRights;
  /** Lot dont le changement de statut est en cours d'envoi. */
  statusPendingId: number | null;
  onRename: () => void;
  onDelete: () => void;
  onAddUnit: () => void;
  onEditUnit: (unit: Unit) => void;
  onDeleteUnit: (unit: Unit) => void;
  onChangeStatus: (unit: Unit, status: UnitStatus) => void;
}) {
  const headingId = `batiment-${building.id}`;
  const occupied = units?.filter((unit) => unit.status === "RENTED").length ?? 0;
  const hasUnitActions = rights.updateUnit || rights.deleteUnit || rights.createListing;

  const columns: Column<Unit>[] = [
    {
      key: "reference",
      header: "Lot",
      cell: (unit) => (
        <div className="flex flex-col">
          <span className="text-text-strong font-medium">{unit.reference}</span>
          <span className="text-text-subtle text-xs">
            {unit.unit_type}
            {/* Sur mobile, la surface et la catégorie (colonnes masquées) passent sous la référence. */}
            <span className="md:hidden">
              {" · "}
              {unit.category_label} · {formatSurface(unit.surface)}
            </span>
          </span>
        </div>
      ),
    },
    { key: "category", header: "Type", hideOnMobile: true, cell: (unit) => unit.category_label },
    { key: "surface", header: "Surface", numeric: true, hideOnMobile: true, cell: (unit) => formatSurface(unit.surface) },
    { key: "bedrooms", header: "Chambres", numeric: true, hideOnMobile: true, cell: (unit) => formatNumber(unit.bedrooms) },
    { key: "bathrooms", header: "Salles de bain", numeric: true, hideOnMobile: true, cell: (unit) => formatNumber(unit.bathrooms) },
    {
      key: "furnished",
      header: "Meublé",
      hideOnMobile: true,
      cell: (unit) => (unit.is_furnished ? "Oui" : <span className="text-text-subtle">Non</span>),
    },
    {
      key: "status",
      header: "Statut",
      cell: (unit) => (
        <UnitStatusControl
          unit={unit}
          editable={rights.changeStatus}
          pending={statusPendingId === unit.id}
          onChange={(status) => onChangeStatus(unit, status)}
        />
      ),
    },
  ];

  if (hasUnitActions) {
    columns.push({
      key: "actions",
      header: "Actions",
      cell: (unit) => (
        <div className="flex justify-end gap-1">
          {rights.createListing && unit.status === "FREE" && (
            <Link
              href={`/espace/annonces?lot=${unit.id}`}
              className="ax-btn ax-btn--ghost ax-btn--icon ax-btn--sm"
              aria-label={`Créer une annonce pour le lot ${unit.reference}`}
              title="Créer une annonce"
            >
              <IconSpeakerphone className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
            </Link>
          )}
          {rights.updateUnit && (
            <button
              type="button"
              className="ax-btn ax-btn--ghost ax-btn--icon ax-btn--sm"
              onClick={() => onEditUnit(unit)}
              aria-label={`Modifier le lot ${unit.reference}`}
              title="Modifier"
            >
              <IconPencil className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
            </button>
          )}
          {rights.deleteUnit && (
            <button
              type="button"
              className="ax-btn ax-btn--ghost ax-btn--icon ax-btn--sm"
              onClick={() => onDeleteUnit(unit)}
              aria-label={`Supprimer le lot ${unit.reference}`}
              title="Supprimer"
            >
              <IconTrash className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
            </button>
          )}
        </div>
      ),
    });
  }

  const addUnitButton = (variant: "secondary" | "primary") =>
    rights.createUnit && (
      <button type="button" className={`ax-btn ax-btn--${variant} ax-btn--sm`} onClick={onAddUnit}>
        <IconPlus className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
        <span className="ax-btn__label">Ajouter un lot</span>
      </button>
    );

  return (
    <section className="ax-card" aria-labelledby={headingId}>
      <div className="ax-card__header flex-wrap">
        <div className="ax-card__titles">
          <h3 className="ax-card__title" id={headingId}>
            {building.name}
          </h3>
          <p className="ax-card__subtitle">
            {units ? `${formatNumber(units.length)} lot${units.length > 1 ? "s" : ""}` : "Lots…"}
          </p>
        </div>
        <div className="ax-card__actions flex-wrap">
          {units && units.length > 0 && <OccupancyBar occupied={occupied} total={units.length} className="mr-2 max-sm:hidden" />}
          {addUnitButton("secondary")}
          {rights.renameBuilding && (
            <button
              type="button"
              className="ax-btn ax-btn--ghost ax-btn--icon ax-btn--sm"
              onClick={onRename}
              aria-label={`Renommer ${building.name}`}
              title="Renommer"
            >
              <IconPencil className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
            </button>
          )}
          {rights.deleteBuilding && (
            <button
              type="button"
              className="ax-btn ax-btn--ghost ax-btn--icon ax-btn--sm"
              onClick={onDelete}
              aria-label={`Supprimer ${building.name}`}
              title="Supprimer le bâtiment"
            >
              <IconTrash className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      <div className="ax-card__body">
        <DataTable
          caption={`Lots du bâtiment ${building.name}`}
          columns={columns}
          rows={units}
          rowKey={(unit) => unit.id}
          loading={loading}
          error={error}
          onRetry={onRetry}
          empty={
            // État vide sans titre de niveau 2 : on est déjà sous le titre (h3) du bâtiment.
            <div className="ax-empty">
              <IconDoor className="ax-empty__icon" stroke={1.5} aria-hidden="true" />
              <p className="text-text-strong m-0 font-medium">Aucun lot dans ce bâtiment</p>
              <p className="m-0 max-w-md">
                Ajoutez ses lots (appartements, bureaux, commerces…) avec leur surface et leur statut : ce sont eux que
                l&apos;on loue, que l&apos;on vend et que l&apos;on publie en annonce.
              </p>
              {addUnitButton("primary")}
            </div>
          }
        />
      </div>
    </section>
  );
}
