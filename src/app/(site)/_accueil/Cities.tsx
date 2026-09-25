import { Container, Section } from "@/components/site/layout";
import { Highlight } from "@/components/site/motion";
import { PHOTOS, type SitePhoto } from "@/components/site/photos";
import { SectionHeading } from "@/components/site/SectionHeading";

import { CitiesList, type CityRow } from "./CitiesList";
import type { HomeStats } from "./data";
import { countLabel } from "./text";

/** Photos réelles par ville ; les villes sans photo dédiée reprennent des vues du littoral et de villas. */
const CITY_PHOTOS: Record<string, SitePhoto> = {
  dakar: PHOTOS.dakarVueAerienne,
  saly: PHOTOS.salyAerienVillas,
  mbour: PHOTOS.salyAerienVillas,
  somone: PHOTOS.villaPiscineJardin,
  "saint-louis": PHOTOS.saintLouisPirogues,
};
const FALLBACK_PHOTOS = [PHOTOS.cornicheResidences, PHOTOS.villaContemporaine, PHOTOS.villasBlanches];

function cityPhoto(city: string, index: number): SitePhoto {
  const key = city
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
  return CITY_PHOTOS[key] ?? FALLBACK_PHOTOS[index % FALLBACK_PHOTOS.length];
}

/** Les villes réelles des annonces, en explorateur (liste + grande photo), plus un accès à toutes les annonces. */
export function Cities({ stats }: { stats: HomeStats }) {
  if (stats.cities.length === 0) return null;

  const rows: CityRow[] = stats.cities.map((item, index) => ({
    city: item.city,
    count: countLabel(item.listings_count, "annonce"),
    photo: cityPhoto(item.city, index),
    href: `/louer?city=${encodeURIComponent(item.city)}`,
  }));
  rows.push({
    city: "Tout le Sénégal",
    count: countLabel(stats.listings_count, "annonce"),
    photo: PHOTOS.goreePort,
    href: "/louer",
  });

  return (
    <Section labelledBy="accueil-villes">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          id="accueil-villes"
          index="03"
          eyebrow="Trouvez votre quartier"
          title={
            <>
              Ville par <Highlight>ville</Highlight>
            </>
          }
        />
        <CitiesList rows={rows} />
      </Container>
    </Section>
  );
}
