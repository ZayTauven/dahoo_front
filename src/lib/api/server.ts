import "server-only";

import createClient from "openapi-fetch";

import { API_URL } from "@/lib/config";

import type { paths } from "./schema";

/** Client de l'API pour les Server Components (pages publiques, sans authentification). */
export const publicApi = createClient<paths>({ baseUrl: API_URL });
