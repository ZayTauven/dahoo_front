"use client";

import { useActionState, useEffect, useRef } from "react";

import { FormAlert, Honeypot, SiteSelectField, SiteTextareaField, SiteTextField, SubmitButton } from "@/components/site/form";

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
      <div className="border-border-default flex flex-col items-start gap-6 border-t pt-8" role="status">
        <p className="site-label text-accent-text m-0">Demande envoyée</p>
        <h3
          ref={successRef}
          tabIndex={-1}
          className="font-display text-text-strong m-0 text-5xl leading-[1.02] font-normal tracking-tight outline-none sm:text-6xl"
        >
          Merci{state.contactName ? `, ${state.contactName}` : ""} !
        </h3>
        <p className="text-text-muted m-0 max-w-lg text-base leading-relaxed sm:text-lg">
          Votre demande de démonstration est bien enregistrée. L&apos;équipe Dahoo vous recontacte pour convenir d&apos;un
          rendez-vous et vous présenter l&apos;outil avec les biens de votre agence.
        </p>
      </div>
    );
  }

  const errors: Partial<Record<DemoField, string>> = state.status === "error" ? state.fieldErrors : {};
  const values = state.status === "error" ? state.values : undefined;

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      aria-busy={pending}
      className="relative flex flex-col gap-8"
    >
      {state.status === "error" && (
        <FormAlert ref={alertRef} title="La demande n'a pas été envoyée">
          {state.message}
        </FormAlert>
      )}

      <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
        <SiteTextField
          label="Nom de l'agence"
          name="agency_name"
          required
          autoComplete="organization"
          maxLength={200}
          defaultValue={values?.agency_name}
          error={errors.agency_name}
        />
        <SiteTextField
          label="Votre nom"
          name="contact_name"
          required
          autoComplete="name"
          maxLength={150}
          defaultValue={values?.contact_name}
          error={errors.contact_name}
        />
        <SiteTextField
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
        <SiteTextField
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          defaultValue={values?.email}
          error={errors.email}
          hint="Facultatif"
        />
        <SiteTextField
          label="Ville"
          name="city"
          autoComplete="address-level2"
          maxLength={100}
          placeholder="Dakar, Thiès, Saly…"
          defaultValue={values?.city}
          error={errors.city}
          hint="Facultatif"
        />
        <SiteSelectField
          label="Nombre de lots gérés"
          name="units_range"
          required
          placeholder="Choisissez…"
          options={UNITS_RANGES}
          defaultValue={values?.units_range ?? ""}
          error={errors.units_range}
        />
      </div>

      <SiteTextareaField
        label="Votre message"
        name="message"
        rows={4}
        maxLength={2000}
        defaultValue={values?.message}
        error={errors.message}
        hint="Facultatif : vos besoins, vos outils actuels, vos disponibilités."
      />

      <Honeypot name="site_web" />

      <div className="border-border-default flex flex-col gap-5 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-text-muted m-0 max-w-sm text-xs leading-relaxed">
          <span aria-hidden="true">* </span>Champs obligatoires. Vos coordonnées servent uniquement à vous recontacter au sujet de Dahoo.
        </p>
        <SubmitButton pending={pending} className="shrink-0 self-start sm:self-auto">
          Demander une démo
        </SubmitButton>
      </div>
    </form>
  );
}
