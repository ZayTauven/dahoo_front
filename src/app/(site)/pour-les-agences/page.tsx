import {
  IconArrowRight,
  IconBuildingEstate,
  IconCash,
  IconCircleCheck,
  IconDeviceDesktop,
  IconEyeOff,
  IconFileText,
  IconGift,
  IconMessages,
  IconNotebook,
  IconPhoneCall,
  IconShieldLock,
  IconSpeakerphone,
  IconTool,
  IconUserShield,
  IconUsersGroup,
  type TablerIcon,
} from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Container, Section } from "@/components/site/layout";
import { Highlight, Reveal } from "@/components/site/motion";
import { SectionHeading } from "@/components/site/SectionHeading";
import { publicApi } from "@/lib/api/server";
import type { Schema } from "@/lib/api/types";
import { formatNumber } from "@/lib/format";

import { DemoForm } from "./_components/DemoForm";
import { Faq, type FaqItem } from "./_components/Faq";
import { HeroMockup, PaymentMockup, PortalMockup, TicketMockup } from "./_components/Mockups";

export const metadata: Metadata = {
  title: "Logiciel de gestion locative pour agences immobilières",
  description:
    "Dahoo aide les agences immobilières du Sénégal à gérer biens, locataires, baux, loyers (Wave, Orange Money, espèces), maintenance et annonces, en équipe. 30 jours d'essai gratuit, démo sur demande.",
  alternates: { canonical: "/pour-les-agences" },
  openGraph: {
    type: "website",
    locale: "fr_SN",
    siteName: "Dahoo",
    url: "/pour-les-agences",
    title: "Dahoo pour les agences immobilières",
    description:
      "Patrimoine, baux, loyers, maintenance et annonces réunis dans un seul espace pour toute votre agence. Demandez une démo.",
  },
};

/** Compteurs réels du portail ; `null` si l'API ne répond pas (le bandeau est alors masqué). */
async function getStats(): Promise<Schema<"PublicStats"> | null> {
  try {
    const { data } = await publicApi.GET("/api/v1/public/stats/");
    return data ?? null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ contenus */

const REASSURANCE = [
  { icon: IconGift, text: "30 jours d'essai gratuit, toutes fonctionnalités" },
  { icon: IconDeviceDesktop, text: "Dans le navigateur, rien à installer" },
  { icon: IconShieldLock, text: "Données cloisonnées par agence" },
];

const PROBLEMS: { icon: TablerIcon; title: string; before: string; after: string }[] = [
  {
    icon: IconNotebook,
    title: "Des loyers suivis au cahier",
    before: "Qui a payé, qui doit encore, depuis quand ? Il faut reprendre chaque page, chaque fichier.",
    after: "Chaque bail a ses échéances. Un paiement affecté les solde, les impayés ressortent d'un filtre.",
  },
  {
    icon: IconMessages,
    title: "Des preuves de paiement éparpillées",
    before: "Captures Wave et Orange Money perdues dans les discussions, reçus d'espèces introuvables.",
    after: "Chaque paiement est enregistré avec son moyen, sa référence et le nom de la personne qui l'a saisi.",
  },
  {
    icon: IconPhoneCall,
    title: "Des pannes signalées par téléphone",
    before: "La demande passe de main en main, personne ne sait qui s'en occupe ni où elle en est.",
    after: "Un ticket par incident, avec priorité, responsable, statut et journal des interventions.",
  },
  {
    icon: IconSpeakerphone,
    title: "Des annonces à renvoyer à chaque prospect",
    before: "Photos, prix et descriptions à republier partout, demandes de visite dispersées.",
    after: "Vous publiez sur le portail Dahoo depuis votre espace ; les demandes de visite arrivent chez vous.",
  },
];

const MODULES: { id: string; icon: TablerIcon; title: string; text: string; points: string[] }[] = [
  {
    id: "patrimoine",
    icon: IconBuildingEstate,
    title: "Patrimoine",
    text: "Vos biens, leurs bâtiments et leurs lots : appartements, villas, studios, bureaux, commerces ou terrains, avec quartier et propriétaire.",
    points: ["Statut de chaque lot : libre, loué, en maintenance, vendu", "Surface, chambres, salles de bain, meublé ou non", "Lot passé « loué » dès l'activation du bail"],
  },
  {
    id: "baux",
    icon: IconFileText,
    title: "Locataires et baux",
    text: "Une fiche par locataire (coordonnées, pièce d'identité, notes) et des baux au cycle clair : brouillon, actif, puis résilié ou terminé.",
    points: ["Loyer, charges et dépôt de garantie", "Paiement mensuel ou trimestriel", "Un seul bail actif par lot, contrôlé automatiquement"],
  },
  {
    id: "loyers",
    icon: IconCash,
    title: "Loyers et paiements",
    text: "Les échéances de loyer et de charges de chaque bail, et les paiements reçus par Wave, Orange Money, virement ou espèces.",
    points: ["Un paiement affecté à une ou plusieurs échéances", "Paiements partiels pris en compte", "Échéance marquée payée dès qu'elle est soldée"],
  },
  {
    id: "maintenance",
    icon: IconTool,
    title: "Maintenance",
    text: "Chaque incident devient un ticket rattaché au lot, avec sa catégorie, sa priorité (de basse à urgente) et son statut.",
    points: ["Affectation à un membre de l'équipe", "Journal horodaté des interventions", "Ouvert, en cours, en attente, résolu, clôturé"],
  },
  {
    id: "annonces",
    icon: IconSpeakerphone,
    title: "Annonces sur le portail",
    text: "Créez l'annonce d'un lot à louer ou à vendre, ajoutez vos photos et publiez-la sur le portail Dahoo, visible par le grand public.",
    points: ["Jusqu'à 20 photos par annonce", "Publier ou suspendre une annonce en un clic", "Demandes de visite reçues dans l'espace agence"],
  },
  {
    id: "equipe",
    icon: IconUsersGroup,
    title: "Équipe et droits",
    text: "Ajoutez vos collaborateurs et donnez à chacun le rôle qui correspond à son travail, de l'administrateur au simple consultant.",
    points: ["4 rôles : administrateur, gestionnaire, comptable, lecture seule", "Droits vérifiés par le serveur à chaque action", "Chaque paiement garde le nom de qui l'a saisi"],
  },
];

const STEPS = [
  {
    title: "Demandez une démo",
    text: "Remplissez le formulaire : l'équipe Dahoo vous rappelle et vous montre l'outil sur des cas proches des vôtres.",
  },
  {
    title: "Votre espace agence est créé",
    text: "Nous ouvrons votre espace et votre compte administrateur. Vos 30 jours d'essai gratuit commencent.",
  },
  {
    title: "Vous saisissez votre parc",
    text: "Biens, lots, locataires et baux en cours, puis vous ajoutez vos collaborateurs avec le bon rôle.",
  },
  {
    title: "Vous gérez au quotidien",
    text: "Échéances, paiements, tickets et annonces : toute l'agence travaille sur les mêmes informations.",
  },
];

const ROLES = [
  { role: "Administrateur", scope: "Tout, y compris la gestion de l'équipe et les informations de l'agence." },
  { role: "Gestionnaire", scope: "Toute la gestion au quotidien : biens, baux, paiements, maintenance, annonces. Pas la gestion de l'équipe." },
  { role: "Comptable", scope: "Consulte l'ensemble, enregistre et affecte les paiements, gère les échéances." },
  { role: "Lecture seule", scope: "Consulte les informations sans pouvoir rien modifier." },
];

const SECURITY: { icon: TablerIcon; title: string; text: string }[] = [
  {
    icon: IconShieldLock,
    title: "Cloisonnement par agence",
    text: "Chaque agence ne voit que ses propres biens, locataires, baux et paiements. Un locataire suivi par deux agences a deux fiches distinctes, invisibles l'une pour l'autre.",
  },
  {
    icon: IconUserShield,
    title: "Des droits vérifiés à chaque action",
    text: "Les rôles ne se contentent pas de masquer des boutons : chaque action est contrôlée par le serveur selon le rôle de la personne connectée.",
  },
  {
    icon: IconEyeOff,
    title: "Rien de privé sur le portail",
    text: "Le public ne voit que vos annonces publiées : jamais vos locataires, vos baux ni l'adresse exacte du bien, dont la position est arrondie.",
  },
];

const FAQ: FaqItem[] = [
  {
    question: "Faut-il installer un logiciel ?",
    answer: (
      <p className="m-0">
        Non. Dahoo s&apos;utilise dans le navigateur, sur ordinateur, tablette ou téléphone, avec une connexion internet. Il n&apos;y a
        pas d&apos;application à télécharger.
      </p>
    ),
  },
  {
    question: "Dahoo encaisse-t-il les loyers à ma place ?",
    answer: (
      <p className="m-0">
        Non. Vos locataires paient comme aujourd&apos;hui (Wave, Orange Money, virement, espèces) et l&apos;argent arrive sur vos
        comptes. Dahoo sert à <b className="text-text-strong">enregistrer</b> chaque paiement reçu avec sa référence et à l&apos;affecter
        aux bonnes échéances.
      </p>
    ),
  },
  {
    question: "Je gère des biens pour le compte de propriétaires : est-ce adapté ?",
    answer: (
      <p className="m-0">
        Oui. Chaque bien peut être rattaché à son propriétaire (bailleur), et vous organisez ensuite ses bâtiments, ses lots, ses
        baux et ses paiements.
      </p>
    ),
  },
  {
    question: "Que se passe-t-il à la fin des 30 jours d'essai ?",
    answer: (
      <p className="m-0">
        Sans abonnement, votre espace passe en lecture seule : vos données restent consultables, mais plus rien ne peut être
        ajouté ni modifié, et vos annonces ne sont plus affichées sur le portail. L&apos;activation d&apos;un abonnement rétablit
        l&apos;accès complet. Voir <Link href="/tarifs">les tarifs</Link>.
      </p>
    ),
  },
  {
    question: "Mes collaborateurs voient-ils tout ?",
    answer: (
      <p className="m-0">
        Cela dépend du rôle que vous leur donnez : administrateur, gestionnaire, comptable ou lecture seule. Un comptable peut par
        exemple enregistrer les paiements sans pouvoir modifier les baux.
      </p>
    ),
  },
  {
    question: "Comment démarrer ?",
    answer: (
      <p className="m-0">
        Demandez une démo avec le <a href="#demo">formulaire ci-dessous</a>. L&apos;équipe Dahoo vous rappelle, crée votre espace agence
        et votre compte administrateur : l&apos;essai gratuit de 30 jours démarre à ce moment-là.
      </p>
    ),
  },
];

/* ------------------------------------------------------------------ sections */

function Hero() {
  return (
    <div className="bg-brand-900 relative isolate overflow-hidden text-white">
      <div
        aria-hidden="true"
        className="bg-accent/25 absolute -top-40 -right-40 -z-10 h-[28rem] w-[28rem] rounded-full blur-3xl"
      />
      <div aria-hidden="true" className="bg-brand-500/40 absolute -bottom-48 -left-32 -z-10 h-[30rem] w-[30rem] rounded-full blur-3xl" />

      <Container className="grid grid-cols-1 items-center gap-14 py-16 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-28">
        <div className="flex flex-col gap-6">
          <p className="text-accent-300 m-0 text-sm font-semibold tracking-wide">Logiciel de gestion immobilière pour les agences</p>
          <h1 className="font-display m-0 text-4xl leading-[1.08] font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.6rem]">
            Vos biens, vos baux et vos loyers, <Highlight>enfin au même endroit.</Highlight>
          </h1>
          <p className="m-0 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            Dahoo remplace les cahiers, les fichiers Excel et les fils WhatsApp de votre agence : patrimoine, locataires, échéances,
            paiements Mobile Money, maintenance et annonces, partagés par toute l&apos;équipe selon le rôle de chacun.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="#demo" className="ax-btn ax-btn--primary ax-btn--lg">
              <span className="ax-btn__label">Demander une démo</span>
              <IconArrowRight className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
            </a>
            <Link href="/tarifs" className="ax-btn ax-btn--secondary ax-btn--lg border-white/35 text-white hover:bg-white/10 hover:text-white">
              <span className="ax-btn__label">Voir les tarifs</span>
            </Link>
          </div>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-sm text-white/80 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {REASSURANCE.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2">
                <Icon size={18} stroke={1.75} aria-hidden="true" className="text-accent-300 shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <Reveal delay={0.15}>
          <HeroMockup />
        </Reveal>
      </Container>
    </div>
  );
}

function Problems() {
  return (
    <Section labelledBy="probleme-titre">
      <Container className="flex flex-col gap-12">
        <Reveal>
          <SectionHeading id="probleme-titre" eyebrow="Ce que Dahoo change" title={<>Moins de relances, <Highlight>plus de visibilité</Highlight></>}>
            <p className="m-0">
              La gestion locative repose souvent sur des outils dispersés. Dahoo réunit chaque étape, du bail au dernier paiement,
              dans un espace partagé par toute l&apos;agence.
            </p>
          </SectionHeading>
        </Reveal>
        <ul className="m-0 grid list-none gap-5 p-0 md:grid-cols-2">
          {PROBLEMS.map(({ icon: Icon, title, before, after }, index) => (
            <Reveal as="li" key={title} delay={index * 0.08} className="bg-surface-solid border-border-default flex flex-col rounded-xl border">
              <div className="flex items-start gap-4 p-6 pb-5">
                <span className="bg-accent-wash text-accent-text flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                  <Icon size={24} stroke={1.5} aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-display text-text-strong m-0 text-lg font-semibold">{title}</h3>
                  <p className="text-text-muted m-0 text-sm leading-relaxed">{before}</p>
                </div>
              </div>
              <p className="border-border-default bg-surface-subtle text-text m-0 mt-auto flex items-start gap-2.5 rounded-b-xl border-t px-6 py-4 text-sm leading-relaxed">
                <IconCircleCheck size={20} stroke={1.75} aria-hidden="true" className="text-success mt-px shrink-0" />
                <span>
                  <b className="text-text-strong">Avec Dahoo :</b> {after}
                </span>
              </p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

function Modules() {
  return (
    <Section tone="subtle" id="modules" labelledBy="modules-titre" className="scroll-mt-20">
      <Container className="flex flex-col gap-12">
        <Reveal>
          <SectionHeading
            id="modules-titre"
            eyebrow="Les modules"
            align="center"
            title={
              <>
                Toute la gestion de l&apos;agence, <Highlight>un seul outil</Highlight>
              </>
            }
          >
            <p className="m-0">Six modules reliés entre eux, inclus dans toutes les offres.</p>
          </SectionHeading>
        </Reveal>
        <ul className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map(({ id, icon: Icon, title, text, points }, index) => (
            <Reveal
              as="li"
              key={id}
              delay={(index % 3) * 0.08}
              className="bg-surface-solid border-border-default group flex flex-col gap-4 rounded-xl border p-6 transition-shadow hover:shadow-[0_18px_40px_-28px_rgba(20,27,71,0.35)] sm:p-7"
            >
              <span className="bg-brand text-on-brand group-hover:bg-accent group-hover:text-on-accent flex h-12 w-12 items-center justify-center rounded-lg transition-colors">
                <Icon size={24} stroke={1.5} aria-hidden="true" />
              </span>
              <h3 className="font-display text-text-strong m-0 text-xl font-semibold">{title}</h3>
              <p className="text-text-muted m-0 text-sm leading-relaxed">{text}</p>
              <ul className="border-border-default m-0 mt-auto flex list-none flex-col gap-2 border-t p-0 pt-4">
                {points.map((point) => (
                  <li key={point} className="text-text flex items-start gap-2 text-sm">
                    <IconCircleCheck size={18} stroke={1.75} aria-hidden="true" className="text-accent-text mt-px shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {items.map((item) => (
        <li key={item} className="text-text flex items-start gap-3">
          <span className="bg-accent-wash text-accent-text mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
            <IconCircleCheck size={16} stroke={2} aria-hidden="true" />
          </span>
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Spotlights() {
  return (
    <Section>
      <Container className="flex flex-col gap-20 lg:gap-28">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="flex flex-col gap-6">
            <SectionHeading
              id="loyers-titre"
              eyebrow="Loyers et Mobile Money"
              title={
                <>
                  Chaque paiement, <Highlight>à la bonne échéance</Highlight>
                </>
              }
            >
              <p className="m-0">
                Vos locataires paient comme d&apos;habitude, par Wave, Orange Money, virement ou en espèces. Vous enregistrez le
                paiement dans Dahoo avec sa référence, puis vous l&apos;affectez à une ou plusieurs échéances.
              </p>
            </SectionHeading>
            <CheckList
              items={[
                "Impossible d'affecter plus que le montant reçu ou que le reste dû.",
                "Les échéances soldées passent en « payée », les autres restent à suivre.",
                "Les impayés se retrouvent en un filtre : échéances non payées avant une date.",
              ]}
            />
            <p className="border-accent bg-accent-wash text-text m-0 rounded-md border-l-4 px-4 py-3 text-sm leading-relaxed">
              Dahoo n&apos;encaisse pas vos loyers : l&apos;argent arrive directement sur vos comptes. Le logiciel sert à tenir une
              trace fiable de ce qui a été reçu.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <PaymentMockup />
          </Reveal>
        </div>

        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="flex flex-col gap-6 lg:order-2">
            <SectionHeading
              eyebrow="Maintenance"
              title={
                <>
                  Plus aucune panne <Highlight>oubliée</Highlight>
                </>
              }
            >
              <p className="m-0">
                Une fuite, une panne de climatisation, une serrure cassée : l&apos;incident devient un ticket rattaché au lot, que
                toute l&apos;équipe peut suivre jusqu&apos;à sa clôture.
              </p>
            </SectionHeading>
            <CheckList
              items={[
                "Priorité de basse à urgente, catégorie et description.",
                "Affectation à un membre de l'équipe, qui voit ce qu'il a à traiter.",
                "Journal des interventions horodaté, pour savoir qui a fait quoi et quand.",
              ]}
            />
          </Reveal>
          <Reveal delay={0.1} className="lg:order-1">
            <TicketMockup />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

function PortalBenefit({ stats }: { stats: Schema<"PublicStats"> | null }) {
  const cities = stats?.cities.slice(0, 3).map((city) => city.city) ?? [];
  const cityList = cities.length > 1 ? `${cities.slice(0, -1).join(", ")} et ${cities[cities.length - 1]}` : cities[0];

  return (
    <Section tone="brand" labelledBy="portail-titre" className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="bg-accent/20 absolute -right-32 -bottom-40 -z-10 h-[26rem] w-[26rem] rounded-full blur-3xl" />
      <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal className="flex flex-col gap-6">
          <SectionHeading
            id="portail-titre"
            invert
            eyebrow="Le portail Dahoo"
            title={
              <>
                Vos annonces devant <Highlight>ceux qui cherchent</Highlight>
              </>
            }
          >
            <p className="m-0">
              Dahoo, c&apos;est aussi un portail d&apos;annonces ouvert au grand public, où l&apos;on cherche un logement ou un local
              à louer ou à acheter. Les annonces publiées depuis votre espace y apparaissent avec leurs photos, et chaque demande de
              visite arrive dans votre espace agence avec les coordonnées du prospect.
            </p>
          </SectionHeading>
          <ul className="m-0 flex list-none flex-col gap-3 p-0 text-white/85">
            {[
              "Publication, suspension ou clôture de l'annonce depuis votre espace.",
              "Une page agence qui regroupe toutes vos annonces en ligne.",
              "Adresse exacte jamais affichée : seule une position approximative est publiée.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <IconCircleCheck size={20} stroke={1.75} aria-hidden="true" className="text-accent-300 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link href="/louer" className="ax-btn ax-btn--secondary ax-btn--lg border-white/35 text-white hover:bg-white/10 hover:text-white">
              <span className="ax-btn__label">Voir le portail</span>
              <IconArrowRight className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
            </Link>
            {stats && stats.listings_count > 0 && (
              <p className="m-0 text-sm text-white/75">
                En ce moment : <b className="text-white">{formatNumber(stats.listings_count)} annonces</b> en ligne
                {cityList ? ` à ${cityList}` : ""}.
              </p>
            )}
          </div>
        </Reveal>
        <Reveal delay={0.1} className="mx-auto w-full max-w-md lg:max-w-none">
          <PortalMockup />
        </Reveal>
      </Container>
    </Section>
  );
}

function HowItWorks() {
  return (
    <Section labelledBy="etapes-titre">
      <Container className="flex flex-col gap-12">
        <Reveal>
          <SectionHeading
            id="etapes-titre"
            eyebrow="Comment ça marche"
            align="center"
            title={
              <>
                Quatre étapes <Highlight>pour démarrer</Highlight>
              </>
            }
          >
            <p className="m-0">Pas de projet informatique : un navigateur, votre liste de biens et vos baux en cours suffisent.</p>
          </SectionHeading>
        </Reveal>
        <ol className="m-0 grid list-none gap-8 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {STEPS.map((step, index) => (
            <Reveal as="li" key={step.title} delay={index * 0.08} className="relative flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <span className="bg-accent text-on-accent font-display flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {index < STEPS.length - 1 && <span aria-hidden="true" className="bg-border-default hidden h-px flex-1 lg:block" />}
              </div>
              <h3 className="font-display text-text-strong m-0 text-lg font-semibold">{step.title}</h3>
              <p className="text-text-muted m-0 text-sm leading-relaxed">{step.text}</p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

function Security() {
  return (
    <Section tone="subtle" labelledBy="securite-titre">
      <Container className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div className="flex flex-col gap-8">
          <Reveal>
            <SectionHeading
              id="securite-titre"
              eyebrow="Sécurité et confidentialité"
              title={
                <>
                  Vos données restent <Highlight>les vôtres</Highlight>
                </>
              }
            />
          </Reveal>
          <ul className="m-0 flex list-none flex-col gap-6 p-0">
            {SECURITY.map(({ icon: Icon, title, text }, index) => (
              <Reveal as="li" key={title} delay={index * 0.08} className="flex items-start gap-4">
                <span className="bg-brand text-on-brand flex h-11 w-11 shrink-0 items-center justify-center rounded-lg">
                  <Icon size={22} stroke={1.5} aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="font-display text-text-strong m-0 text-lg font-semibold">{title}</h3>
                  <p className="text-text-muted m-0 text-sm leading-relaxed">{text}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal delay={0.1} className="self-center">
          <div className="bg-surface-solid border-border-default overflow-hidden rounded-xl border">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="border-border-default font-display text-text-strong border-b px-5 py-4 text-left text-lg font-semibold">
                Quatre rôles pour l&apos;équipe
              </caption>
              <thead className="sr-only">
                <tr>
                  <th scope="col">Rôle</th>
                  <th scope="col">Ce qu&apos;il permet</th>
                </tr>
              </thead>
              <tbody>
                {ROLES.map((item) => (
                  <tr key={item.role} className="border-border-default border-b last:border-b-0">
                    <th scope="row" className="text-text-strong w-36 px-5 py-4 align-top font-semibold sm:w-44">
                      {item.role}
                    </th>
                    <td className="text-text-muted py-4 pr-5 align-top leading-relaxed">{item.scope}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

function Questions() {
  return (
    <Section labelledBy="faq-titre">
      <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal className="flex flex-col gap-6">
          <SectionHeading
            id="faq-titre"
            eyebrow="Questions fréquentes"
            title={
              <>
                Vous avez une <Highlight>question ?</Highlight>
              </>
            }
          >
            <p className="m-0">Les réponses aux questions que se posent le plus souvent les agences avant de démarrer.</p>
          </SectionHeading>
          <div className="flex flex-wrap gap-3">
            <a href="#demo" className="ax-btn ax-btn--primary">
              <span className="ax-btn__label">Demander une démo</span>
            </a>
            <Link href="/contact" className="ax-btn ax-btn--secondary">
              <span className="ax-btn__label">Nous contacter</span>
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <Faq items={FAQ} name="faq-agences" />
        </Reveal>
      </Container>
    </Section>
  );
}

function DemoSection() {
  return (
    <Section tone="subtle" id="demo" labelledBy="demo-titre" className="scroll-mt-16">
      <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
        <div className="flex flex-col gap-8">
          <SectionHeading
            id="demo-titre"
            eyebrow="Démonstration"
            title={
              <>
                Voyez Dahoo avec <Highlight>vos propres cas</Highlight>
              </>
            }
          >
            <p className="m-0">
              Dites-nous qui vous êtes et combien de lots vous gérez : nous préparons une démonstration adaptée à votre agence.
            </p>
          </SectionHeading>
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-text-strong m-0 text-lg font-semibold">Ce qui se passe ensuite</h3>
            <ol className="m-0 flex list-none flex-col gap-4 p-0">
              {[
                "Un membre de l'équipe Dahoo vous rappelle pour convenir d'un créneau.",
                "Nous vous présentons l'outil sur des situations proches des vôtres.",
                "Si Dahoo vous convient, nous créons votre espace : 30 jours d'essai gratuit.",
              ].map((text, index) => (
                <li key={text} className="flex items-start gap-3">
                  <span className="bg-brand text-on-brand font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="text-text pt-1 leading-relaxed">{text}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="bg-surface-solid border-border-default rounded-xl border shadow-[0_30px_60px_-40px_rgba(20,27,71,0.45)]">
          <DemoForm />
        </div>
      </Container>
    </Section>
  );
}

export default async function ForAgenciesPage() {
  const stats = await getStats();
  return (
    <>
      <Hero />
      <Problems />
      <Modules />
      <Spotlights />
      <PortalBenefit stats={stats} />
      <HowItWorks />
      <Security />
      <Questions />
      <DemoSection />
    </>
  );
}
