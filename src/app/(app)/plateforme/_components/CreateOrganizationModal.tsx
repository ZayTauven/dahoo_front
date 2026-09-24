"use client";

import { useState, type ReactNode } from "react";

import { TextField } from "@/components/app/ui/fields";
import { FormModal } from "@/components/app/ui/Modal";
import { api } from "@/lib/api/client";
import { toApiError } from "@/lib/api/errors";
import type { Schema } from "@/lib/api/types";
import { useApiMutation } from "@/lib/api/useApiMutation";
import { formatDate } from "@/lib/format";

import { addDays, KEYS, TRIAL_DAYS, type Organization } from "./data";

type CreateBody = Schema<"PlatformOrganizationCreateRequest">;
type AccountMode = "existing" | "new";

export interface OrganizationDraft {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  adminPhone: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
}

const EMPTY_DRAFT: OrganizationDraft = {
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  adminPhone: "",
  adminFirstName: "",
  adminLastName: "",
  adminEmail: "",
};

/**
 * Erreurs du premier administrateur : l'API les renvoie imbriquées ({"admin": {"phone": [...]}})
 * ou en liste (validation du mot de passe). On les aplatit en `admin_<champ>` pour les champs.
 */
function flattenAdminErrors(payload: unknown): unknown {
  if (!payload || typeof payload !== "object" || Array.isArray(payload) || !("admin" in payload)) return payload;
  const { admin, ...rest } = payload as Record<string, unknown>;
  if (Array.isArray(admin) || typeof admin === "string") return { ...rest, admin_password: admin };
  if (admin && typeof admin === "object") {
    return { ...rest, ...Object.fromEntries(Object.entries(admin).map(([field, value]) => [`admin_${field}`, value])) };
  }
  return rest;
}

async function createOrganization(body: CreateBody): Promise<Organization> {
  const result = await api.POST("/api/v1/platform/organizations/", { body });
  if (result.error !== undefined || !result.response.ok || !result.data) {
    throw toApiError(result.response.status, flattenAdminErrors(result.error));
  }
  return result.data;
}

/**
 * Création d'une agence et de son premier administrateur (compte existant retrouvé par téléphone,
 * ou nouveau compte). L'essai gratuit démarre à la création.
 */
export function CreateOrganizationModal({
  initial,
  context,
  onClose,
  onCreated,
}: {
  /** Préremplissage (demande de démo). */
  initial?: Partial<OrganizationDraft>;
  /** Rappel affiché en tête du formulaire (origine de la création). */
  context?: ReactNode;
  onClose: () => void;
  onCreated?: (organization: Organization) => void;
}) {
  const [form, setForm] = useState<OrganizationDraft>({ ...EMPTY_DRAFT, ...initial });
  const [mode, setMode] = useState<AccountMode>(initial?.adminFirstName ? "new" : "existing");
  const [password, setPassword] = useState("");
  const set = (field: keyof OrganizationDraft) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const save = useApiMutation({
    mutationFn: createOrganization,
    invalidate: [KEYS.organizations],
    success: (organization) => `Agence « ${organization.name} » créée. Son essai gratuit court jusqu'au ${formatDate(organization.trial_ends_at)}.`,
    onSuccess: (organization) => {
      onCreated?.(organization);
      onClose();
    },
  });
  const errors = save.fieldErrors;

  // Numéro inconnu alors que « compte existant » était choisi : l'API réclame prénom, nom et mot de passe.
  const accountMissing = mode === "existing" && Boolean(errors.admin_first_name || errors.admin_last_name || errors.admin_password);
  const [switchedFor, setSwitchedFor] = useState<object>();
  if (accountMissing && switchedFor !== errors) {
    setSwitchedFor(errors);
    setMode("new");
  }
  const switchedToNew = switchedFor !== undefined && switchedFor === errors;

  const submit = () => {
    const admin: CreateBody["admin"] =
      mode === "existing"
        ? { phone: form.adminPhone.trim() }
        : {
            phone: form.adminPhone.trim(),
            first_name: form.adminFirstName.trim(),
            last_name: form.adminLastName.trim(),
            email: form.adminEmail.trim(),
            password,
          };
    save.mutate({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      admin,
    });
  };

  const trialEnd = formatDate(addDays(new Date(), TRIAL_DAYS));

  return (
    <FormModal open onClose={onClose} title="Créer une agence" submitLabel="Créer l'agence" onSubmit={submit} pending={save.isPending} error={save.formError} size="lg">
      {context}
      <div className="ax-alert ax-alert--info">
        <div className="ax-alert__content">
          <p className="ax-alert__title">Essai gratuit de {TRIAL_DAYS} jours</p>
          <p className="ax-alert__message">
            L&apos;essai démarre dès la création : l&apos;agence dispose de toutes les fonctionnalités jusqu&apos;au {trialEnd}. Sans
            abonnement à cette date, son espace passe en lecture seule. Vous pourrez prolonger l&apos;essai depuis sa fiche.
          </p>
        </div>
      </div>

      <section className="flex flex-col gap-4" aria-labelledby="creation-agence">
        <h3 id="creation-agence" className="text-text-strong font-display m-0 text-base font-semibold">
          L&apos;agence
        </h3>
        <TextField label="Nom de l'agence" required value={form.name} onChange={set("name")} error={errors.name} autoComplete="off" placeholder="Ex. Teranga Immobilier" />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Téléphone de l'agence" type="tel" inputMode="tel" placeholder="+221 33 800 00 00" value={form.phone} onChange={set("phone")} error={errors.phone} />
          <TextField label="Email de l'agence" type="email" value={form.email} onChange={set("email")} error={errors.email} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Ville" placeholder="Dakar, Thiès, Saly…" value={form.city} onChange={set("city")} error={errors.city} />
          <TextField label="Adresse" placeholder="Rue, quartier" value={form.address} onChange={set("address")} error={errors.address} />
        </div>
      </section>

      <section className="border-border-default flex flex-col gap-4 border-t pt-4" aria-labelledby="creation-administrateur">
        <div>
          <h3 id="creation-administrateur" className="text-text-strong font-display m-0 text-base font-semibold">
            Premier administrateur
          </h3>
          <p className="text-text-muted mt-1 mb-0 text-sm">
            Il gère ensuite l&apos;agence depuis son espace : équipe, biens, baux et paiements.
          </p>
        </div>
        <div className="ax-segment self-start" role="group" aria-label="Compte de l'administrateur">
          <button type="button" className="ax-segment__option" aria-pressed={mode === "existing"} onClick={() => setMode("existing")}>
            Compte Dahoo existant
          </button>
          <button type="button" className="ax-segment__option" aria-pressed={mode === "new"} onClick={() => setMode("new")}>
            Nouveau compte
          </button>
        </div>
        {switchedToNew && mode === "new" && (
          <div className="ax-alert ax-alert--warning" role="status">
            <div className="ax-alert__content">
              <p className="ax-alert__message">
                Aucun compte Dahoo n&apos;utilise ce numéro : complétez le prénom, le nom et un mot de passe pour le créer.
              </p>
            </div>
          </div>
        )}
        <TextField
          label="Téléphone de l'administrateur"
          required
          type="tel"
          inputMode="tel"
          placeholder="+221 77 123 45 67"
          value={form.adminPhone}
          onChange={set("adminPhone")}
          error={errors.admin_phone}
          hint={
            mode === "existing"
              ? "Le numéro de connexion d'un compte Dahoo existant : il sera rattaché à l'agence comme administrateur."
              : "Il servira d'identifiant de connexion. Si un compte Dahoo utilise déjà ce numéro, il est simplement rattaché à l'agence."
          }
        />
        {mode === "new" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Prénom" required value={form.adminFirstName} onChange={set("adminFirstName")} error={errors.admin_first_name} autoComplete="off" />
              <TextField label="Nom" required value={form.adminLastName} onChange={set("adminLastName")} error={errors.admin_last_name} autoComplete="off" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Email" type="email" value={form.adminEmail} onChange={set("adminEmail")} error={errors.admin_email} autoComplete="off" />
              <TextField
                label="Mot de passe provisoire"
                required
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                error={errors.admin_password}
                hint="8 caractères au moins. Transmettez-le de façon sûre ; l'administrateur pourra le changer."
              />
            </div>
          </>
        )}
      </section>
    </FormModal>
  );
}
