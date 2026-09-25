"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import { FormAlert, Honeypot, SiteTextareaField, SiteTextField, SubmitButton } from "@/components/site/form";

import { requestVisit } from "../[id]/actions";
import { INITIAL_VISIT_STATE, VISIT_LIMITS, type VisitRequestState } from "./visit-request";

/**
 * Formulaire de demande de visite (colonne latérale de la fiche).
 * Envoi par Server Action : fonctionne aussi sans JavaScript ; avec JavaScript, `useActionState`
 * affiche les erreurs par champ, garde la saisie et remplace le formulaire par une confirmation.
 */
export function VisitRequestForm({
  listingId,
  agencyName,
  defaultMessage,
  browseHref,
}: {
  listingId: number;
  agencyName: string;
  defaultMessage: string;
  /** Liste où chercher un autre bien si l'annonce a été retirée entre-temps. */
  browseHref: string;
}) {
  const [state, formAction, pending] = useActionState(requestVisit.bind(null, listingId), INITIAL_VISIT_STATE);
  // Confirmation masquée par « Envoyer une autre demande » : on mémorise l'état qu'elle affichait.
  const [dismissed, setDismissed] = useState<VisitRequestState | null>(null);
  const showSuccess = state.status === "success" && state !== dismissed;

  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  // Après un envoi : focus sur la confirmation, ou sur le premier champ en erreur.
  useEffect(() => {
    if (state.status === "success") successRef.current?.focus();
    else if (state.status === "error") {
      const invalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      invalid?.focus();
    }
  }, [state]);

  if (showSuccess) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="border-text-strong focus-visible:outline-text-strong flex flex-col items-start gap-4 border-t pt-6 outline-none focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <p className="site-label text-text-muted m-0 flex items-center gap-3">
          <span aria-hidden="true" className="bg-accent size-1.5 rounded-full" />
          Demande transmise
        </p>
        <p className="font-display text-text-strong m-0 text-4xl leading-none tracking-tight">
          Demande <em className="italic">envoyée</em>
        </p>
        <p className="text-text m-0 leading-relaxed">
          {agencyName} a bien reçu votre demande de visite et vous rappellera au numéro indiqué pour convenir d&apos;un
          rendez-vous.
        </p>
        <button
          type="button"
          className="site-link text-text-strong cursor-pointer border-0 bg-transparent p-0 font-medium"
          onClick={() => setDismissed(state)}
        >
          Envoyer une autre demande
        </button>
      </div>
    );
  }

  const values = state.values;
  const fields = state.fields ?? {};

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-6" aria-busy={pending} noValidate>
      {state.status === "error" && state.message && (
        <FormAlert title={state.message}>
          {state.gone && (
            <Link href={browseHref} className="site-link text-text-strong text-sm font-medium">
              Voir les autres annonces
            </Link>
          )}
        </FormAlert>
      )}

      <fieldset disabled={pending || state.gone} className="relative m-0 flex min-w-0 flex-col gap-6 border-0 p-0">
        <legend className="sr-only">Vos coordonnées</legend>
        <SiteTextField
          label="Nom complet"
          name="full_name"
          autoComplete="name"
          required
          maxLength={VISIT_LIMITS.fullName}
          defaultValue={values?.full_name ?? ""}
          error={fields.full_name}
        />
        <SiteTextField
          label="Téléphone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          maxLength={VISIT_LIMITS.phone}
          defaultValue={values?.phone ?? ""}
          hint="Exemple : 77 123 45 67"
          error={fields.phone}
        />
        <SiteTextField
          label="E-mail (facultatif)"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={VISIT_LIMITS.email}
          defaultValue={values?.email ?? ""}
          error={fields.email}
        />
        <SiteTextareaField
          label="Message"
          name="message"
          rows={4}
          maxLength={VISIT_LIMITS.message}
          defaultValue={values?.message ?? defaultMessage}
          hint="Précisez vos disponibilités pour la visite."
          error={fields.message}
        />
        <Honeypot name="website" />
      </fieldset>

      <SubmitButton pending={pending} disabled={state.gone} block>
        Demander une visite
      </SubmitButton>

      <p className="text-text-muted m-0 text-xs leading-relaxed">
        Vos coordonnées sont transmises uniquement à {agencyName}, qui vous recontactera au sujet de ce bien.
      </p>
    </form>
  );
}
