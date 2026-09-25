import { IconArrowUpRight } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/site/layout";
import { Highlight, Reveal } from "@/components/site/motion";
import { PHOTOS, type SitePhoto } from "@/components/site/photos";
import { SectionHeading } from "@/components/site/SectionHeading";
import { UNIT_CATEGORY } from "@/lib/labels";
import { cn } from "@/lib/utils";

import type { HomeStats } from "./data";
import { countLabel } from "./text";

/**
 * Mosaïque des types de bien (d'après l'« Interactive Bento Gallery » de 21st) : une tuile photo par
 * type, de tailles variées, avec le nombre d'annonces. Sur ordinateur, la grille remplit 3 rangées
 * sans trou ; sur mobile, 2 colonnes.
 */
const TILES: Record<string, { photo: SitePhoto; span: string }> = {
  APARTMENT: { photo: PHOTOS.interieur13, span: "col-span-2 row-span-2" },
  HOUSE: { photo: PHOTOS.villaPiscineJardin, span: "col-span-2 md:col-span-2" },
  STUDIO: { photo: PHOTOS.interieur06, span: "col-span-1" },
  OFFICE: { photo: PHOTOS.toursDakar, span: "col-span-1" },
  SHOP: { photo: PHOTOS.dakarRueMosquee, span: "col-span-1 md:col-span-2" },
  LAND: { photo: PHOTOS.salyAerienVillas, span: "col-span-1 md:col-span-2" },
};

/** Les terrains se vendent : leur tuile mène à la liste des biens à vendre. */
function categoryHref(category: string): string {
  return category === "LAND" ? `/acheter?category=${category}` : `/louer?category=${category}`;
}

export function Categories({ stats }: { stats: HomeStats }) {
  const counts = new Map<string, number>(stats.by_category.map((item) => [item.category, item.count]));
  const categories = Object.entries(UNIT_CATEGORY).map(([value, entry]) => ({
    value,
    label: entry.label,
    count: counts.get(value) ?? 0,
  }));

  return (
    <section aria-labelledby="accueil-categories" className="pt-14 pb-16 sm:pt-20 sm:pb-20 lg:pt-24">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="accueil-categories"
            index="01"
            eyebrow="Que recherchez-vous ?"
            title={
              <>
                Six façons d&apos;<Highlight>habiter</Highlight>
              </>
            }
          />
          {stats.listings_count > 0 && (
            <p className="site-label text-text-muted m-0">{countLabel(stats.listings_count, "annonce en ligne", "annonces en ligne")}</p>
          )}
        </div>

        <ul className="m-0 grid list-none auto-rows-37.5 grid-cols-2 gap-3 p-0 sm:auto-rows-47.5 md:grid-cols-4 lg:auto-rows-55">
          {categories.map((item, index) => {
            const tile = TILES[item.value];
            return (
              <Reveal as="li" key={item.value} delay={index * 0.06} className={cn("min-h-0", tile?.span)}>
                <Link
                  href={categoryHref(item.value)}
                  className="group relative isolate flex h-full flex-col justify-end overflow-hidden rounded-md p-4 text-white no-underline sm:p-6"
                >
                  {tile && (
                    <Image
                      src={tile.photo.src}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="-z-10 object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
                    />
                  )}
                  <span
                    aria-hidden="true"
                    className="from-brand-900/80 via-brand-900/15 absolute inset-0 -z-10 bg-linear-to-t to-transparent"
                  />
                  <span className="flex items-end justify-between gap-3">
                    <span className="flex flex-col gap-1">
                      <span className="font-display text-3xl leading-none tracking-tight sm:text-4xl">{item.label}</span>
                      <span className="site-label text-white/80">
                        {item.count > 0 ? countLabel(item.count, "annonce") : "Bientôt"}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="group-hover:bg-accent group-hover:text-on-accent flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition-colors duration-500"
                    >
                      <IconArrowUpRight size={18} stroke={1.75} className="transition-transform duration-500 group-hover:rotate-45" />
                    </span>
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
