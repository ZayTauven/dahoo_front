import { IconArrowRight } from "@tabler/icons-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";

import { Container } from "@/components/site/layout";
import { Highlight, Reveal, RevealLines } from "@/components/site/motion";
import { Breadcrumbs } from "@/components/site/PageHero";
import { PHOTOS } from "@/components/site/photos";
import { Eyebrow } from "@/components/site/SectionHeading";

import { AgencyMark } from "../agences/_components/AgencyMonogram";
import { getAgencies } from "../agences/_components/data";
import { ContactPanel, type ContactProfile } from "./_components/ContactPanel";
import { DAHOO_CONTACT_EMAIL } from "./_components/demo-request";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez Dahoo : trouvez un bien à louer ou à acheter auprès des agences partenaires, ou demandez une démonstration de l'outil de gestion locative pour votre agence.",
  alternates: { canonical: "/contact" },
};

/** Agences partenaires affichées sous les coordonnées (les logos d'abord). */
const PARTNERS_SHOWN = 6;

export default async function ContactPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ profil }, agencies] = await Promise.all([searchParams, getAgencies(1)]);
  const initialProfile: ContactProfile = profil === "agence" ? "agence" : "particulier";
  const partners =
    agencies && agencies !== "page-not-found"
      ? [...agencies.results].sort((a, b) => Number(Boolean(b.logo)) - Number(Boolean(a.logo))).slice(0, PARTNERS_SHOWN)
      : [];

  const details = [
    {
      label: "Écrire à Dahoo",
      content: (
        <a href={`mailto:${DAHOO_CONTACT_EMAIL}`} className="site-link text-inherit">
          {DAHOO_CONTACT_EMAIL}
        </a>
      ),
    },
    { label: "Basés à", content: "Dakar, Sénégal" },
    {
      label: "Une question sur un bien",
      content: (
        <Link href="/agences" className="site-link inline-flex items-center gap-1.5 text-inherit">
          Trouver l&apos;agence <IconArrowRight size={16} stroke={1.75} aria-hidden="true" />
        </Link>
      ),
    },
    {
      label: "Déjà client ?",
      content: (
        <Link href="/connexion" className="site-link inline-flex items-center gap-1.5 text-inherit">
          Espace agence <IconArrowRight size={16} stroke={1.75} aria-hidden="true" />
        </Link>
      ),
    },
  ];

  return (
    <div className="pt-8 pb-16 sm:pt-10 sm:pb-24 lg:pb-28">
      <Container>
        <Breadcrumbs crumbs={[{ label: "Contact" }]} />

        {/* D'après « Contact 01 » de 21st : à gauche la photo et les coordonnées en étiquettes, à droite le formulaire. */}
        <div className="mt-6 grid gap-6 sm:mt-8 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-8">
          <div className="relative isolate flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-md p-5 sm:aspect-[16/10] sm:p-8 lg:col-span-5 lg:row-start-1 lg:aspect-auto lg:min-h-[30rem]">
            <Image
              src={PHOTOS.goreePort.src}
              alt={PHOTOS.goreePort.alt}
              fill
              preload
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="-z-10 object-cover object-[40%_50%]"
            />
            <span aria-hidden="true" className="from-brand-900/85 via-brand-900/30 absolute inset-0 -z-10 bg-linear-to-t to-transparent" />
            <Eyebrow className="text-white/80 [&>span:first-child]:text-white">Nous pouvons vous aider</Eyebrow>
            <h1 className="font-display m-0 mt-4 text-[2.7rem] leading-[0.95] font-normal tracking-[-0.03em] text-balance text-white sm:text-6xl">
              <RevealLines
                play="mount"
                delay={0.1}
                lines={[
                  <Fragment key="titre">
                    Une question&nbsp;? <Highlight>Parlons-en.</Highlight>
                  </Fragment>,
                ]}
              />
            </h1>
          </div>

          <section
            aria-labelledby="aide"
            className="bg-surface-solid flex flex-col gap-6 rounded-md p-5 sm:p-8 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:p-10"
          >
            <Eyebrow index="01" as="h2" id="aide">
              Comment pouvons-nous vous aider&nbsp;?
            </Eyebrow>
            <ContactPanel initialProfile={initialProfile} />
          </section>

          <Reveal className="lg:col-span-5 lg:row-start-2">
            <section aria-labelledby="coordonnees-dahoo" className="flex flex-col gap-6">
              <Eyebrow index="02" as="h2" id="coordonnees-dahoo">
                Nous écrire
              </Eyebrow>
              <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-6">
                {details.map((item) => (
                  <div key={item.label} className="flex min-w-0 flex-col gap-1.5">
                    <dt className="site-label text-text-muted">{item.label}</dt>
                    <dd className="text-text-strong m-0 text-base font-medium [overflow-wrap:anywhere]">{item.content}</dd>
                  </div>
                ))}
              </dl>

              {partners.length > 0 && (
                <div className="border-border-default flex flex-col gap-4 border-t pt-6">
                  <p className="site-label text-text-muted m-0">Elles publient sur Dahoo</p>
                  <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                    {partners.map((agency) => (
                      <li key={agency.id}>
                        <Link
                          href={`/agences/${agency.id}`}
                          title={agency.name}
                          className="block rounded-sm transition-transform duration-500 hover:-translate-y-0.5"
                        >
                          <AgencyMark name={agency.name} logo={agency.logo} sizes="56px" className="size-12 text-lg sm:size-14 sm:text-xl" />
                          <span className="sr-only">{agency.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </Reveal>
        </div>
      </Container>
    </div>
  );
}
