"use client";

import { IconArrowsMaximize, IconChevronLeft, IconChevronRight, IconPhoto, IconX } from "@tabler/icons-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { A11y, Keyboard, Navigation, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

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
  "absolute top-1/2 z-10 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 shadow-md transition-opacity disabled:cursor-default disabled:opacity-0";

/** Swiper actif (non détruit) ou `null` : forme attendue par l'option `thumbs.swiper`. */
function alive(swiper: SwiperInstance | null): SwiperInstance | null {
  return swiper && !swiper.destroyed ? swiper : null;
}

/**
 * Galerie de la fiche : grande photo en carrousel + vignettes, et visionneuse plein écran
 * (<dialog> modal natif : focus piégé, Échap pour fermer). Navigation clavier par les flèches.
 */
export function ListingGallery({ photos, title }: { photos: GalleryPhoto[]; title: string }) {
  const [active, setActive] = useState(0);
  const [main, setMain] = useState<SwiperInstance | null>(null);
  const [thumbs, setThumbs] = useState<SwiperInstance | null>(null);
  const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

  const [open, setOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Visionneuse ouverte : page figée et flèches du clavier réservées au carrousel plein écran.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    main?.keyboard?.disable();
    return () => {
      root.style.overflow = previousOverflow;
      main?.keyboard?.enable();
    };
  }, [open, main]);

  if (photos.length === 0) {
    return (
      <div className="bg-surface-subtle text-text-muted flex aspect-[16/9] flex-col items-center justify-center gap-3 rounded-xl sm:aspect-[21/9]">
        <IconPhoto size={44} stroke={1.25} aria-hidden="true" />
        <p className="m-0 text-sm">Aucune photo n&apos;est encore disponible pour ce bien.</p>
      </div>
    );
  }

  const several = photos.length > 1;

  function openViewer(index: number) {
    setViewerIndex(index);
    setOpen(true);
    dialogRef.current?.showModal();
  }

  function onViewerClosed() {
    setOpen(false);
    main?.slideTo(viewerIndex, 0);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Swiper
          modules={[Navigation, Thumbs, Keyboard, A11y]}
          onSwiper={setMain}
          onSlideChange={(swiper) => setActive(swiper.activeIndex)}
          navigation={{ prevEl, nextEl, addIcons: false }}
          thumbs={{ swiper: alive(thumbs) }}
          keyboard={{ enabled: true, onlyInViewport: true }}
          a11y={A11Y_MESSAGES}
          spaceBetween={12}
          className="overflow-hidden rounded-xl"
        >
          {photos.map((photo, index) => (
            <SwiperSlide key={photo.url}>
              <button
                type="button"
                onClick={() => openViewer(index)}
                className="bg-surface-subtle relative block aspect-[4/3] w-full cursor-zoom-in border-0 p-0 sm:aspect-[16/9]"
                aria-label={`Agrandir la photo ${index + 1} sur ${photos.length}`}
              >
                <Image
                  src={photo.url}
                  alt={photo.alt}
                  fill
                  preload={index === 0}
                  sizes="(min-width: 1200px) 1168px, 100vw"
                  className="object-cover"
                />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>

        {several && (
          <>
            <button
              ref={setPrevEl}
              type="button"
              aria-label="Photo précédente"
              className={cn(NAV_BUTTON, "bg-surface-raised text-text-strong left-3")}
            >
              <IconChevronLeft size={22} stroke={2} aria-hidden="true" />
            </button>
            <button
              ref={setNextEl}
              type="button"
              aria-label="Photo suivante"
              className={cn(NAV_BUTTON, "bg-surface-raised text-text-strong right-3")}
            >
              <IconChevronRight size={22} stroke={2} aria-hidden="true" />
            </button>
          </>
        )}

        <div className="pointer-events-none absolute right-3 bottom-3 left-3 z-10 flex items-end justify-between gap-2">
          <span className="bg-brand-900/80 ax-num rounded-full px-3 py-1 text-xs font-semibold text-white" aria-hidden="true">
            {active + 1} / {photos.length}
          </span>
          <button
            type="button"
            onClick={() => openViewer(active)}
            className="bg-brand-900/80 hover:bg-brand-900 pointer-events-auto flex cursor-pointer items-center gap-1.5 rounded-full border-0 px-3 py-1.5 text-xs font-semibold text-white"
          >
            <IconArrowsMaximize size={16} stroke={2} aria-hidden="true" />
            Plein écran
          </button>
        </div>
      </div>

      {several && (
        <Swiper
          modules={[Thumbs, A11y]}
          onSwiper={setThumbs}
          watchSlidesProgress
          slidesPerView={3.5}
          spaceBetween={8}
          breakpoints={{ 576: { slidesPerView: 5 }, 992: { slidesPerView: 7 } }}
          a11y={{ ...A11Y_MESSAGES, containerMessage: "Vignettes des photos" }}
          className="w-full"
        >
          {photos.map((photo, index) => (
            <SwiperSlide
              key={photo.url}
              className="opacity-60 transition-opacity [&.swiper-slide-thumb-active]:opacity-100"
            >
              <button
                type="button"
                onClick={() => main?.slideTo(index)}
                aria-label={`Afficher la photo ${index + 1}`}
                aria-current={active === index ? "true" : undefined}
                className={cn(
                  "bg-surface-subtle relative block aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-md border-2 p-0",
                  active === index ? "border-accent" : "border-transparent",
                )}
              >
                <Image src={photo.url} alt="" fill sizes="160px" className="object-cover" />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      <dialog
        ref={dialogRef}
        onClose={onViewerClosed}
        aria-label={`Photos : ${title}`}
        className="bg-brand-900 m-0 h-dvh max-h-none w-screen max-w-none border-0 p-0 text-white backdrop:bg-transparent"
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
    <div className="flex h-full flex-col gap-3 p-3 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="ax-num m-0 text-sm font-semibold text-white/85" aria-live="polite">
          Photo {index + 1} sur {photos.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          autoFocus
          aria-label="Fermer la galerie"
          className="flex size-11 cursor-pointer items-center justify-center rounded-full border-0 bg-white/10 text-white hover:bg-white/20"
        >
          <IconX size={22} stroke={2} aria-hidden="true" />
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
            <button
              ref={setPrevEl}
              type="button"
              aria-label="Photo précédente"
              className={cn(NAV_BUTTON, "text-brand-900 left-1 bg-white sm:left-3")}
            >
              <IconChevronLeft size={22} stroke={2} aria-hidden="true" />
            </button>
            <button
              ref={setNextEl}
              type="button"
              aria-label="Photo suivante"
              className={cn(NAV_BUTTON, "text-brand-900 right-1 bg-white sm:right-3")}
            >
              <IconChevronRight size={22} stroke={2} aria-hidden="true" />
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
              className="cursor-pointer opacity-50 transition-opacity [&.swiper-slide-thumb-active]:opacity-100"
            >
              <span
                className={cn(
                  "relative block aspect-[4/3] overflow-hidden rounded-md border-2",
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
