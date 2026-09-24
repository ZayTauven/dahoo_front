"use server";

import { headers } from "next/headers";

import { toApiError } from "@/lib/api/errors";
import { publicApi } from "@/lib/api/server";
import { forwardingHeaders } from "@/lib/server/forwarding";

import {
  DAHOO_CONTACT_EMAIL,
  DEMO_FIELDS,
  isUnitsRange,
  type DemoField,
  type DemoRequestState,
  type DemoValues,
} from "./demo-request";

const MAX_LENGTH: Record<DemoField, number> = {
  agency_name: 200,
  contact_name: 150,
  phone: 30,
  email: 254,
  city: 100,
  units_range: 10,
  message: 2000,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: DemoValues): Partial<Record<DemoField, string>> {
  const errors: Partial<Record<DemoField, string>> = {};

  if (!values.agency_name) errors.agency_name = "Indiquez le nom de votre agence.";
  if (!values.contact_name) errors.contact_name = "Indiquez votre nom.";

  const phoneDigits = values.phone.replace(/\D/g, "");
  if (!values.phone) errors.phone = "Indiquez un numéro de téléphone pour que nous puissions vous rappeler.";
  else if (!/^[\d\s+().-]+$/.test(values.phone) || phoneDigits.length < 7 || phoneDigits.length > 15)
    errors.phone = "Ce numéro de téléphone ne semble pas valide (exemple : 77 123 45 67).";

  if (values.email && !EMAIL_PATTERN.test(values.email)) errors.email = "Cette adresse e-mail ne semble pas valide.";
  if (!isUnitsRange(values.units_range)) errors.units_range = "Choisissez le nombre de lots que vous gérez.";

  for (const field of DEMO_FIELDS) {
    if (!errors[field] && values[field].length > MAX_LENGTH[field]) {
      errors[field] = `${MAX_LENGTH[field]} caractères au maximum.`;
    }
  }
  return errors;
}

function rateLimitMessage(retryAfter: string | null): string {
  const seconds = Number(retryAfter);
  const wait =
    Number.isFinite(seconds) && seconds > 0
      ? seconds < 90
        ? "dans une minute"
        : `dans environ ${Math.ceil(seconds / 60)} minutes`
      : "un peu plus tard";
  return `Vous avez envoyé plusieurs demandes en peu de temps. Réessayez ${wait}, ou écrivez-nous à ${DAHOO_CONTACT_EMAIL}.`;
}

/**
 * Demande de démo envoyée depuis la page Contact (profil « Je suis une agence »).
 * Validation côté serveur, puis POST /api/v1/public/demo-requests/ avec l'IP du visiteur
 * pour que Django applique sa limite de débit par visiteur (5 demandes par heure).
 */
export async function requestDemo(_previous: DemoRequestState, formData: FormData): Promise<DemoRequestState> {
  const read = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value.trim() : "";
  };
  const values = Object.fromEntries(DEMO_FIELDS.map((field) => [field, read(field)])) as DemoValues;

  // Champ piège invisible : rempli seulement par les robots. On simule un succès sans rien envoyer.
  if (read("site_web")) return { status: "success", contactName: values.contact_name };

  const fieldErrors = validate(values);
  if (Object.keys(fieldErrors).length > 0 || !isUnitsRange(values.units_range)) {
    return { status: "error", message: "Certains champs sont à corriger.", fieldErrors, values };
  }

  try {
    const { error, response } = await publicApi.POST("/api/v1/public/demo-requests/", {
      body: {
        agency_name: values.agency_name,
        contact_name: values.contact_name,
        phone: values.phone,
        email: values.email || undefined,
        city: values.city || undefined,
        units_range: values.units_range,
        message: values.message || undefined,
      },
      headers: forwardingHeaders(await headers()),
    });

    if (response.ok) return { status: "success", contactName: values.contact_name };

    if (response.status === 429) {
      return { status: "error", message: rateLimitMessage(response.headers.get("Retry-After")), fieldErrors: {}, values };
    }

    const apiError = toApiError(response.status, error);
    const apiFieldErrors: Partial<Record<DemoField, string>> = {};
    for (const field of DEMO_FIELDS) {
      if (apiError.fields[field]) apiFieldErrors[field] = apiError.fields[field];
    }
    const hasFieldErrors = Object.keys(apiFieldErrors).length > 0;
    return {
      status: "error",
      message: hasFieldErrors
        ? "Certains champs sont à corriger."
        : response.status >= 500
          ? `Le service est momentanément indisponible. Réessayez dans quelques instants ou écrivez-nous à ${DAHOO_CONTACT_EMAIL}.`
          : apiError.message,
      fieldErrors: apiFieldErrors,
      values,
    };
  } catch {
    return {
      status: "error",
      message: `Impossible d'envoyer votre demande pour le moment. Réessayez dans quelques instants ou écrivez-nous à ${DAHOO_CONTACT_EMAIL}.`,
      fieldErrors: {},
      values,
    };
  }
}
