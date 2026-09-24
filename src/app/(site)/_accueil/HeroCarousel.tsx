"use client";

import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import { useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useState, type FocusEvent, type ReactNode } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { Autoplay, EffectFade } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/effect-fade";

import { Container } from "@/components/site/layout";
import { cn } from "@/lib/utils";

/** Photos d'ambiance du hero : décoratives (le message est porté par le titre et la recherche). */
const SLIDES = ["/images/site/slider-01.webp", "/images/site/slider-02.webp", "/images/site/slider-03.webp"];

/**
 * Hero plein écran de l'accueil : diaporama en fondu (équivalent du slider Crafto) sous un voile
 * indigo qui garantit le contraste du texte. Le diaporama s'arrête au survol, au focus clavier,
 * si l'utilisateur a demandé moins d'animations, ou via le bouton pause (WCAG 2.2.2).
 */
export function HeroCarousel({ children, labelledBy }: { children: ReactNode; labelledBy: string }) {
  const reduceMotion = useReducedMotion();
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  const [active, setActive] = useState(0);
  const [choice, setChoice] = useState<"play" | "pause" | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const playing = choice ? choice === "play" : !reduceMotion;
  // Un « Relancer » explicite l'emporte sur la pause au survol / au focus (sinon le clic, qui donne
  // le focus au bouton, n'aurait aucun effet visible).
  const running = choice === "play" || (playing && !hovered && !focused);

  useEffect(() => {
    const autoplay = swiper?.autoplay;
    if (!autoplay || swiper.destroyed) return;
    if (running) autoplay.start();
    else autoplay.stop();
  }, [swiper, running]);

  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
  };

  return (
    <section
      aria-labelledby={labelledBy}
      className="bg-brand-900 relative isolate flex min-h-[calc(100svh-72px)] flex-col overflow-hidden text-white"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={onBlur}
    >
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={1200}
          rewind
          allowTouchMove={false}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          onSwiper={setSwiper}
          onSlideChange={(instance) => setActive(instance.realIndex)}
          className="h-full w-full"
        >
          {SLIDES.map((src, index) => (
            <SwiperSlide key={src}>
              <Image
                src={src}
                alt=""
                fill
                sizes="100vw"
                preload={index === 0}
                className="scale-105 object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Voile sombre : texte blanc lisible (AA) quelle que soit la photo. */}
      <div
        aria-hidden="true"
        className="from-brand-900/95 via-brand-900/70 to-brand-900/45 lg:from-brand-900/90 lg:via-brand-900/60 lg:to-brand-900/20 absolute inset-0 z-0 bg-linear-to-t lg:bg-linear-to-r"
      />

      <div className="relative z-10 flex flex-1 flex-col">{children}</div>

      <div className="pointer-events-none absolute inset-x-0 top-4 z-20 lg:top-8">
        <Container className="flex justify-end">
          <div className="pointer-events-auto flex items-center gap-3 bg-brand-900/50 rounded-full py-1 pr-1 pl-3 backdrop-blur-sm">
            <div className="flex items-center gap-1" role="group" aria-label="Choisir la photo affichée">
              {SLIDES.map((src, index) => {
                const current = index === active;
                return (
                  <button
                    key={src}
                    type="button"
                    onClick={() => swiper?.slideTo(index)}
                    aria-label={`Afficher la photo ${index + 1} sur ${SLIDES.length}`}
                    aria-current={current ? "true" : undefined}
                    className={cn(
                      "flex min-h-8 items-center gap-2 rounded-full px-1.5 font-mono text-xs transition-colors",
                      current ? "text-white" : "text-white/65 hover:text-white",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                    <span
                      aria-hidden="true"
                      className={cn("h-px bg-white transition-all duration-500", current ? "w-8" : "w-0")}
                    />
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setChoice(playing ? "pause" : "play")}
              aria-label={playing ? "Mettre le diaporama en pause" : "Relancer le diaporama"}
              className="flex size-8 items-center justify-center rounded-full border border-white/40 text-white transition-colors hover:bg-white/15"
            >
              {playing ? (
                <IconPlayerPause size={16} stroke={2} aria-hidden="true" />
              ) : (
                <IconPlayerPlay size={16} stroke={2} aria-hidden="true" />
              )}
            </button>
          </div>
        </Container>
      </div>
    </section>
  );
}
