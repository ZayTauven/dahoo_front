import {
  IconBrandFacebook,
  IconBrandWhatsapp,
  IconCash,
  IconFileText,
  IconHomeSearch,
  IconSparkles,
  IconTool,
  IconUser,
  IconWorld,
  type Icon,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

import { StatusBadge } from "@/components/app/ui/StatusBadge";
import { formatMoney } from "@/lib/format";
import { TICKET_PRIORITY } from "@/lib/labels";
import { cn } from "@/lib/utils";

import { METHOD_LOGOS, methodColor } from "./charts";
import { dayAndMonth, daysFromToday, relativeDays, toNumber, type Finance, type LeasesSummary, type Listings, type Maintenance } from "./format";
import { CardEmpty } from "@/components/app/analytics/cards";

/** Bloc date « 05 / sept. » en tête de ligne. */
function DateBlock({ iso, tone = "neutral" }: { iso: string; tone?: "neutral" | "danger" | "accent" }) {
  const { day, month } = dayAndMonth(iso);
  return (
    <span
      className={cn(
        "flex size-11 shrink-0 flex-col items-center justify-center rounded-xl leading-none",
        tone === "danger" && "bg-danger/10 text-danger",
        tone === "accent" && "bg-accent-wash text-accent-text",
        tone === "neutral" && "bg-surface-subtle text-text-strong",
      )}
    >
      <span className="ax-num text-base font-semibold">{day}</span>
      <span className="text-[0.62rem] uppercase opacity-80">{month}</span>
    </span>
  );
}

/** Échéances en retard, les plus anciennes d'abord. */
export function LateList({ finance }: { finance: Finance }) {
  if (finance.late.length === 0) {
    return <CardEmpty icon={IconSparkles}>Aucun impayé : tous les loyers échus sont réglés.</CardEmpty>;
  }
  return (
    <ul className="ax-list ax-list--linked m-0 list-none p-0">
      {finance.late.map((row) => (
        <li key={row.id}>
          <Link href={row.lease_id ? `/espace/baux/${row.lease_id}` : "/espace/echeances?etat=retard"} className="ax-list__row">
            <DateBlock iso={row.due_date} tone="danger" />
            <span className="ax-list__content">
              <span className="ax-list__title">{row.tenant || "Locataire"}</span>
              <span className="ax-list__meta">
                Lot {row.unit} · en retard de {row.days_late}&nbsp;j
              </span>
            </span>
            <span className="ax-num text-danger shrink-0 text-sm font-semibold">{formatMoney(row.remaining)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Échéances des 30 prochains jours. */
export function UpcomingList({ finance }: { finance: Finance }) {
  if (finance.upcoming.length === 0) {
    return <CardEmpty icon={IconCash}>Aucune échéance dans les 30 prochains jours.</CardEmpty>;
  }
  return (
    <ul className="ax-list ax-list--linked m-0 list-none p-0">
      {finance.upcoming.map((row) => {
        const days = daysFromToday(row.due_date);
        return (
          <li key={row.id}>
            <Link href={row.lease_id ? `/espace/baux/${row.lease_id}` : "/espace/echeances?etat=a_venir"} className="ax-list__row">
              <DateBlock iso={row.due_date} tone={days <= 7 ? "accent" : "neutral"} />
              <span className="ax-list__content">
                <span className="ax-list__title">{row.tenant || "Locataire"}</span>
                <span className="ax-list__meta">
                  Lot {row.unit} · {relativeDays(days)}
                </span>
              </span>
              <span className="ax-num text-text-strong shrink-0 text-sm font-semibold">{formatMoney(row.remaining)}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Tickets ouverts, les plus prioritaires d'abord. */
export function OpenTicketsList({ maintenance }: { maintenance: Maintenance }) {
  if (maintenance.recent_open.length === 0) {
    return <CardEmpty icon={IconTool}>Aucun ticket ouvert : le parc est au calme.</CardEmpty>;
  }
  return (
    <ul className="ax-list ax-list--linked m-0 list-none p-0">
      {maintenance.recent_open.map((ticket) => (
        <li key={ticket.id}>
          <Link href={`/espace/maintenance/${ticket.id}`} className="ax-list__row items-start">
            <span
              aria-hidden="true"
              className={cn(
                "mt-1.5 size-2.5 shrink-0 rounded-full",
                ticket.priority === "URGENT" ? "bg-danger" : ticket.priority === "HIGH" ? "bg-warning" : "bg-text-subtle",
              )}
            />
            <span className="ax-list__content">
              <span className="ax-list__title line-clamp-2 whitespace-normal">{ticket.description}</span>
              <span className="ax-list__meta">
                Lot {ticket.unit}
                {ticket.category && ` · ${ticket.category}`} · {ticket.age_days === 0 ? "aujourd'hui" : `il y a ${ticket.age_days} j`}
              </span>
            </span>
            <span className="shrink-0">
              <StatusBadge entries={TICKET_PRIORITY} value={ticket.priority} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

const SOURCES: Record<string, { label: string; icon: Icon }> = {
  site: { label: "Portail Dahoo", icon: IconWorld },
  whatsapp: { label: "WhatsApp", icon: IconBrandWhatsapp },
  facebook: { label: "Facebook", icon: IconBrandFacebook },
  agent: { label: "Agent", icon: IconUser },
};

/** Dernières demandes de visite (prospects). */
export function InterestsList({ listings }: { listings: Listings }) {
  if (listings.recent_interests.length === 0) {
    return <CardEmpty icon={IconHomeSearch}>Aucune demande de visite pour le moment.</CardEmpty>;
  }
  return (
    <ul className="ax-list ax-list--linked m-0 list-none p-0">
      {listings.recent_interests.map((interest) => {
        const source = SOURCES[interest.source] ?? { label: interest.source, icon: IconUser };
        const SourceIcon = source.icon;
        return (
          <li key={interest.id}>
            <Link href={`/espace/annonces/${interest.listing_id}`} className="ax-list__row">
              <span className="ax-avatar ax-avatar--sm ax-avatar--squircle bg-accent-wash text-accent-text">
                <span className="ax-avatar__initials">
                  {interest.prospect
                    .split(" ")
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")}
                </span>
              </span>
              <span className="ax-list__content">
                <span className="ax-list__title">{interest.prospect}</span>
                <span className="ax-list__meta truncate">{interest.listing}</span>
              </span>
              <span className="text-text-subtle flex shrink-0 flex-col items-end gap-0.5 text-xs">
                <span className="flex items-center gap-1">
                  <SourceIcon size={14} stroke={1.75} aria-hidden="true" />
                  {source.label}
                </span>
                <span>{relativeDays(daysFromToday(interest.created_at))}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Annonces qui attirent le plus de demandes, avec leur photo. */
export function TopListings({ listings }: { listings: Listings }) {
  const max = Math.max(...listings.top_listings.map((l) => l.interests), 1);
  return (
    <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
      {listings.top_listings.slice(0, 4).map((listing) => (
        <li key={listing.id} className="min-w-0">
          <Link
            href={`/espace/annonces/${listing.id}`}
            className="border-border-default hover:bg-(--ax-fill-hover) group flex items-center gap-3 rounded-xl border p-2 no-underline transition-colors"
          >
            <span className="bg-surface-subtle relative size-14 shrink-0 overflow-hidden rounded-lg">
              {listing.cover && <Image src={listing.cover} alt="" fill sizes="56px" className="object-cover" />}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="text-text-strong truncate text-sm font-medium">{listing.title}</span>
              <span className="flex items-center gap-2">
                <span className="bg-surface-subtle h-1.5 flex-1 overflow-hidden rounded-full">
                  <span className="bg-accent block h-full rounded-full" style={{ width: `${(listing.interests / max) * 100}%` }} />
                </span>
                <span className="ax-num text-text-muted text-xs">{listing.interests}</span>
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Baux arrivant à échéance dans les 90 jours. */
export function EndingLeasesList({ leases }: { leases: LeasesSummary }) {
  if (leases.ending_soon.length === 0) {
    return <CardEmpty icon={IconFileText}>Aucun bail n&apos;arrive à échéance dans les 90 prochains jours.</CardEmpty>;
  }
  return (
    <ul className="ax-list ax-list--linked m-0 list-none p-0">
      {leases.ending_soon.map((lease) => (
        <li key={lease.id}>
          <Link href={`/espace/baux/${lease.id}`} className="ax-list__row">
            <DateBlock iso={lease.end_date} tone={lease.days_left <= 45 ? "accent" : "neutral"} />
            <span className="ax-list__content">
              <span className="ax-list__title">{lease.tenant}</span>
              <span className="ax-list__meta">Lot {lease.unit}</span>
            </span>
            <span className="ax-badge ax-badge--soft ax-badge--warning shrink-0">dans {lease.days_left}&nbsp;j</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Derniers paiements enregistrés. */
export function RecentPaymentsList({ finance }: { finance: Finance }) {
  if (finance.recent_payments.length === 0) {
    return <CardEmpty icon={IconCash}>Aucun paiement enregistré.</CardEmpty>;
  }
  return (
    <ul className="ax-list m-0 list-none p-0">
      {finance.recent_payments.map((payment, index) => {
        const logo = METHOD_LOGOS[payment.method_code];
        return (
          <li key={payment.id} className="ax-list__row">
            <span
              className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-semibold text-white"
              style={{ background: logo ? "white" : methodColor(payment.method_code, index) }}
            >
              {logo ? <Image src={logo} alt="" width={36} height={36} className="size-9 object-cover" /> : payment.method.slice(0, 2)}
            </span>
            <span className="ax-list__content">
              <span className="ax-list__title">{payment.payer || "Payeur"}</span>
              <span className="ax-list__meta">
                {payment.method} · {relativeDays(daysFromToday(payment.date))}
              </span>
            </span>
            <span className="ax-num text-success shrink-0 text-sm font-semibold">+{formatMoney(toNumber(payment.amount))}</span>
          </li>
        );
      })}
    </ul>
  );
}
