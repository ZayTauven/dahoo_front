"use client";

import { useState } from "react";

import { TextField } from "@/components/app/ui/fields";
import { FormModal } from "@/components/app/ui/Modal";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { useApiMutation } from "@/lib/api/useApiMutation";

import { BUILDINGS_KEY, PROPERTIES_KEY, UNITS_KEY, type Building } from "./data";

/** Ajout ou renommage d'un bâtiment d'un bien. */
export function BuildingFormModal({
  propertyId,
  building,
  suggestion,
  onClose,
}: {
  propertyId: number;
  building: Building | null;
  /** Nom proposé pour un premier bâtiment (« Bâtiment principal »). */
  suggestion?: string;
  onClose: () => void;
}) {
  const [name, setName] = useState(building?.name ?? suggestion ?? "");

  const save = useApiMutation({
    mutationFn: async (body: { name: string }) =>
      building
        ? unwrap(await api.PATCH("/api/v1/properties/buildings/{id}/", { params: { path: { id: building.id } }, body }))
        : unwrap(
            await api.POST("/api/v1/properties/properties/{property_pk}/buildings/", {
              params: { path: { property_pk: propertyId } },
              body,
            }),
          ),
    // Les libellés des lots (« Bien · Bâtiment · Réf. ») changent avec le nom du bâtiment.
    invalidate: [BUILDINGS_KEY, PROPERTIES_KEY, UNITS_KEY],
    success: building ? "Bâtiment renommé." : "Bâtiment ajouté.",
    onSuccess: onClose,
  });

  return (
    <FormModal
      open
      size="sm"
      onClose={onClose}
      title={building ? "Renommer le bâtiment" : "Nouveau bâtiment"}
      submitLabel={building ? "Enregistrer" : "Ajouter"}
      onSubmit={() => save.mutate({ name: name.trim() })}
      pending={save.isPending}
      error={save.formError}
    >
      <TextField
        label="Nom du bâtiment"
        required
        placeholder="Bâtiment A, Immeuble principal, Villa…"
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={save.fieldErrors.name}
        autoComplete="off"
        hint={building ? undefined : "Même une villa seule a un bâtiment : c'est lui qui porte ses lots."}
      />
    </FormModal>
  );
}
