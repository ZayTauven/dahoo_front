"use client";

import { IconArrowRight, IconBuildingStore, IconHomeSearch, type TablerIcon } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";

import { DemoRequestForm } from "./DemoRequestForm";

export type ContactProfile = "particulier" | "agence";

const PROFILES: { value: ContactProfile; icon: TablerIcon; title: string; text: string }[] = [
  { value: "particulier", icon: IconHomeSearch, title: "Je cherche un bien", text: "À louer ou à acheter" },
  { value: "agence", icon: IconBuildingStore, title: "Je suis une agence", text: "Découvrir Dahoo en démo" },
];

const SEARCH_LINKS = [
  { href: "/louer", title: "Biens à louer", text: "Appartements, maisons, studios, bureaux et locaux." },
  { href: "/acheter", title: "Biens à vendre", text: "Maisons, appartements et terrains à acheter." },
  { href: "/agences", title: "Agences partenaires", text: "Leurs coordonnées et tous leurs biens." },
];

/**
 * Formulaire de contact orienté selon le besoin : il n'existe pas de message de contact générique.
 * « Je cherche un bien » renvoie vers les annonces (les demandes de visite partent de chaque fiche),
 * « Je suis une agence » ouvre la demande de démonstration.
 */
export function ContactPanel({ initialProfile }: { initialProfile: ContactProfile }) {
  const [profile, setProfile] = useState<ContactProfile>(initialProfile);

  return (
    <div className="flex flex-col gap-8">
      <fieldset className="m-0 border-0 p-0">
        <legend className="text-text-strong mb-3 p-0 text-sm font-semibold">Vous êtes…</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {PROFILES.map((option) => {
            const OptionIcon = option.icon;
            return (
              <label
                key={option.value}
                className="border-border-default has-[:checked]:border-accent has-[:checked]:bg-accent-wash has-[:focus-visible]:ring-accent/40 flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-colors has-[:focus-visible]:ring-4"
              >
                <input
                  type="radio"
                  name="profil"
                  value={option.value}
                  checked={profile === option.value}
                  onChange={() => setProfile(option.value)}
                  className="sr-only"
                />
                <span className="bg-brand-600 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-white">
                  <OptionIcon size={22} stroke={1.75} aria-hidden="true" />
                </span>
                <span className="flex flex-col">
                  <span className="text-text-strong font-semibold">{option.title}</span>
                  <span className="text-text-muted text-sm">{option.text}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {profile === "agence" ? (
        <div className="flex flex-col gap-5">
          <p className="text-text-muted m-0 leading-relaxed">
            Laissez-nous vos coordonnées : l&apos;équipe Dahoo vous recontacte pour vous présenter l&apos;outil de gestion
            locative et la publication de vos annonces sur le portail.
          </p>
          <DemoRequestForm />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <p className="text-text-muted m-0 leading-relaxed">
            Les demandes de visite et les questions sur un bien se font depuis la fiche de l&apos;annonce : votre message
            est transmis directement à l&apos;agence qui gère le bien, qui vous répond elle-même.
          </p>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {SEARCH_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="border-border-default hover:border-brand group flex items-center justify-between gap-4 rounded-xl border p-4 no-underline transition-colors"
                >
                  <span className="flex flex-col">
                    <span className="text-text-strong font-semibold group-hover:text-brand">{link.title}</span>
                    <span className="text-text-muted text-sm">{link.text}</span>
                  </span>
                  <IconArrowRight size={20} stroke={2} aria-hidden="true" className="text-brand shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
