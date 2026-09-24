import Image from "next/image";
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

export function SiteFooter() {
  return (
    <footer className="bg-brand-900 text-white">
      <Container className="grid gap-10 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex max-w-xs flex-col gap-4">
          <Link href="/" aria-label="Dahoo, accueil">
            <Image src="/brand/logo-white.png" alt="Dahoo" width={132} height={43} />
          </Link>
          <p className="m-0 text-sm leading-relaxed text-white/70">
            Le portail des agences immobilières et la plateforme qui simplifie leur gestion : annonces, locations,
            loyers et maintenance.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="font-display m-0 mb-4 text-base font-semibold text-white">{column.title}</h2>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/70 no-underline transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-6 text-xs text-white/60 sm:flex-row sm:justify-between">
          <p className="m-0">© {new Date().getFullYear()} Dahoo. Tous droits réservés.</p>
          <p className="m-0">Montants affichés en francs CFA (XOF).</p>
        </Container>
      </div>
    </footer>
  );
}
