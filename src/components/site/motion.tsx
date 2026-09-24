"use client";

import { MotionConfig, motion } from "motion/react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Respecte « réduire les animations » du système pour tout le site public. */
export function SiteMotion({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/**
 * Apparition au défilement (remplace les attributs `data-anime` de Crafto) :
 * fondu + légère montée, une seule fois, avec un délai optionnel pour les listes.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "article";
}) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.165, 0.84, 0.44, 1] }}
    >
      {children}
    </Component>
  );
}

/**
 * Mot mis en valeur dans un titre, souligné d'une barre d'accent qui se dessine à l'apparition
 * (équivalent de `.text-highlight` + `.separator-animation` de Crafto).
 */
export function Highlight({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("relative z-0 inline-block font-bold", className)}>
      {children}
      <motion.span
        aria-hidden="true"
        className="bg-accent/70 absolute bottom-[0.08em] -left-[3px] -z-10 h-[0.18em] rounded-full"
        initial={{ width: 0 }}
        whileInView={{ width: "calc(100% + 6px)" }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 1, delay: 0.2, ease: [0.165, 0.84, 0.44, 1] }}
      />
    </span>
  );
}
