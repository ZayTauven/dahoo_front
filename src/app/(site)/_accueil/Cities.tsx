import { Container, Section } from "@/components/site/layout";
import { Highlight } from "@/components/site/motion";
import { SectionHeading } from "@/components/site/SectionHeading";

import { CitiesCarousel, type CityCard } from "./CitiesCarousel";
import type { HomeStats } from "./data";
import { countLabel } from "./text";

/**
 * Visuels des villes. Les photos « monuments » de Crafto (Paris, Londres…) ne conviennent pas :
 * on associe des photos de biens, avec la plage pour les villes du littoral.
 */
const CITY_IMAGES: Record<string, string> = {
  dakar: "/images/site/property-02.webp",
  saly: "/images/site/hotel-banner-bg.webp",
  mbour: "/images/site/hotel-banner-bg.webp",
  somone: "/images/site/hotel-banner-bg.webp",
};
const FALLBACK_IMAGES = [
  "/images/site/property-05.webp",
  "/images/site/property-01.webp",
  "/images/site/slider-03.webp",
  "/images/site/property-06.webp",
  "/images/site/property-04.webp",
];

function cityImage(city: string, index: number): string {
  const key = city
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
  return CITY_IMAGES[key] ?? FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}

/** « We are available in many countries » de Crafto, sur les villes réelles des annonces. */
export function Cities({ stats }: { stats: HomeStats }) {
  if (stats.cities.length === 0) return null;

  const several = stats.cities.length > 1;
  const cards: CityCard[] = stats.cities.map((item, index) => ({
    city: item.city,
    count: countLabel(item.listings_count, "annonce"),
    image: cityImage(item.city, index),
    href: `/louer?city=${encodeURIComponent(item.city)}`,
  }));

  return (
    <Section tone="subtle" labelledBy="accueil-villes" className="overflow-hidden">
      <Container>
        <CitiesCarousel
          cities={cards}
          total={countLabel(stats.listings_count, "annonce")}
          heading={
            <SectionHeading
              id="accueil-villes"
              eyebrow="Trouvez votre quartier"
              title={
                <>
                  Des biens {several ? "dans" : "à"} <Highlight>{several ? "plusieurs villes" : stats.cities[0].city}</Highlight>
                </>
              }
            >
              <p className="m-0">
                Parcourez les annonces ville par ville et comparez les quartiers avant de programmer vos visites.
              </p>
            </SectionHeading>
          }
        />
      </Container>
    </Section>
  );
}
