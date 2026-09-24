"use server";

import { headers } from "next/headers";

import { publicApi } from "@/lib/api/server";
import { forwardingHeaders } from "@/lib/server/forwarding";

import { VISIT_LIMITS, type VisitField, type VisitRequestState, type VisitValues } from "../_components/visit-request";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Chiffres, espaces, points, tirets, parenthèses et « + » initial : 77 123 45 67, +221 33 820 00 00… */
const PHONE_PATTERN = /^\+?[\d\s().-]+$/;

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function validate(values: VisitValues): Partial<Record<VisitField, string>> {
  const errors: Partial<Record<VisitField, string>> = {};

  if (values.full_name.length < 2) errors.full_name = "Indiquez votre nom complet.";
  else if (values.full_name.length > VISIT_LIMITS.fullName)
    errors.full_name = `${VISIT_LIMITS.fullName} caractères au maximum.`;

  const digits = values.phone.replace(/\D/g, "");
  if (!values.phone) errors.phone = "Indiquez un numéro pour que l'agence vous rappelle.";
  else if (!PHONE_PATTERN.test(values.phone) || digits.length < 7 || values.phone.length > VISIT_LIMITS.phone)
    errors.phone = "Numéro invalide. Exemple : 77 123 45 67 ou +221 77 123 45 67.";

  if (values.email && (!EMAIL_PATTERN.test(values.email) || values.email.length > VISIT_LIMITS.email))
    errors.email = "Adresse e-mail invalide. Exemple : aminata@exemple.sn.";

  if (values.message.length > VISIT_LIMITS.message)
    errors.message = `Votre message dépasse ${VISIT_LIMITS.message} caractères.`;

  return errors;
}

function firstText(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return firstText(value[0]);
  return undefined;
}

/** Erreurs de validation de Django : { prospect: { phone: [...] }, message: [...] } ou { detail }. */
function apiFieldErrors(payload: unknown): Partial<Record<VisitField, string>> {
  const errors: Partial<Record<VisitField, string>> = {};
  if (!payload || typeof payload !== "object") return errors;
  const body = payload as Record<string, unknown>;
  const prospect = body.prospect;
  if (prospect && typeof prospect === "object" && !Array.isArray(prospect)) {
    const fields = prospect as Record<string, unknown>;
    for (const key of ["full_name", "phone", "email"] as const) {
      const message = firstText(fields[key]);
      if (message) errors[key] = message;
    }
  }
  const message = firstText(body.message);
  if (message) errors.message = message;
  return errors;
}

/**
 * Demande de visite envoyée depuis la fiche d'une annonce.
 * Appelée par `useActionState` ; `listingId` est lié côté client (`requestVisit.bind(null, id)`).
 * Les en-têtes de relais transmettent l'IP du visiteur à Django, qui limite à 10 demandes par heure.
 */
export async function requestVisit(listingId: number, _previous: VisitRequestState, formData: FormData): Promise<VisitRequestState> {
  const values: VisitValues = {
    full_name: text(formData, "full_name"),
    phone: text(formData, "phone"),
    email: text(formData, "email"),
    message: text(formData, "message"),
  };

  if (!Number.isInteger(listingId) || listingId <= 0) {
    return { status: "error", message: "Annonce introuvable.", values, gone: true };
  }

  // Champ piège invisible : un robot le remplit, un visiteur non. On répond « envoyé » sans rien transmettre.
  if (text(formData, "website")) return { status: "success" };

  const errors = validate(values);
  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Vérifiez les champs signalés.", fields: errors, values };
  }

  try {
    const { error, response } = await publicApi.POST("/api/v1/public/listings/{id}/interest/", {
      params: { path: { id: listingId } },
      body: {
        prospect: {
          full_name: values.full_name,
          phone: values.phone,
          email: values.email || null,
          source: "site",
        },
        message: values.message,
      },
      headers: forwardingHeaders(await headers()),
    });

    if (response.ok) return { status: "success" };

    if (response.status === 404) {
      return {
        status: "error",
        message: "Cette annonce n'est plus disponible : l'agence ne reçoit plus de demandes pour ce bien.",
        values,
        gone: true,
      };
    }
    if (response.status === 429) {
      return {
        status: "error",
        message: "Trop de demandes envoyées depuis votre connexion. Réessayez dans une heure ou appelez directement l'agence.",
        values,
      };
    }
    if (response.status === 400) {
      const fields = apiFieldErrors(error);
      return {
        status: "error",
        message: Object.keys(fields).length > 0 ? "Vérifiez les champs signalés." : "Votre demande n'a pas pu être enregistrée.",
        fields,
        values,
      };
    }
    return {
      status: "error",
      message: "Le service est momentanément indisponible. Réessayez dans quelques minutes ou appelez l'agence.",
      values,
    };
  } catch {
    return {
      status: "error",
      message: "Le service est momentanément indisponible. Réessayez dans quelques minutes ou appelez l'agence.",
      values,
    };
  }
}
