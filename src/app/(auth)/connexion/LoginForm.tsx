"use client";

import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import { toApiError, type FieldErrors } from "@/lib/api/errors";

/** N'accepte qu'une redirection interne à l'espace connecté (évite les redirections ouvertes). */
function safeNext(value: string | null): string {
  if (value && /^\/(espace|plateforme)(\/|\?|$)/.test(value)) return value;
  return "/espace";
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);
  const [fields, setFields] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const missing: FieldErrors = {};
    if (!phone.trim()) missing.phone = "Saisissez votre numéro de téléphone.";
    if (!password) missing.password = "Saisissez votre mot de passe.";
    setFields(missing);
    setMessage("");
    if (Object.keys(missing).length) return;

    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.replace(/\s+/g, ""), password }),
      });
      if (!response.ok) {
        const error = toApiError(response.status, await response.json().catch(() => null));
        setFields(error.fields);
        setMessage(error.status === 400 ? "Numéro ou mot de passe incorrect." : error.message);
        return;
      }
      router.replace(safeNext(params.get("suite")));
      router.refresh();
    } catch {
      setMessage("Connexion impossible pour le moment. Vérifiez votre réseau et réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      {message && (
        <div role="alert" className="ax-alert ax-alert--danger">
          <div className="ax-alert__content">
            <p className="ax-alert__message">{message}</p>
          </div>
        </div>
      )}

      <div className="ax-field">
        <label className="ax-label" htmlFor="login-phone">
          Numéro de téléphone
        </label>
        <input
          id="login-phone"
          type="tel"
          inputMode="tel"
          autoComplete="username"
          placeholder="+221 77 123 45 67"
          className={`ax-input${fields.phone ? " is-invalid" : ""}`}
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          aria-invalid={Boolean(fields.phone)}
          aria-describedby={fields.phone ? "login-phone-error" : undefined}
        />
        {fields.phone && (
          <p id="login-phone-error" className="ax-field__message ax-field__message--error">
            {fields.phone}
          </p>
        )}
      </div>

      <div className="ax-field">
        <label className="ax-label" htmlFor="login-password">
          Mot de passe
        </label>
        <div className="ax-field__control">
          <input
            id="login-password"
            type={reveal ? "text" : "password"}
            autoComplete="current-password"
            className={`ax-input ax-input--with-trailing${fields.password ? " is-invalid" : ""}`}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(fields.password)}
            aria-describedby={fields.password ? "login-password-error" : undefined}
          />
          <button
            type="button"
            className="ax-field__affix ax-field__affix--trailing ax-field__affix--button"
            onClick={() => setReveal((value) => !value)}
            aria-pressed={reveal}
            aria-label={reveal ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {reveal ? <IconEyeOff stroke={1.75} aria-hidden="true" /> : <IconEye stroke={1.75} aria-hidden="true" />}
          </button>
        </div>
        {fields.password && (
          <p id="login-password-error" className="ax-field__message ax-field__message--error">
            {fields.password}
          </p>
        )}
      </div>

      <button
        type="submit"
        className={`ax-btn ax-btn--primary ax-btn--lg ax-btn--block${loading ? " is-loading" : ""}`}
        aria-busy={loading}
        disabled={loading}
      >
        <span className="ax-btn__spinner" aria-hidden="true" />
        <span className="ax-btn__label">Se connecter</span>
      </button>
    </form>
  );
}
