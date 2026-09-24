import { storeTokens, type Tokens } from "@/lib/auth/session";
import { API_URL } from "@/lib/config";
import { forwardingHeaders } from "@/lib/server/forwarding";

/** Connexion par téléphone : relaie les identifiants à Django et pose les jetons en cookies httpOnly. */
export async function POST(request: Request) {
  const credentials = await request.json().catch(() => null);
  if (!credentials || typeof credentials !== "object") {
    return Response.json({ detail: "Requête invalide." }, { status: 400 });
  }

  const login = await fetch(new URL("/api/v1/users/login/", API_URL), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...forwardingHeaders(request.headers) },
    body: JSON.stringify(credentials),
    cache: "no-store",
  });
  if (!login.ok) {
    // Erreurs de validation (400) ou limitation de débit (429) : renvoyées telles quelles au formulaire.
    return new Response(login.body, { status: login.status, headers: { "Content-Type": "application/json" } });
  }

  const tokens = (await login.json()) as Tokens;
  await storeTokens(tokens);

  const me = await fetch(new URL("/api/v1/users/me/", API_URL), {
    headers: { Authorization: `Bearer ${tokens.access}` },
    cache: "no-store",
  });
  return new Response(me.body, { status: me.status, headers: { "Content-Type": "application/json" } });
}
