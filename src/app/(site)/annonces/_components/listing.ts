import { listingPrice } from "@/components/site/PropertyCard";
import { SITE_URL } from "@/lib/config";

import type { ListingDetail } from "./data";
import type { GalleryPhoto } from "./ListingGallery";

/*
 * Aides de présentation de la fiche annonce (sans état, utilisables côté serveur).
 */

export function listingPlace(listing: Pick<ListingDetail, "neighborhood" | "city">): string {
  return [listing.neighborhood, listing.city].filter(Boolean).join(", ");
}

/** Liste où revenir selon la transaction (fil d'Ariane, liens « voir d'autres biens »). */
export function listingBrowse(listing: Pick<ListingDetail, "listing_type">): { href: string; label: string } {
  return listing.listing_type === "RENT" ? { href: "/louer", label: "Louer" } : { href: "/acheter", label: "Acheter" };
}

export function galleryPhotos(listing: ListingDetail): GalleryPhoto[] {
  const photos = listing.photos
    .filter((photo): photo is typeof photo & { url: string } => Boolean(photo.url))
    .map((photo, index) => ({ url: photo.url, alt: photo.alt?.trim() || `${listing.title}, photo ${index + 1}` }));
  if (photos.length === 0 && listing.cover) photos.push({ url: listing.cover, alt: listing.title });
  return photos;
}

/** Coordonnées exploitables (l'API les arrondit : position approximative). */
export function listingCoordinates(listing: Pick<ListingDetail, "latitude" | "longitude">): { lat: number; lng: number } | null {
  if (listing.latitude == null || listing.longitude == null) return null;
  const lat = Number(listing.latitude);
  const lng = Number(listing.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

/** Texte brut tronqué au dernier mot entier, pour les descriptions de métadonnées. */
export function truncate(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.–-]+$/, "")}…`;
}

/** Résumé d'une annonce quand elle n'a pas de description : « Appartement à louer à Mermoz, Dakar — 250 000 F CFA / mois ». */
export function listingSummary(listing: ListingDetail): string {
  const transaction = listing.listing_type === "RENT" ? "à louer" : "à vendre";
  const place = listingPlace(listing);
  return `${listing.category_label} ${transaction}${place ? ` à ${place}` : ""} : ${listingPrice(listing)}.`;
}

/** Numéro affichable : +221339570000 → +221 33 957 00 00 (autres formats laissés tels quels). */
export function formatPhone(phone: string): string {
  const compact = phone.replace(/[\s.-]/g, "");
  const senegal = /^(\+221|00221)?(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(compact);
  if (!senegal) return phone;
  const [, prefix, a, b, c, d] = senegal;
  return `${prefix ? "+221 " : ""}${a} ${b} ${c} ${d}`;
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

const RESIDENCE_TYPE: Record<string, string> = {
  APARTMENT: "Apartment",
  STUDIO: "Apartment",
  HOUSE: "SingleFamilyResidence",
};

/**
 * Données structurées schema.org : une page `RealEstateListing` dont l'objet principal est le bien
 * (`Apartment`, `SingleFamilyResidence` ou `Place` pour bureaux, commerces et terrains) et l'offre
 * (`Offer`, loyer mensuel ou prix de vente en XOF), vendue par l'agence (`RealEstateAgent`).
 */
export function listingJsonLd(listing: ListingDetail, photos: GalleryPhoto[]) {
  const url = new URL(`/annonces/${listing.id}`, SITE_URL).toString();
  const agencyUrl = new URL(`/agences/${listing.agency.id}`, SITE_URL).toString();
  const coords = listingCoordinates(listing);
  const browse = listingBrowse(listing);
  const isResidence = listing.category in RESIDENCE_TYPE;

  const place: Record<string, unknown> = {
    "@type": RESIDENCE_TYPE[listing.category] ?? "Place",
    name: listing.title,
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.city,
      ...(listing.neighborhood ? { streetAddress: listing.neighborhood } : {}),
      addressCountry: "SN",
    },
    ...(coords ? { geo: { "@type": "GeoCoordinates", latitude: coords.lat, longitude: coords.lng } } : {}),
  };
  if (isResidence) {
    if (listing.surface) place.floorSize = { "@type": "QuantitativeValue", value: listing.surface, unitCode: "MTK" };
    if (listing.bedrooms != null) place.numberOfBedrooms = listing.bedrooms;
    if (listing.bathrooms != null) place.numberOfBathroomsTotal = listing.bathrooms;
  }

  const price = Number(listing.price);
  const offer: Record<string, unknown> = {
    "@type": "Offer",
    url,
    price,
    priceCurrency: "XOF",
    availability: "https://schema.org/InStock",
    businessFunction: listing.listing_type === "RENT" ? "http://purl.org/goodrelations/v1#LeaseOut" : "http://purl.org/goodrelations/v1#Sell",
    seller: {
      "@type": "RealEstateAgent",
      name: listing.agency.name,
      url: agencyUrl,
      ...(listing.agency.phone ? { telephone: listing.agency.phone } : {}),
      ...(listing.agency.email ? { email: listing.agency.email } : {}),
    },
  };
  if (listing.listing_type === "RENT") {
    offer.priceSpecification = { "@type": "UnitPriceSpecification", price, priceCurrency: "XOF", unitCode: "MON" };
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "RealEstateListing",
        "@id": url,
        url,
        name: listing.title,
        description: listing.description || listingSummary(listing),
        ...(listing.published_at ? { datePosted: listing.published_at } : {}),
        image: photos.map((photo) => photo.url),
        mainEntity: place,
        offers: offer,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: new URL("/", SITE_URL).toString() },
          { "@type": "ListItem", position: 2, name: browse.label, item: new URL(browse.href, SITE_URL).toString() },
          { "@type": "ListItem", position: 3, name: listing.title, item: url },
        ],
      },
    ],
  };
}
