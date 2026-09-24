import type { NextRequest } from "next/server";

import { readTokens, refreshTokens } from "@/lib/auth/session";
import { API_URL, BACKEND_RELAY } from "@/lib/config";
import { forwardingHeaders } from "@/lib/server/forwarding";

/*
 * Relais authentifié vers l'API Django (guide Next « backend-for-frontend »).
 * Le navigateur appelle /api/backend/api/v1/... ; le relais ajoute le jeton d'accès lu dans le
 * cookie httpOnly, le renouvelle une fois si Django répond 401, et renvoie la réponse telle quelle.
 */

const FORWARDED_REQUEST_HEADERS = ["accept", "content-type", "x-organization-id", "accept-language"];
const FORWARDED_RESPONSE_HEADERS = ["content-type", "content-disposition", "retry-after"];

async function forward(request: NextRequest, body: ArrayBuffer | undefined, access: string | undefined) {
  // Le chemin est repris tel quel (barre finale comprise, attendue par Django REST Framework).
  const target = new URL(request.nextUrl.pathname.slice(BACKEND_RELAY.length) + request.nextUrl.search, API_URL);
  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  if (access) headers.set("authorization", `Bearer ${access}`);
  for (const [name, value] of Object.entries(forwardingHeaders(request.headers))) headers.set(name, value);
  return fetch(target, { method: request.method, headers, body, cache: "no-store", redirect: "manual" });
}

async function handle(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith(`${BACKEND_RELAY}/api/`)) {
    return Response.json({ detail: "Introuvable." }, { status: 404 });
  }
  // Défense CSRF en plus des cookies SameSite=Lax : une écriture doit venir de notre propre origine.
  const origin = request.headers.get("origin");
  if (!["GET", "HEAD"].includes(request.method) && origin && origin !== request.nextUrl.origin) {
    return Response.json({ detail: "Origine non autorisée." }, { status: 403 });
  }
  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer();
  const tokens = await readTokens();

  let access = tokens.access;
  if (!access && tokens.refresh) access = (await refreshTokens(tokens.refresh))?.access;

  let upstream = await forward(request, body, access);
  if (upstream.status === 401 && tokens.refresh) {
    const renewed = await refreshTokens(tokens.refresh);
    if (renewed) upstream = await forward(request, body, renewed.access);
  }

  const headers = new Headers();
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  return new Response(upstream.body, { status: upstream.status, headers });
}

export { handle as DELETE, handle as GET, handle as PATCH, handle as POST, handle as PUT };
