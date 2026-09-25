"use client";

import { IconArrowLeft, IconArrowRight, IconArrowsMaximize, IconX } from "@tabler/icons-react";
import { useLenis } from "lenis/react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";

import { Reveal } from "@/components/site/motion";
import { PHOTOS, type SitePhoto } from "@/components/site/photos";
import { cn } from "@/lib/utils";

interface GalleryItem {
  photo: SitePhoto;
  title: string;
  desc: string;
}

/** Photos réelles fournies par Dahoo ; légendes tirées de leur description. */
const ITEMS: GalleryItem[] = [
  { photo: PHOTOS.cornicheResidences, title: "La corniche", desc: "Résidences face à la mer" },
  { photo: PHOTOS.goreePort, title: "Gorée", desc: "Le port et ses maisons colorées" },
  { photo: PHOTOS.dakarVueAerienne, title: "Dakar", desc: "Un quartier vu du ciel" },
  { photo: PHOTOS.saintLouisPirogues, title: "Saint-Louis", desc: "Pirogues sur le fleuve" },
  { photo: PHOTOS.interieur07, title: "Intérieurs", desc: "Séjour aux boiseries claires, ouvert sur la ville" },
  { photo: PHOTOS.salyAerienVillas, title: "Saly", desc: "Villas entre les palmiers" },
  { photo: PHOTOS.interieur22, title: "Intérieurs", desc: "Salle à manger ouverte sur le jardin" },
];

/*
 * Mosaïque sans trou (celle du composant d'origine) : sur 4 colonnes et 6 rangées, les tuiles hautes
 * (1 × 3) et larges (2 × 2) s'emboîtent ; sur mobile, 2 colonnes et 5 rangées.
 */
const SPANS = [
  "row-span-2 md:col-span-1 md:row-span-3",
  "md:col-span-2 md:row-span-2",
  "md:col-span-1 md:row-span-3",
  "col-span-2 md:row-span-2",
  "row-span-2 md:col-span-1 md:row-span-3",
  "md:col-span-2 md:row-span-2",
  "md:col-span-1 md:row-span-3",
];

const pad = (value: number) => String(value).padStart(2, "0");

const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

/** Agrandissement d'une photo : fenêtre modale accessible (focus piégé, Échap, flèches, bouton fermer). */
function Lightbox({
  index,
  onClose,
  onSelect,
}: {
  index: number;
  onClose: () => void;
  onSelect: (index: number) => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const item = ITEMS[index];
  const count = ITEMS.length;

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      onSelect((index + 1) % count);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      onSelect((index - 1 + count) % count);
    } else if (event.key === "Tab") {
      const focusables = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  const navButton =
    "flex size-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors duration-300 hover:bg-accent hover:text-on-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ax-accent)";

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="galerie-legende"
      data-lenis-prevent
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="bg-brand-900/94 fixed inset-0 z-[80] flex outline-none flex-col gap-4 p-4 text-white backdrop-blur-md sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="site-label m-0 text-white/70">
          {pad(index + 1)} / {pad(count)}
        </p>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Fermer l'agrandissement" className={navButton}>
          <IconX size={20} stroke={1.75} aria-hidden="true" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center gap-3 sm:gap-6">
        <button type="button" onClick={() => onSelect((index - 1 + count) % count)} aria-label="Photo précédente" className={cn(navButton, "hidden sm:flex")}>
          <IconArrowLeft size={20} stroke={1.75} aria-hidden="true" />
        </button>

        <AnimatePresence mode="wait" initial={false}>
          <motion.figure
            key={index}
            className="m-0 flex h-full min-w-0 flex-1 flex-col gap-3"
            initial={{ y: 20, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1, transition: { type: "spring", stiffness: 500, damping: 30, mass: 0.5 } }}
            exit={{ y: 20, scale: 0.97, opacity: 0, transition: { duration: 0.15 } }}
          >
            <div className="relative min-h-0 flex-1">
              <Image src={item.photo.src} alt={item.photo.alt} fill sizes="100vw" className="object-contain" />
            </div>
            <figcaption id="galerie-legende" className="flex flex-col items-center gap-1 text-center">
              <span className="font-display text-3xl leading-none">{item.title}</span>
              <span className="text-sm text-white/75">{item.desc}</span>
            </figcaption>
          </motion.figure>
        </AnimatePresence>

        <button type="button" onClick={() => onSelect((index + 1) % count)} aria-label="Photo suivante" className={cn(navButton, "hidden sm:flex")}>
          <IconArrowRight size={20} stroke={1.75} aria-hidden="true" />
        </button>
      </div>

      {/* Dock de vignettes (comme l'original) : la photo affichée se redresse et se soulève. */}
      <ul className="m-0 flex list-none items-center justify-center gap-0 p-0 pb-1">
        {ITEMS.map((thumb, position) => {
          const selected = position === index;
          return (
            <motion.li
              key={`${thumb.photo.src}-${position}`}
              className="-mx-1"
              style={{ zIndex: selected ? 30 : count - position }}
              initial={false}
              animate={{ rotate: selected ? 0 : position % 2 === 0 ? -12 : 12, y: selected ? -8 : 0, scale: selected ? 1.15 : 1 }}
              whileHover={{ rotate: 0, y: -10, scale: 1.2 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <button
                type="button"
                onClick={() => onSelect(position)}
                aria-label={`Voir : ${thumb.title}, ${thumb.desc}`}
                aria-current={selected ? "true" : undefined}
                className={cn(
                  "relative block size-10 overflow-hidden rounded-md border-2 sm:size-12",
                  selected ? "border-accent" : "border-white/30",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ax-accent)",
                )}
              >
                <Image src={thumb.photo.src} alt="" fill sizes="48px" className="object-cover" />
              </button>
            </motion.li>
          );
        })}
      </ul>
    </motion.div>
  );
}

/**
 * Galerie du Sénégal (d'après l'« Interactive Bento Gallery » de 21st) : une mosaïque de photos réelles ;
 * un clic (ou Entrée) agrandit la photo dans une fenêtre où l'on passe de l'une à l'autre.
 * Le titre de chaque photo est toujours visible, sa description apparaît au survol et au focus.
 */
export function SenegalGallery() {
  const [open, setOpen] = useState<number | null>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const lastOpened = useRef(0);
  const lenis = useLenis();

  // Page figée derrière la fenêtre (défilement fluide compris).
  useEffect(() => {
    if (open === null) return;
    lenis?.stop();
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
      lenis?.start();
    };
  }, [open, lenis]);

  const close = useCallback(() => {
    setOpen(null);
    // Le focus revient sur la photo qui a ouvert la fenêtre.
    requestAnimationFrame(() => triggers.current[lastOpened.current]?.focus());
  }, []);

  return (
    <>
      <ul className="m-0 grid list-none auto-rows-[7rem] grid-flow-dense grid-cols-2 gap-2 p-0 sm:auto-rows-[9rem] md:auto-rows-[5rem] md:grid-cols-4 md:gap-3 lg:auto-rows-[6rem]">
        {ITEMS.map((item, index) => (
          <Reveal as="li" key={`${item.photo.src}-${index}`} delay={index * 0.05} className={cn("min-h-0", SPANS[index])}>
            <button
              ref={(element) => {
                triggers.current[index] = element;
              }}
              type="button"
              aria-haspopup="dialog"
              aria-label={`Agrandir la photo : ${item.title}, ${item.desc}`}
              onClick={() => {
                lastOpened.current = index;
                setOpen(index);
              }}
              className="group bg-surface-subtle relative block h-full w-full cursor-zoom-in overflow-hidden rounded-md text-left text-white"
            >
              <Image
                src={item.photo.src}
                alt=""
                fill
                sizes={SPANS[index].includes("md:col-span-2") ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
                className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
              />
              <span aria-hidden="true" className="from-brand-900/75 absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t to-transparent" />
              <span aria-hidden="true" className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-3 sm:p-4">
                <span className="font-display text-xl leading-none tracking-tight sm:text-2xl">{item.title}</span>
                <span className="hidden max-h-0 overflow-hidden text-sm text-white/80 opacity-0 transition-all duration-500 group-hover:max-h-12 group-hover:opacity-100 group-focus-visible:max-h-12 group-focus-visible:opacity-100 sm:block">
                  {item.desc}
                </span>
              </span>
              <span
                aria-hidden="true"
                className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-white/15 opacity-0 backdrop-blur-sm transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                <IconArrowsMaximize size={16} stroke={1.75} />
              </span>
            </button>
          </Reveal>
        ))}
      </ul>

      <AnimatePresence>{open !== null && <Lightbox key="galerie" index={open} onClose={close} onSelect={setOpen} />}</AnimatePresence>
    </>
  );
}
