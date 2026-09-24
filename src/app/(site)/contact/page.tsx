import {
  IconArrowRight,
  IconBuildingStore,
  IconHome,
  IconKey,
  IconLogin2,
  IconMail,
  IconMessage2,
  IconReceipt2,
} from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/site/layout";
import { Reveal } from "@/components/site/motion";

import { PageBanner } from "../agences/_components/PageBanner";
import { ContactPanel, type ContactProfile } from "./_components/ContactPanel";
import { DAHOO_CONTACT_EMAIL } from "./_components/demo-request";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez Dahoo : trouvez un bien à louer ou à acheter auprès des agences partenaires, ou demandez une démonstration de l'outil de gestion locative pour votre agence.",
  alternates: { canonical: "/contact" },
};

const QUICK_LINKS = [
  { href: "/louer", icon: IconKey, title: "Biens à louer", text: "Toutes les locations du portail" },
  { href: "/acheter", icon: IconHome, title: "Biens à vendre", text: "Maisons, appartements, terrains" },
  { href: "/pour-les-agences", icon: IconBuildingStore, title: "Offre agences", text: "Ce que Dahoo fait pour vous" },
  { href: "/tarifs", icon: IconReceipt2, title: "Tarifs", text: "Les formules d'abonnement" },
];

export default async function ContactPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { profil } = await searchParams;
  const initialProfile: ContactProfile = profil === "agence" ? "agence" : "particulier";

  return (
    <>
      <PageBanner
        eyebrow="Contact"
        title={
          <>
            Une question ? <br className="hidden sm:inline" />
            Parlons-en.
          </>
        }
        lede="Dites-nous ce que vous cherchez : nous vous orientons vers les bonnes annonces ou vers l'équipe Dahoo."
        crumbs={[{ label: "Contact" }]}
        image="/images/site/slider-01.webp"
        watermark="contact"
      />

      <section aria-labelledby="aide" className="pb-16 sm:pb-20 lg:pb-24">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
          <Reveal
            delay={0.1}
            className="border-border-default relative z-10 -mt-10 rounded-2xl border bg-[var(--ax-surface-solid)] p-6 shadow-card sm:-mt-14 sm:p-10 lg:order-2 lg:-mt-24"
          >
            <h2 id="aide" className="font-display text-text-strong m-0 mb-6 text-3xl leading-tight font-semibold sm:text-4xl">
              Comment pouvons-nous vous aider ?
            </h2>
            <ContactPanel initialProfile={initialProfile} />
          </Reveal>

          <Reveal className="flex flex-col gap-10 lg:order-1 lg:pt-16">
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-text-strong m-0 flex items-center gap-3 text-2xl font-semibold">
                <span className="bg-accent-wash text-accent-text inline-flex size-11 items-center justify-center rounded-full">
                  <IconMail size={22} stroke={1.75} aria-hidden="true" />
                </span>
                Écrire à Dahoo
              </h2>
              <p className="text-text-muted m-0 leading-relaxed">
                Pour une question sur la plateforme, un partenariat ou la presse, écrivez-nous :
              </p>
              <a href={`mailto:${DAHOO_CONTACT_EMAIL}`} className="text-link self-start text-lg font-semibold break-all">
                {DAHOO_CONTACT_EMAIL}
              </a>
            </div>

            <div className="border-border-default flex flex-col gap-3 border-t pt-8">
              <h2 className="font-display text-text-strong m-0 flex items-center gap-3 text-2xl font-semibold">
                <span className="bg-accent-wash text-accent-text inline-flex size-11 items-center justify-center rounded-full">
                  <IconMessage2 size={22} stroke={1.75} aria-hidden="true" />
                </span>
                Une question sur un bien
              </h2>
              <p className="text-text-muted m-0 leading-relaxed">
                Chaque annonce est gérée par une agence partenaire. Pour visiter un bien ou en savoir plus, utilisez le
                bouton de demande sur la fiche de l&apos;annonce, ou contactez directement l&apos;agence.
              </p>
              <Link href="/agences" className="text-link inline-flex items-center gap-1.5 self-start font-semibold">
                Trouver une agence
                <IconArrowRight size={16} stroke={2} aria-hidden="true" />
              </Link>
            </div>

            <div className="border-border-default flex flex-col gap-3 border-t pt-8">
              <h2 className="font-display text-text-strong m-0 flex items-center gap-3 text-2xl font-semibold">
                <span className="bg-accent-wash text-accent-text inline-flex size-11 items-center justify-center rounded-full">
                  <IconLogin2 size={22} stroke={1.75} aria-hidden="true" />
                </span>
                Déjà client ?
              </h2>
              <p className="text-text-muted m-0 leading-relaxed">
                Votre agence utilise déjà Dahoo ? Connectez-vous à votre espace pour gérer vos biens et vos annonces.
              </p>
              <Link href="/connexion" className="text-link inline-flex items-center gap-1.5 self-start font-semibold">
                Accéder à l&apos;espace agence
                <IconArrowRight size={16} stroke={2} aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>

      <section aria-labelledby="raccourcis" className="bg-surface-subtle py-12 sm:py-16">
        <Container>
          <h2 id="raccourcis" className="sr-only">
            Accès rapides
          </h2>
          <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_LINKS.map(({ icon: LinkIcon, ...link }, index) => (
              <Reveal as="li" key={link.href} delay={index * 0.06}>
                <Link
                  href={link.href}
                  className="group hover:border-brand flex h-full items-center gap-4 rounded-xl border border-transparent p-3 no-underline transition-colors"
                >
                  <span className="bg-brand-600 inline-flex size-14 shrink-0 items-center justify-center rounded-xl text-white">
                    <LinkIcon size={26} stroke={1.5} aria-hidden="true" />
                  </span>
                  <span className="flex flex-col">
                    <span className="font-display text-text-strong text-lg font-semibold group-hover:text-brand">{link.title}</span>
                    <span className="text-text-muted text-sm">{link.text}</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
