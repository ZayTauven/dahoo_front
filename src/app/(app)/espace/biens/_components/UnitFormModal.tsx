"use client";

import { useState } from "react";

import { CheckboxField, SelectField, TextField } from "@/components/app/ui/fields";
import { FormModal } from "@/components/app/ui/Modal";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import type { Schema } from "@/lib/api/types";
import { useApiMutation } from "@/lib/api/useApiMutation";
import { enumOptions, UNIT_CATEGORY, UNIT_STATUS } from "@/lib/labels";

import { optionalInteger, PROPERTIES_KEY, UNITS_KEY, type Building, type Unit, type UnitCategory, type UnitStatus } from "./data";

type UnitForm = {
  reference: string;
  category: UnitCategory;
  unit_type: string;
  surface: string;
  bedrooms: string;
  bathrooms: string;
  parking_spaces: string;
  is_furnished: boolean;
  status: UnitStatus;
};

const text = (value: number | null | undefined) => (value === null || value === undefined ? "" : String(value));

function toForm(unit: Unit | null): UnitForm {
  return {
    reference: unit?.reference ?? "",
    category: unit?.category ?? "APARTMENT",
    unit_type: unit?.unit_type ?? "",
    surface: text(unit?.surface),
    bedrooms: text(unit?.bedrooms),
    bathrooms: text(unit?.bathrooms),
    parking_spaces: text(unit?.parking_spaces),
    is_furnished: unit?.is_furnished ?? false,
    status: unit?.status ?? "FREE",
  };
}

/** Surface saisie (virgule ou point) ; null si vide ou invalide. */
function parseSurface(value: string): number | null {
  const trimmed = value.trim().replace(",", ".");
  const surface = Number(trimmed);
  return trimmed === "" || !Number.isFinite(surface) || surface < 0 ? null : surface;
}

function toBody(form: UnitForm, surface: number): Schema<"UnitRequest"> {
  const land = form.category === "LAND";
  return {
    reference: form.reference.trim(),
    category: form.category,
    unit_type: form.unit_type.trim(),
    surface,
    bedrooms: land ? null : optionalInteger(form.bedrooms),
    bathrooms: land ? null : optionalInteger(form.bathrooms),
    parking_spaces: optionalInteger(form.parking_spaces),
    is_furnished: land ? false : form.is_furnished,
    status: form.status,
  };
}

/** Création ou modification d'un lot dans un bâtiment. */
export function UnitFormModal({
  building,
  unit,
  canSetStatus,
  onClose,
}: {
  building: Building;
  unit: Unit | null;
  /** Le statut d'un lot existant ne se modifie ici qu'avec la capability unit.change_status. */
  canSetStatus: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<UnitForm>(() => toForm(unit));
  const [surfaceError, setSurfaceError] = useState<string>();
  const set = (field: Exclude<keyof UnitForm, "is_furnished">) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const save = useApiMutation({
    mutationFn: async (body: Schema<"UnitRequest">) =>
      unit
        ? unwrap(await api.PATCH("/api/v1/properties/units/{id}/", { params: { path: { id: unit.id } }, body }))
        : unwrap(
            await api.POST("/api/v1/properties/buildings/{building_pk}/units/", {
              params: { path: { building_pk: building.id } },
              body,
            }),
          ),
    invalidate: [UNITS_KEY, PROPERTIES_KEY],
    success: (saved) => (unit ? `Lot ${saved.reference} mis à jour.` : `Lot ${saved.reference} ajouté.`),
    onSuccess: onClose,
  });
  const errors = save.fieldErrors;
  const land = form.category === "LAND";

  const submit = () => {
    const surface = parseSurface(form.surface);
    if (surface === null) {
      setSurfaceError("Indiquez la surface en m² (par exemple 75 ou 62,5).");
      return;
    }
    setSurfaceError(undefined);
    save.mutate(toBody(form, surface));
  };

  return (
    <FormModal
      open
      size="lg"
      onClose={onClose}
      title={unit ? `Modifier le lot ${unit.reference}` : `Nouveau lot · ${building.name}`}
      submitLabel={unit ? "Enregistrer" : "Ajouter le lot"}
      onSubmit={submit}
      pending={save.isPending}
      error={save.formError}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Référence"
          required
          placeholder="A101, RDC-2, Villa 4…"
          value={form.reference}
          onChange={set("reference")}
          error={errors.reference}
          autoComplete="off"
          hint="Identifiant du lot dans le bâtiment (porte, étage…)."
        />
        <SelectField
          label="Catégorie"
          required
          value={form.category}
          onChange={set("category")}
          error={errors.category}
          options={enumOptions(UNIT_CATEGORY)}
          hint="Sert aux filtres du site d'annonces."
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Désignation"
          required
          placeholder="T2, F3, studio meublé…"
          value={form.unit_type}
          onChange={set("unit_type")}
          error={errors.unit_type}
          autoComplete="off"
          hint="Libellé libre, tel qu'il apparaît dans vos annonces."
        />
        <TextField
          label="Surface (m²)"
          required
          inputMode="decimal"
          placeholder="75"
          value={form.surface}
          onChange={set("surface")}
          error={surfaceError ?? errors.surface}
          autoComplete="off"
        />
      </div>
      <div className={`grid gap-4 ${land ? "sm:grid-cols-1" : "grid-cols-2 sm:grid-cols-3"}`}>
        {!land && (
          <>
            <TextField
              label="Chambres"
              type="number"
              min={0}
              inputMode="numeric"
              value={form.bedrooms}
              onChange={set("bedrooms")}
              error={errors.bedrooms}
            />
            <TextField
              label="Salles de bain"
              type="number"
              min={0}
              inputMode="numeric"
              value={form.bathrooms}
              onChange={set("bathrooms")}
              error={errors.bathrooms}
            />
          </>
        )}
        <TextField
          label="Places de parking"
          type="number"
          min={0}
          inputMode="numeric"
          value={form.parking_spaces}
          onChange={set("parking_spaces")}
          error={errors.parking_spaces}
        />
      </div>
      <div className="grid items-end gap-4 sm:grid-cols-2">
        <SelectField
          label="Statut"
          required
          value={form.status}
          onChange={set("status")}
          error={errors.status}
          options={enumOptions(UNIT_STATUS)}
          disabled={Boolean(unit) && !canSetStatus}
          hint={
            unit && !canSetStatus
              ? "Vous n'avez pas le droit de changer le statut d'un lot."
              : "« Loué » est normalement fixé par l'activation d'un bail."
          }
        />
        {!land && (
          <CheckboxField
            label="Logement meublé"
            className="pb-2"
            checked={form.is_furnished}
            onChange={(event) => setForm((current) => ({ ...current, is_furnished: event.target.checked }))}
          />
        )}
      </div>
    </FormModal>
  );
}
