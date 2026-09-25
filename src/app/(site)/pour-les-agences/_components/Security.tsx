import { IconCheck, IconLock, IconMinus, IconShieldCheck } from "@tabler/icons-react";
import Image from "next/image";

import { Container, Section } from "@/components/site/layout";
import { Highlight, Reveal } from "@/components/site/motion";
import { PHOTOS } from "@/components/site/photos";
import { Eyebrow } from "@/components/site/SectionHeading";

/** Droits par rôle (les droits réels du logiciel, vérifiés par l'API). */
const RIGHTS = [
  { key: "voir", label: "Voir" },
  { key: "gerer", label: "Gérer" },
  { key: "payer", label: "Payer" },
  { key: "equipe", label: "Équipe" },
] as const;

const MATRIX: { role: string; rights: Record<(typeof RIGHTS)[number]["key"], boolean> }[] = [
  { role: "Administrateur", rights: { voir: true, gerer: true, payer: true, equipe: true } },
  { role: "Gestionnaire", rights: { voir: true, gerer: true, payer: true, equipe: false } },
  { role: "Comptable", rights: { voir: true, gerer: false, payer: true, equipe: false } },
  { role: "Lecture seule", rights: { voir: true, gerer: false, payer: false, equipe: false } },
];

const cell = "bg-surface-solid flex flex-col gap-4 p-6 sm:p-7";

/**
 * Sécurité et rôles (d'après le « Feature Overview Bento » de 21st) : une grille à filets, le titre
 * dans la première case, la matrice des rôles au centre, trois garanties autour.
 */
export function Security() {
  return (
    <Section tone="subtle" labelledBy="securite-titre">
      <Container>
        <Reveal className="bg-border-default border-border-default grid grid-cols-1 gap-px overflow-hidden rounded-md border md:grid-cols-6">
          <div className={`${cell} justify-between md:col-span-2`}>
            <Eyebrow index="04">Sécurité et rôles</Eyebrow>
            <h2 id="securite-titre" className="font-display m-0 text-4xl leading-[1] font-normal tracking-tight text-balance sm:text-5xl">
              Vos données restent <Highlight>les vôtres</Highlight>
            </h2>
          </div>

          <div className={`${cell} md:col-span-4 md:row-span-2`}>
            <div className="flex items-baseline justify-between gap-4">
              <h3 id="roles-titre" className="font-display m-0 text-3xl leading-tight font-normal tracking-tight">
                Quatre rôles pour l&apos;équipe
              </h3>
              <p className="site-label text-text-muted m-0 hidden sm:block">Qui fait quoi</p>
            </div>
            <table aria-labelledby="roles-titre" className="w-full table-fixed border-collapse text-left">
              <thead>
                <tr className="border-text-strong border-b">
                  <th scope="col" className="w-[34%] pb-3">
                    <span className="sr-only">Rôle</span>
                  </th>
                  {RIGHTS.map((right) => (
                    <th key={right.key} scope="col" className="site-label text-text-muted px-1 pb-3 text-center text-[0.6rem] font-medium sm:text-[0.72rem]">
                      {right.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MATRIX.map((row) => (
                  <tr key={row.role} className="border-border-default border-b">
                    <th scope="row" className="font-display text-text-strong py-4 pr-2 text-xl leading-tight font-normal sm:text-2xl">
                      {row.role}
                    </th>
                    {RIGHTS.map((right) => (
                      <td key={right.key} className="py-4 text-center">
                        {row.rights[right.key] ? (
                          <span className="bg-text-strong text-canvas inline-flex size-7 items-center justify-center rounded-full">
                            <IconCheck size={15} stroke={2.25} aria-hidden="true" />
                            <span className="sr-only">Oui</span>
                          </span>
                        ) : (
                          <span className="text-text-subtle inline-flex size-7 items-center justify-center">
                            <IconMinus size={15} stroke={1.75} aria-hidden="true" />
                            <span className="sr-only">Non</span>
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-text-muted m-0 text-sm leading-relaxed">
              Gérer : biens, baux, maintenance et annonces. Payer : enregistrer et affecter les paiements, suivre les échéances.
            </p>
          </div>

          <div className={`${cell} md:col-span-2`}>
            <IconLock size={26} stroke={1.5} aria-hidden="true" className="text-accent-text" />
            <h3 className="font-display m-0 text-2xl leading-tight font-normal tracking-tight">Un espace cloisonné par agence</h3>
            <p className="text-text-muted m-0 text-sm leading-relaxed">Chaque agence ne voit que ses biens, locataires, baux et paiements.</p>
          </div>

          <div className={`${cell} md:col-span-2`}>
            <IconShieldCheck size={26} stroke={1.5} aria-hidden="true" className="text-accent-text" />
            <h3 className="font-display m-0 text-2xl leading-tight font-normal tracking-tight">Des droits vérifiés à chaque action</h3>
            <p className="text-text-muted m-0 text-sm leading-relaxed">Pas seulement des boutons masqués : le serveur contrôle chaque action.</p>
          </div>

          <div className="bg-surface-solid relative isolate flex min-h-64 flex-col justify-end gap-2 overflow-hidden p-6 sm:p-7 md:col-span-4">
            <Image src={PHOTOS.dakarAerienCites.src} alt="" fill sizes="(min-width: 768px) 60vw, 100vw" className="-z-10 object-cover object-[center_40%]" />
            <span aria-hidden="true" className="from-brand-900/85 via-brand-900/30 absolute inset-0 -z-10 bg-linear-to-t to-brand-900/10" />
            {/* Position arrondie : une zone, jamais l'adresse exacte. */}
            <span
              aria-hidden="true"
              className="absolute top-[22%] right-[18%] size-28 rounded-full border-2 border-dashed border-white/80 bg-white/10 backdrop-blur-[2px] sm:size-36"
            />
            <h3 className="font-display m-0 text-2xl leading-tight font-normal tracking-tight text-white">Rien de privé sur le portail</h3>
            <p className="m-0 max-w-md text-sm leading-relaxed text-white/85">
              Ni locataires, ni baux, ni adresse exacte : seule une position approximative du bien est publiée.
            </p>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
