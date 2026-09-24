import {
  IconBuilding,
  IconBuildingCommunity,
  IconBuildingStore,
  IconDoor,
  IconHome,
  IconTrees,
  type Icon,
} from "@tabler/icons-react";
import Link from "next/link";

import { Container } from "@/components/site/layout";
import { Highlight, Reveal } from "@/components/site/motion";
import { UNIT_CATEGORY } from "@/lib/labels";

import type { HomeStats } from "./data";
import { countLabel } from "./text";

/** Pictogrammes Tabler (ils suivent la couleur du thème, contrairement aux SVG Crafto en gris figé). */
const ICONS: Record<string, Icon> = {
  APARTMENT: IconBuildingCommunity,
  HOUSE: IconHome,
  STUDIO: IconDoor,
  OFFICE: IconBuilding,
  SHOP: IconBuildingStore,
  LAND: IconTrees,
};

/** Les terrains se vendent : leur carte mène à la liste des biens à vendre. */
function categoryHref(category: string): string {
  return category === "LAND" ? `/acheter?category=${category}` : `/louer?category=${category}`;
}

/**
 * Bandeau « Que recherchez-vous ? » (Crafto) : une cellule par type de bien avec son nombre d'annonces.
 * Sans statistiques (API vide ou indisponible), on affiche tous les types, sans compteur.
 */
export function Categories({ stats }: { stats: HomeStats }) {
  const counts = new Map<string, number>(stats.by_category.map((item) => [item.category, item.count]));
  const categories = Object.entries(UNIT_CATEGORY)
    .map(([value, entry]) => ({ value, label: entry.label, count: counts.get(value) ?? 0 }))
    .filter((item) => counts.size === 0 || item.count > 0);

  return (
    <section aria-labelledby="accueil-categories" className="border-border-default bg-canvas border-y">
      <Container className="px-0 sm:px-0">
        <ul className="bg-border-default m-0 grid list-none grid-cols-2 gap-px p-0 sm:grid-cols-3 lg:flex">
          <li className="bg-canvas col-span-2 flex items-center justify-center px-6 py-8 text-center sm:col-span-3 lg:flex-[1.4] lg:justify-start lg:px-4 lg:text-left">
            <h2 id="accueil-categories" className="font-display text-text-strong m-0 text-2xl leading-tight font-semibold">
              Que <Highlight>recherchez</Highlight>-vous ?
            </h2>
          </li>
          {categories.map((item, index) => {
            const Icon = ICONS[item.value] ?? IconHome;
            return (
              <Reveal
                as="li"
                key={item.value}
                delay={index * 0.06}
                className="bg-canvas lg:flex-1"
              >
                <Link
                  href={categoryHref(item.value)}
                  className="group text-text-strong hover:bg-surface-subtle relative flex h-full flex-col items-center gap-3 px-3 pt-11 pb-7 text-center no-underline transition-colors"
                >
                  {item.count > 0 && (
                    <span className="bg-accent-wash text-accent-text absolute top-3 left-3 rounded px-2 py-0.5 text-[0.7rem] font-bold">
                      {countLabel(item.count, "annonce")}
                    </span>
                  )}
                  <Icon
                    size={44}
                    stroke={1.25}
                    aria-hidden="true"
                    className="text-text-strong group-hover:text-accent-text transition-transform duration-300 group-hover:-translate-y-1"
                  />
                  <span className="text-[0.8rem] font-bold tracking-wide uppercase">{item.label}</span>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
