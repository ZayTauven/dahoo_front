"use server";

import { headers } from "next/headers";

import { toApiError } from "@/lib/api/errors";
import { publicApi } from "@/lib/api/server";
import type { Schema } from "@/lib/api/types";
import { forwardingHeaders } from "@/lib/server/forwarding";

import {
  DEMO_FIELDS,
  MAX_LENGTH,
  UNITS_RANGES,
  type DemoField,
  type DemoFormState,
  type UnitsRange,
} from "./demo-form";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/** Valide la saisie : renvoie les erreurs par champ (vide si tout est correct). */
function validate(values: Record<DemoField, string>): Partial<Record<DemoField, string>> {
  const errors: Partial<Record<DemoField, string>> = {};

  if (!values.agency_name) errors.agency_name = "Indiquez le nom de votre agence.";
  else if (values.agency_name.length > MAX_LENGTH.agency_name) errors.agency_name = "Ce nom est trop long (200 caractères maximum).";

  if (!values.contact_name) errors.contact_name = "Indiquez votre nom.";
  else if (values.contact_name.length > MAX_LENGTH.contact_name) errors.contact_name = "Ce nom est trop long (150 caractères maximum).";

  const digits = values.phone.replace(/\D/g, "");
  if (!values.phone) errors.phone = "Indiquez un numéro pour vous rappeler.";
  else if (!/^\+?[\d\s.()-]+$/.test(values.phone) || digits.length < 9 || digits.length > 15 || values.phone.length > MAX_LENGTH.phone)
    errors.phone = "Numéro invalide. Exemple : 77 123 45 67 ou +221 77 123 45 67.";

  if (values.email && (!EMAIL_PATTERN.test(values.email) || values.email.length > MAX_LENGTH.email))
    errors.email = "Adresse e-mail invalide. Exemple : contact@agence.sn.";

  if (values.city.length > MAX_LENGTH.city) errors.city = "Nom de ville trop long (100 caractères maximum).";

  if (!UNITS_RANGES.some((range) => range.value === values.units_range))
    errors.units_range = "Choisissez le nombre de lots que vous gérez.";

  if (values.message.length > MAX_LENGTH.message) errors.message = `Message trop long (${MAX_LENGTH.message} caractères maximum).`;

  return errors;
}

function isDemoField(key: string): key is DemoField {
  return (DEMO_FIELDS as readonly string[]).includes(key);
}

/**
 * Formulaire « Demander une démo » : validation serveur puis POST /api/v1/public/demo-requests/.
 * L'IP du visiteur est transmise à Django (forwardingHeaders) pour la limite de 5 demandes par heure.
 */
export async function requestDemo(_previous: DemoFormState, formData: FormData): Promise<DemoFormState> {
  const values = Object.fromEntries(DEMO_FIELDS.map((field) => [field, text(formData, field)])) as Record<DemoField, string>;

  // Champ piège invisible : un robot le remplit, un humain non. On simule un succès sans rien envoyer.
  if (text(formData, "website")) {
    return { status: "success", contactName: values.contact_name, agencyName: values.agency_name };
  }

  const fieldErrors = validate(values);
  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Certains champs sont à corriger avant l'envoi.",
      fieldErrors,
      values,
    };
  }

  const body: Schema<"DemoRequestRequest"> = {
    agency_name: values.agency_name,
    contact_name: values.contact_name,
    phone: values.phone,
    units_range: values.units_range as UnitsRange,
    ...(values.email ? { email: values.email } : {}),
    ...(values.city ? { city: values.city } : {}),
    ...(values.message ? { message: values.message } : {}),
  };

  try {
    const { response, error } = await publicApi.POST("/api/v1/public/demo-requests/", {
      body,
      headers: forwardingHeaders(await headers()),
      // Écriture : jamais de cache de données Next, quelle que soit la configuration du client.
      fetch: (request: Request) => fetch(request, { cache: "no-store" }),
    });

    if (response.ok) {
      return { status: "success", contactName: values.contact_name, agencyName: values.agency_name };
    }

    if (response.status === 429) {
      return {
        status: "error",
        message:
          "Plusieurs demandes ont déjà été envoyées depuis votre connexion dans l'heure. Réessayez un peu plus tard, ou écrivez-nous depuis la page Contact.",
        fieldErrors: {},
        values,
      };
    }

    const apiError = toApiError(response.status, error);
    const apiFieldErrors: Partial<Record<DemoField, string>> = {};
    for (const [key, message] of Object.entries(apiError.fields)) {
      if (isDemoField(key)) apiFieldErrors[key] = message;
    }
    const hasFieldErrors = Object.keys(apiFieldErrors).length > 0;
    return {
      status: "error",
      message: hasFieldErrors ? "Certains champs sont à corriger avant l'envoi." : apiError.message,
      fieldErrors: apiFieldErrors,
      values,
    };
  } catch {
    return {
      status: "error",
      message: "Le service est momentanément indisponible. Votre demande n'a pas été envoyée : réessayez dans quelques minutes.",
      fieldErrors: {},
      values,
    };
  }
}
