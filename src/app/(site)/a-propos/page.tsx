import type { Metadata } from "next";
import Image from "next/image";

import { Container, Section } from "@/components/site/layout";
import { Highlight, Reveal } from "@/components/site/motion";
import { PHOTOS } from "@/components/site/photos";
import { Eyebrow, SectionHeading } from "@/components/site/SectionHeading";
import { publicApi } from "@/lib/api/server";
import type { Schema } from "@/lib/api/types";

import { AboutIntro, type AboutFigures } from "./_components/AboutIntro";
import { SenegalGallery } from "./_components/SenegalGallery";

export const metadata: Metadata = {
  title: "À propos de Dahoo",
  description:
    "Dahoo rapproche les agences immobilières du Sénégal et leurs clients : un portail d'annonces à louer et à vendre, et un outil qui digitalise la gestion locative des agences.",
  alternates: { canonical: "/a-propos" },
};

/** Compteurs réels du portail ; `null` si l'API ne répond pas (les chiffres sont alors masqués). */
async function getStats(): Promise<Schema<"PublicStats"> | null> {
  try {
    const { data } = await publicApi.GET("/api/v1/public/stats/");
    return data ?? null;
  } catch {
    return null;
  }
}

/*
 * Engagements (valeurs) : textes encore à confirmer par le client. Ils restent factuels, décrivent ce
 * que fait le service et n'avancent aucun chiffre ni témoignage.
 */
const VALUES = [
  { title: "Transparence", text: "Prix en FCFA, agence toujours indiquée." },
  { title: "Proximité", text: "Pensé pour le marché sénégalais." },
  { title: "Simplicité", text: "Sur téléphone comme sur ordinateur." },
  { title: "Confiance", text: "Chaque annonce a son agence, joignable." },
];

const pad = (value: number) => String(value).padStart(2, "0");

export default async function AboutPage() {
  const stats = await getStats();
  const figures: AboutFigures | null = stats
    ? {
        listings: stats.listings_count,
        agencies: stats.agencies_count,
        rent: stats.by_type.find((entry) => entry.listing_type === "RENT")?.count ?? 0,
        sale: stats.by_type.find((entry) => entry.listing_type === "SALE")?.count ?? 0,
        cities: stats.cities.map((entry) => entry.city),
      }
    : null;

  return (
    <>
      {/* 01 — Photo de Dakar, chiffres réels, mission en deux colonnes. */}
      <AboutIntro figures={figures} />

      {/* 02 — Le Sénégal en images : mosaïque et agrandissement. */}
      <Section tone="subtle" labelledBy="galerie" className="lg:pb-24">
        <Container className="flex flex-col gap-8 lg:gap-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              id="galerie"
              index="02"
              eyebrow="Notre terrain"
              title={
                <>
                  Le Sénégal, <Highlight>en images</Highlight>
                </>
              }
            />
            <p className="site-label text-text-muted m-0">Une photo s&apos;agrandit d&apos;un clic</p>
          </div>
          <SenegalGallery />
        </Container>
      </Section>

      {/* 03 — Engagements : une photo, quatre mots. */}
      <Section labelledBy="valeurs">
        <Container>
          <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0 md:grid-cols-12 md:grid-rows-2 md:gap-3">
            <Reveal as="li" className="relative isolate col-span-2 min-h-72 overflow-hidden rounded-md md:col-span-4 md:row-span-2">
              <Image src={PHOTOS.villaPatioBleu.src} alt={PHOTOS.villaPatioBleu.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="-z-10 object-cover" />
              <span aria-hidden="true" className="from-brand-900/85 via-brand-900/25 absolute inset-0 -z-10 bg-linear-to-t to-transparent" />
              <div className="flex h-full flex-col justify-end gap-4 p-6 sm:p-8">
                <Eyebrow index="03" className="text-white/75 [&>span:first-child]:text-white">
                  Nos engagements
                </Eyebrow>
                <h2 id="valeurs" className="font-display m-0 text-4xl leading-none font-normal tracking-tight text-balance text-white sm:text-5xl">
                  Ce qui guide <Highlight>notre travail</Highlight>
                </h2>
              </div>
            </Reveal>
            {VALUES.map((value, index) => (
              <Reveal
                as="li"
                key={value.title}
                delay={0.06 + index * 0.06}
                className="bg-surface-solid flex min-h-40 flex-col justify-between gap-6 rounded-md p-5 sm:p-7 md:col-span-4"
              >
                <span className="site-label text-accent-text">{pad(index + 1)}</span>
                <div className="flex flex-col gap-2">
                  <h3 className="font-display text-text-strong m-0 text-[1.7rem] leading-none font-normal tracking-tight sm:text-4xl">
                    {value.title}
                  </h3>
                  <p className="text-text-muted m-0 text-sm leading-snug sm:text-base">{value.text}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
