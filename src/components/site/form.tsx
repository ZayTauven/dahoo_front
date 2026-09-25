"use client";

import { IconArrowRight, IconChevronDown } from "@tabler/icons-react";
import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

/*
 * Champs de formulaire du site public : un seul langage pour la demande de visite, les demandes de
 * démo et la connexion. Champ nu posé sur un filet, qui passe à l'encre et s'épaissit au focus, au
 * rouge en erreur ; libellé en étiquette à chasse fixe ; aide et erreur reliées au champ
 * (`aria-describedby`, `aria-invalid`).
 */

const control =
  "text-text-strong placeholder:text-text-subtle block w-full rounded-none border-0 border-b bg-transparent px-0 py-2.5 text-base leading-snug outline-none transition-[border-color,box-shadow] duration-300 focus:border-text-strong focus:shadow-[0_1px_0_0_var(--ax-text-strong)] disabled:opacity-60";

const controlState = (invalid: boolean) => (invalid ? "border-danger" : "border-border-strong");

interface FieldProps {
  /** Identifiant imposé du champ (sinon généré). */
  id?: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
}

/** Enveloppe commune : libellé, champ, aide ou erreur. `children` reçoit les attributs d'accessibilité. */
function Field({
  id: fixedId,
  label,
  hint,
  error,
  required,
  className,
  children,
}: FieldProps & { children: (a11y: { id: string; describedBy?: string; invalid: boolean }) => ReactNode }) {
  const generatedId = useId();
  const id = fixedId ?? generatedId;
  const hintId = hint ? `${id}-aide` : undefined;
  const errorId = error ? `${id}-erreur` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <label htmlFor={id} className="site-label text-text-muted">
        {label}
        {required && (
          <span className="text-accent-text" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && !error && (
        <p id={hintId} className="text-text-muted m-0 pt-1 text-xs leading-relaxed">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-danger m-0 pt-1 text-xs font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

/** Champ texte (texte, téléphone, e-mail, mot de passe…). `trailing` : bouton à droite du champ. */
export const SiteTextField = forwardRef<
  HTMLInputElement,
  FieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & { trailing?: ReactNode }
>(function SiteTextField({ id: fixedId, label, hint, error, required, className, trailing, ...input }, ref) {
  return (
    <Field id={fixedId} label={label} hint={hint} error={error} required={required} className={className}>
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          <input
            ref={ref}
            id={id}
            className={cn(control, controlState(invalid), trailing ? "pr-10" : undefined)}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            required={required}
            {...input}
          />
          {trailing && <div className="absolute inset-y-0 right-0 flex items-center">{trailing}</div>}
        </div>
      )}
    </Field>
  );
});

/** Zone de texte. */
export function SiteTextareaField({
  label,
  hint,
  error,
  required,
  className,
  rows = 4,
  ...textarea
}: FieldProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className">) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className}>
      {({ id, describedBy, invalid }) => (
        <textarea
          id={id}
          rows={rows}
          className={cn(control, "resize-y text-[0.95rem] leading-relaxed", controlState(invalid))}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          required={required}
          {...textarea}
        />
      )}
    </Field>
  );
}

export interface SiteOption {
  value: string;
  label: string;
}

/** Liste déroulante native (accessible, pratique sur mobile), habillée d'un chevron. */
export function SiteSelectField({
  label,
  hint,
  error,
  required,
  className,
  options,
  placeholder,
  ...select
}: FieldProps & Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> & { options: readonly SiteOption[]; placeholder?: string }) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className}>
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          <select
            id={id}
            className={cn(control, "cursor-pointer appearance-none pr-8", controlState(invalid))}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            required={required}
            {...select}
          >
            {placeholder !== undefined && (
              <option value="" disabled={required}>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <IconChevronDown
            size={16}
            stroke={1.75}
            aria-hidden="true"
            className="text-text-muted pointer-events-none absolute top-1/2 right-0 -translate-y-1/2"
          />
        </div>
      )}
    </Field>
  );
}

/** Choix unique en pastilles (boutons radio) : pour quelques options courtes. */
export function SiteChoiceField({
  label,
  name,
  options,
  defaultValue,
  hint,
  error,
  required,
  className,
  columns = "grid-cols-2 sm:grid-cols-4",
}: FieldProps & { name: string; options: readonly SiteOption[]; defaultValue?: string; columns?: string }) {
  const id = useId();
  const hintId = hint ? `${id}-aide` : undefined;
  const errorId = error ? `${id}-erreur` : undefined;
  return (
    <fieldset
      className={cn("m-0 flex min-w-0 flex-col gap-2 border-0 p-0", className)}
      aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
    >
      <legend className="site-label text-text-muted mb-2 p-0">
        {label}
        {required && (
          <span className="text-accent-text" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </legend>
      <div className={cn("grid gap-2", columns)}>
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "text-text flex min-h-12 cursor-pointer items-center justify-center rounded-full border px-4 py-2 text-center text-sm font-medium transition-colors duration-300",
              "hover:border-text-strong has-checked:border-text-strong has-checked:bg-text-strong has-checked:text-canvas",
              "has-focus-visible:outline-accent has-focus-visible:outline-2 has-focus-visible:outline-offset-2",
              error ? "border-danger" : "border-border-strong",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              required={required}
              defaultChecked={defaultValue === option.value}
              // Pas d'aria-invalid sur un radio : l'erreur est reliée au groupe (aria-describedby) ;
              // ce marqueur permet aux formulaires d'y placer le focus après un envoi refusé.
              data-invalid={error ? "true" : undefined}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
      {hint && !error && (
        <p id={hintId} className="text-text-muted m-0 text-xs leading-relaxed">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-danger m-0 text-xs font-medium">
          {error}
        </p>
      )}
    </fieldset>
  );
}

/** Message d'échec d'un envoi (en tête de formulaire), focalisable. */
export const FormAlert = forwardRef<HTMLDivElement, { title: string; children?: ReactNode }>(function FormAlert(
  { title, children },
  ref,
) {
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      className="border-danger flex flex-col gap-1 border-l-2 py-1 pl-4 outline-none focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <p className="text-text-strong m-0 font-medium">{title}</p>
      {children && <div className="text-text-muted m-0 text-sm leading-relaxed">{children}</div>}
    </div>
  );
});

/** Bouton d'envoi : libellé « en cours » et roue pendant l'envoi. */
export function SubmitButton({
  pending,
  children,
  pendingLabel = "Envoi en cours…",
  block = false,
  disabled,
  className,
}: {
  pending: boolean;
  children: ReactNode;
  pendingLabel?: string;
  block?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      className={cn("ax-btn ax-btn--primary ax-btn--lg", block && "ax-btn--block", pending && "is-loading", className)}
    >
      {pending && <span className="ax-btn__spinner" aria-hidden="true" />}
      <span className="ax-btn__label">{pending ? pendingLabel : children}</span>
      {!pending && <IconArrowRight className="ax-btn__icon" stroke={1.75} aria-hidden="true" />}
    </button>
  );
}

/** Champ piège pour les robots : invisible, hors du parcours clavier et des technologies d'assistance. */
export function Honeypot({ name }: { name: string }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Ne pas remplir ce champ
        <input type="text" name={name} tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
