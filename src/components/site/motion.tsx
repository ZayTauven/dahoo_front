"use client";

import { ReactLenis } from "lenis/react";
import { MotionConfig, motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, type ReactNode } from "react";

import "lenis/dist/lenis.css";

import { cn } from "@/lib/utils";

/** Courbe de sortie « expo » commune à toutes les animations du site. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/*
 * Animations liées au défilement : toujours des transformations en fonction (`useTransform(v, fn)`).
 * Avec des plages, Motion délègue l'opacité au moteur natif des animations de défilement, qui calcule
 * une progression fausse avec des décalages de cible (constaté dans Chrome sur le hero).
 */
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Enveloppe du site public : respecte « réduire les animations » du système et, sinon,
 * active le défilement fluide (Lenis) qui donne son inertie à la page et aux parallaxes.
 */
export function SiteMotion({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  return (
    <MotionConfig reducedMotion="user">
      {!reduceMotion && <ReactLenis root options={{ lerp: 0.09, anchors: true }} />}
      {children}
    </MotionConfig>
  );
}

/**
 * Apparition au défilement : fondu + montée, une seule fois, avec un délai optionnel pour les listes.
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
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 1.1, delay, ease: EASE_OUT }}
    >
      {children}
    </Component>
  );
}

/**
 * Titre révélé ligne par ligne : chaque ligne monte depuis un masque (effet « rideau » des sites
 * éditoriaux). Le texte reste du vrai texte, lu normalement par les lecteurs d'écran.
 * `play="mount"` joue l'animation au chargement (hero), sinon à l'entrée dans l'écran.
 */
export function RevealLines({
  lines,
  className,
  lineClassName,
  delay = 0,
  stagger = 0.09,
  play = "view",
}: {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  play?: "view" | "mount";
}) {
  // Le déclencheur est sur le conteneur non découpé : les lignes, masquées par leur parent
  // overflow-hidden, ne sont jamais « visibles » pour l'IntersectionObserver.
  const trigger = play === "mount" ? { animate: "shown" } : { whileInView: "shown", viewport: { once: true, amount: 0.5 } };
  return (
    <motion.span className={cn("block", className)} initial="hidden" {...trigger}>
      {lines.map((line, index) => (
        // Marge basse négative compensée : le masque ne coupe pas les jambages (g, p, italiques).
        <span key={index} className={cn("-mb-[0.12em] block overflow-hidden pb-[0.12em]", lineClassName)}>
          <motion.span
            className="block will-change-transform"
            variants={{ hidden: { y: "110%" }, shown: { y: "0%" } }}
            transition={{ duration: 1.2, delay: delay + index * stagger, ease: EASE_OUT }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/**
 * Image révélée par un volet qui s'ouvre de bas en haut, pendant que la photo se « pose » (léger dézoom).
 * `children` est l'image (en général `next/image` avec `fill`).
 */
export function RevealImage({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  // Le déclencheur est sur un conteneur non découpé : Chrome tient compte du clip-path dans
  // l'IntersectionObserver, un élément découpé à 100 % ne serait jamais « visible ».
  return (
    <motion.div className={cn("relative", className)} initial="hidden" whileInView="shown" viewport={{ once: true, amount: 0.2 }}>
      <motion.div
        className="absolute inset-0 overflow-hidden rounded-[inherit]"
        variants={{ hidden: { clipPath: "inset(100% 0% 0% 0%)" }, shown: { clipPath: "inset(0% 0% 0% 0%)" } }}
        transition={{ duration: 1.4, delay, ease: EASE_OUT }}
      >
        <motion.div
          className="absolute inset-0"
          variants={{ hidden: { scale: 1.25 }, shown: { scale: 1 } }}
          transition={{ duration: 1.8, delay, ease: EASE_OUT }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Parallaxe : le contenu glisse de `distance` pixels (de +d à -d) pendant la traversée de l'écran.
 * À placer dans un conteneur `overflow-hidden` un peu plus petit que le contenu.
 */
export function Parallax({ children, className, distance = 60 }: { children: ReactNode; className?: string; distance?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, (v) => distance - 2 * distance * v);
  return (
    <motion.div ref={ref} className={className} style={reduceMotion ? undefined : { y }}>
      {children}
    </motion.div>
  );
}

/**
 * Paragraphe dont les mots s'allument au fil du défilement (manifeste de l'accueil).
 * Le texte complet est lisible dès le départ (opacité minimale 0,18 pour la décoration, mais le
 * contenu réel reste dans le DOM et dans l'arbre d'accessibilité).
 */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((word, index) =>
        reduceMotion ? (
          <span key={index}>{word} </span>
        ) : (
          <Word key={index} progress={scrollYProgress} range={[index / words.length, (index + 1) / words.length]}>
            {word}
          </Word>
        ),
      )}
    </p>
  );
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, (v) => 0.18 + 0.82 * clamp01((v - range[0]) / (range[1] - range[0])));
  return (
    <>
      <motion.span style={{ opacity }}>{children}</motion.span>{" "}
    </>
  );
}

/**
 * Mot mis en valeur dans un titre : l'italique du serif, comme dans la presse.
 * (Remplace le soulignement orange du gabarit Crafto.)
 */
export function Highlight({ children, className }: { children: ReactNode; className?: string }) {
  return <em className={cn("font-display font-normal italic", className)}>{children}</em>;
}
