"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

import { cn } from "@/lib/utils";

const STEPS = [
  { title: "Vous demandez une démo", text: "L'équipe Dahoo vous rappelle pour convenir d'un créneau." },
  { title: "Votre espace est créé", text: "Compte administrateur ouvert : les 30 jours d'essai commencent." },
  { title: "Vous saisissez votre parc", text: "Biens, lots, locataires, baux en cours, puis votre équipe." },
  { title: "Vous gérez au quotidien", text: "Échéances, paiements, tickets et annonces, pour toute l'agence." },
];

/** Cartes en zigzag, légèrement inclinées ; le tracé passe par leur centre. */
const PLACES = ["mr-auto rotate-[-2deg]", "ml-auto rotate-[2deg]", "mr-auto rotate-[-1.5deg]", "ml-auto rotate-[1.5deg]"];

/**
 * Les quatre étapes (d'après le « How It Works » de 21st) : cartes épinglées en zigzag, reliées par
 * un tracé qui se dessine au fil du défilement. « Réduire les animations » : tracé complet.
 */
export function Steps({ className }: { className?: string }) {
  const ref = useRef<HTMLOListElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.6"] });
  const length = useTransform(scrollYProgress, (v) => Math.min(1, Math.max(0, v)));

  return (
    <ol ref={ref} className={cn("relative m-0 flex list-none flex-col gap-7 p-0", className)}>
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="text-text-strong pointer-events-none absolute inset-0 h-full w-full"
      >
        <path
          d="M 35 12 C 35 26, 65 22, 65 37 C 65 52, 35 48, 35 62 C 35 77, 65 73, 65 87"
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.18}
          strokeWidth={1.5}
          strokeDasharray="6 6"
          vectorEffect="non-scaling-stroke"
        />
        <motion.path
          d="M 35 12 C 35 26, 65 22, 65 37 C 65 52, 35 48, 35 62 C 35 77, 65 73, 65 87"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: reduceMotion ? 1 : length }}
        />
      </svg>

      {STEPS.map((step, index) => (
        <li
          key={step.title}
          className={cn(
            "relative w-[88%] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:z-10 hover:scale-[1.03] sm:w-[70%]",
            PLACES[index],
          )}
        >
          <div className="bg-surface-solid border-border-default relative rounded-lg border px-5 pt-5 pb-4 shadow-xl shadow-text-strong/10">
            <span aria-hidden="true" className="bg-accent ring-canvas absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rounded-full ring-4" />
            <div className="flex items-baseline gap-3">
              <span className="font-display text-accent-text text-3xl leading-none italic">
                <span className="sr-only">Étape </span>
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display m-0 text-2xl leading-tight font-normal tracking-tight">{step.title}</h3>
            </div>
            <p className="text-text-muted m-0 mt-1.5 text-sm leading-snug">{step.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
