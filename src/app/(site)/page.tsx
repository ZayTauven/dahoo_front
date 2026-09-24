import type { Metadata } from "next";

import { Container } from "@/components/site/layout";
import { Highlight } from "@/components/site/motion";
import { formatNumber } from "@/lib/format";

import { AgencyCta } from "./_accueil/AgencyCta";
import { Categories } from "./_accueil/Categories";
import { Cities } from "./_accueil/Cities";
import { getHomeStats, getLatestListings } from "./_accueil/data";
import { HeroCarousel } from "./_accueil/HeroCarousel";
import { Intro } from "./_accueil/Intro";
import { LatestListings } from "./_accueil/LatestListings";
import { SearchBar } from "./_accueil/SearchBar";
import { Services } from "./_accueil/Services";
import { WhyDahoo } from "./_accueil/WhyDahoo";

const TITLE = "Dahoo — Annonces immobilières au Sénégal et logiciel pour agences";
const DESCRIPTION =
  "Appartements, villas, bureaux et terrains à louer ou à vendre à Dakar, Saly et ailleurs au Sénégal, publiés par des agences immobilières. Agences : gérez biens, baux, loyers et annonces avec Dahoo.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_SN",
    siteName: "Dahoo",
    url: "/",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/images/site/slider-01.webp",
        width: 1920,
        height: 939,
        alt: "Dahoo, le portail des agences immobilières au Sénégal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/images/site/slider-01.webp"],
  },
};

export default async function HomePage() {
  const [stats, listings] = await Promise.all([getHomeStats(), getLatestListings(6)]);

  return (
    <>
      <HeroCarousel labelledBy="accueil-titre">
        <Container className="flex flex-1 flex-col justify-end gap-10 pt-24 pb-10 sm:pb-14 lg:justify-center lg:gap-14 lg:pt-28 lg:pb-20">
          <div className="flex max-w-3xl flex-col gap-5">
            <p className="text-accent-300 m-0 text-sm font-semibold tracking-wide sm:text-base">
              Le portail des agences immobilières au Sénégal
            </p>
            <h1
              id="accueil-titre"
              className="font-display m-0 text-[2.6rem] leading-[1.05] font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl"
            >
              Trouvez votre prochain <Highlight>chez-vous</Highlight> au Sénégal
            </h1>
            <p className="m-0 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              Locations et ventes publiées directement par les agences qui gèrent les biens. Choisissez, demandez une
              visite, l&apos;agence s&apos;occupe du reste.
            </p>
            {stats.listings_count > 0 && (
              <p className="m-0 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/85">
                <span>
                  <b className="font-mono text-white">{formatNumber(stats.listings_count)}</b>{" "}
                  {stats.listings_count > 1 ? "annonces en ligne" : "annonce en ligne"}
                </span>
                {stats.agencies_count > 0 && (
                  <span>
                    <b className="font-mono text-white">{formatNumber(stats.agencies_count)}</b>{" "}
                    {stats.agencies_count > 1 ? "agences partenaires" : "agence partenaire"}
                  </span>
                )}
              </p>
            )}
          </div>

          <SearchBar cities={stats.cities} className="lg:max-w-5xl" />
        </Container>
      </HeroCarousel>

      <Intro listingsCount={stats.listings_count} agenciesCount={stats.agencies_count} />
      <Categories stats={stats} />
      <LatestListings listings={listings} />
      <WhyDahoo agenciesCount={stats.agencies_count} />
      <Cities stats={stats} />
      <Services listingsCount={stats.listings_count} agenciesCount={stats.agencies_count} />
      <AgencyCta />
    </>
  );
}
