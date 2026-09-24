"use client";

import { IconBuildingStore, IconLock } from "@tabler/icons-react";
import { useState, type ReactNode } from "react";

import { TextareaField, TextField } from "@/components/app/ui/fields";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import type { Schema } from "@/lib/api/types";
import { useApiMutation } from "@/lib/api/useApiMutation";
import { formatDate } from "@/lib/format";

export type Organization = Schema<"Organization">;
type OrganizationForm = Required<Schema<"PatchedOrganizationRequest">>;

export const ORGANIZATION_KEY = ["organization", "current"] as const;

function toForm(organization: Organization): OrganizationForm {
  return {
    name: organization.name,
    phone: organization.phone ?? "",
    email: organization.email ?? "",
    city: organization.city ?? "",
    address: organization.address ?? "",
  };
}

/** Coordonnées de l'agence : formulaire si l'utilisateur peut les modifier, fiche en lecture sinon. */
export function OrganizationCard({ organization, editable, readOnlyReason }: { organization: Organization; editable: boolean; readOnlyReason?: string }) {
  return (
    <section className="ax-card" aria-labelledby="agence-infos-titre">
      <div className="ax-card__header">
        <div className="ax-card__titles">
          <h2 className="ax-card__title flex items-center gap-2" id="agence-infos-titre">
            <IconBuildingStore className="text-accent-text size-5 shrink-0" stroke={1.75} aria-hidden="true" />
            Informations de l&apos;agence
          </h2>
          <p className="ax-card__subtitle">
            Affichées dans votre espace et sur votre fiche agence du site Dahoo. Agence créée le{" "}
            {formatDate(organization.created_at)}.
          </p>
        </div>
      </div>
      <div className="ax-card__body">
        {editable ? (
          // La clé réinitialise le formulaire quand les données enregistrées changent.
          <OrganizationForm key={JSON.stringify(toForm(organization))} organization={organization} />
        ) : (
          <>
            <dl className="m-0 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <Info label="Nom de l'agence">{organization.name}</Info>
              <Info label="Téléphone">{organization.phone && <span className="ax-num">{organization.phone}</span>}</Info>
              <Info label="Email">{organization.email}</Info>
              <Info label="Ville">{organization.city}</Info>
              <Info label="Adresse" wide>
                {organization.address}
              </Info>
            </dl>
            {readOnlyReason && (
              <p className="text-text-muted mt-5 mb-0 flex items-start gap-2 text-sm">
                <IconLock className="mt-0.5 size-4 shrink-0" stroke={1.75} aria-hidden="true" />
                <span>{readOnlyReason}</span>
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function Info({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={`flex min-w-0 flex-col gap-1${wide ? " sm:col-span-2" : ""}`}>
      <dt className="text-text-subtle text-xs font-medium">{label}</dt>
      <dd className="text-text-strong m-0 break-words">{children || <span className="text-text-subtle">Non renseigné</span>}</dd>
    </div>
  );
}

function OrganizationForm({ organization }: { organization: Organization }) {
  const initial = toForm(organization);
  const [form, setForm] = useState<OrganizationForm>(initial);
  const set = (field: keyof OrganizationForm) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));
  const dirty = (Object.keys(initial) as (keyof OrganizationForm)[]).some((field) => form[field] !== initial[field]);

  const save = useApiMutation({
    mutationFn: async (body: OrganizationForm) => unwrap(await api.PATCH("/api/v1/organizations/current/", { body })),
    // « session » : le nom de l'agence affiché dans l'en-tête vient de /users/me/.
    invalidate: [["organization"], ["session"]],
    success: "Informations de l'agence enregistrées.",
  });
  const errors = save.fieldErrors;

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!save.isPending && dirty) save.mutate({ ...form, name: form.name.trim() });
      }}
    >
      {save.formError && (
        <div className="ax-alert ax-alert--danger" role="alert">
          <div className="ax-alert__content">
            <p className="ax-alert__message">{save.formError}</p>
          </div>
        </div>
      )}
      <TextField label="Nom de l'agence" required value={form.name} onChange={set("name")} error={errors.name} autoComplete="organization" />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Téléphone"
          type="tel"
          inputMode="tel"
          placeholder="+221 33 800 00 00"
          value={form.phone}
          onChange={set("phone")}
          error={errors.phone}
          autoComplete="tel"
        />
        <TextField
          label="Email de contact"
          type="email"
          placeholder="contact@votre-agence.sn"
          value={form.email}
          onChange={set("email")}
          error={errors.email}
          autoComplete="email"
        />
      </div>
      <TextField label="Ville" placeholder="Dakar" value={form.city} onChange={set("city")} error={errors.city} autoComplete="address-level2" />
      <TextareaField
        label="Adresse"
        rows={2}
        placeholder="Rue 10 × Corniche, Point E"
        value={form.address}
        onChange={set("address")}
        error={errors.address}
        autoComplete="street-address"
      />
      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        {dirty && (
          <button
            type="button"
            className="ax-btn ax-btn--ghost"
            onClick={() => {
              setForm(initial);
              save.resetErrors();
            }}
          >
            <span className="ax-btn__label">Annuler les modifications</span>
          </button>
        )}
        <button
          type="submit"
          className={`ax-btn ax-btn--primary${save.isPending ? " is-loading" : ""}`}
          disabled={!dirty || save.isPending}
          aria-busy={save.isPending}
        >
          <span className="ax-btn__spinner" aria-hidden="true" />
          <span className="ax-btn__label">Enregistrer</span>
        </button>
      </div>
    </form>
  );
}
