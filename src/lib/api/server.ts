import "server-only";

import createClient from "openapi-fetch";

import { API_URL } from "@/lib/config";
import { forwardingHeaders } from "@/lib/server/forwarding";

import type { paths } from "./schema";

/**
 * Client de l'API pour les Server Components (pages publiques, sans authentification).
 * Identifié auprès de Django par la clé partagée : ses lectures, mises en cache par Next,
 * ne consomment pas la limite de débit des visiteurs. Les réponses sont réutilisées 60 s
 * (une annonce publiée apparaît donc en moins d'une minute sur le portail).
 */
export const publicApi = createClient<paths>({
  baseUrl: API_URL,
  headers: forwardingHeaders(),
  fetch: (request: Request) => fetch(request, { next: { revalidate: 60 } }),
});
