"use client";

import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";

import { FormAlert, Honeypot, SiteChoiceField, SiteTextareaField, SiteTextField, SubmitButton } from "@/components/site/form";

import { requestDemo } from "./demo-action";
import { INITIAL_DEMO_STATE, MAX_LENGTH, UNITS_RANGES, type DemoField, type DemoValues } from "./demo-form";

/**
 * Formulaire « Demander une démo » : Server Action + useActionState.
 * Validation côté serveur (messages en français liés aux champs), saisie conservée en cas d'erreur,
 * focus déplacé sur le premier champ invalide, puis confirmation à la place du formulaire.
 */
export function DemoForm() {
  const [state, formAction, pending] = useActionState(requestDemo, INITIAL_DEMO_STATE);
  const formRef = useRef<HTMLFormElement>(null);
  const confirmationRef = useRef<HTMLHeadingElement>(null);

  const values: DemoValues = state.status === "error" ? state.values : {};
  const errorOf = (field: DemoField) => (state.status === "error" ? state.fieldErrors[field] : undefined);

  useEffect(() => {
    if (state.status === "success") {
      confirmationRef.current?.focus();
    } else if (state.status === "error") {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]')?.focus();
    }
  }, [state]);

  if (state.status === "success") {
    return (
      <div role="status" className="flex flex-col items-start gap-6 p-6 sm:p-10 lg:p-12">
        <p className="site-label text-text-muted m-0 flex items-center gap-3">
          <span aria-hidden="true" className="bg-accent size-1.5 rounded-full" />
          Demande envoyée
        </p>
        <h3
          ref={confirmationRef}
          tabIndex={-1}
          className="font-display text-text-strong m-0 text-4xl leading-[1.02] font-normal tracking-tight outline-none sm:text-5xl"
        >
          Merci {state.contactName}, votre demande est bien envoyée.
        </h3>
        <p className="text-text-muted m-0 max-w-lg leading-relaxed sm:text-lg">
          L&apos;équipe Dahoo a reçu la demande de <b className="text-text-strong font-medium">{state.agencyName}</b>. Nous vous
          rappelons au numéro indiqué pour convenir d&apos;un créneau de démonstration.
        </p>
        <div className="border-border-default flex w-full flex-wrap items-center gap-x-8 gap-y-4 border-t pt-6">
          <Link href="/tarifs" className="ax-btn ax-btn--primary ax-btn--lg">
            <span className="ax-btn__label">Consulter les tarifs</span>
          </Link>
          <Link href="/louer" className="site-link text-text-strong inline-flex items-center gap-2 font-medium">
            Parcourir le portail
            <IconArrowRight size={18} stroke={1.75} aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  const unitsError = errorOf("units_range");

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      aria-busy={pending}
      className="relative flex flex-col gap-7 p-6 sm:p-10 lg:p-12"
    >
      {state.status === "error" && <FormAlert title="Votre demande n'est pas partie">{state.message}</FormAlert>}

      <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
        <SiteTextField
          label="Nom de l'agence"
          name="agency_name"
          required
          autoComplete="organization"
          maxLength={MAX_LENGTH.agency_name}
          defaultValue={values.agency_name}
          error={errorOf("agency_name")}
          placeholder="Ex. Teranga Immobilier"
        />
        <SiteTextField
          label="Votre nom"
          name="contact_name"
          required
          autoComplete="name"
          maxLength={MAX_LENGTH.contact_name}
          defaultValue={values.contact_name}
          error={errorOf("contact_name")}
          placeholder="Prénom et nom"
        />
        <SiteTextField
          label="Téléphone"
          name="phone"
          type="tel"
          inputMode="tel"
          required
          autoComplete="tel"
          maxLength={MAX_LENGTH.phone}
          defaultValue={values.phone}
          error={errorOf("phone")}
          hint="Nous vous rappelons à ce numéro."
          placeholder="77 123 45 67"
        />
        <SiteTextField
          label="E-mail (facultatif)"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={MAX_LENGTH.email}
          defaultValue={values.email}
          error={errorOf("email")}
          placeholder="contact@agence.sn"
        />
        <SiteTextField
          label="Ville (facultatif)"
          name="city"
          autoComplete="address-level2"
          maxLength={MAX_LENGTH.city}
          defaultValue={values.city}
          error={errorOf("city")}
          placeholder="Dakar, Thiès, Saly…"
          className="sm:col-span-2"
        />
      </div>

      <SiteChoiceField
        label="Nombre de lots gérés"
        name="units_range"
        required
        options={UNITS_RANGES}
        defaultValue={values.units_range}
        error={unitsError}
        hint="Un lot = un appartement, une villa, un bureau ou un local que vous louez ou vendez."
      />

      <SiteTextareaField
        label="Votre besoin (facultatif)"
        name="message"
        rows={4}
        maxLength={MAX_LENGTH.message}
        defaultValue={values.message}
        error={errorOf("message")}
        placeholder="Ex. Nous gérons deux immeubles à Mermoz et quelques villas à Saly ; les loyers sont suivis sur Excel."
      />

      <Honeypot name="website" />

      <div className="border-border-default flex flex-col gap-5 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-text-muted m-0 max-w-xs text-xs leading-relaxed">
          Vos coordonnées servent uniquement à vous recontacter au sujet de cette démonstration.
        </p>
        <SubmitButton pending={pending}>Demander ma démo</SubmitButton>
      </div>
    </form>
  );
}
