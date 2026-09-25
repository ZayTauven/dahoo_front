"use client";

import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import { FormAlert, SiteTextField, SubmitButton } from "@/components/site/form";
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
    <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
      {message && <FormAlert title={message} />}

      <SiteTextField
        id="login-phone"
        label="Numéro de téléphone"
        type="tel"
        inputMode="tel"
        autoComplete="username"
        placeholder="+221 77 123 45 67"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        error={fields.phone}
      />

      <SiteTextField
        id="login-password"
        label="Mot de passe"
        type={reveal ? "text" : "password"}
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={fields.password}
        trailing={
          <button
            type="button"
            className="text-text-muted hover:text-text-strong flex size-9 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent transition-colors"
            onClick={() => setReveal((value) => !value)}
            aria-pressed={reveal}
            aria-label={reveal ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {reveal ? <IconEyeOff size={18} stroke={1.75} aria-hidden="true" /> : <IconEye size={18} stroke={1.75} aria-hidden="true" />}
          </button>
        }
      />

      <SubmitButton pending={loading} pendingLabel="Connexion…" block>
        Se connecter
      </SubmitButton>
    </form>
  );
}
