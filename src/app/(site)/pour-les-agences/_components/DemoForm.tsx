"use client";

import { IconAlertTriangle, IconArrowRight, IconCircleCheck, IconSend } from "@tabler/icons-react";
import Link from "next/link";
import { useActionState, useEffect, useId, useRef } from "react";

import { TextareaField, TextField } from "@/components/app/ui/fields";
import { cn } from "@/lib/utils";

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
  const unitsId = useId();

  const values: DemoValues = state.status === "error" ? state.values : {};
  const errorOf = (field: DemoField) => (state.status === "error" ? state.fieldErrors[field] : undefined);

  useEffect(() => {
    if (state.status === "success") {
      confirmationRef.current?.focus();
    } else if (state.status === "error") {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }
  }, [state]);

  if (state.status === "success") {
    return (
      <div role="status" className="flex flex-col items-start gap-5 p-6 sm:p-10">
        <span className="bg-accent-wash text-accent-text flex h-14 w-14 items-center justify-center rounded-full">
          <IconCircleCheck size={30} stroke={1.75} aria-hidden="true" />
        </span>
        <h3 ref={confirmationRef} tabIndex={-1} className="font-display text-text-strong m-0 text-2xl font-semibold outline-none">
          Merci {state.contactName}, votre demande est bien envoyée.
        </h3>
        <p className="text-text-muted m-0 leading-relaxed">
          L&apos;équipe Dahoo a reçu la demande de <b className="text-text-strong">{state.agencyName}</b>. Nous vous rappelons au
          numéro indiqué pour convenir d&apos;un créneau de démonstration.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/tarifs" className="ax-btn ax-btn--secondary">
            <span className="ax-btn__label">Consulter les tarifs</span>
          </Link>
          <Link href="/louer" className="ax-btn ax-btn--ghost">
            <span className="ax-btn__label">Parcourir le portail</span>
            <IconArrowRight className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  const unitsError = errorOf("units_range");

  return (
    <form ref={formRef} action={formAction} noValidate aria-busy={pending} className="relative flex flex-col gap-5 p-6 sm:p-10">
      {state.status === "error" && (
        <div role="alert" className="ax-alert ax-alert--danger">
          <IconAlertTriangle className="ax-alert__icon" stroke={1.75} aria-hidden="true" />
          <div className="ax-alert__content">
            <p className="ax-alert__title">Votre demande n&apos;est pas partie</p>
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
          maxLength={MAX_LENGTH.agency_name}
          defaultValue={values.agency_name}
          error={errorOf("agency_name")}
          placeholder="Ex. Teranga Immobilier"
        />
        <TextField
          label="Votre nom"
          name="contact_name"
          required
          autoComplete="name"
          maxLength={MAX_LENGTH.contact_name}
          defaultValue={values.contact_name}
          error={errorOf("contact_name")}
          placeholder="Prénom et nom"
        />
        <TextField
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
        <TextField
          label="E-mail (facultatif)"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={MAX_LENGTH.email}
          defaultValue={values.email}
          error={errorOf("email")}
          placeholder="contact@agence.sn"
        />
        <TextField
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

      <fieldset
        className="m-0 flex flex-col gap-2 border-0 p-0"
        aria-describedby={unitsError ? `${unitsId}-erreur` : undefined}
      >
        <legend className="ax-label mb-2 p-0">
          Nombre de lots gérés
          <span className="ax-field__required" aria-hidden="true">
            {" "}
            *
          </span>
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {UNITS_RANGES.map((range) => (
            <label
              key={range.value}
              className={cn(
                "border-border-default bg-surface text-text flex min-h-11 cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-center text-sm font-medium transition-colors",
                "hover:border-border-strong has-[:checked]:border-accent has-[:checked]:bg-accent-wash has-[:checked]:text-text-strong",
                "has-[:focus-visible]:ring-accent/40 has-[:focus-visible]:ring-2",
                unitsError && "border-danger",
              )}
            >
              <input
                type="radio"
                name="units_range"
                value={range.value}
                required
                defaultChecked={values.units_range === range.value}
                className="sr-only"
              />
              {range.label}
            </label>
          ))}
        </div>
        {unitsError ? (
          <p id={`${unitsId}-erreur`} className="ax-field__message ax-field__message--error m-0">
            {unitsError}
          </p>
        ) : (
          <p className="ax-field__hint m-0">Un lot = un appartement, une villa, un bureau ou un local que vous louez ou vendez.</p>
        )}
      </fieldset>

      <TextareaField
        label="Votre besoin (facultatif)"
        name="message"
        rows={4}
        maxLength={MAX_LENGTH.message}
        defaultValue={values.message}
        error={errorOf("message")}
        placeholder="Ex. Nous gérons deux immeubles à Mermoz et quelques villas à Saly ; les loyers sont suivis sur Excel."
      />

      {/* Champ piège pour les robots : invisible et hors du parcours clavier. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Site web
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-text-subtle m-0 max-w-sm text-xs leading-relaxed">
          Vos coordonnées servent uniquement à vous recontacter au sujet de cette démonstration.
        </p>
        <button type="submit" className={cn("ax-btn ax-btn--primary ax-btn--lg", pending && "is-loading")} disabled={pending}>
          <span className="ax-btn__spinner" aria-hidden="true" />
          <IconSend className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
          <span className="ax-btn__label">{pending ? "Envoi en cours…" : "Demander ma démo"}</span>
        </button>
      </div>
    </form>
  );
}
