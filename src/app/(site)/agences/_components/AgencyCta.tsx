import { IconArrowRight, IconBuildingEstate } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/site/layout";
import { Reveal } from "@/components/site/motion";

/** Bloc final « Vous êtes une agence ? » : renvoie vers l'offre Dahoo pour les professionnels. */
export function AgencyCta() {
  return (
    <section aria-labelledby="cta-agence" className="py-16 sm:py-20">
      <Container>
        <Reveal className="bg-brand-900 relative isolate overflow-hidden rounded-2xl px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14">
          <Image
            src="/images/site/property-02.webp"
            alt=""
            fill
            sizes="(min-width: 1200px) 1168px, 100vw"
            className="-z-20 object-cover opacity-30"
          />
          <div aria-hidden="true" className="from-brand-900 via-brand-900/90 to-brand-900/40 absolute inset-0 -z-10 bg-gradient-to-r" />
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex max-w-2xl items-start gap-5">
              <span className="bg-accent text-on-accent hidden size-14 shrink-0 items-center justify-center rounded-full sm:inline-flex">
                <IconBuildingEstate size={28} stroke={1.5} aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-3">
                <h2 id="cta-agence" className="font-display m-0 text-2xl leading-tight font-semibold text-white sm:text-3xl">
                  Vous êtes une agence immobilière ?
                </h2>
                <p className="m-0 leading-relaxed text-white/80">
                  Publiez vos biens sur le portail Dahoo et gérez vos locations au même endroit : biens, locataires, baux,
                  loyers et maintenance.
                </p>
              </div>
            </div>
            <Link href="/pour-les-agences" className="ax-btn ax-btn--primary ax-btn--lg shrink-0 self-start lg:self-center">
              <span className="ax-btn__label">Découvrir l&apos;offre agences</span>
              <IconArrowRight className="ax-btn__icon" stroke={2} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
