"use client";

import { IconAlertTriangle, IconCircleCheck, IconSend } from "@tabler/icons-react";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import { TextareaField, TextField } from "@/components/app/ui/fields";
import { cn } from "@/lib/utils";

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
        className="bg-accent-wash flex flex-col items-start gap-3 rounded-lg p-5 outline-none focus-visible:ring-2 focus-visible:ring-[var(--ax-accent)]"
      >
        <IconCircleCheck size={32} stroke={1.75} className="text-success" aria-hidden="true" />
        <p className="font-display text-text-strong m-0 text-lg font-semibold">Demande envoyée</p>
        <p className="text-text m-0 text-sm leading-relaxed">
          {agencyName} a bien reçu votre demande de visite et vous rappellera au numéro indiqué pour convenir d&apos;un
          rendez-vous.
        </p>
        <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm -ml-2" onClick={() => setDismissed(state)}>
          <span className="ax-btn__label">Envoyer une autre demande</span>
        </button>
      </div>
    );
  }

  const values = state.values;
  const fields = state.fields ?? {};

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4" aria-busy={pending} noValidate>
      {state.status === "error" && state.message && (
        <div role="alert" className="ax-alert ax-alert--danger">
          <IconAlertTriangle className="ax-alert__icon" stroke={1.75} aria-hidden="true" />
          <div className="ax-alert__content">
            <p className="ax-alert__message m-0">{state.message}</p>
            {state.gone && (
              <Link href={browseHref} className="text-link mt-1 inline-block text-sm font-semibold">
                Voir les autres annonces
              </Link>
            )}
          </div>
        </div>
      )}

      <fieldset disabled={pending || state.gone} className="m-0 flex min-w-0 flex-col gap-4 border-0 p-0">
        <legend className="sr-only">Vos coordonnées</legend>
        <TextField
          label="Nom complet"
          name="full_name"
          autoComplete="name"
          required
          maxLength={VISIT_LIMITS.fullName}
          defaultValue={values?.full_name ?? ""}
          error={fields.full_name}
        />
        <TextField
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
        <TextField
          label="E-mail (facultatif)"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={VISIT_LIMITS.email}
          defaultValue={values?.email ?? ""}
          error={fields.email}
        />
        <TextareaField
          label="Message"
          name="message"
          rows={4}
          maxLength={VISIT_LIMITS.message}
          defaultValue={values?.message ?? defaultMessage}
          hint="Précisez vos disponibilités pour la visite."
          error={fields.message}
        />
        {/* Champ piège pour les robots, invisible et hors du parcours clavier. */}
        <div aria-hidden="true" className="hidden">
          <label>
            Site web
            <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
          </label>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={pending || state.gone}
        className={cn("ax-btn ax-btn--primary ax-btn--block ax-btn--lg", pending && "is-loading")}
      >
        <IconSend className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
        <span className="ax-btn__label">{pending ? "Envoi en cours…" : "Demander une visite"}</span>
        {pending && <span className="ax-btn__spinner" aria-hidden="true" />}
      </button>

      <p className="text-text-muted m-0 text-xs leading-relaxed">
        Vos coordonnées sont transmises uniquement à {agencyName}, qui vous recontactera au sujet de ce bien.
      </p>
    </form>
  );
}
