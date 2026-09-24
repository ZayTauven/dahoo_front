import "server-only";

import { cookies } from "next/headers";

import { API_URL } from "@/lib/config";

/*
 * Session côté serveur : les jetons JWT de l'API Django sont stockés dans des cookies httpOnly,
 * jamais exposés au JavaScript du navigateur. Le relais /api/backend les ajoute aux requêtes.
 */

export const ACCESS_COOKIE = "dahoo_access";
export const REFRESH_COOKIE = "dahoo_refresh";

// Alignées sur SIMPLE_JWT côté Django (access 10 min, refresh 7 jours).
const ACCESS_MAX_AGE = 60 * 10;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export interface Tokens {
  access: string;
  refresh?: string;
}

export async function storeTokens({ access, refresh }: Tokens): Promise<void> {
  const store = await cookies();
  store.set(ACCESS_COOKIE, access, { ...cookieOptions, maxAge: ACCESS_MAX_AGE });
  if (refresh) {
    store.set(REFRESH_COOKIE, refresh, { ...cookieOptions, maxAge: REFRESH_MAX_AGE });
  }
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function readTokens(): Promise<{ access?: string; refresh?: string }> {
  const store = await cookies();
  return {
    access: store.get(ACCESS_COOKIE)?.value,
    refresh: store.get(REFRESH_COOKIE)?.value,
  };
}

/**
 * Obtient un nouveau jeton d'accès. Le backend fait tourner le refresh (ROTATE_REFRESH_TOKENS) :
 * le nouveau refresh est renvoyé et doit remplacer l'ancien, qui est blacklisté.
 */
export async function refreshTokens(refresh: string): Promise<Tokens | null> {
  const response = await fetch(new URL("/api/v1/users/refresh/", API_URL), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
    cache: "no-store",
  });
  if (!response.ok) return null;
  const data = (await response.json()) as Tokens;
  await storeTokens(data);
  return data;
}
