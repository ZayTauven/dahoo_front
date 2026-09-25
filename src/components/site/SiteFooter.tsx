import { IconArrowUpRight } from "@tabler/icons-react";
import Link from "next/link";

import { Container } from "./layout";

const COLUMNS = [
  {
    title: "Annonces",
    links: [
      { label: "Biens à louer", href: "/louer" },
      { label: "Biens à vendre", href: "/acheter" },
      { label: "Agences partenaires", href: "/agences" },
    ],
  },
  {
    title: "Dahoo",
    links: [
      { label: "Pour les agences", href: "/pour-les-agences" },
      { label: "Tarifs", href: "/tarifs" },
      { label: "À propos", href: "/a-propos" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Espace agence",
    links: [
      { label: "Se connecter", href: "/connexion" },
      { label: "Demander une démo", href: "/pour-les-agences#demo" },
    ],
  },
];

/** Pied de page : dernier appel, plan du site, puis le nom de la marque en très grand, rogné par le bas. */
export function SiteFooter() {
  return (
    <footer className="site-dark overflow-hidden">
      <Container className="flex flex-col gap-16 pt-24 sm:pt-32">
        <div className="border-border-default flex flex-col gap-10 border-b pb-16 lg:flex-row lg:items-end lg:justify-between">
          <p className="font-display text-text-strong m-0 max-w-3xl text-5xl leading-[0.98] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Un bien à louer, à vendre ou <em className="italic">à gérer</em> ?
          </p>
          <Link
            href="/contact"
            className="group bg-accent text-on-accent inline-flex shrink-0 items-center gap-3 self-start rounded-full py-2 pr-2 pl-7 text-base font-medium no-underline transition-colors duration-500 hover:bg-[var(--site-deep-text)] lg:self-auto"
          >
            Parlons-en
            <span className="bg-on-accent text-accent flex size-11 items-center justify-center rounded-full transition-transform duration-500 group-hover:rotate-45">
              <IconArrowUpRight size={20} stroke={1.75} aria-hidden="true" />
            </span>
          </Link>
        </div>

        <div className="grid gap-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <p className="text-text-muted m-0 max-w-xs text-[0.95rem] leading-relaxed">
            Le portail des agences immobilières du Sénégal, et le logiciel qui simplifie leur gestion : annonces,
            locations, loyers et maintenance.
          </p>
          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="site-label text-text-muted m-0 mb-5">{column.title}</h2>
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="site-link text-text-strong text-[0.95rem]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="site-label text-text-muted flex flex-col gap-2 sm:flex-row sm:justify-between">
          <p className="m-0">© {new Date().getFullYear()} Dahoo — Dakar, Sénégal</p>
          <p className="m-0">Montants affichés en francs CFA (XOF)</p>
        </div>
      </Container>

      <p
        aria-hidden="true"
        className="font-display text-text-strong m-0 -mb-[0.22em] pt-6 text-center text-[31vw] leading-[0.8] tracking-[-0.05em] select-none"
      >
        Dahoo
      </p>
    </footer>
  );
}
