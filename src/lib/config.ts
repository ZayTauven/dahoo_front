/** URL de l'API Django. Utilisée uniquement côté serveur (relais /api/backend, pages publiques). */
export const API_URL = process.env.DAHOO_API_URL ?? "http://localhost:8000";

/** URL publique du site (liens absolus, métadonnées). */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Préfixe du relais authentifié vers l'API, appelé par le navigateur. */
export const BACKEND_RELAY = "/api/backend";
