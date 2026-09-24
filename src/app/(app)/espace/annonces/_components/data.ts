import { api, getActiveOrganization } from "@/lib/api/client";
import { ApiError, toApiError, unwrap } from "@/lib/api/errors";
import type { Schema } from "@/lib/api/types";
import { BACKEND_RELAY } from "@/lib/config";
import { formatMoney } from "@/lib/format";

/*
 * Accès aux données du module Annonces : clés React Query, chargements complets (sélecteur de lots),
 * contrôle et envoi des photos, petits calculs partagés par la liste et la fiche.
 */

export type Listing = Schema<"Listing">;
export type ListingStatus = Schema<"ListingStatusEnum">;
export type ListingType = Schema<"ListingTypeEnum">;
export type ListingPhoto = Schema<"ListingPhoto">;
export type Interest = Schema<"ProspectInterest">;
export type Unit = Schema<"Unit">;

/** Premier élément = ressource, pour que `invalidate` rafraîchisse toutes les vues concernées. */
export const KEYS = {
  listings: ["listings"] as const,
  list: (query: Record<string, string | number>) => ["listings", "list", query] as const,
  detail: (id: number) => ["listings", "detail", id] as const,
  photos: (id: number) => ["listings", "photos", id] as const,
  interests: (id: number, page: number) => ["listings", "interests", id, page] as const,
  units: ["units"] as const,
};

export const LISTING_STATUSES: readonly ListingStatus[] = ["DRAFT", "PUBLISHED", "SUSPENDED", "CLOSED"];
export const LISTING_TYPES: readonly ListingType[] = ["RENT", "SALE"];

export function asListingStatus(value: string): ListingStatus | undefined {
  return LISTING_STATUSES.find((status) => status === value);
}

export function asListingType(value: string): ListingType | undefined {
  return LISTING_TYPES.find((type) => type === value);
}

/** Prix affiché : « 450 000 F CFA / mois » pour une location. */
export function priceLabel(listing: Pick<Listing, "listing_type" | "price">): string {
  return listing.listing_type === "RENT" ? `${formatMoney(listing.price)} / mois` : formatMoney(listing.price);
}

/** Publier depuis Brouillon ou Suspendue, dépublier depuis Publiée (règles de listings/api/views.py). */
export const CAN_PUBLISH_FROM: readonly ListingStatus[] = ["DRAFT", "SUSPENDED"];
export const CAN_UNPUBLISH_FROM: readonly ListingStatus[] = ["PUBLISHED"];

/* ------------------------------------------------------------------ Lots */

/** Nombre maximal de pages lues pour le sélecteur (25 lots par page côté API). */
const MAX_PAGES = 20;

export async function fetchAllUnits(): Promise<Unit[]> {
  const units: Unit[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const result = unwrap(await api.GET("/api/v1/properties/units/", { params: { query: { page } } }));
    units.push(...result.results);
    if (!result.next) break;
  }
  return units;
}

/* ------------------------------------------------------------------ Photos */

/** Limites de l'API (listings/photos.py) : vérifiées avant l'envoi pour un message immédiat. */
export const MAX_PHOTOS = 20;
export const MAX_PHOTO_SIZE = 8 * 1024 * 1024;
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ACCEPT_ATTRIBUTE = ACCEPTED_TYPES.join(",");

/** Message d'erreur si le fichier sera refusé par l'API, sinon `undefined`. */
export function checkPhotoFile(file: File): string | undefined {
  if (!(ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
    return "Format non accepté : JPEG, PNG ou WebP uniquement.";
  }
  if (file.size > MAX_PHOTO_SIZE) {
    return `Fichier trop lourd (${formatFileSize(file.size)}) : 8 Mo maximum.`;
  }
  return undefined;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  return `${(bytes / (1024 * 1024)).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo`;
}

/** Photos dans l'ordre d'affichage de l'API (position puis identifiant). */
export function sortPhotos(photos: ListingPhoto[]): ListingPhoto[] {
  return [...photos].sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || a.id - b.id);
}

export interface UploadHandle {
  promise: Promise<ListingPhoto>;
  abort: () => void;
}

/**
 * Envoi multipart d'une photo (champ `image`) par le relais, avec suivi de la progression.
 * XMLHttpRequest plutôt que fetch : seul lui expose la progression de l'envoi, utile sur une
 * connexion mobile lente. En-têtes identiques au client `api` (organisation active).
 */
export function uploadPhoto(listingId: number, file: File, onProgress: (ratio: number) => void): UploadHandle {
  const xhr = new XMLHttpRequest();
  const promise = new Promise<ListingPhoto>((resolve, reject) => {
    const body = new FormData();
    body.append("image", file);

    xhr.open("POST", `${BACKEND_RELAY}/api/v1/listings/${listingId}/photos/`);
    xhr.setRequestHeader("Accept", "application/json");
    const organization = getActiveOrganization();
    if (organization) xhr.setRequestHeader("X-Organization-ID", organization);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    xhr.onload = () => {
      let payload: unknown;
      try {
        payload = xhr.responseText ? JSON.parse(xhr.responseText) : undefined;
      } catch {
        payload = undefined;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(payload as ListingPhoto);
      } else if (xhr.status === 401) {
        reject(new ApiError(401, "Votre session a expiré : reconnectez-vous puis renvoyez la photo."));
      } else if (xhr.status === 413) {
        reject(new ApiError(413, "Fichier refusé par le serveur : il est trop volumineux."));
      } else {
        reject(toApiError(xhr.status, payload));
      }
    };
    xhr.onerror = () => reject(new Error("Connexion interrompue pendant l'envoi. Vérifiez votre réseau et réessayez."));
    xhr.onabort = () => reject(new DOMException("Envoi annulé.", "AbortError"));
    xhr.send(body);
  });
  return { promise, abort: () => xhr.abort() };
}
