import {
  IconBuildingCommunity,
  IconChartPie,
  IconBuildingEstate,
  IconCalendarDollar,
  IconCreditCard,
  IconFileText,
  IconInbox,
  IconLayoutDashboard,
  IconSpeakerphone,
  IconTool,
  IconUserCog,
  IconUsers,
  IconUsersGroup,
  type Icon,
} from "@tabler/icons-react";

export interface NavItem {
  label: string;
  href: string;
  icon: Icon;
  /** Capability requise pour voir l'entrée (voir access/catalog.py côté API). */
  capability?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
  /** Section réservée aux administrateurs de la plateforme Dahoo. */
  platformOnly?: boolean;
}

export const NAVIGATION: NavSection[] = [
  {
    title: "Pilotage",
    items: [{ label: "Tableau de bord", href: "/espace", icon: IconLayoutDashboard }],
  },
  {
    title: "Patrimoine",
    items: [{ label: "Biens", href: "/espace/biens", icon: IconBuildingEstate, capability: "property.view" }],
  },
  {
    title: "Gestion locative",
    items: [
      { label: "Locataires", href: "/espace/locataires", icon: IconUsers, capability: "tenant.view" },
      { label: "Baux", href: "/espace/baux", icon: IconFileText, capability: "lease.view" },
      { label: "Échéances", href: "/espace/echeances", icon: IconCalendarDollar, capability: "payment.schedule.view" },
      { label: "Paiements", href: "/espace/paiements", icon: IconCreditCard, capability: "payment.view" },
    ],
  },
  {
    title: "Opérations",
    items: [
      { label: "Maintenance", href: "/espace/maintenance", icon: IconTool, capability: "maintenance.ticket.view" },
      { label: "Annonces", href: "/espace/annonces", icon: IconSpeakerphone, capability: "listing.view" },
    ],
  },
  {
    title: "Organisation",
    items: [
      { label: "Équipe", href: "/espace/equipe", icon: IconUsersGroup, capability: "member.view" },
      { label: "Mon agence", href: "/espace/agence", icon: IconUserCog, capability: "organization.view" },
    ],
  },
  {
    title: "Plateforme Dahoo",
    platformOnly: true,
    items: [
      { label: "Vue d'ensemble", href: "/plateforme", icon: IconChartPie },
      { label: "Agences clientes", href: "/plateforme/agences", icon: IconBuildingCommunity },
      { label: "Demandes de démo", href: "/plateforme/demandes", icon: IconInbox },
    ],
  },
];

/** Entrée active : la plus longue correspondance de préfixe (évite que /espace reste actif partout). */
export function activeHref(pathname: string, sections: NavSection[]): string | undefined {
  let best: string | undefined;
  for (const section of sections) {
    for (const item of section.items) {
      const matches = pathname === item.href || pathname.startsWith(`${item.href}/`);
      if (matches && (!best || item.href.length > best.length)) best = item.href;
    }
  }
  return best;
}
