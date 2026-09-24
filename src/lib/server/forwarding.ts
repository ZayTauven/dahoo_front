import "server-only";

/*
 * En-têtes ajoutés aux appels serveur → Django (voir dahoo_backend/dahoo/throttling.py) :
 * la clé partagée prouve que la requête vient du front, l'IP permet à Django de limiter le débit
 * par visiteur plutôt que globalement (toutes les requêtes relayées ont l'IP du serveur Next).
 *
 * L'IP n'est lue que dans un en-tête ÉCRASÉ par le reverse proxy de production (Nginx :
 * `proxy_set_header X-Real-IP $remote_addr;`). X-Forwarded-For n'est pas utilisé : Next ne le
 * renseigne que s'il est absent, un visiteur pourrait donc y inscrire une IP arbitraire et
 * contourner la limite de connexion. Sans cet en-tête, les écritures partagent la limite globale.
 */

const PROXY_KEY = process.env.DAHOO_PROXY_KEY ?? "";
const CLIENT_IP_HEADER = (process.env.DAHOO_CLIENT_IP_HEADER ?? "x-real-ip").toLowerCase();

/** IP du visiteur transmise par le reverse proxy de confiance, s'il y en a un. */
export function clientIp(headers: Headers): string | undefined {
  return headers.get(CLIENT_IP_HEADER)?.trim() || undefined;
}

/**
 * En-têtes à ajouter à un appel vers Django. Sans `incoming` (rendu serveur des pages publiques),
 * seule la clé est envoyée : Django ne limite pas ces lectures, mises en cache par Next.
 */
export function forwardingHeaders(incoming?: Headers): Record<string, string> {
  if (!PROXY_KEY) return {};
  const headers: Record<string, string> = { "X-Dahoo-Proxy-Key": PROXY_KEY };
  const ip = incoming ? clientIp(incoming) : undefined;
  if (ip) headers["X-Dahoo-Client-IP"] = ip;
  return headers;
}
