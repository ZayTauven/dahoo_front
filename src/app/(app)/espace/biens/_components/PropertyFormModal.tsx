"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { TextField } from "@/components/app/ui/fields";
import { FormModal } from "@/components/app/ui/Modal";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import type { Schema } from "@/lib/api/types";
import { useApiMutation } from "@/lib/api/useApiMutation";

import { optionalCoordinate, PROPERTIES_KEY, SENEGAL_CITIES, type Property } from "./data";

type PropertyForm = { name: string; address: string; neighborhood: string; city: string; latitude: string; longitude: string };

function toForm(property: Property | null): PropertyForm {
  return {
    name: property?.name ?? "",
    address: property?.address ?? "",
    neighborhood: property?.neighborhood ?? "",
    city: property?.city ?? "Dakar",
    latitude: property?.latitude ?? "",
    longitude: property?.longitude ?? "",
  };
}

function toBody(form: PropertyForm): Schema<"PropertyRequest"> {
  return {
    name: form.name.trim(),
    address: form.address.trim(),
    neighborhood: form.neighborhood.trim(),
    city: form.city.trim(),
    latitude: optionalCoordinate(form.latitude),
    longitude: optionalCoordinate(form.longitude),
  };
}

/**
 * Création ou modification d'un bien. Après une création, on ouvre la fiche du bien
 * pour enchaîner sur ses bâtiments et ses lots.
 */
export function PropertyFormModal({ property, onClose }: { property: Property | null; onClose: () => void }) {
  const router = useRouter();
  const citiesId = useId();
  const [form, setForm] = useState<PropertyForm>(() => toForm(property));
  const set = (field: keyof PropertyForm) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const save = useApiMutation({
    mutationFn: async (body: Schema<"PropertyRequest">) =>
      property
        ? unwrap(await api.PATCH("/api/v1/properties/properties/{id}/", { params: { path: { id: property.id } }, body }))
        : unwrap(await api.POST("/api/v1/properties/properties/", { body })),
    invalidate: [PROPERTIES_KEY],
    success: property ? "Bien mis à jour." : "Bien ajouté. Ajoutez maintenant ses bâtiments et ses lots.",
    onSuccess: (saved) => {
      onClose();
      if (!property) router.push(`/espace/biens/${saved.id}`);
    },
  });
  const errors = save.fieldErrors;

  return (
    <FormModal
      open
      onClose={onClose}
      title={property ? "Modifier le bien" : "Nouveau bien"}
      submitLabel={property ? "Enregistrer" : "Ajouter le bien"}
      onSubmit={() => save.mutate(toBody(form))}
      pending={save.isPending}
      error={save.formError}
    >
      <TextField
        label="Nom du bien"
        required
        placeholder="Résidence Les Filaos"
        value={form.name}
        onChange={set("name")}
        error={errors.name}
        autoComplete="off"
        hint="Le nom sous lequel votre équipe désigne le bien."
      />
      <TextField
        label="Adresse"
        required
        placeholder="Rue 10 x Corniche, lot 45"
        value={form.address}
        onChange={set("address")}
        error={errors.address}
        autoComplete="off"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Quartier"
          placeholder="Mermoz, Almadies, HLM…"
          value={form.neighborhood}
          onChange={set("neighborhood")}
          error={errors.neighborhood}
          autoComplete="off"
        />
        <TextField label="Ville" required list={citiesId} value={form.city} onChange={set("city")} error={errors.city} autoComplete="off" />
        <datalist id={citiesId}>
          {SENEGAL_CITIES.map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>
      </div>
      <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
        <legend className="text-text-strong mb-1 p-0 text-sm font-medium">Position GPS (facultatif)</legend>
        <p className="text-text-muted m-0 text-sm">
          Pour situer l&apos;annonce sur la carte (la position montrée aux visiteurs du site est arrondie). Astuce : un
          appui long sur l&apos;emplacement dans une application de cartes affiche ses coordonnées.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Latitude"
            inputMode="decimal"
            placeholder="14.716677"
            value={form.latitude}
            onChange={set("latitude")}
            error={errors.latitude}
            autoComplete="off"
          />
          <TextField
            label="Longitude"
            inputMode="decimal"
            placeholder="-17.467686"
            value={form.longitude}
            onChange={set("longitude")}
            error={errors.longitude}
            autoComplete="off"
          />
        </div>
      </fieldset>
    </FormModal>
  );
}
