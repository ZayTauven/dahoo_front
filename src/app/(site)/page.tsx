import type { Metadata } from "next";
import { Fragment } from "react";

import { Highlight, RevealLines } from "@/components/site/motion";
import { Eyebrow } from "@/components/site/SectionHeading";

import { AgencyCta } from "./_accueil/AgencyCta";
import { Categories } from "./_accueil/Categories";
import { Cities } from "./_accueil/Cities";
import { getHomeStats, getLatestListings } from "./_accueil/data";
import { Hero } from "./_accueil/Hero";
import { LatestListings } from "./_accueil/LatestListings";
import { SearchBar } from "./_accueil/SearchBar";
import { countLabel } from "./_accueil/text";
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
        url: "/images/site/dahoo/villa-patio-bleu.webp",
        width: 2400,
        height: 1600,
        alt: "Dahoo, le portail des agences immobilières au Sénégal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/images/site/dahoo/villa-patio-bleu.webp"],
  },
};

export default async function HomePage() {
  const [stats, listings] = await Promise.all([getHomeStats(), getLatestListings(5)]);
  const figures = [
    stats.listings_count > 0 && countLabel(stats.listings_count, "annonce en ligne", "annonces en ligne"),
    stats.agencies_count > 0 && countLabel(stats.agencies_count, "agence partenaire", "agences partenaires"),
  ].filter(Boolean);

  return (
    <>
      <Hero
        labelledBy="accueil-titre"
        figures={figures.length > 0 ? figures.join(" — ") : undefined}
        title={
          <>
            <Eyebrow className="text-white/80 [&>span:first-child]:text-white">Le portail des agences immobilières au Sénégal</Eyebrow>
            <h1
              id="accueil-titre"
              className="font-display m-0 text-[3.2rem] leading-[0.92] font-normal tracking-[-0.035em] text-white sm:text-[6rem] lg:text-[8.5rem]"
            >
              <RevealLines
                play="mount"
                delay={0.3}
                lines={[
                  "Trouvez votre",
                  <Fragment key="ligne-2">
                    <Highlight>chez-vous</Highlight> au Sénégal
                  </Fragment>,
                ]}
              />
            </h1>
          </>
        }
      >
        <SearchBar cities={stats.cities} />
      </Hero>

      <Categories stats={stats} />
      <LatestListings listings={listings} total={stats.listings_count} />
      <Cities stats={stats} />
      <WhyDahoo stats={stats} />
      <AgencyCta />
    </>
  );
}
