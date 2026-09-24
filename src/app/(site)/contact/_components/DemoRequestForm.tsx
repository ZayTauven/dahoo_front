"use client";

import { IconAlertTriangle, IconCircleCheck, IconSend } from "@tabler/icons-react";
import { useActionState, useEffect, useRef } from "react";

import { SelectField, TextareaField, TextField } from "@/components/app/ui/fields";

import { requestDemo } from "./actions";
import { INITIAL_DEMO_STATE, UNITS_RANGES, type DemoField } from "./demo-request";

/** Formulaire « Je suis une agence » : demande de démonstration de Dahoo (Server Action). */
export function DemoRequestForm() {
  const [state, formAction, pending] = useActionState(requestDemo, INITIAL_DEMO_STATE);
  const formRef = useRef<HTMLFormElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  // Après l'envoi : focus sur le premier champ en erreur, sinon sur le message (lecteurs d'écran, clavier).
  useEffect(() => {
    if (state.status === "success") successRef.current?.focus();
    if (state.status === "error") {
      const invalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      (invalid ?? alertRef.current)?.focus();
    }
  }, [state]);

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-start gap-4 py-4" role="status">
        <span className="bg-accent-wash text-accent-text inline-flex size-14 items-center justify-center rounded-full">
          <IconCircleCheck size={30} stroke={1.75} aria-hidden="true" />
        </span>
        <h3 ref={successRef} tabIndex={-1} className="font-display text-text-strong m-0 text-2xl font-semibold outline-none">
          Merci{state.contactName ? `, ${state.contactName}` : ""} !
        </h3>
        <p className="text-text-muted m-0 leading-relaxed">
          Votre demande de démonstration est bien enregistrée. L&apos;équipe Dahoo vous recontacte pour convenir d&apos;un
          rendez-vous et vous présenter l&apos;outil avec les biens de votre agence.
        </p>
      </div>
    );
  }

  const errors: Partial<Record<DemoField, string>> = state.status === "error" ? state.fieldErrors : {};
  const values = state.status === "error" ? state.values : undefined;

  return (
    <form ref={formRef} action={formAction} noValidate aria-busy={pending} className="flex flex-col gap-5">
      {state.status === "error" && (
        <div ref={alertRef} tabIndex={-1} role="alert" className="ax-alert ax-alert--danger outline-none">
          <IconAlertTriangle className="ax-alert__icon" stroke={1.75} aria-hidden="true" />
          <div className="ax-alert__content">
            <p className="ax-alert__title">La demande n&apos;a pas été envoyée</p>
            <p className="ax-alert__message">{state.message}</p>
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Nom de l'agence"
          name="agency_name"
          required
          autoComplete="organization"
          maxLength={200}
          defaultValue={values?.agency_name}
          error={errors.agency_name}
        />
        <TextField
          label="Votre nom"
          name="contact_name"
          required
          autoComplete="name"
          maxLength={150}
          defaultValue={values?.contact_name}
          error={errors.contact_name}
        />
        <TextField
          label="Téléphone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          maxLength={30}
          placeholder="77 123 45 67"
          defaultValue={values?.phone}
          error={errors.phone}
        />
        <TextField
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          defaultValue={values?.email}
          error={errors.email}
          hint="Facultatif"
        />
        <TextField
          label="Ville"
          name="city"
          autoComplete="address-level2"
          maxLength={100}
          placeholder="Dakar, Thiès, Saly…"
          defaultValue={values?.city}
          error={errors.city}
          hint="Facultatif"
        />
        <SelectField
          label="Nombre de lots gérés"
          name="units_range"
          required
          placeholder="Choisissez…"
          options={UNITS_RANGES}
          defaultValue={values?.units_range ?? ""}
          error={errors.units_range}
        />
      </div>

      <TextareaField
        label="Votre message"
        name="message"
        rows={4}
        maxLength={2000}
        defaultValue={values?.message}
        error={errors.message}
        hint="Facultatif : vos besoins, vos outils actuels, vos disponibilités."
      />

      {/* Champ piège pour les robots : invisible et ignoré par les technologies d'assistance. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="site_web">Ne pas remplir ce champ</label>
        <input id="site_web" name="site_web" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-text-muted m-0 text-xs">
          <span aria-hidden="true">* </span>Champs obligatoires. Vos coordonnées servent uniquement à vous recontacter au sujet de Dahoo.
        </p>
        <button
          type="submit"
          className={`ax-btn ax-btn--primary ax-btn--lg shrink-0${pending ? " is-loading" : ""}`}
          disabled={pending}
        >
          {pending && <span className="ax-btn__spinner" aria-hidden="true" />}
          <IconSend className="ax-btn__icon" stroke={2} aria-hidden="true" />
          <span className="ax-btn__label">{pending ? "Envoi en cours…" : "Demander une démo"}</span>
        </button>
      </div>
    </form>
  );
}
