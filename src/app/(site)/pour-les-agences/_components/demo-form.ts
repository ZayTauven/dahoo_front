import type { Schema } from "@/lib/api/types";

/*
 * Contrat du formulaire « Demander une démo » partagé entre le composant client et la Server Action
 * (un fichier "use server" ne peut exporter que des fonctions asynchrones).
 */

export type UnitsRange = Schema<"UnitsRangeEnum">;

/** Tranches de `units_range` (nombre de lots gérés), dans l'ordre de l'API. */
export const UNITS_RANGES: { value: UnitsRange; label: string }[] = [
  { value: "1-20", label: "1 à 20 lots" },
  { value: "21-100", label: "21 à 100 lots" },
  { value: "101-500", label: "101 à 500 lots" },
  { value: "500+", label: "Plus de 500 lots" },
];

export const DEMO_FIELDS = ["agency_name", "contact_name", "phone", "email", "city", "units_range", "message"] as const;
export type DemoField = (typeof DEMO_FIELDS)[number];

export type DemoValues = Partial<Record<DemoField, string>>;

export type DemoFormState =
  | { status: "idle" }
  | {
      status: "error";
      /** Message général, annoncé en tête de formulaire. */
      message: string;
      fieldErrors: Partial<Record<DemoField, string>>;
      /** Saisie renvoyée pour ne rien faire retaper au visiteur. */
      values: DemoValues;
    }
  | { status: "success"; contactName: string; agencyName: string };

export const INITIAL_DEMO_STATE: DemoFormState = { status: "idle" };

/** Longueurs maximales (alignées sur le modèle Django ; message borné côté front). */
export const MAX_LENGTH = {
  agency_name: 200,
  contact_name: 150,
  phone: 30,
  email: 254,
  city: 100,
  message: 2000,
} as const;
