/*
 * Contrat entre la Server Action `requestVisit` (annonces/[id]/actions.ts) et le formulaire client.
 * Fichier sans directive : un module "use server" ne peut exporter que des fonctions asynchrones.
 */

export type VisitField = "full_name" | "phone" | "email" | "message";

export type VisitValues = Record<VisitField, string>;

export interface VisitRequestState {
  status: "idle" | "success" | "error";
  /** Message général (erreur réseau, limite atteinte, annonce retirée…). */
  message?: string;
  /** Erreurs par champ, affichées sous chaque champ. */
  fields?: Partial<Record<VisitField, string>>;
  /** Valeurs saisies, renvoyées pour que le formulaire ne se vide pas en cas d'erreur. */
  values?: VisitValues;
  /** L'annonce n'est plus publique : inutile de proposer un nouvel envoi. */
  gone?: boolean;
}

export const INITIAL_VISIT_STATE: VisitRequestState = { status: "idle" };

export const VISIT_LIMITS = {
  fullName: 120,
  phone: 20,
  email: 254,
  message: 1000,
} as const;
