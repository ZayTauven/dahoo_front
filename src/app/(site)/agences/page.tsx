import { IconArrowRight, IconBuildingCommunity, IconCircleCheck, IconMapPin } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container, Section } from "@/components/site/layout";
import { Highlight, Reveal } from "@/components/site/motion";
import { SectionHeading } from "@/components/site/SectionHeading";
import type { Schema } from "@/lib/api/types";

import { countLabel, pageParam } from "./_components/agency";
import { AgencyCta } from "./_components/AgencyCta";
import { AgencyMonogram } from "./_components/AgencyMonogram";
import { AGENCIES_PAGE_SIZE, getAgencies } from "./_components/data";
import { PageBanner } from "./_components/PageBanner";
import { Pagination } from "./_components/Pagination";

export const metadata: Metadata = {
  title: "Agences immobilières partenaires",
  description:
    "Les agences immobilières partenaires de Dahoo au Sénégal : consultez leurs coordonnées et tous leurs biens à louer ou à vendre.",
  alternates: { canonical: "/agences" },
};

function AgencyCard({ agency }: { agency: Schema<"PublicAgency"> }) {
  return (
    <article className="border-border-default group relative flex h-full flex-col items-center rounded-xl border bg-[var(--ax-surface-solid)] px-6 pt-8 pb-6 text-center shadow-card transition-transform duration-300 hover:-translate-y-1">
      <div className="relative">
        <AgencyMonogram id={agency.id} name={agency.name} className="size-24 text-2xl" />
        <span className="bg-accent text-on-accent absolute -top-1 -right-6 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap shadow-sm">
          {countLabel(agency.listings_count, "annonce", "annonces")}
        </span>
      </div>

      <h3 className="font-display text-text-strong m-0 mt-6 text-xl leading-snug font-semibold">
        <Link href={`/agences/${agency.id}`} className="text-inherit no-underline after:absolute after:inset-0 after:rounded-xl group-hover:text-brand">
          {agency.name}
        </Link>
      </h3>
      {agency.city && (
        <p className="text-text-muted m-0 mt-2 flex items-center gap-1 text-sm">
          <IconMapPin size={16} stroke={1.75} aria-hidden="true" /> {agency.city}
        </p>
      )}

      <div className="mt-auto w-full pt-6">
        <p className="border-border-default text-text-strong m-0 flex items-center justify-center gap-2 border-t pt-5 text-sm font-semibold">
          Voir la fiche et les biens
          <IconArrowRight size={16} stroke={2} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
        </p>
      </div>
    </article>
  );
}

export default async function AgenciesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const page = pageParam((await searchParams).page);
  const result = await getAgencies(page);
  if (result === "page-not-found") notFound();

  const pageCount = result ? Math.max(1, Math.ceil(result.count / AGENCIES_PAGE_SIZE)) : 1;

  return (
    <>
      <PageBanner
        eyebrow="Agences partenaires"
        title={
          <>
            Des agences de confiance, <br className="hidden sm:inline" />
            près de chez vous.
          </>
        }
        lede="Toutes les annonces du portail Dahoo sont publiées directement par des agences immobilières du Sénégal. Retrouvez leurs coordonnées et l'ensemble de leurs biens."
        crumbs={[{ label: "Agences" }]}
        image="/images/site/slider-03.webp"
        watermark="agences"
      />

      <Section tone="subtle" labelledBy="liste-agences">
        <Container>
          <Reveal>
            <SectionHeading
              id="liste-agences"
              eyebrow="Annuaire"
              align="center"
              title={
                <>
                  Nos agences <Highlight>partenaires</Highlight>
                </>
              }
            >
              <p className="m-0">
                Choisissez une agence pour voir ses biens à louer et à vendre, puis contactez-la directement depuis sa
                fiche ou depuis une annonce.
              </p>
            </SectionHeading>
          </Reveal>

          {result === null ? (
            <div role="status" className="ax-alert ax-alert--warning mx-auto mt-12 max-w-xl">
              <div className="ax-alert__content">
                <p className="ax-alert__title">Liste momentanément indisponible</p>
                <p className="ax-alert__message">
                  Nous n&apos;arrivons pas à charger les agences pour le moment. Réessayez dans quelques instants.
                </p>
              </div>
            </div>
          ) : result.results.length === 0 ? (
            <div className="ax-empty mt-6">
              <IconBuildingCommunity className="ax-empty__icon" stroke={1.5} aria-hidden="true" />
              <p className="ax-empty__title">Aucune agence pour le moment</p>
              <p className="m-0">Les premières agences partenaires publient bientôt leurs biens sur Dahoo.</p>
            </div>
          ) : (
            <>
              <ul className="m-0 mt-12 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {result.results.map((agency, index) => (
                  <Reveal as="li" key={agency.id} delay={Math.min(index, 7) * 0.06}>
                    <AgencyCard agency={agency} />
                  </Reveal>
                ))}
              </ul>

              <Pagination
                page={page}
                pageCount={pageCount}
                hrefFor={(target) => (target === 1 ? "/agences" : `/agences?page=${target}`)}
                label="Pages de la liste des agences"
              />

              <p className="text-text-strong m-0 mt-12 flex items-center justify-center gap-2 text-center text-base">
                <IconCircleCheck size={22} stroke={1.75} aria-hidden="true" className="text-accent-text shrink-0" />
                <span>
                  {result.count > 1 ? (
                    <>
                      <b>{countLabel(result.count, "agence partenaire", "agences partenaires")}</b> publient leurs biens sur
                      Dahoo.
                    </>
                  ) : (
                    <>
                      <b>Une agence partenaire</b> publie ses biens sur Dahoo.
                    </>
                  )}
                </span>
              </p>
            </>
          )}
        </Container>
      </Section>

      <AgencyCta />
    </>
  );
}
