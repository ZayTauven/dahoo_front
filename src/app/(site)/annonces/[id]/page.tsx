import {
  IconArmchair,
  IconBath,
  IconBed,
  IconBuildingEstate,
  IconCalendarEvent,
  IconCar,
  IconChevronRight,
  IconHash,
  IconKey,
  IconMail,
  IconMapPin,
  IconPhone,
  IconRuler2,
  type Icon,
} from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { Container, Section } from "@/components/site/layout";
import { Reveal } from "@/components/site/motion";
import { listingPrice, PropertyCard } from "@/components/site/PropertyCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

import { getListing, parseListingId, type ListingDetail } from "../_components/data";
import {
  formatPhone,
  galleryPhotos,
  listingBrowse,
  listingCoordinates,
  listingJsonLd,
  listingPlace,
  listingSummary,
  telHref,
  truncate,
} from "../_components/listing";
import { ListingGallery } from "../_components/ListingGallery";
import { VisitRequestForm } from "../_components/VisitRequestForm";

type Props = { params: Promise<{ id: string }> };

async function loadListing(params: Props["params"]): Promise<ListingDetail> {
  const id = parseListingId((await params).id);
  const listing = id ? await getListing(id) : null;
  if (!listing) notFound();
  return listing;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await loadListing(params);
  const title = listing.city ? `${listing.title} — ${listing.city}` : listing.title;
  const description = truncate(listing.description || listingSummary(listing));
  const cover = galleryPhotos(listing)[0];
  const path = `/annonces/${listing.id}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "fr_SN",
      siteName: "Dahoo",
      url: path,
      title,
      description,
      ...(cover ? { images: [{ url: cover.url, alt: cover.alt }] } : {}),
    },
    twitter: {
      card: cover ? "summary_large_image" : "summary",
      title,
      description,
      ...(cover ? { images: [cover.url] } : {}),
    },
  };
}

export default async function ListingPage({ params }: Props) {
  const listing = await loadListing(params);
  const photos = galleryPhotos(listing);
  const place = listingPlace(listing);
  const browse = listingBrowse(listing);
  const isRent = listing.listing_type === "RENT";
  const coords = listingCoordinates(listing);
  const agency = listing.agency;
  const pricePerSquareMeter = !isRent && listing.surface > 0 ? Number(listing.price) / listing.surface : null;
  const jsonLd = listingJsonLd(listing, photos);

  const defaultMessage = `Bonjour, je souhaite visiter le bien « ${listing.title} »${place ? ` (${place})` : ""}, réf. ${listing.id}. Merci de me recontacter pour convenir d'un rendez-vous.`;

  const keyFacts: Fact[] = [
    { icon: IconBuildingEstate, label: "Type", value: listing.category_label },
    { icon: IconRuler2, label: "Surface", value: `${formatNumber(listing.surface)} m²` },
    ...(listing.bedrooms != null ? [{ icon: IconBed, label: "Chambres", value: String(listing.bedrooms) }] : []),
    ...(listing.bathrooms != null ? [{ icon: IconBath, label: "Salles de bain", value: String(listing.bathrooms) }] : []),
  ];

  const specs: Fact[] = [
    { icon: IconBuildingEstate, label: "Type de bien", value: listing.category_label },
    { icon: IconKey, label: "Transaction", value: isRent ? "Location" : "Vente" },
    { icon: IconRuler2, label: "Surface", value: `${formatNumber(listing.surface)} m²` },
    ...(listing.bedrooms != null ? [{ icon: IconBed, label: "Chambres", value: plural(listing.bedrooms, "chambre") }] : []),
    ...(listing.bathrooms != null
      ? [{ icon: IconBath, label: "Salles de bain", value: plural(listing.bathrooms, "salle de bain", "salles de bain") }]
      : []),
    ...(listing.parking_spaces != null
      ? [
          {
            icon: IconCar,
            label: "Parking",
            value: listing.parking_spaces > 0 ? plural(listing.parking_spaces, "place") : "Sans place de parking",
          },
        ]
      : []),
    { icon: IconArmchair, label: "Meublé", value: listing.is_furnished ? "Oui" : "Non" },
    ...(listing.published_at ? [{ icon: IconCalendarEvent, label: "Publiée le", value: formatDate(listing.published_at) }] : []),
    { icon: IconHash, label: "Référence", value: `DH-${listing.id}` },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* En-tête : fil d'Ariane, titre, lieu, prix */}
      <Container className="flex flex-col gap-6 pt-6 pb-8 sm:pt-10 lg:pb-10">
        <nav aria-label="Fil d'Ariane">
          <ol className="text-text-muted m-0 flex list-none flex-wrap items-center gap-1.5 p-0 text-sm">
            <li className="flex items-center gap-1.5">
              <Link href="/" className="text-text-muted hover:text-brand no-underline hover:underline">
                Accueil
              </Link>
            </li>
            <li className="flex items-center gap-1.5">
              <IconChevronRight size={14} stroke={2} aria-hidden="true" />
              <Link href={browse.href} className="text-text-muted hover:text-brand no-underline hover:underline">
                {browse.label}
              </Link>
            </li>
            <li className="flex min-w-0 items-center gap-1.5">
              <IconChevronRight size={14} stroke={2} aria-hidden="true" />
              <span aria-current="page" className="text-text-strong line-clamp-1 font-medium">
                {listing.title}
              </span>
            </li>
          </ol>
        </nav>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="flex max-w-3xl flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase",
                  isRent ? "bg-accent text-on-accent" : "bg-brand text-on-brand",
                )}
              >
                {isRent ? "À louer" : "À vendre"}
              </span>
              <span className="bg-surface-subtle text-text rounded-full px-3 py-1 text-xs font-semibold">{listing.category_label}</span>
              {listing.is_furnished && (
                <span className="bg-surface-subtle text-text rounded-full px-3 py-1 text-xs font-semibold">Meublé</span>
              )}
            </div>
            <h1 className="font-display text-text-strong m-0 text-3xl leading-[1.15] font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              {listing.title}
            </h1>
            {place && (
              <p className="text-text-muted m-0 flex items-center gap-1.5 text-base">
                <IconMapPin size={18} stroke={1.75} className="text-accent-text shrink-0" aria-hidden="true" />
                {place}
              </p>
            )}
          </div>

          <div className="border-accent flex flex-col gap-1 border-l-2 pl-5 lg:min-w-64">
            <p className="text-text-muted m-0 text-sm">{isRent ? "Loyer mensuel" : "Prix de vente"}</p>
            <p className="font-display text-text-strong ax-num m-0 text-3xl font-bold tracking-tight sm:text-4xl">{listingPrice(listing)}</p>
            {pricePerSquareMeter != null && (
              <p className="text-text-muted ax-num m-0 text-sm">soit {formatMoney(Math.round(pricePerSquareMeter))} / m²</p>
            )}
            <p className="text-text-muted m-0 text-sm">
              Proposé par{" "}
              <Link href={`/agences/${agency.id}`} className="text-link font-semibold">
                {agency.name}
              </Link>
            </p>
          </div>
        </div>

        <a href="#demande-visite" className="ax-btn ax-btn--primary ax-btn--lg ax-btn--block lg:hidden">
          <IconCalendarEvent className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
          <span className="ax-btn__label">Demander une visite</span>
        </a>
      </Container>

      {/* Galerie */}
      <Container>
        <ListingGallery photos={photos} title={listing.title} />
      </Container>

      {/* Chiffres clés */}
      <Container className="pt-6">
        <ul
          className={cn(
            "border-border-default bg-border-default m-0 grid list-none grid-cols-2 gap-px overflow-hidden rounded-xl border p-0",
            "[&>li:last-child:nth-child(odd)]:col-span-2 sm:[&>li:last-child:nth-child(odd)]:col-span-1",
            FACT_COLUMNS[keyFacts.length],
          )}
        >
          {keyFacts.map((fact) => (
            <li key={fact.label} className="bg-surface-subtle flex items-center gap-3 px-4 py-4 sm:justify-center">
              <fact.icon size={26} stroke={1.5} className="text-brand shrink-0" aria-hidden="true" />
              <span className="flex flex-col">
                <span className="text-text-muted text-xs">{fact.label}</span>
                <span className="text-text-strong ax-num text-base font-semibold">{fact.value}</span>
              </span>
            </li>
          ))}
        </ul>
      </Container>

      {/* Contenu + colonne de contact */}
      <Container className="grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14 lg:py-16">
        <div className="flex min-w-0 flex-col gap-12">
          <DetailSection id="description" title="Description">
            {listing.description ? (
              <div className="text-text flex flex-col gap-4 text-base leading-relaxed">
                {listing.description
                  .split(/\n{2,}/)
                  .map((paragraph) => paragraph.trim())
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={index} className="m-0 whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
              </div>
            ) : (
              <p className="text-text-muted m-0">{listingSummary(listing)} L&apos;agence vous communiquera tous les détails lors de votre prise de contact.</p>
            )}
          </DetailSection>

          <DetailSection id="caracteristiques" title="Caractéristiques">
            <dl className="m-0 grid gap-x-10 sm:grid-cols-2">
              {specs.map((spec) => (
                <div key={spec.label} className="border-border-default flex items-center gap-3 border-b py-3.5">
                  <spec.icon size={22} stroke={1.5} className="text-brand shrink-0" aria-hidden="true" />
                  <dt className="text-text-strong text-sm font-semibold">{spec.label}</dt>
                  <dd className="text-text ml-auto text-right text-sm">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </DetailSection>

          <DetailSection id="localisation" title="Localisation">
            <p className="text-text m-0 flex items-center gap-1.5">
              <IconMapPin size={18} stroke={1.75} className="text-accent-text shrink-0" aria-hidden="true" />
              {place || "Localisation communiquée par l'agence"}
            </p>
            {coords ? (
              <div className="flex flex-col gap-3">
                <div className="border-border-default bg-surface-subtle overflow-hidden rounded-xl border">
                  <iframe
                    title={`Carte : position approximative du bien${place ? ` à ${place}` : ""}`}
                    src={osmEmbedUrl(coords)}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="block aspect-[4/3] w-full border-0 sm:aspect-[16/9]"
                  />
                </div>
                <p className="text-text-muted m-0 text-sm">
                  Position approximative : l&apos;adresse exacte vous sera communiquée par l&apos;agence.{" "}
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=15/${coords.lat}/${coords.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link font-medium"
                  >
                    Ouvrir la carte dans OpenStreetMap<span className="sr-only"> (nouvel onglet)</span>
                  </a>
                </p>
              </div>
            ) : (
              <p className="text-text-muted m-0 text-sm">L&apos;adresse exacte vous sera communiquée par l&apos;agence lors de la prise de rendez-vous.</p>
            )}
          </DetailSection>
        </div>

        <aside aria-label="Contacter l'agence" className="min-w-0">
          <div className="border-border-default flex flex-col overflow-hidden rounded-xl border bg-[var(--ax-surface-solid)] shadow-[var(--ax-shadow-card)] lg:sticky lg:top-24">
            <div className="bg-brand-900 flex items-center gap-4 p-5 text-white">
              <span
                aria-hidden="true"
                className="bg-accent text-on-accent font-display flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-bold"
              >
                {initials(agency.name)}
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="m-0 text-xs font-semibold tracking-wide text-white/75 uppercase">Agence</p>
                <p className="font-display m-0 text-lg leading-snug font-semibold text-white">{agency.name}</p>
                <Link href={`/agences/${agency.id}`} className="text-accent-300 text-sm font-medium hover:underline">
                  Voir l&apos;agence et ses annonces
                </Link>
              </div>
            </div>

            {(agency.phone || agency.email) && (
              <div className="border-border-default grid gap-2 border-b p-5 sm:grid-cols-2 lg:grid-cols-1">
                {agency.phone && (
                  <a href={telHref(agency.phone)} className="ax-btn ax-btn--secondary ax-btn--block">
                    <IconPhone className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
                    <span className="ax-btn__label ax-num">Appeler le {formatPhone(agency.phone)}</span>
                  </a>
                )}
                {agency.email && (
                  <a href={`mailto:${agency.email}?subject=${encodeURIComponent(`Annonce réf. DH-${listing.id} : ${listing.title}`)}`} className="ax-btn ax-btn--ghost ax-btn--block">
                    <IconMail className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
                    <span className="ax-btn__label truncate">{agency.email}</span>
                  </a>
                )}
              </div>
            )}

            <section id="demande-visite" aria-labelledby="demande-visite-titre" className="flex scroll-mt-24 flex-col gap-4 p-5">
              <div className="flex flex-col gap-1">
                <h2 id="demande-visite-titre" className="font-display text-text-strong m-0 text-xl font-semibold">
                  Demander une visite
                </h2>
                <p className="text-text-muted m-0 text-sm">Laissez vos coordonnées : l&apos;agence vous rappelle pour fixer un rendez-vous.</p>
              </div>
              <VisitRequestForm listingId={listing.id} agencyName={agency.name} defaultMessage={defaultMessage} browseHref={browse.href} />
            </section>
          </div>
        </aside>
      </Container>

      {listing.similar.length > 0 && (
        <Section tone="subtle" labelledBy="similaires-titre">
          <Container className="flex flex-col gap-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading id="similaires-titre" eyebrow="À découvrir aussi" title="Biens similaires" />
              <Link href={browse.href} className="text-link inline-flex items-center gap-1 text-sm font-semibold">
                {isRent ? "Toutes les locations" : "Tous les biens à vendre"}
                <IconChevronRight size={16} stroke={2} aria-hidden="true" />
              </Link>
            </div>
            <ul className="m-0 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {listing.similar.map((similar, index) => (
                <li key={similar.id}>
                  <Reveal delay={index * 0.08} className="h-full">
                    <PropertyCard listing={similar} />
                  </Reveal>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}
    </>
  );
}

/** Colonnes du bandeau de chiffres clés selon leur nombre (classes écrites en entier pour Tailwind). */
const FACT_COLUMNS: Record<number, string> = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4" };

interface Fact {
  icon: Icon;
  label: string;
  value: string;
}

function DetailSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-titre`} className="flex flex-col gap-5">
      <h2 id={`${id}-titre`} className="font-display text-text-strong m-0 text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  );
}

function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count > 1 ? pluralForm : singular}`;
}

function initials(name: string): string {
  const words = name.split(/\s+/).filter((word) => /^[\p{L}\d]/u.test(word) && word.length > 2);
  return (words.length > 0 ? words : name.split(/\s+/))
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

/** Carte OpenStreetMap intégrée, centrée sur la position arrondie de l'annonce (≈ 1,5 km de large). */
function osmEmbedUrl({ lat, lng }: { lat: number; lng: number }): string {
  const dLat = 0.007;
  const dLng = 0.012;
  const bbox = [lng - dLng, lat - dLat, lng + dLng, lat + dLat].map((value) => value.toFixed(5)).join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
}
