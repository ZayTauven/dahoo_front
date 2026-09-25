"use client";

import { IconArrowsMaximize, IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { A11y, Keyboard, Navigation, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { RevealImage } from "@/components/site/motion";
import { cn } from "@/lib/utils";

import "swiper/css";
import "swiper/css/a11y";
import "swiper/css/navigation";
import "swiper/css/thumbs";

export interface GalleryPhoto {
  url: string;
  alt: string;
}

const A11Y_MESSAGES = {
  prevSlideMessage: "Photo précédente",
  nextSlideMessage: "Photo suivante",
  firstSlideMessage: "Première photo",
  lastSlideMessage: "Dernière photo",
  containerRoleDescriptionMessage: "carrousel",
  itemRoleDescriptionMessage: "photo",
  slideLabelMessage: "Photo {{index}} sur {{slidesLength}}",
};

const NAV_BUTTON =
  "bg-surface-solid text-text-strong hover:bg-accent hover:text-on-accent absolute top-1/2 z-10 flex size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 transition-[background-color,color,opacity] duration-300 disabled:cursor-default disabled:opacity-0";

/** Nombre de photos montrées dans la mosaïque ; les suivantes s'ouvrent dans la visionneuse. */
const MOSAIC_SIZE = 3;

/** Swiper actif (non détruit) ou `null` : forme attendue par l'option `thumbs.swiper`. */
function alive(swiper: SwiperInstance | null): SwiperInstance | null {
  return swiper && !swiper.destroyed ? swiper : null;
}

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * Galerie de la fiche, en mosaïque éditoriale : une grande photo, et jusqu'à deux autres en colonne.
 * Chaque photo ouvre la visionneuse plein écran (<dialog> modal natif : focus piégé, Échap pour
 * fermer, flèches du clavier), qui montre toutes les photos.
 */
export function ListingGallery({ photos, title }: { photos: GalleryPhoto[]; title: string }) {
  const [open, setOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Visionneuse ouverte : page figée.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previousOverflow;
    };
  }, [open]);

  if (photos.length === 0) {
    return (
      <div className="border-border-strong text-text-muted flex aspect-[4/3] flex-col items-center justify-center gap-4 rounded-md border bg-[repeating-linear-gradient(135deg,transparent_0_14px,var(--ax-border)_14px_15px)] p-8 text-center sm:aspect-[21/9]">
        <p className="font-display text-text-strong m-0 text-4xl italic sm:text-5xl">Photos à venir</p>
        <p className="site-label m-0">Aucune photo n&apos;est encore disponible pour ce bien.</p>
      </div>
    );
  }

  const shown = photos.slice(0, MOSAIC_SIZE);
  const hidden = photos.length - shown.length;

  function openViewer(index: number) {
    setViewerIndex(index);
    setOpen(true);
    dialogRef.current?.showModal();
  }

  return (
    <div className="relative">
      <ul
        className={cn(
          "m-0 grid list-none gap-3 p-0 sm:gap-4",
          shown.length > 1 && "grid-cols-2 lg:h-[min(44rem,78vh)] lg:grid-cols-12",
          shown.length === 3 && "lg:grid-rows-2",
        )}
      >
        {shown.map((photo, index) => {
          const lead = index === 0;
          const last = index === shown.length - 1;
          return (
            <li
              key={photo.url}
              className={cn(
                "relative min-w-0",
                shown.length === 1 && "aspect-[4/3] sm:aspect-video lg:aspect-[21/9]",
                shown.length > 1 && lead && "col-span-2 aspect-[4/3] lg:col-span-8 lg:aspect-auto",
                shown.length === 3 && lead && "lg:row-span-2",
                shown.length === 2 && !lead && "col-span-2 aspect-[4/3] lg:col-span-4 lg:aspect-auto",
                shown.length === 3 && !lead && "aspect-square lg:col-span-4 lg:aspect-auto",
              )}
            >
              <button
                type="button"
                onClick={() => openViewer(index)}
                aria-label={`Agrandir la photo ${index + 1} sur ${photos.length}`}
                className="group bg-surface-subtle focus-visible:outline-text-strong relative block h-full w-full cursor-zoom-in overflow-hidden rounded-md border-0 p-0 focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                <RevealImage delay={index * 0.12} className="h-full w-full rounded-md">
                  <Image
                    src={photo.url}
                    alt={photo.alt}
                    fill
                    preload={lead}
                    sizes={lead ? "(min-width: 1360px) 840px, (min-width: 992px) 62vw, 100vw" : "(min-width: 992px) 420px, 50vw"}
                    className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                  />
                </RevealImage>
                {last && hidden > 0 && (
                  <span
                    aria-hidden="true"
                    className="bg-text-strong/55 text-canvas absolute inset-0 flex items-center justify-center rounded-md"
                  >
                    <span className="font-display text-5xl leading-none sm:text-6xl">+{hidden}</span>
                  </span>
                )}
              </button>
              {lead && (
                <button
                  type="button"
                  onClick={() => openViewer(0)}
                  className="site-label bg-surface-solid text-text-strong hover:bg-accent hover:text-on-accent absolute bottom-4 left-4 z-10 flex h-10 cursor-pointer items-center gap-2.5 rounded-full border-0 px-4 transition-colors duration-300"
                >
                  <IconArrowsMaximize size={15} stroke={1.75} aria-hidden="true" />
                  {photos.length > 1 ? `Voir les ${pad(photos.length)} photos` : "Plein écran"}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        aria-label={`Photos : ${title}`}
        className="site-dark m-0 h-dvh max-h-none w-screen max-w-none border-0 p-0 backdrop:bg-transparent"
      >
        {open && (
          <FullscreenViewer
            photos={photos}
            initialIndex={viewerIndex}
            onIndexChange={setViewerIndex}
            onClose={() => dialogRef.current?.close()}
          />
        )}
      </dialog>
    </div>
  );
}

/** Contenu de la visionneuse, monté seulement à l'ouverture (Swiper mesure alors un conteneur visible). */
function FullscreenViewer({
  photos,
  initialIndex,
  onIndexChange,
  onClose,
}: {
  photos: GalleryPhoto[];
  initialIndex: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [thumbs, setThumbs] = useState<SwiperInstance | null>(null);
  const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);
  const several = photos.length > 1;

  return (
    <div className="flex h-full flex-col gap-4 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="site-label text-text-muted m-0" aria-live="polite">
          <span className="sr-only">
            Photo {index + 1} sur {photos.length}
          </span>
          <span aria-hidden="true">
            <span className="text-text-strong">{pad(index + 1)}</span> / {pad(photos.length)}
          </span>
        </p>
        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="site-label text-text-strong hover:bg-accent hover:text-on-accent border-border-strong flex h-11 cursor-pointer items-center gap-2 rounded-full border bg-transparent px-4 transition-colors duration-300 hover:border-transparent"
        >
          Fermer
          <IconX size={16} stroke={1.75} aria-hidden="true" />
          <span className="sr-only"> la galerie</span>
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        <Swiper
          modules={[Navigation, Thumbs, Keyboard, A11y]}
          initialSlide={initialIndex}
          onSlideChange={(swiper) => {
            setIndex(swiper.activeIndex);
            onIndexChange(swiper.activeIndex);
          }}
          navigation={{ prevEl, nextEl, addIcons: false }}
          thumbs={{ swiper: alive(thumbs) }}
          keyboard={{ enabled: true }}
          a11y={A11Y_MESSAGES}
          spaceBetween={16}
          className="h-full"
        >
          {photos.map((photo) => (
            <SwiperSlide key={photo.url}>
              <div className="relative h-full w-full">
                <Image src={photo.url} alt={photo.alt} fill sizes="100vw" className="object-contain" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        {several && (
          <>
            <button ref={setPrevEl} type="button" aria-label="Photo précédente" className={cn(NAV_BUTTON, "left-1 sm:left-3")}>
              <IconChevronLeft size={22} stroke={1.75} aria-hidden="true" />
            </button>
            <button ref={setNextEl} type="button" aria-label="Photo suivante" className={cn(NAV_BUTTON, "right-1 sm:right-3")}>
              <IconChevronRight size={22} stroke={1.75} aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {several && (
        <Swiper
          modules={[Thumbs]}
          onSwiper={setThumbs}
          watchSlidesProgress
          slidesPerView={4.5}
          spaceBetween={8}
          breakpoints={{ 576: { slidesPerView: 7 }, 992: { slidesPerView: 10 } }}
          className="w-full max-w-4xl shrink-0"
        >
          {photos.map((photo, thumbIndex) => (
            <SwiperSlide
              key={photo.url}
              className="cursor-pointer opacity-45 transition-opacity [&.swiper-slide-thumb-active]:opacity-100"
            >
              <span
                className={cn(
                  "relative block aspect-[4/3] overflow-hidden rounded-sm border",
                  thumbIndex === index ? "border-accent" : "border-transparent",
                )}
              >
                <Image src={photo.url} alt="" fill sizes="120px" className="object-cover" />
              </span>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}
