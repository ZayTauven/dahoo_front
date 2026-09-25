"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useId, useRef, useState, type KeyboardEvent } from "react";

import { Container, Section } from "@/components/site/layout";
import { EASE_OUT, Highlight } from "@/components/site/motion";
import { PHOTOS, type SitePhoto } from "@/components/site/photos";
import { SectionHeading } from "@/components/site/SectionHeading";
import { cn } from "@/lib/utils";

import { SCREENS } from "./offer";
import { PaymentPills, Screen } from "./Screen";

interface Stop {
  id: string;
  label: string;
  title: string;
  text: string;
  screen: string;
  path: string;
  alt: string;
  /** Vraie photo posée derrière la capture, en rapport avec le module. */
  photo: SitePhoto;
  payments?: boolean;
  portal?: boolean;
}

const STOPS: Stop[] = [
  {
    id: "biens",
    label: "Biens",
    title: "Vos biens et leurs lots",
    text: "Villas, immeubles, bureaux : chaque lot avec son statut, libre ou loué, et son taux d'occupation.",
    screen: SCREENS.biens,
    path: "espace/biens",
    alt: "Espace agence Dahoo : la liste des biens, avec leurs bâtiments, leurs lots et leur taux d'occupation",
    photo: PHOTOS.residenceBriques,
  },
  {
    id: "baux",
    label: "Locataires et baux",
    title: "Un locataire, un bail, un lot",
    text: "Loyer, charges, période et fréquence : le bail activé passe le lot en « loué ».",
    screen: SCREENS.baux,
    path: "espace/baux",
    alt: "Espace agence Dahoo : la liste des baux actifs, avec le locataire, le lot, le loyer et les charges",
    photo: PHOTOS.interieur01,
  },
  {
    id: "echeances",
    label: "Échéances",
    title: "Les loyers attendus, mois par mois",
    text: "À encaisser, en retard, encaissé : les impayés ressortent d'un coup d'œil.",
    screen: SCREENS.echeances,
    path: "espace/echeances",
    alt: "Espace agence Dahoo : les échéances du mois, à encaisser, en retard et encaissées",
    photo: PHOTOS.dakarAerienCites,
  },
  {
    id: "paiements",
    label: "Paiements",
    title: "Chaque paiement, à la bonne échéance",
    text: "Wave, Orange Money, virement ou espèces, avec sa référence et le nom de qui l'a saisi.",
    screen: SCREENS.paiements,
    path: "espace/paiements",
    alt: "Espace agence Dahoo : les paiements reçus par Wave et Orange Money, avec leur référence",
    photo: PHOTOS.dakarCathedraleCarRapide,
    payments: true,
  },
  {
    id: "maintenance",
    label: "Maintenance",
    title: "Plus aucune panne oubliée",
    text: "Un ticket par incident : priorité, responsable, statut et journal des interventions.",
    screen: SCREENS.maintenance,
    path: "espace/maintenance",
    alt: "Espace agence Dahoo : un ticket de maintenance pour une fuite, en cours, priorité haute",
    photo: PHOTOS.interieur14,
  },
  {
    id: "annonces",
    label: "Annonces",
    title: "Vos annonces sur le portail Dahoo",
    text: "Publiées depuis votre espace, avec photos ; les demandes de visite arrivent chez vous.",
    screen: SCREENS.annonces,
    path: "espace/annonces",
    alt: "Espace agence Dahoo : les annonces publiées sur le portail, avec leurs photos et leur prix",
    photo: PHOTOS.villaPiscineJardin,
    portal: true,
  },
];

const pad = (index: number) => String(index + 1).padStart(2, "0");

/** Scène d'un module : la photo au fond, la capture réelle par-dessus, qui change avec le module. */
function Stage({ index, portalFigures, className }: { index: number; portalFigures?: string; className?: string }) {
  const stop = STOPS[index];
  return (
    <div className={cn("relative isolate overflow-hidden rounded-lg", className)}>
      <AnimatePresence initial={false}>
        <motion.div
          key={stop.id}
          className="absolute inset-0 -z-10"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: EASE_OUT }}
        >
          <Image src={stop.photo.src} alt="" fill sizes="(min-width: 992px) 55vw, 100vw" className="object-cover" />
        </motion.div>
      </AnimatePresence>
      <span aria-hidden="true" className="bg-brand-900/35 absolute inset-0 -z-10" />

      <p aria-hidden="true" className="site-label absolute top-4 left-4 m-0 text-white sm:top-5 sm:left-6">
        {pad(index)} / {pad(STOPS.length - 1)} — {stop.label}
      </p>

      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={stop.id}
          className="absolute inset-x-[6%] top-[17%] sm:inset-x-[8%]"
          initial={{ opacity: 0, y: 48, rotate: 1.5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
        >
          <Screen
            src={stop.screen}
            path={stop.path}
            alt={stop.alt}
            crop="content"
            sizes="(min-width: 992px) 50vw, 90vw"
            className="shadow-brand-900/50"
          />
        </motion.div>
      </AnimatePresence>

      {stop.payments && <PaymentPills className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6" />}
      {stop.portal && portalFigures && (
        <p className="site-label text-brand-900 absolute bottom-4 left-4 m-0 rounded-full bg-white px-4 py-2 sm:bottom-6 sm:left-6">
          {portalFigures}
        </p>
      )}
    </div>
  );
}

/** Ordinateur (d'après le « Sticky Scroll Reveal » de 21st) : les modules défilent, la scène reste. */
function ScrollTour({ portalFigures }: { portalFigures?: string }) {
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start center", "end center"] });
  const rail = useTransform(scrollYProgress, (v) => Math.min(1, Math.max(0, v)));

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(STOPS.length - 1, Math.max(0, Math.floor(v * STOPS.length)));
    setActive((current) => (current === next ? current : next));
  });

  return (
    <div className="mt-14 hidden grid-cols-12 gap-8 lg:grid">
      <ol ref={listRef} className="relative col-span-5 m-0 list-none p-0">
        <span aria-hidden="true" className="bg-border-default absolute inset-y-0 left-0 w-px" />
        <motion.span aria-hidden="true" className="bg-accent absolute inset-y-0 left-0 w-px origin-top" style={{ scaleY: rail }} />
        {STOPS.map((stop, index) => (
          <li key={stop.id} className="flex min-h-60 flex-col justify-center py-8 pl-10">
            <motion.div
              className="flex flex-col gap-3"
              initial={false}
              animate={{ opacity: active === index ? 1 : 0.6 }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
            >
              <span className={cn("site-label transition-colors duration-500", active === index ? "text-accent-text" : "text-text-muted")}>
                {pad(index)} — {stop.label}
              </span>
              <h3 className="font-display m-0 text-4xl leading-[1.02] font-normal tracking-tight xl:text-[2.75rem]">{stop.title}</h3>
              <p className="text-text-muted m-0 max-w-sm leading-relaxed">{stop.text}</p>
            </motion.div>
          </li>
        ))}
      </ol>
      <div className="col-span-7">
        <div className="sticky top-[calc(50vh-17.5rem)]">
          <Stage index={active} portalFigures={portalFigures} className="aspect-5/4 max-h-[35rem] w-full" />
        </div>
      </div>
    </div>
  );
}

/** Téléphone et tablette (d'après le « Feature Tab Switcher » de 21st) : un onglet par module. */
function TabsTour({ portalFigures }: { portalFigures?: string }) {
  const id = useId();
  const [active, setActive] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const stop = STOPS[active];

  const select = (index: number, focus = false) => {
    setActive(index);
    const tab = tabsRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[index];
    if (!tab || !tabsRef.current) return;
    if (focus) tab.focus();
    tabsRef.current.scrollTo({ left: tab.offsetLeft - 20, behavior: "smooth" });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = STOPS.length - 1;
    const moves: Record<string, number> = {
      ArrowRight: active === last ? 0 : active + 1,
      ArrowLeft: active === 0 ? last : active - 1,
      Home: 0,
      End: last,
    };
    if (event.key in moves) {
      event.preventDefault();
      select(moves[event.key], true);
    }
  };

  return (
    <div className="mt-10 flex flex-col gap-6 lg:hidden">
      <div
        ref={tabsRef}
        role="tablist"
        aria-label="Modules du logiciel"
        onKeyDown={onKeyDown}
        className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:-mx-8 sm:px-8"
      >
        {STOPS.map((item, index) => {
          const selected = index === active;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`${id}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(index)}
              className={cn(
                "focus-visible:outline-accent shrink-0 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2",
                selected ? "bg-accent text-on-accent border-transparent" : "border-border-strong text-text-strong",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${stop.id}`} className="flex flex-col gap-5">
        <Stage index={active} portalFigures={portalFigures} className="aspect-[4/3.4] w-full sm:aspect-16/11" />
        <div className="flex flex-col gap-2">
          <h3 className="font-display m-0 text-3xl leading-[1.05] font-normal tracking-tight">{stop.title}</h3>
          <p className="text-text-muted m-0 leading-relaxed">{stop.text}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * La visite du logiciel, section centrale de la page : six modules, chacun montré par sa vraie
 * capture. Seule section sombre de la page.
 */
export function Tour({ portalFigures }: { portalFigures?: string }) {
  return (
    <Section tone="brand" id="modules" labelledBy="visite-titre" className="scroll-mt-16">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="visite-titre"
            index="02"
            eyebrow="La visite du logiciel"
            title={
              <>
                Six modules, <Highlight>un seul espace</Highlight>
              </>
            }
          />
          <p className="site-label text-text-muted m-0 lg:pb-3">Inclus dans toutes les offres</p>
        </div>
        <ScrollTour portalFigures={portalFigures} />
        <TabsTour portalFigures={portalFigures} />
      </Container>
    </Section>
  );
}
