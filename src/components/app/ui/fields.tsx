"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

/*
 * Champs de formulaire de l'espace agence (classes .ax-field de Vireo).
 * Chaque champ relie son libellé, son aide et son erreur (aria-describedby / aria-invalid).
 */

interface FieldShellProps {
  label: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  className?: string;
  children: (props: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
}

function FieldShell({ label, error, hint, required, className, children }: FieldShellProps) {
  const id = useId();
  const hintId = hint ? `${id}-aide` : undefined;
  const errorId = error ? `${id}-erreur` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`ax-field${className ? ` ${className}` : ""}`}>
      <label className="ax-label" htmlFor={id}>
        {label}
        {required && (
          <span className="ax-field__required" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && !error && (
        <p id={hintId} className="ax-field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="ax-field__message ax-field__message--error">
          {error}
        </p>
      )}
    </div>
  );
}

type Common = { label: string; error?: string; hint?: ReactNode; className?: string };

export function TextField({ label, error, hint, className, required, ...input }: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell label={label} error={error} hint={hint} required={required} className={className}>
      {({ id, describedBy, invalid }) => (
        <input
          id={id}
          className={`ax-input${invalid ? " is-invalid" : ""}`}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          required={required}
          {...input}
        />
      )}
    </FieldShell>
  );
}

export function TextareaField({ label, error, hint, className, required, ...textarea }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell label={label} error={error} hint={hint} required={required} className={className}>
      {({ id, describedBy, invalid }) => (
        <textarea
          id={id}
          rows={4}
          className={`ax-textarea${invalid ? " is-invalid" : ""}`}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          required={required}
          {...textarea}
        />
      )}
    </FieldShell>
  );
}

export interface Option {
  value: string | number;
  label: string;
}

export function SelectField({
  label,
  error,
  hint,
  className,
  required,
  options,
  placeholder,
  ...select
}: Common & SelectHTMLAttributes<HTMLSelectElement> & { options: Option[]; placeholder?: string }) {
  return (
    <FieldShell label={label} error={error} hint={hint} required={required} className={className}>
      {({ id, describedBy, invalid }) => (
        <select
          id={id}
          className={`ax-select${invalid ? " is-invalid" : ""}`}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          required={required}
          {...select}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}

export function CheckboxField({
  label,
  className,
  ...input
}: { label: string; className?: string } & Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  return (
    <label className={`ax-check${className ? ` ${className}` : ""}`}>
      <input type="checkbox" className="ax-checkbox" {...input} />
      <span>{label}</span>
    </label>
  );
}
