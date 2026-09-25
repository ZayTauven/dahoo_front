import { IconArrowUpRight } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

import { Container, Section } from "@/components/site/layout";
import { Highlight, Reveal } from "@/components/site/motion";
import { PHOTOS } from "@/components/site/photos";
import { Eyebrow } from "@/components/site/SectionHeading";
import { formatNumber } from "@/lib/format";

import type { HomeStats } from "./data";

const SERVICES = [
  { title: "Louer un logement", text: "Loyer mensuel affiché", href: "/louer", photo: PHOTOS.interieur01 },
  { title: "Acheter un bien", text: "Villas, appartements, terrains", href: "/acheter", photo: PHOTOS.villaContemporaine },
  { title: "Confier sa gestion", text: "Une agence encaisse vos loyers", href: "/agences", photo: PHOTOS.residenceFacadeOcre },
  { title: "Faire estimer un bien", text: "Le prix du marché, par un pro", href: "/agences", photo: PHOTOS.villasBlanches },
];

/**
 * « Pourquoi Dahoo » et les projets possibles, fusionnés en une mosaïque (d'après le « Stats Bento »
 * de 21st) : la photo porte la promesse, les tuiles donnent les preuves (chiffres réels, visite sans
 * compte, prix en FCFA), puis quatre tuiles mènent aux listes.
 */
export function WhyDahoo({ stats }: { stats: HomeStats }) {
  const cities = stats.cities.map((item) => item.city);

  return (
    <Section tone="subtle" labelledBy="accueil-pourquoi">
      <Container>
        <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-12 md:grid-rows-[repeat(2,minmax(15rem,auto))]">
          {/* Promesse */}
          <Reveal as="li" className="relative isolate min-h-[26rem] overflow-hidden rounded-md md:col-span-6 md:row-span-2">
            <Image src={PHOTOS.interieur22.src} alt={PHOTOS.interieur22.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="-z-10 object-cover" />
            <span aria-hidden="true" className="from-brand-900/85 via-brand-900/30 absolute inset-0 -z-10 bg-linear-to-t to-transparent" />
            <div className="flex h-full flex-col justify-end gap-4 p-6 text-white sm:p-8">
              <Eyebrow index="04" className="text-white/75 [&>span:first-child]:text-white">
                Pourquoi Dahoo
              </Eyebrow>
              <h2 id="accueil-pourquoi" className="font-display m-0 text-4xl leading-[1] font-normal tracking-tight text-balance text-white sm:text-5xl">
                Des biens réels, des agences <Highlight>joignables.</Highlight>
              </h2>
            </div>
          </Reveal>

          {/* Chiffres réels */}
          <Reveal as="li" delay={0.06} className="site-dark relative overflow-hidden rounded-md p-6 sm:p-8 md:col-span-6">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(45deg,var(--ax-border)_0px_1px,transparent_1px_10px)] [mask-image:radial-gradient(ellipse_80%_60%_at_100%_0%,#000_60%,transparent_100%)]"
            />
            <div className="relative flex h-full flex-col justify-between gap-6">
              <p className="site-label text-text-muted m-0">Aujourd&apos;hui sur le portail</p>
              <dl className="m-0 grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <dt className="site-label text-text-muted order-2">{stats.listings_count > 1 ? "annonces" : "annonce"}</dt>
                  <dd className="font-display text-text-strong order-1 m-0 text-7xl leading-none tracking-tight">{formatNumber(stats.listings_count)}</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="site-label text-text-muted order-2">{stats.agencies_count > 1 ? "agences partenaires" : "agence partenaire"}</dt>
                  <dd className="font-display text-text-strong order-1 m-0 text-7xl leading-none tracking-tight">{formatNumber(stats.agencies_count)}</dd>
                </div>
              </dl>
              {cities.length > 0 && <p className="text-text-muted m-0 text-sm">{cities.join(" · ")}</p>}
            </div>
          </Reveal>

          {/* Visite sans compte : on montre le geste plutôt que de l'expliquer. */}
          <Reveal as="li" delay={0.12} className="bg-surface-solid flex flex-col justify-between gap-5 rounded-md p-6 sm:p-7 md:col-span-3">
            <p className="site-label text-text-muted m-0">Sans créer de compte</p>
            <div aria-hidden="true" className="flex flex-col gap-2">
              <span className="border-border-strong text-text-subtle border-b pb-1.5 text-sm">Votre nom</span>
              <span className="border-border-strong text-text-subtle border-b pb-1.5 text-sm">77 123 45 67</span>
              <span className="bg-text-strong text-canvas mt-1 self-start rounded-full px-4 py-2 text-xs font-medium">
                Demander une visite
              </span>
            </div>
            <p className="text-text-strong m-0 font-medium">L&apos;agence vous rappelle.</p>
          </Reveal>

          {/* Prix */}
          <Reveal as="li" delay={0.18} className="bg-accent text-on-accent flex flex-col justify-between gap-5 rounded-md p-6 sm:p-7 md:col-span-3">
            <p className="site-label m-0 opacity-80">Prix affichés</p>
            <p className="font-display m-0 text-6xl leading-none tracking-tight">FCFA</p>
            <p className="m-0 font-medium">Loyers et prix de vente, sans surprise.</p>
          </Reveal>

          {/* Projets */}
          {SERVICES.map((service, index) => (
            <Reveal as="li" key={service.title} delay={0.1 + index * 0.06} className="md:col-span-3">
              <Link
                href={service.href}
                className="group bg-surface-solid text-text-strong flex h-full flex-col overflow-hidden rounded-md no-underline"
              >
                <span className="relative block aspect-[16/10] overflow-hidden">
                  <Image
                    src={service.photo.src}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 25vw, 100vw"
                    className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                  />
                </span>
                <span className="flex flex-1 items-end justify-between gap-3 p-5">
                  <span className="flex flex-col gap-1">
                    <span className="font-display text-2xl leading-tight tracking-tight">{service.title}</span>
                    <span className="text-text-muted text-sm">{service.text}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="border-border-strong group-hover:bg-accent group-hover:text-on-accent flex size-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-500 group-hover:border-transparent"
                  >
                    <IconArrowUpRight size={18} stroke={1.75} className="transition-transform duration-500 group-hover:rotate-45" />
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
