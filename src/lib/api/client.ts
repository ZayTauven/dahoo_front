"use client";

import createClient, { type Middleware } from "openapi-fetch";

import { BACKEND_RELAY } from "@/lib/config";

import type { paths } from "./schema";

/*
 * Client typé de l'API Django pour le navigateur : passe par le relais /api/backend, qui ajoute
 * le jeton d'accès (cookie httpOnly). Routes, paramètres et réponses sont typés depuis OpenAPI.
 */

const ORGANIZATION_KEY = "dahoo:organization";

/** Organisation active (utile seulement aux utilisateurs membres de plusieurs agences). */
export function getActiveOrganization(): string | null {
  try {
    return window.localStorage.getItem(ORGANIZATION_KEY);
  } catch {
    return null;
  }
}

export function setActiveOrganization(id: number | null): void {
  try {
    if (id === null) window.localStorage.removeItem(ORGANIZATION_KEY);
    else window.localStorage.setItem(ORGANIZATION_KEY, String(id));
  } catch {
    // Stockage indisponible (navigation privée) : l'API choisira l'organisation unique.
  }
}

const organizationHeader: Middleware = {
  onRequest({ request }) {
    const organization = getActiveOrganization();
    if (organization) request.headers.set("X-Organization-ID", organization);
    return request;
  },
};

const sessionExpired: Middleware = {
  onResponse({ response }) {
    // Le relais a déjà tenté de renouveler la session : un 401 ici signifie qu'elle est terminée.
    if (response.status === 401 && !window.location.pathname.startsWith("/connexion")) {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      // Hors composant React : rechargement complet voulu pour repartir d'un état vierge.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`/connexion?suite=${next}`);
    }
    return response;
  },
};

export const api = createClient<paths>({ baseUrl: BACKEND_RELAY });
api.use(organizationHeader, sessionExpired);
