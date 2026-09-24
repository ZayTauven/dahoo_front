"use client";

import { useState } from "react";

import { SelectField, TextField } from "@/components/app/ui/fields";
import { FormModal } from "@/components/app/ui/Modal";
import { useToast } from "@/components/app/ui/Toast";
import { api } from "@/lib/api/client";
import { ApiError, unwrap } from "@/lib/api/errors";
import type { Schema } from "@/lib/api/types";
import { useApiMutation } from "@/lib/api/useApiMutation";

import { MEMBERS_KEY, normalizePhone, ROLE_SUMMARY, type Role } from "./data";

type MemberForm = Required<Schema<"MembershipCreateRequest">>;

const EMPTY_FORM: MemberForm = { phone: "", role: "", first_name: "", last_name: "", email: "", password: "" };
const NEW_ACCOUNT_FIELDS = ["first_name", "last_name", "password"] as const;

/** Réponse signalant qu'aucun compte n'existe pour ce numéro : on affiche les champs du nouveau compte. */
const NEEDS_ACCOUNT = { needsAccount: true } as const;

/**
 * Ajout d'un membre par téléphone. Si le numéro a déjà un compte Dahoo, il suffit de choisir le rôle ;
 * sinon l'API demande prénom, nom et mot de passe, et la modale affiche ces champs pour créer le compte.
 */
export function AddMemberModal({ roles, onClose }: { roles: Role[]; onClose: () => void }) {
  const toast = useToast();
  const [form, setForm] = useState<MemberForm>(EMPTY_FORM);
  // Numéro pour lequel l'API a indiqué qu'aucun compte n'existe (changer de numéro repart de zéro).
  const [newAccountPhone, setNewAccountPhone] = useState<string | null>(null);
  const [roleMissing, setRoleMissing] = useState(false);
  const phone = normalizePhone(form.phone);
  const newAccount = newAccountPhone !== null && newAccountPhone === phone;

  const set = (field: keyof MemberForm) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const save = useApiMutation({
    mutationFn: async (body: MemberForm) => {
      const payload = newAccount ? { ...body, email: body.email || undefined } : { phone: body.phone, role: body.role };
      try {
        return unwrap(await api.POST("/api/v1/organizations/members/", { body: payload }));
      } catch (error) {
        const missingAccount =
          !newAccount &&
          error instanceof ApiError &&
          error.status === 400 &&
          NEW_ACCOUNT_FIELDS.some((field) => field in error.fields) &&
          !("phone" in error.fields) &&
          !("role" in error.fields);
        if (missingAccount) return NEEDS_ACCOUNT;
        // Mot de passe refusé par les règles de sécurité : l'API le signale sans nom de champ.
        if (newAccount && error instanceof ApiError && error.status === 400 && !Object.keys(error.fields).length) {
          throw new ApiError(400, error.message, { password: error.message });
        }
        throw error;
      }
    },
    invalidate: [MEMBERS_KEY],
    onSuccess: (result) => {
      if ("needsAccount" in result) {
        setNewAccountPhone(phone);
        return;
      }
      toast.success(`${result.user.first_name} ${result.user.last_name} a rejoint l'équipe.`);
      onClose();
    },
  });
  const errors = save.fieldErrors;
  const selectedRole = roles.find((role) => role.code === form.role);

  return (
    <FormModal
      open
      onClose={onClose}
      title="Ajouter un membre"
      submitLabel={newAccount ? "Créer le compte et ajouter" : "Ajouter"}
      onSubmit={() => {
        setRoleMissing(!form.role);
        if (form.role) save.mutate({ ...form, phone });
      }}
      pending={save.isPending}
      error={save.formError}
    >
      <p className="text-text-muted m-0 text-sm">
        Saisissez le numéro de téléphone du collaborateur. S&apos;il utilise déjà Dahoo, il retrouvera votre agence à sa
        prochaine connexion.
      </p>
      <TextField
        label="Téléphone"
        required
        type="tel"
        inputMode="tel"
        autoComplete="off"
        placeholder="+221 77 123 45 67"
        value={form.phone}
        onChange={set("phone")}
        error={errors.phone}
        hint="Numéro au format international (+221…) : c'est son identifiant de connexion."
      />
      <SelectField
        label="Rôle"
        required
        value={form.role}
        onChange={set("role")}
        error={roleMissing && !form.role ? "Choisissez un rôle." : errors.role}
        placeholder="Choisir un rôle"
        options={roles.map((role) => ({ value: role.code, label: role.label }))}
        hint={selectedRole ? ROLE_SUMMARY[selectedRole.code] : "Le rôle détermine ce que le membre peut voir et faire."}
      />

      {newAccount && (
        <>
          <div className="ax-alert ax-alert--info" role="status">
            <div className="ax-alert__content">
              <b className="ax-alert__title">Aucun compte Dahoo pour ce numéro</b>
              <p className="ax-alert__message">
                Un compte va être créé. Renseignez son identité et un mot de passe provisoire, puis communiquez-le au
                collaborateur : il se connectera avec son numéro et ce mot de passe.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Prénom"
              required
              autoComplete="off"
              value={form.first_name}
              onChange={set("first_name")}
              error={errors.first_name}
            />
            <TextField
              label="Nom"
              required
              autoComplete="off"
              value={form.last_name}
              onChange={set("last_name")}
              error={errors.last_name}
            />
          </div>
          <TextField label="Email" type="email" autoComplete="off" value={form.email} onChange={set("email")} error={errors.email} />
          <TextField
            label="Mot de passe provisoire"
            required
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={set("password")}
            error={errors.password}
            hint="Au moins 8 caractères, pas uniquement des chiffres ni un mot trop courant."
          />
        </>
      )}
    </FormModal>
  );
}
