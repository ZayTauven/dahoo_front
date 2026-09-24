import type { components } from "./schema";

/** Raccourci vers les schémas OpenAPI générés : Schema<"Me">, Schema<"Property">… */
export type Schema<Name extends keyof components["schemas"]> = components["schemas"][Name];

/** Page de résultats paginée par Django REST Framework. */
export interface Page<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
