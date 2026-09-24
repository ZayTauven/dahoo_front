/*
 * Erreurs de l'API Django REST Framework, sous une forme exploitable par les formulaires :
 * - { "detail": "..." }                       → message général
 * - { "champ": ["..."], "non_field_errors": [...] } → messages par champ
 */

export type FieldErrors = Record<string, string>;

export class ApiError extends Error {
  readonly status: number;
  readonly fields: FieldErrors;

  constructor(status: number, message: string, fields: FieldErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

const STATUS_MESSAGES: Record<number, string> = {
  402: "Votre période d'essai est terminée : l'accès est en lecture seule.",
  403: "Vous n'avez pas les droits nécessaires pour cette action.",
  404: "Élément introuvable.",
  429: "Trop de tentatives. Patientez un instant avant de réessayer.",
};

function firstMessage(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return firstMessage(value[0]);
  if (value && typeof value === "object") return firstMessage(Object.values(value)[0]);
  return undefined;
}

export function toApiError(status: number, payload: unknown): ApiError {
  const fields: FieldErrors = {};
  let message: string | undefined;

  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    for (const [key, value] of Object.entries(payload)) {
      const text = firstMessage(value);
      if (!text) continue;
      if (key === "detail" || key === "non_field_errors") message ??= text;
      else fields[key] = text;
    }
  }
  message ??= STATUS_MESSAGES[status] ?? firstMessage(Object.values(fields)) ?? "Une erreur est survenue. Réessayez.";
  return new ApiError(status, message, fields);
}

/** Déballe une réponse openapi-fetch : renvoie les données ou lève une ApiError. */
export function unwrap<T>(result: { data?: T; error?: unknown; response: Response }): T {
  if (result.error !== undefined || !result.response.ok) {
    throw toApiError(result.response.status, result.error);
  }
  return result.data as T;
}
