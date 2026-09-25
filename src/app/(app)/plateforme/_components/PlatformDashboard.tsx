"use client";

import type { ApexOptions } from "apexcharts";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBuildingCommunity,
  IconCalendarDue,
  IconHomeSearch,
  IconInbox,
  IconPlus,
  IconRefresh,
  IconSparkles,
  IconWorld,
  type Icon,
} from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { CardEmpty, CardSkeleton, DashCard, MiniStat, PartitionBar, Swatch } from "@/components/app/analytics/cards";
import { ApexChart } from "@/components/app/charts/ApexChart";
import { PageHead } from "@/components/app/shell/PageHead";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import type { Schema } from "@/lib/api/types";
import { formatMoney, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

type Data = Schema<"PlatformDashboard">;
type Status = Schema<"TopAgency">["status"];

const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const monthLabel = (key: string) => MONTHS[Number(key.split("-")[1]) - 1];

const STATUS: Record<Status, { label: string; color: string; badge: string }> = {
  ACTIVE: { label: "Abonnées", color: "var(--ax-viz-emerald)", badge: "success" },
  TRIAL: { label: "En essai", color: "var(--ax-accent)", badge: "warning" },
  EXPIRED: { label: "Essai expiré", color: "var(--ax-viz-red)", badge: "danger" },
  SUSPENDED: { label: "Suspendues", color: "var(--ax-text-subtle)", badge: "neutral" },
};
const STATUS_SINGULAR: Record<Status, string> = { ACTIVE: "Abonnée", TRIAL: "En essai", EXPIRED: "Expirée", SUSPENDED: "Suspendue" };

const UNITS_RANGE: Record<string, string> = { "1-20": "1 à 20 lots", "21-100": "21 à 100 lots", "101-500": "101 à 500 lots", "500+": "500 lots et plus" };

function daysAgo(iso: string): string {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return days <= 0 ? "aujourd'hui" : days === 1 ? "hier" : `il y a ${days} j`;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

interface Alert {
  key: string;
  icon: Icon;
  tone: string;
  title: string;
  href: string;
}

function alerts(data: Data): Alert[] {
  const items: Alert[] = [];
  const { by_status: status } = data.agencies;
  if (data.trials_ending.length) {
    const first = data.trials_ending[0];
    items.push({
      key: "trials",
      icon: IconCalendarDue,
      tone: "bg-warning/15 text-warning",
      title: `${data.trials_ending.length} essai${data.trials_ending.length > 1 ? "s" : ""} se termine${data.trials_ending.length > 1 ? "nt" : ""} bientôt (${first.name} dans ${first.days_left} j)`,
      href: `/plateforme/agences/${first.id}`,
    });
  }
  if (data.demo_requests.pending) {
    items.push({
      key: "demos",
      icon: IconInbox,
      tone: "bg-info/10 text-info",
      title: `${data.demo_requests.pending} demande${data.demo_requests.pending > 1 ? "s" : ""} de démo à traiter`,
      href: "/plateforme/demandes",
    });
  }
  if (status.EXPIRED) {
    items.push({
      key: "expired",
      icon: IconAlertTriangle,
      tone: "bg-danger/10 text-danger",
      title: `${status.EXPIRED} agence${status.EXPIRED > 1 ? "s" : ""} en lecture seule (essai expiré)`,
      href: "/plateforme/agences",
    });
  }
  return items;
}

export function PlatformDashboard() {
  const [months, setMonths] = useState<6 | 12>(12);
  const query = useQuery({
    queryKey: ["platform-dashboard", months],
    queryFn: async () => unwrap(await api.GET("/api/v1/platform/dashboard/", { params: { query: { months } } })),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
  const data = query.data;

  const head = (
    <PageHead
      title="Vue d'ensemble"
      subtitle="Le parc d'agences clientes, les essais, les abonnements et l'activité du portail Dahoo."
      crumbs={[{ label: "Plateforme" }, { label: "Vue d'ensemble" }]}
      actions={
        <>
          <div className="ax-btn-group ax-btn-group--segmented" role="radiogroup" aria-label="Période des graphiques">
            {([6, 12] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={months === value}
                className={cn("ax-btn ax-btn--sm", months === value && "is-selected")}
                onClick={() => setMonths(value)}
              >
                {value} mois
              </button>
            ))}
          </div>
          <button
            type="button"
            className="ax-btn ax-btn--ghost ax-btn--icon"
            aria-label="Actualiser"
            onClick={() => void query.refetch()}
            disabled={query.isFetching}
          >
            <IconRefresh className={cn("ax-btn__icon", query.isFetching && "animate-spin")} stroke={1.75} aria-hidden="true" />
          </button>
          <Link href="/plateforme/agences?nouvelle=1" className="ax-btn ax-btn--primary">
            <IconPlus className="ax-btn__icon" stroke={2} aria-hidden="true" />
            <span className="ax-btn__label">Nouvelle agence</span>
          </Link>
        </>
      }
    />
  );

  if (query.isError) {
    return (
      <>
        {head}
        <div className="ax-alert ax-alert--danger" role="alert">
          <IconAlertTriangle className="ax-alert__icon" stroke={1.75} aria-hidden="true" />
          <div className="ax-alert__content">
            <p className="ax-alert__title">La vue d&apos;ensemble n&apos;a pas pu être chargée</p>
          </div>
          <div className="ax-alert__actions">
            <button type="button" className="ax-btn ax-btn--sm ax-btn--secondary" onClick={() => void query.refetch()}>
              <span className="ax-btn__label">Réessayer</span>
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        {head}
        <div className="ax-dash-grid" aria-busy="true">
          <CardSkeleton className="ax-col--5" height={220} />
          <CardSkeleton className="ax-col--7" height={220} />
          <CardSkeleton className="ax-col--8" height={280} />
          <CardSkeleton className="ax-col--4" height={280} />
        </div>
      </>
    );
  }

  const status = data.agencies.by_status;
  const mrr = Number(data.subscriptions.mrr);
  const items = alerts(data);

  return (
    <>
      {head}
      <div className={cn("ax-dash-grid transition-opacity", query.isFetching && "opacity-70")}>
        {items.length > 0 && (
          <ul className="ax-col--12 m-0 flex list-none snap-x gap-3 overflow-x-auto p-0 pb-1 md:flex-wrap md:overflow-visible md:pb-0" aria-label="À traiter">
            {items.map((item) => {
              const AlertIcon = item.icon;
              return (
                <li key={item.key} className="ax-card min-w-[260px] snap-start md:min-w-0 md:flex-[1_1_260px]">
                  <Link href={item.href} className="group flex h-full items-center gap-3 p-3.5 text-inherit no-underline">
                    <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", item.tone)}>
                      <AlertIcon size={20} stroke={1.75} aria-hidden="true" />
                    </span>
                    <span className="text-text-strong flex-1 text-sm font-medium">{item.title}</span>
                    <IconArrowRight size={16} stroke={1.75} aria-hidden="true" className="text-text-subtle transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {/* Revenu récurrent */}
        <section
          aria-labelledby="pf-mrr"
          className="ax-col--5 bg-brand-900 relative flex overflow-hidden rounded-(--ax-radius-xl) text-white shadow-(--ax-shadow-card) max-lg:col-span-12"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-[radial-gradient(circle,rgba(247,148,29,0.35),transparent_65%)]"
          />
          <div className="relative flex w-full flex-col gap-5 p-6">
            <div className="flex flex-col gap-1">
              <h2 id="pf-mrr" className="m-0 text-sm font-medium text-white/70">
                Revenu mensuel récurrent
              </h2>
              <p className="ax-num m-0 text-4xl leading-tight font-semibold tracking-tight">{formatMoney(mrr)}</p>
              <p className="m-0 text-sm text-white/70">
                {formatMoney(mrr * 12)} sur un an · {formatNumber(data.subscriptions.active)} abonnement
                {data.subscriptions.active > 1 ? "s" : ""} actif{data.subscriptions.active > 1 ? "s" : ""}
              </p>
            </div>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {data.subscriptions.by_plan.length ? (
                data.subscriptions.by_plan.map((plan) => (
                  <li key={plan.plan} className="flex items-center gap-3 rounded-xl bg-white/8 px-3 py-2.5 text-sm">
                    <span className="flex-1 font-medium">{plan.plan}</span>
                    <span className="text-white/70">
                      {plan.count} agence{plan.count > 1 ? "s" : ""}
                    </span>
                    <span className="ax-num font-semibold">{formatMoney(plan.mrr)}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-white/70">Aucun abonnement actif pour le moment.</li>
              )}
            </ul>
            <div className="mt-auto flex flex-col gap-2">
              <span className="text-xs text-white/70">Conversion des agences</span>
              <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-white/10">
                {(Object.keys(STATUS) as Status[])
                  .filter((key) => status[key] > 0)
                  .map((key) => (
                    <span key={key} className="h-full" style={{ width: `${(status[key] / Math.max(1, data.agencies.total)) * 100}%`, background: STATUS[key].color }} />
                  ))}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/75">
                {(Object.keys(STATUS) as Status[]).map((key) => (
                  <span key={key} className="flex items-center gap-1.5">
                    <Swatch color={STATUS[key].color} /> {STATUS[key].label} {status[key]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Indicateurs */}
        <div className="ax-col--7 grid gap-4 sm:grid-cols-2 md:gap-6 max-lg:col-span-12">
          {[
            {
              icon: IconBuildingCommunity,
              tone: 1,
              label: "Agences clientes",
              value: formatNumber(data.agencies.total),
              caption: `${formatNumber(data.agencies.members)} utilisateurs actifs · ${formatNumber(data.agencies.cities)} villes`,
              href: "/plateforme/agences",
            },
            {
              icon: IconCalendarDue,
              tone: 4,
              label: "En période d'essai",
              value: formatNumber(status.TRIAL),
              caption: data.trials_ending.length
                ? `${data.trials_ending.length} se termine${data.trials_ending.length > 1 ? "nt" : ""} dans les 14 jours`
                : "Aucun essai ne se termine dans les 14 jours",
              href: "/plateforme/agences",
            },
            {
              icon: IconInbox,
              tone: 2,
              label: "Démos à traiter",
              value: formatNumber(data.demo_requests.pending),
              caption: `${formatNumber(data.demo_requests.last_30d)} reçues en 30 jours · ${formatNumber(data.demo_requests.total)} au total`,
              href: "/plateforme/demandes",
            },
            {
              icon: IconWorld,
              tone: 3,
              label: "Annonces sur le portail",
              value: formatNumber(data.portal.listings_published),
              caption: `${formatNumber(data.portal.interests_30d)} demandes de visite en 30 jours`,
              href: "/louer",
            },
          ].map((kpi) => {
            const KpiIcon = kpi.icon;
            return (
              <div key={kpi.label} className="ax-card ax-kpi ax-card--interactive">
                <Link href={kpi.href} className="flex h-full flex-col gap-3 p-5 text-inherit no-underline">
                  <span className="flex items-center gap-3">
                    <span className={`ax-kpi__icon ax-kpi__icon--c${kpi.tone}`}>
                      <KpiIcon stroke={1.75} aria-hidden="true" />
                    </span>
                    <span className="text-text-muted text-sm font-medium">{kpi.label}</span>
                  </span>
                  <span className="ax-num text-text-strong text-[1.65rem] leading-tight font-semibold tracking-tight">{kpi.value}</span>
                  <span className="text-text-muted mt-auto text-xs leading-relaxed">{kpi.caption}</span>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Croissance */}
        <DashCard
          labelledBy="pf-croissance"
          className="ax-col--8"
          eyebrow="Croissance"
          title="Inscriptions et demandes de démo"
          subtitle={`Nouvelles agences clientes et demandes reçues chaque mois, sur ${months} mois.`}
        >
          <div className="mb-3 flex flex-wrap items-center gap-4 text-xs">
            <span className="text-text-muted flex items-center gap-2">
              <Swatch color="var(--ax-brand)" /> Agences inscrites
            </span>
            <span className="text-text-muted flex items-center gap-2">
              <Swatch color="var(--ax-accent)" /> Demandes de démo
            </span>
          </div>
          <ApexChart
            type="bar"
            height={280}
            legend="none"
            ariaLabel="Agences inscrites et demandes de démo reçues chaque mois"
            colors={["--ax-brand", "--ax-accent"]}
            series={[
              { name: "Agences inscrites", data: data.monthly.map((m) => m.signups) },
              { name: "Demandes de démo", data: data.monthly.map((m) => m.demo_requests) },
            ]}
            apex={
              {
                plotOptions: { bar: { borderRadius: 4, columnWidth: "55%" } },
                xaxis: { categories: data.monthly.map((m) => monthLabel(m.month)) },
                yaxis: { min: 0, tickAmount: 4, labels: { formatter: (value: number) => formatNumber(Math.round(value)) } },
                tooltip: { shared: true, intersect: false },
              } as ApexOptions
            }
          />
        </DashCard>

        {/* Réseau */}
        <DashCard labelledBy="pf-reseau" className="ax-col--4" eyebrow="Réseau Dahoo" title="Activité des agences" subtitle="Sur les 30 derniers jours.">
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <MiniStat label="Lots gérés" value={formatNumber(data.portal.units_managed)} />
              <MiniStat label="Paiements saisis" value={formatNumber(data.portal.payments_30d_count)} />
              <MiniStat label="Volume encaissé" value={formatMoney(data.portal.payments_30d_amount)} />
              <MiniStat label="Demandes de visite" value={formatNumber(data.portal.interests_30d)} />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-text-subtle text-[0.7rem] font-semibold tracking-[0.06em] uppercase">Annonces publiées</span>
              <PartitionBar
                segments={[
                  { label: "À louer", value: data.portal.listings_rent, color: "var(--ax-brand)" },
                  { label: "À vendre", value: data.portal.listings_sale, color: "var(--ax-accent)" },
                ]}
              />
            </div>
          </div>
        </DashCard>

        {/* Essais */}
        <DashCard labelledBy="pf-essais" className="ax-col--4" eyebrow="14 prochains jours" title="Essais à convertir" href="/plateforme/agences">
          {data.trials_ending.length ? (
            <ul className="ax-list ax-list--linked m-0 list-none p-0">
              {data.trials_ending.map((trial) => (
                <li key={trial.id}>
                  <Link href={`/plateforme/agences/${trial.id}`} className="ax-list__row">
                    <span className="ax-avatar ax-avatar--sm ax-avatar--squircle bg-accent-wash text-accent-text">
                      <span className="ax-avatar__initials">{initials(trial.name)}</span>
                    </span>
                    <span className="ax-list__content">
                      <span className="ax-list__title">{trial.name}</span>
                      <span className="ax-list__meta">
                        {trial.city || "Ville non renseignée"} · {trial.members} membre{trial.members > 1 ? "s" : ""} · {trial.listings} annonce
                        {trial.listings > 1 ? "s" : ""}
                      </span>
                    </span>
                    <span className={cn("ax-badge ax-badge--soft shrink-0", trial.days_left <= 5 ? "ax-badge--danger" : "ax-badge--warning")}>
                      {trial.days_left}&nbsp;j
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <CardEmpty icon={IconSparkles}>Aucun essai ne se termine dans les 14 prochains jours.</CardEmpty>
          )}
        </DashCard>

        {/* Démos */}
        <DashCard labelledBy="pf-demos" className="ax-col--4" eyebrow="À rappeler" title="Demandes de démo" href="/plateforme/demandes">
          {data.demo_requests.recent_pending.length ? (
            <ul className="ax-list ax-list--linked m-0 list-none p-0">
              {data.demo_requests.recent_pending.map((demo) => (
                <li key={demo.id}>
                  <Link href="/plateforme/demandes" className="ax-list__row">
                    <span className="ax-avatar ax-avatar--sm ax-avatar--squircle bg-info/10 text-info">
                      <span className="ax-avatar__initials">{initials(demo.agency_name)}</span>
                    </span>
                    <span className="ax-list__content">
                      <span className="ax-list__title">{demo.agency_name}</span>
                      <span className="ax-list__meta">
                        {demo.contact_name}
                        {demo.city && ` · ${demo.city}`} · {UNITS_RANGE[demo.units_range] ?? demo.units_range}
                      </span>
                    </span>
                    <span className="text-text-subtle shrink-0 text-xs">{daysAgo(demo.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <CardEmpty icon={IconInbox}>Toutes les demandes de démo ont été traitées.</CardEmpty>
          )}
        </DashCard>

        {/* Agences les plus actives */}
        <DashCard labelledBy="pf-top" className="ax-col--4" eyebrow="Classement" title="Agences les plus actives" href="/plateforme/agences">
          {data.top_agencies.length ? (
            <ul className="ax-list ax-list--linked m-0 list-none p-0">
              {data.top_agencies.map((agency, index) => (
                <li key={agency.id}>
                  <Link href={`/plateforme/agences/${agency.id}`} className="ax-list__row">
                    <span className="ax-num text-text-subtle w-4 shrink-0 text-xs">{index + 1}</span>
                    {agency.logo ? (
                      <Image src={agency.logo} alt="" width={36} height={36} className="size-9 shrink-0 rounded-xl object-cover" />
                    ) : (
                      <span className="ax-avatar ax-avatar--sm ax-avatar--squircle bg-brand-50 text-brand">
                        <span className="ax-avatar__initials">{initials(agency.name)}</span>
                      </span>
                    )}
                    <span className="ax-list__content">
                      <span className="ax-list__title">{agency.name}</span>
                      <span className="ax-list__meta">
                        {agency.listings} annonce{agency.listings > 1 ? "s" : ""} · {agency.units} lot{agency.units > 1 ? "s" : ""}
                      </span>
                    </span>
                    <span className={`ax-badge ax-badge--soft ax-badge--${STATUS[agency.status].badge} shrink-0`}>
                      {STATUS_SINGULAR[agency.status]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <CardEmpty icon={IconHomeSearch}>Aucune agence cliente pour le moment.</CardEmpty>
          )}
        </DashCard>
      </div>
    </>
  );
}
