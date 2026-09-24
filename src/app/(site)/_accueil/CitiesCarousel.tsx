"use client";

import { IconArrowLeft, IconArrowRight, IconArrowUpRight } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";

export interface CityCard {
  city: string;
  count: string;
  image: string;
  href: string;
}

const navButton =
  "bg-surface-solid text-text-strong border-border-default flex size-12 items-center justify-center rounded-full border shadow-[0_12px_30px_-18px_rgba(20,27,71,0.5)] transition-colors hover:bg-accent hover:text-on-accent disabled:pointer-events-none disabled:opacity-40";

/**
 * Carrousel des villes (reprend « We are available in many countries » de Crafto) :
 * titre et flèches à gauche, cartes-photos à droite, dernière carte vers toutes les annonces.
 */
export function CitiesCarousel({
  heading,
  cities,
  total,
}: {
  heading: ReactNode;
  cities: CityCard[];
  total: string;
}) {
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const sync = (instance: SwiperInstance) => setEdges({ start: instance.isBeginning, end: instance.isEnd });

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[5fr_7fr] lg:gap-12">
      <div className="flex flex-col gap-8">
        {heading}
        <div className="flex gap-3">
          <button
            type="button"
            className={navButton}
            onClick={() => swiper?.slidePrev()}
            disabled={edges.start}
            aria-label="Villes précédentes"
            aria-controls="carrousel-villes"
          >
            <IconArrowLeft size={20} stroke={1.75} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={navButton}
            onClick={() => swiper?.slideNext()}
            disabled={edges.end}
            aria-label="Villes suivantes"
            aria-controls="carrousel-villes"
          >
            <IconArrowRight size={20} stroke={1.75} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="min-w-0">
        <Swiper
          id="carrousel-villes"
          modules={[A11y]}
          a11y={{
            containerMessage: "Villes où des biens sont publiés",
            containerRoleDescriptionMessage: "carrousel",
            itemRoleDescriptionMessage: "ville",
            slideLabelMessage: "{{index}} sur {{slidesLength}}",
          }}
          slidesPerView={1.15}
          spaceBetween={16}
          breakpoints={{
            576: { slidesPerView: 2, spaceBetween: 24 },
            1200: { slidesPerView: 2.35, spaceBetween: 30 },
          }}
          watchOverflow
          onSwiper={(instance) => {
            setSwiper(instance);
            sync(instance);
          }}
          onSlideChange={sync}
          onResize={sync}
          onBreakpoint={sync}
        >
          {cities.map((item, index) => (
            <SwiperSlide key={item.city}>
              <Link
                href={item.href}
                className="group relative block aspect-[370/480] overflow-hidden rounded-xl text-white no-underline"
              >
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="(min-width: 1200px) 290px, (min-width: 576px) 45vw, 85vw"
                  loading={index < 2 ? "eager" : "lazy"}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span
                  aria-hidden="true"
                  className="from-brand-900/95 via-brand-900/35 absolute inset-0 bg-linear-to-t to-transparent"
                />
                <span className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-1 p-6 sm:p-8">
                  <span className="font-display text-2xl font-semibold">{item.city}</span>
                  <span className="text-sm text-white/85">{item.count}</span>
                  <span className="bg-accent text-on-accent mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-transform group-hover:translate-x-1">
                    Voir les biens <IconArrowRight size={16} stroke={2} aria-hidden="true" />
                  </span>
                </span>
              </Link>
            </SwiperSlide>
          ))}

          <SwiperSlide>
            <Link
              href="/louer"
              className="group bg-brand-900 relative flex aspect-[370/480] flex-col justify-between overflow-hidden rounded-xl p-6 text-white no-underline sm:p-8"
            >
              <span className="bg-accent text-on-accent flex size-12 items-center justify-center rounded-full">
                <IconArrowUpRight size={22} stroke={2} aria-hidden="true" />
              </span>
              <span className="flex flex-col gap-2">
                <span className="font-display text-2xl font-semibold">Toutes les villes</span>
                <span className="text-sm text-white/80">{total}</span>
                <span className="text-accent-300 mt-3 text-sm font-semibold group-hover:underline">
                  Parcourir les annonces
                </span>
              </span>
            </Link>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
}
