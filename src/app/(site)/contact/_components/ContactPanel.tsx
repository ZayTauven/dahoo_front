"use client";

import { IconArrowRight, IconArrowUpRight, IconBuildingSkyscraper, IconHomeSearch } from "@tabler/icons-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { EASE_OUT, Highlight } from "@/components/site/motion";
import { PHOTOS } from "@/components/site/photos";
import { cn } from "@/lib/utils";

import { DemoRequestForm } from "./DemoRequestForm";

export type ContactProfile = "particulier" | "agence";

const PROFILES = [
  { value: "particulier", title: "Je cherche un bien", text: "À louer ou à acheter", Icon: IconHomeSearch },
  { value: "agence", title: "Je suis une agence", text: "Découvrir Dahoo en démo", Icon: IconBuildingSkyscraper },
] as const satisfies readonly { value: ContactProfile; title: string; text: string; Icon: typeof IconHomeSearch }[];

const SEARCH_LINKS = [
  { href: "/louer", title: "Biens à louer", text: "Appartements, villas, studios, bureaux", photo: PHOTOS.interieur01 },
  { href: "/acheter", title: "Biens à vendre", text: "Maisons, appartements, terrains", photo: PHOTOS.villaContemporaine },
  { href: "/agences", title: "Agences partenaires", text: "Leurs coordonnées et leurs biens", photo: PHOTOS.residenceFacadeOcre },
];

/**
 * Aiguillage de la page Contact : il n'existe pas de message de contact générique.
 * « Je cherche un bien » renvoie vers les annonces (les demandes de visite partent de chaque fiche),
 * « Je suis une agence » ouvre la demande de démonstration.
 * Les deux choix sont de vrais boutons radio (clavier, lecteurs d'écran) habillés en grandes pastilles.
 */
export function ContactPanel({ initialProfile }: { initialProfile: ContactProfile }) {
  const [profile, setProfile] = useState<ContactProfile>(initialProfile);

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <fieldset className="m-0 border-0 p-0">
        <legend className="site-label text-text-muted mb-3 p-0">Vous êtes…</legend>
        <div className="grid grid-cols-2 gap-2">
          {PROFILES.map(({ value, title, text, Icon }) => (
            <label
              key={value}
              className={cn(
                "group border-border-strong text-text-strong relative flex cursor-pointer flex-col gap-3 rounded-md border p-4 transition-colors duration-500 sm:p-5",
                "hover:border-text-strong has-checked:bg-text-strong has-checked:text-canvas has-checked:border-transparent",
                "has-focus-visible:outline-accent has-focus-visible:outline-2 has-focus-visible:outline-offset-2",
              )}
            >
              <input
                type="radio"
                name="profil"
                value={value}
                checked={profile === value}
                onChange={() => setProfile(value)}
                className="peer sr-only"
              />
              <span className="flex items-center justify-between gap-3">
                <Icon size={22} stroke={1.5} aria-hidden="true" />
                <span
                  aria-hidden="true"
                  className="border-border-strong group-has-checked:border-canvas/60 flex size-5 items-center justify-center rounded-full border"
                >
                  <span className="bg-accent size-2.5 scale-0 rounded-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-has-checked:scale-100" />
                </span>
              </span>
              <span className="font-display text-[1.45rem] leading-[1] tracking-tight sm:text-3xl">{title}</span>
              <span className="text-text-muted group-has-checked:text-canvas/75 hidden text-sm sm:block">{text}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <motion.div
        key={profile}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE_OUT }}
        className="flex flex-col gap-7"
      >
        {profile === "agence" ? (
          <>
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-text-strong m-0 text-4xl leading-[1] font-normal tracking-tight">
                Demander une <Highlight>démonstration</Highlight>
              </h3>
              <p className="text-text-muted m-0 max-w-md leading-relaxed">
                L&apos;équipe Dahoo vous rappelle pour vous présenter l&apos;outil avec les biens de votre agence.
              </p>
            </div>
            <DemoRequestForm />
            <p className="border-border-default m-0 flex flex-wrap gap-x-6 gap-y-2 border-t pt-5">
              <Link href="/pour-les-agences" className="site-link text-text-strong inline-flex items-center gap-2 text-sm font-medium">
                L&apos;offre agences <IconArrowRight size={16} stroke={1.75} aria-hidden="true" />
              </Link>
              <Link href="/tarifs" className="site-link text-text-strong inline-flex items-center gap-2 text-sm font-medium">
                Tarifs <IconArrowRight size={16} stroke={1.75} aria-hidden="true" />
              </Link>
            </p>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-text-strong m-0 text-4xl leading-[1] font-normal tracking-tight">
                Tout part de <Highlight>l&apos;annonce</Highlight>
              </h3>
              <p className="text-text-muted m-0 max-w-md leading-relaxed">
                La demande de visite part de la fiche du bien, directement vers l&apos;agence qui le gère.
              </p>
            </div>
            <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-3 sm:gap-3">
              {SEARCH_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group border-border-default text-text-strong flex h-full items-center gap-4 rounded-md border p-2 no-underline transition-colors duration-500 hover:border-text-strong sm:flex-col sm:items-stretch sm:gap-3 sm:p-2 sm:pb-4"
                  >
                    <span className="relative block size-18 shrink-0 overflow-hidden rounded-sm sm:aspect-[4/5] sm:size-auto">
                      <Image
                        src={link.photo.src}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 220px, 72px"
                        className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                      />
                    </span>
                    <span className="flex min-w-0 flex-1 items-end justify-between gap-2 sm:px-2">
                      <span className="flex flex-col gap-1">
                        <span className="font-display text-2xl leading-none tracking-tight">{link.title}</span>
                        <span className="text-text-muted text-sm leading-snug">{link.text}</span>
                      </span>
                      <IconArrowUpRight
                        size={18}
                        stroke={1.75}
                        aria-hidden="true"
                        className="text-text-muted group-hover:text-text-strong shrink-0 transition-transform duration-500 group-hover:rotate-45"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </motion.div>
    </div>
  );
}
