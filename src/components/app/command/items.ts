"use client";

import {
  IconBell,
  IconBuildingCommunity,
  IconBuildingEstate,
  IconCash,
  IconDoor,
  IconFileText,
  IconMoon,
  IconPalette,
  IconPlus,
  IconSpeakerphone,
  IconSun,
  IconTool,
  IconUser,
  IconUserPlus,
  IconWorld,
  type Icon,
} from "@tabler/icons-react";

import { NAVIGATION } from "@/components/app/navigation";
import type { Schema } from "@/lib/api/types";

export type SearchResult = Schema<"SearchResult">;

export interface CommandItem {
  id: string;
  group: string;
  title: string;
  subtitle?: string;
  icon: Icon;
  /** Mots-clés supplémentaires pour la recherche (non affichés). */
  keywords?: string;
  href?: string;
  run?: () => void;
}

/** Minuscules sans accents : « Échéances » se trouve en tapant « echeance ». */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/**
 * Chaque mot saisi doit apparaître (titre, sous-titre ou mots-clés). `strong` : le titre contient la
 * saisie (affiché avant les données de l'agence) ; `weak` : trouvé seulement par les mots-clés.
 */
export function matchItems(items: CommandItem[], query: string): { strong: CommandItem[]; weak: CommandItem[] } {
  const q = normalize(query.trim());
  if (!q) return { strong: items, weak: [] };
  const terms = q.split(/\s+/);
  const scored = items
    .map((item) => {
      const title = normalize(item.title);
      const haystack = `${title} ${normalize(item.subtitle ?? "")} ${normalize(item.keywords ?? "")}`;
      if (!terms.every((term) => haystack.includes(term))) return null;
      return { item, score: title.startsWith(q) ? 0 : title.includes(q) ? 1 : 2 };
    })
    .filter((row): row is { item: CommandItem; score: number } => row !== null)
    .sort((a, b) => a.score - b.score);
  return {
    strong: scored.filter((row) => row.score < 2).map((row) => row.item),
    weak: scored.filter((row) => row.score === 2).map((row) => row.item),
  };
}

interface Context {
  can: (capability: string) => boolean;
  isPlatformAdmin: boolean;
  hasAgency: boolean;
  isReadOnly: boolean;
  dark: boolean;
  toggleTheme: () => void;
  openCustomizer: () => void;
}

const PAGE_KEYWORDS: Record<string, string> = {
  "/espace": "accueil tableau de bord statistiques analytics",
  "/espace/biens": "patrimoine immeubles villas lots appartements",
  "/espace/locataires": "clients occupants",
  "/espace/baux": "contrats location",
  "/espace/echeances": "loyers retards impayes calendrier",
  "/espace/paiements": "encaissements wave orange money virement especes",
  "/espace/maintenance": "tickets incidents pannes interventions",
  "/espace/annonces": "portail publication visites prospects",
  "/espace/equipe": "membres utilisateurs roles",
  "/espace/agence": "coordonnees abonnement apparence logo",
};

export function pageItems({ can, isPlatformAdmin, hasAgency }: Context): CommandItem[] {
  const pages = NAVIGATION.filter((section) => (section.platformOnly ? isPlatformAdmin : hasAgency)).flatMap(
    (section) =>
      section.items
        .filter((item) => !item.capability || can(item.capability))
        .map((item) => ({
          id: `page:${item.href}`,
          group: "Pages",
          title: item.label,
          subtitle: section.title,
          icon: item.icon,
          keywords: PAGE_KEYWORDS[item.href],
          href: item.href,
        })),
  );
  const notifications = hasAgency ? "/espace/notifications" : "/plateforme/notifications";
  return [
    ...pages,
    {
      id: "page:notifications",
      group: "Pages",
      title: "Notifications",
      icon: IconBell,
      keywords: "alertes rappels",
      href: notifications,
    },
  ];
}

export function actionItems(context: Context): CommandItem[] {
  const { can, isPlatformAdmin, hasAgency, isReadOnly, dark } = context;
  const creations: (CommandItem & { capability: string })[] = [
    {
      id: "new:payment",
      title: "Enregistrer un paiement",
      icon: IconCash,
      capability: "payment.create",
      keywords: "encaisser wave orange money",
      href: "/espace/paiements?nouveau=1",
      group: "",
    },
    {
      id: "new:property",
      title: "Ajouter un bien",
      icon: IconBuildingEstate,
      capability: "property.create",
      keywords: "immeuble villa creer",
      href: "/espace/biens?nouveau=1",
      group: "",
    },
    {
      id: "new:tenant",
      title: "Ajouter un locataire",
      icon: IconUserPlus,
      capability: "tenant.create",
      keywords: "client creer",
      href: "/espace/locataires?nouveau=1",
      group: "",
    },
    {
      id: "new:lease",
      title: "Nouveau bail",
      icon: IconFileText,
      capability: "lease.create",
      keywords: "contrat location creer",
      href: "/espace/baux?nouveau=1",
      group: "",
    },
    {
      id: "new:ticket",
      title: "Signaler un incident",
      icon: IconTool,
      capability: "maintenance.ticket.create",
      keywords: "ticket maintenance panne creer",
      href: "/espace/maintenance?nouveau=1",
      group: "",
    },
    {
      id: "new:listing",
      title: "Créer une annonce",
      icon: IconSpeakerphone,
      capability: "listing.create",
      keywords: "publier portail",
      href: "/espace/annonces?nouveau=1",
      group: "",
    },
  ];
  const items: CommandItem[] =
    hasAgency && !isReadOnly
      ? creations.filter((item) => can(item.capability)).map((item) => ({ ...item, group: "Actions" }))
      : [];
  if (isPlatformAdmin) {
    items.push({
      id: "new:agency",
      group: "Actions",
      title: "Créer une agence",
      icon: IconBuildingCommunity,
      keywords: "client essai",
      href: "/plateforme/agences?nouvelle=1",
    });
  }
  items.push(
    {
      id: "ui:theme",
      group: "Actions",
      title: dark ? "Passer en mode clair" : "Passer en mode sombre",
      icon: dark ? IconSun : IconMoon,
      keywords: "theme couleurs nuit",
      run: context.toggleTheme,
    },
    {
      id: "ui:customizer",
      group: "Actions",
      title: "Personnaliser l'apparence",
      icon: IconPalette,
      keywords: "theme couleur accent barre laterale",
      run: context.openCustomizer,
    },
    {
      id: "site",
      group: "Actions",
      title: "Voir le site public",
      icon: IconWorld,
      keywords: "portail vitrine annonces",
      href: "/",
    },
  );
  return items;
}

const RESULT_META: Record<SearchResult["type"], { group: string; icon: Icon }> = {
  property: { group: "Biens", icon: IconBuildingEstate },
  unit: { group: "Lots", icon: IconDoor },
  tenant: { group: "Locataires", icon: IconUser },
  lease: { group: "Baux", icon: IconFileText },
  listing: { group: "Annonces", icon: IconSpeakerphone },
  ticket: { group: "Maintenance", icon: IconTool },
};

export function resultItems(results: SearchResult[]): CommandItem[] {
  return results.map((result) => ({
    id: `${result.type}:${result.id}`,
    group: RESULT_META[result.type].group,
    title: result.title,
    subtitle: result.subtitle,
    icon: RESULT_META[result.type].icon,
    href: result.link,
  }));
}

/* ── Récemment ouverts (ce navigateur) ── */

const RECENT_KEY = "dahoo:command-recent";
const RECENT_MAX = 5;
type RecentEntry = Pick<CommandItem, "id" | "title" | "subtitle" | "href"> & { kind: SearchResult["type"] | "page" };

export function readRecent(): RecentEntry[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(value) ? (value as RecentEntry[]).slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
}

export function rememberRecent(item: CommandItem): void {
  const id = item.id.replace(/^recent:/, "");
  if (!item.href || id.startsWith("new:") || id === "site") return;
  const [prefix] = id.split(":");
  const kind = (prefix in RESULT_META ? prefix : "page") as RecentEntry["kind"];
  const entry: RecentEntry = { id, title: item.title, subtitle: item.subtitle, href: item.href, kind };
  try {
    const next = [entry, ...readRecent().filter((recent) => recent.id !== entry.id)].slice(0, RECENT_MAX);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // Historique non mémorisé : sans conséquence.
  }
}

/** Les pages devenues inaccessibles (changement de rôle) sont écartées. */
export function recentItems(entries: RecentEntry[], pages: CommandItem[]): CommandItem[] {
  return entries.flatMap((entry) => {
    const page = pages.find((item) => item.id === entry.id);
    if (entry.kind === "page" && !page) return [];
    const icon = page?.icon ?? (entry.kind === "page" ? IconPlus : RESULT_META[entry.kind].icon);
    return [{ ...entry, id: `recent:${entry.id}`, group: "Récemment ouverts", icon }];
  });
}
