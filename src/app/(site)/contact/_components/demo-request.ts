import type { Schema } from "@/lib/api/types";

/*
 * Contrat partagé entre le formulaire de demande de démo (client) et sa Server Action.
 * Fichier sans directive : importable des deux côtés.
 */

export type UnitsRange = Schema<"DemoRequestRequest">["units_range"];

export const UNITS_RANGES: { value: UnitsRange; label: string }[] = [
  { value: "1-20", label: "1 à 20 lots" },
  { value: "21-100", label: "21 à 100 lots" },
  { value: "101-500", label: "101 à 500 lots" },
  { value: "500+", label: "Plus de 500 lots" },
];

export function isUnitsRange(value: string): value is UnitsRange {
  return UNITS_RANGES.some((range) => range.value === value);
}

export const DEMO_FIELDS = ["agency_name", "contact_name", "phone", "email", "city", "units_range", "message"] as const;
export type DemoField = (typeof DEMO_FIELDS)[number];

export type DemoValues = Record<DemoField, string>;

export type DemoRequestState =
  | { status: "idle" }
  | { status: "success"; contactName: string }
  | {
      status: "error";
      message: string;
      fieldErrors: Partial<Record<DemoField, string>>;
      /** Saisie renvoyée pour la réafficher : React réinitialise le formulaire après l'action. */
      values: DemoValues;
    };

export const INITIAL_DEMO_STATE: DemoRequestState = { status: "idle" };

/** Adresse de contact générique de Dahoo (à confirmer par le client). */
export const DAHOO_CONTACT_EMAIL = "contact@dahoo.sn";
