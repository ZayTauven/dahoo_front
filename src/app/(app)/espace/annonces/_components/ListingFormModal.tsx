"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { SelectField, TextareaField, TextField } from "@/components/app/ui/fields";
import { FormModal } from "@/components/app/ui/Modal";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { useApiMutation } from "@/lib/api/useApiMutation";
import { formatMoney } from "@/lib/format";
import { enumLabel, enumOptions, LISTING_TYPE, UNIT_STATUS } from "@/lib/labels";

import { asListingType, fetchAllUnits, KEYS, type Listing, type ListingType } from "./data";

interface ListingForm {
  unit: string;
  title: string;
  description: string;
  listing_type: ListingType;
  price: string;
}

/** Montant saisi (« 450 000 », « 450000 ») → chaîne de chiffres attendue par l'API, sinon null. */
function normalizePrice(raw: string): string | null {
  let compact = raw.replace(/[\s\u00a0\u202f]/g, "");
  // Points acceptés seulement comme séparateurs de milliers (« 450.000 »), jamais comme décimales.
  if (/^\d{1,3}(\.\d{3})+$/.test(compact)) compact = compact.replace(/\./g, "");
  return /^\d{1,10}$/.test(compact) ? compact : null;
}

/**
 * Création ou modification d'une annonce : lot, titre, description, type et prix.
 * Le statut ne se modifie pas ici (publier / dépublier depuis la fiche).
 */
export function ListingFormModal({
  listing,
  initialUnit,
  onClose,
  onCreated,
}: {
  listing: Listing | null;
  /** Lot pré-sélectionné (lien « Créer une annonce » du module Biens : ?lot={id}). */
  initialUnit?: number;
  onClose: () => void;
  onCreated?: (listing: Listing) => void;
}) {
  const [form, setForm] = useState<ListingForm>(
    listing
      ? {
          unit: String(listing.unit),
          title: listing.title,
          description: listing.description,
          listing_type: listing.listing_type,
          price: String(Math.round(Number(listing.price))),
        }
      : { unit: initialUnit ? String(initialUnit) : "", title: "", description: "", listing_type: "RENT", price: "" },
  );
  const [localErrors, setLocalErrors] = useState<Partial<Record<keyof ListingForm, string>>>({});
  const set = (field: keyof ListingForm) => (event: { target: { value: string } }) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
    setLocalErrors((current) => ({ ...current, [field]: undefined }));
  };

  const units = useQuery({ queryKey: [...KEYS.units, "tous"], queryFn: fetchAllUnits, staleTime: 60_000 });
  const unitOptions = (units.data ?? []).map((unit) => ({
    value: unit.id,
    label: `${unit.label} — ${[unit.category_label, unit.unit_type].filter(Boolean).join(" ")} · ${enumLabel(UNIT_STATUS, unit.status)}`,
  }));
  const selectedUnit = units.data?.find((unit) => String(unit.id) === form.unit);
  const preselectedMissing = Boolean(initialUnit && units.data && !units.data.some((unit) => unit.id === initialUnit));

  const save = useApiMutation({
    mutationFn: async (body: { unit: number; title: string; description: string; listing_type: ListingType; price: string }) =>
      listing
        ? unwrap(await api.PATCH("/api/v1/listings/{id}/", { params: { path: { id: listing.id } }, body }))
        : unwrap(await api.POST("/api/v1/listings/", { body })),
    invalidate: [KEYS.listings],
    success: listing ? "Annonce mise à jour." : "Annonce créée en brouillon. Ajoutez maintenant ses photos.",
    onSuccess: (result) => (listing ? onClose() : onCreated?.(result)),
  });

  const submit = () => {
    const errors: Partial<Record<keyof ListingForm, string>> = {};
    const price = normalizePrice(form.price);
    if (!form.unit) errors.unit = "Choisissez le lot concerné par l'annonce.";
    if (!form.title.trim()) errors.title = "Donnez un titre à l'annonce.";
    if (!form.description.trim()) errors.description = "Décrivez le bien : pièces, équipements, environnement.";
    if (price === null) errors.price = "Indiquez un montant en FCFA, en chiffres, sans décimales.";
    setLocalErrors(errors);
    if (Object.keys(errors).length > 0 || price === null) return;
    save.mutate({
      unit: Number(form.unit),
      title: form.title.trim(),
      description: form.description.trim(),
      listing_type: form.listing_type,
      price,
    });
  };

  const error = (field: keyof ListingForm) => localErrors[field] ?? save.fieldErrors[field];
  const isRent = form.listing_type === "RENT";
  const price = normalizePrice(form.price);

  return (
    <FormModal
      open
      onClose={onClose}
      title={listing ? "Modifier l'annonce" : "Nouvelle annonce"}
      submitLabel={listing ? "Enregistrer" : "Créer l'annonce"}
      onSubmit={submit}
      pending={save.isPending}
      error={save.formError}
      size="lg"
    >
      <SelectField
        label="Lot"
        required
        value={form.unit}
        onChange={set("unit")}
        options={unitOptions}
        placeholder={units.isLoading ? "Chargement des lots…" : "Choisir un lot"}
        disabled={units.isLoading}
        error={error("unit") ?? (units.error ? `Lots indisponibles : ${units.error.message}` : undefined)}
        hint={
          preselectedMissing
            ? "Le lot indiqué dans le lien est introuvable : choisissez-le dans la liste."
            : selectedUnit
              ? `${selectedUnit.surface} m²${selectedUnit.bedrooms != null ? ` · ${selectedUnit.bedrooms} ch.` : ""}${selectedUnit.is_furnished ? " · meublé" : ""}`
              : "Le bien, le bâtiment et le lot mis en location ou en vente."
        }
      />
      <TextField
        label="Titre"
        required
        maxLength={200}
        placeholder="Ex. Appartement F3 lumineux à Mermoz"
        value={form.title}
        onChange={set("title")}
        error={error("title")}
        hint="Affiché en gros sur le portail : type de bien, point fort et quartier."
      />
      <TextareaField
        label="Description"
        required
        rows={6}
        placeholder="Pièces, surface, équipements (climatisation, groupe électrogène, gardien…), proximité des commerces et des écoles."
        value={form.description}
        onChange={set("description")}
        error={error("description")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Type d'annonce"
          required
          value={form.listing_type}
          onChange={(event) => {
            const type = asListingType(event.target.value);
            if (type) setForm((current) => ({ ...current, listing_type: type }));
          }}
          options={enumOptions(LISTING_TYPE)}
          error={save.fieldErrors.listing_type}
        />
        <TextField
          label={isRent ? "Loyer mensuel (FCFA)" : "Prix de vente (FCFA)"}
          required
          inputMode="numeric"
          autoComplete="off"
          placeholder={isRent ? "350 000" : "85 000 000"}
          value={form.price}
          onChange={set("price")}
          error={error("price")}
          hint={price ? `Affiché : ${formatMoney(price)}${isRent ? " / mois" : ""}` : "Montant en chiffres, sans décimales."}
        />
      </div>
      {listing && (
        <p className="text-text-muted m-0 text-sm">
          Type actuel : {enumLabel(LISTING_TYPE, listing.listing_type)}. Les modifications d&apos;une annonce publiée sont visibles sur le
          portail en moins d&apos;une minute.
        </p>
      )}
    </FormModal>
  );
}
