"use client";

import { IconArrowUpRight } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { EASE_OUT } from "@/components/site/motion";
import type { SitePhoto } from "@/components/site/photos";
import { cn } from "@/lib/utils";

export interface CityRow {
  city: string;
  count: string;
  photo: SitePhoto;
  href: string;
}

/**
 * Explorateur de villes (d'après l'« Interactive Globe Explorer » de 21st) : la liste à gauche,
 * une grande photo réelle de la ville à droite, qui change au survol ou au focus clavier.
 * Sur mobile, la photo de la ville active s'affiche au-dessus de la liste.
 */
export function CitiesList({ rows }: { rows: CityRow[] }) {
  const [active, setActive] = useState(0);
  const current = rows[active] ?? rows[0];

  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
      <div className="relative aspect-4/3 overflow-hidden rounded-md lg:order-2 lg:col-span-7 lg:aspect-auto lg:min-h-136">
        <AnimatePresence initial={false}>
          <motion.div
            key={current.href}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: EASE_OUT }}
          >
            <Image src={current.photo.src} alt={current.photo.alt} fill sizes="(min-width: 992px) 60vw, 100vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>
        <div
          aria-hidden="true"
          className="from-brand-900/75 pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t to-transparent"
        />
        <p aria-hidden="true" className="absolute bottom-5 left-5 m-0 flex flex-col gap-1 text-white sm:bottom-7 sm:left-7">
          <span className="font-display text-5xl leading-none tracking-tight sm:text-6xl">{current.city}</span>
          <span className="site-label text-white/80">{current.count}</span>
        </p>
      </div>

      <ul className="m-0 flex list-none flex-col justify-center p-0 lg:order-1 lg:col-span-5">
        {rows.map((row, index) => {
          const selected = index === active;
          return (
            <li key={row.href} className="border-border-default border-t last:border-b">
              <Link
                href={row.href}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                aria-current={selected ? "true" : undefined}
                className="group text-text-strong flex items-center gap-5 py-5 no-underline sm:py-6"
              >
                <span className="site-label text-text-muted w-7 shrink-0">{String(index + 1).padStart(2, "0")}</span>
                <span
                  className={cn(
                    "font-display flex-1 text-4xl leading-none tracking-tight transition-all duration-500 sm:text-5xl",
                    selected ? "translate-x-2 italic" : "text-text-strong/45",
                  )}
                >
                  {row.city}
                </span>
                <span className="site-label text-text-muted hidden sm:block">{row.count}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors duration-500",
                    selected ? "bg-accent text-on-accent border-transparent" : "border-border-strong",
                  )}
                >
                  <IconArrowUpRight size={18} stroke={1.75} />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
