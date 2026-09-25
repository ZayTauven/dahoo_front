"use client";

import {
  IconAlertTriangle,
  IconArrowRight,
  IconCalendarDue,
  IconCash,
  IconChartBar,
  IconCircleCheck,
  IconHomeSearch,
  IconInfoCircle,
  IconPlus,
  IconRefresh,
  IconTool,
  type Icon,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { useDashboard } from "@/components/app/analytics/useDashboard";
import { PageHead } from "@/components/app/shell/PageHead";
import { useSession } from "@/lib/auth/useSession";
import { formatMoney, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

import {
  CashflowChart,
  InterestsChart,
  MaintenanceChart,
  METHOD_LOGOS,
  MethodsDonut,
  methodColor,
  MonthBars,
  PartitionBar,
  RateRing,
  Sparkline,
} from "./charts";
import { compactMoney, delta, monthLong, percent, todayLabel, toNumber, type Dashboard, type Insight } from "./format";
import {
  EndingLeasesList,
  InterestsList,
  LateList,
  OpenTicketsList,
  RecentPaymentsList,
  TopListings,
  UpcomingList,
} from "./lists";
import { GettingStarted } from "./GettingStarted";
import { CardEmpty, CardSkeleton, DashCard, DeltaChip, MiniStat, Swatch } from "@/components/app/analytics/cards";

type Months = 6 | 12;

function greeting(): string {
  const hour = new Date().getHours();
  return hour < 18 ? "Bonjour" : "Bonsoir";
}

const SEVERITY: Record<Insight["severity"], { icon: Icon; className: string }> = {
  danger: { icon: IconAlertTriangle, className: "bg-danger/10 text-danger" },
  warning: { icon: IconCalendarDue, className: "bg-warning/15 text-warning" },
  info: { icon: IconInfoCircle, className: "bg-info/10 text-info" },
  success: { icon: IconCircleCheck, className: "bg-success/10 text-success" },
};

/** Bandeau « À traiter » : les alertes calculées par l'API, chacune menant à l'écran concerné. */
function Insights({ items }: { items: Insight[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="tdb-alertes" className="ax-col--12">
      <h2 id="tdb-alertes" className="sr-only">
        À traiter
      </h2>
      <ul className="m-0 flex list-none snap-x gap-3 overflow-x-auto p-0 pb-1 [scrollbar-width:thin] md:flex-wrap md:overflow-visible md:pb-0">
        {items.map((item) => {
          const tone = SEVERITY[item.severity];
          const ToneIcon = tone.icon;
          return (
            <li key={item.kind} className="ax-card min-w-[250px] snap-start transition-transform hover:-translate-y-0.5 md:min-w-0 md:flex-[1_1_260px]">
              <Link href={item.href} className="group flex h-full items-center gap-3 p-3.5 text-inherit no-underline">
                <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", tone.className)}>
                  <ToneIcon size={20} stroke={1.75} aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-text-strong text-sm leading-snug font-medium">{item.title}</span>
                  {item.amount !== null && <span className="ax-num text-text-muted text-xs">{formatMoney(item.amount)}</span>}
                </span>
                <IconArrowRight
                  size={16}
                  stroke={1.75}
                  aria-hidden="true"
                  className="text-text-subtle shrink-0 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Carte indicateur : icône, libellé, valeur, phrase d'explication, visuel (courbe, anneau, répartition). */
function Kpi({
  icon: KpiIcon,
  tone,
  label,
  value,
  caption,
  chip,
  visual,
  below,
  href,
}: {
  icon: Icon;
  tone: 1 | 2 | 3 | 4;
  label: string;
  value: string;
  caption: string;
  chip?: ReactNode;
  visual?: ReactNode;
  /** Visuel sous la valeur, en pleine largeur (montants longs). */
  below?: ReactNode;
  href: string;
}) {
  return (
    <div className="ax-card ax-kpi ax-card--interactive">
      <Link href={href} className="flex h-full flex-col gap-3 p-5 text-inherit no-underline">
        <span className="flex items-center gap-3">
          <span className={`ax-kpi__icon ax-kpi__icon--c${tone}`}>
            <KpiIcon stroke={1.75} aria-hidden="true" />
          </span>
          <span className="text-text-muted min-w-0 flex-1 text-sm font-medium">{label}</span>
          {chip}
        </span>
        <span className="flex items-center justify-between gap-3">
          <span className="ax-num text-text-strong truncate text-[1.65rem] leading-tight font-semibold tracking-tight">{value}</span>
          {visual}
        </span>
        {below}
        <span className="text-text-muted mt-auto text-xs leading-relaxed">{caption}</span>
      </Link>
    </div>
  );
}

function Loading() {
  return (
    <div className="ax-dash-grid" aria-busy="true" aria-label="Chargement du tableau de bord">
      <CardSkeleton className="ax-col--5" height={230} />
      <div className="ax-col--7 grid gap-4 sm:grid-cols-2 md:gap-6">
        {[0, 1, 2, 3].map((i) => (
          <CardSkeleton key={i} height={70} />
        ))}
      </div>
      <CardSkeleton className="ax-col--8" height={300} />
      <CardSkeleton className="ax-col--4" height={300} />
    </div>
  );
}

export function DashboardScreen() {
  const { user, membership, can, isReadOnly } = useSession();
  const [months, setMonths] = useState<Months>(12);

  const query = useDashboard(months);
  const data: Dashboard | undefined = query.data;

  const actions = (
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
        aria-label="Actualiser le tableau de bord"
        onClick={() => void query.refetch()}
        disabled={query.isFetching}
      >
        <IconRefresh className={cn("ax-btn__icon", query.isFetching && "animate-spin")} stroke={1.75} aria-hidden="true" />
      </button>
      {!isReadOnly && can("payment.create") && (
        <Link href="/espace/paiements?nouveau=1" className="ax-btn ax-btn--primary">
          <IconPlus className="ax-btn__icon" stroke={2} aria-hidden="true" />
          <span className="ax-btn__label">Enregistrer un paiement</span>
        </Link>
      )}
    </>
  );

  const head = (
    <PageHead
      title={`${greeting()}${user ? `, ${user.first_name}` : ""}`}
      subtitle={
        <span className="first-letter:uppercase">
          {todayLabel()}
          {membership ? ` · ${membership.organization_name}` : ""}
        </span>
      }
      actions={actions}
    />
  );

  if (query.isError) {
    return (
      <>
        {head}
        <div className="ax-alert ax-alert--danger" role="alert">
          <IconAlertTriangle className="ax-alert__icon" stroke={1.75} aria-hidden="true" />
          <div className="ax-alert__content">
            <p className="ax-alert__title">Le tableau de bord n&apos;a pas pu être chargé</p>
            <p className="ax-alert__message">Vérifiez votre connexion puis réessayez.</p>
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
        <Loading />
      </>
    );
  }

  const { finance: rawFinance, portfolio, maintenance, listings, leases } = data;
  // Trésorerie affichée dès qu'il existe une échéance ou un paiement ; sinon, « Premiers pas ».
  const finance =
    rawFinance &&
    (toNumber(rawFinance.period_expected) > 0 ||
      toNumber(rawFinance.period_collected) > 0 ||
      rawFinance.overdue.count > 0 ||
      rawFinance.upcoming.length > 0)
      ? rawFinance
      : null;
  const maintenanceActive = Boolean(maintenance && (maintenance.open > 0 || maintenance.monthly.some((m) => m.created || m.resolved)));
  const monthly = finance?.monthly ?? [];
  const current = monthly.at(-1);
  const previous = monthly.at(-2);
  const collectedNow = toNumber(current?.collected);
  const units = portfolio?.units_by_status;

  return (
    <>
      {head}
      <div className={cn("ax-dash-grid transition-opacity", query.isFetching && "opacity-70")}>
        <Insights items={data.insights} />
        {rawFinance && !finance && <GettingStarted data={data} />}

        {/* ── Rangée héros : encaissé ce mois + 4 indicateurs ── */}
        {finance && current && (
          <section
            aria-labelledby="tdb-mois"
            className="ax-col--5 bg-brand-900 relative flex overflow-hidden rounded-(--ax-radius-xl) text-white shadow-(--ax-shadow-card) max-lg:col-span-12"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-[radial-gradient(circle,rgba(247,148,29,0.35),transparent_65%)]"
            />
            <div className="relative flex w-full flex-col gap-5 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h2 id="tdb-mois" className="m-0 text-sm font-medium text-white/70">
                    Encaissé en {monthLong(current.month)}
                  </h2>
                  <p className="ax-num m-0 text-4xl leading-tight font-semibold tracking-tight text-white">{formatMoney(collectedNow)}</p>
                  <p className="m-0 flex flex-wrap items-center gap-2 text-sm text-white/70">
                    sur {formatMoney(current.expected)} attendus
                    {previous && <DeltaChip value={delta(collectedNow, toNumber(previous.collected))} />}
                  </p>
                </div>
                <Link href="/espace/paiements" className="ax-btn ax-btn--sm hidden shrink-0 border border-white/25 text-white hover:bg-white/10 sm:inline-flex">
                  <span className="ax-btn__label">Paiements</span>
                </Link>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span>Recouvrement des échéances du mois</span>
                  <span className="ax-num font-semibold text-white">{percent(finance.this_month.rate)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/15">
                  <span className="bg-accent block h-full rounded-full" style={{ width: `${Math.min(100, finance.this_month.rate ?? 0)}%` }} />
                </div>
              </div>
              <div className="mt-auto">
                <MonthBars finance={finance} />
              </div>
            </div>
          </section>
        )}

        <div className={cn("grid gap-4 sm:grid-cols-2 md:gap-6", finance && current ? "ax-col--7 max-lg:col-span-12" : "ax-col--12")}>
          {finance && (
            <Kpi
              icon={IconChartBar}
              tone={1}
              label="Recouvrement du mois"
              value={percent(finance.this_month.rate)}
              caption={`${formatMoney(finance.this_month.collected)} réglés sur ${formatMoney(finance.this_month.expected)} dus ce mois-ci.`}
              visual={
                <Sparkline data={monthly.map((m) => m.rate ?? 0)} color="--ax-accent" label="Taux de recouvrement des derniers mois" />
              }
              href="/espace/echeances?etat=non_payee"
            />
          )}
          {finance && (
            <Kpi
              icon={IconCash}
              tone={3}
              label="Impayés"
              value={formatMoney(finance.overdue.amount)}
              caption={
                finance.overdue.count
                  ? `${finance.overdue.count} échéance${finance.overdue.count > 1 ? "s" : ""} en retard, ${finance.overdue.tenants} locataire${finance.overdue.tenants > 1 ? "s" : ""} concerné${finance.overdue.tenants > 1 ? "s" : ""}.`
                  : "Aucun loyer échu en attente de paiement."
              }
              below={
                <PartitionBar
                  legend={false}
                  segments={finance.overdue.aging.map((bucket, index) => ({
                    label: `${bucket.bucket} jours`,
                    value: toNumber(bucket.amount),
                    color: ["var(--ax-viz-amber)", "var(--ax-accent)", "var(--ax-viz-red)", "var(--ax-danger-500)"][index],
                    display: formatMoney(bucket.amount),
                  }))}
                />
              }
              href="/espace/echeances?etat=retard"
            />
          )}
          {portfolio && units && (
            <Kpi
              icon={IconHomeSearch}
              tone={2}
              label="Taux d'occupation"
              value={percent(portfolio.occupancy_rate)}
              caption={`${formatNumber(units.RENTED)} lot${units.RENTED > 1 ? "s" : ""} loué${units.RENTED > 1 ? "s" : ""} sur ${formatNumber(portfolio.units - units.SOLD)} · ${formatNumber(units.FREE)} libre${units.FREE > 1 ? "s" : ""}.`}
              visual={<RateRing value={portfolio.occupancy_rate} label="Taux d'occupation" />}
              href="/espace/biens"
            />
          )}
          {listings && (
            <Kpi
              icon={IconHomeSearch}
              tone={4}
              label="Demandes de visite (30 j)"
              value={formatNumber(listings.interests_30d)}
              caption={`${formatNumber(listings.published)} annonce${listings.published > 1 ? "s" : ""} en ligne · ${formatNumber(listings.interests_period)} demandes sur ${months} mois.`}
              visual={
                <Sparkline
                  data={listings.monthly_interests.map((m) => m.count)}
                  color="--ax-viz-violet"
                  label="Demandes de visite des derniers mois"
                />
              }
              href="/espace/annonces"
            />
          )}
        </div>

        {/* ── Trésorerie ── */}
        {finance && (
          <DashCard
            labelledBy="tdb-tresorerie"
            className="ax-col--8"
            eyebrow="Trésorerie"
            title="Loyers encaissés"
            subtitle={`Encaissé chaque mois face aux échéances attendues, sur ${months} mois.`}
            href="/espace/paiements"
          >
            <div className="mb-4 flex flex-wrap items-end gap-x-8 gap-y-3">
              <MiniStat label="Encaissé" value={formatMoney(finance.period_collected)} />
              <MiniStat label="Attendu" value={formatMoney(finance.period_expected)} />
              <MiniStat
                label="Taux moyen"
                value={percent(
                  toNumber(finance.period_expected) ? (toNumber(finance.period_collected) / toNumber(finance.period_expected)) * 100 : null,
                )}
              />
              <div className="ml-auto flex items-center gap-4 text-xs">
                <span className="text-text-muted flex items-center gap-2">
                  <Swatch color="var(--ax-brand)" /> Encaissé
                </span>
                <span className="text-text-muted flex items-center gap-2">
                  <span aria-hidden="true" className="bg-accent inline-block h-0.5 w-4 rounded-full" /> Attendu
                </span>
              </div>
            </div>
            <CashflowChart finance={finance} />
          </DashCard>
        )}

        {finance && (
          <DashCard labelledBy="tdb-moyens" className="ax-col--4" eyebrow="Encaissements" title="Moyens de paiement" subtitle={`Sur ${months} mois`}>
            {finance.by_method.length ? (
              <div className="flex flex-col gap-5">
                <MethodsDonut finance={finance} />
                <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                  {finance.by_method.map((method, index) => {
                    const share = (toNumber(method.amount) / toNumber(finance.period_collected || 1)) * 100;
                    return (
                      <li key={method.code} className="flex items-center gap-3 text-sm">
                        {METHOD_LOGOS[method.code] ? (
                          <Image src={METHOD_LOGOS[method.code]} alt="" width={22} height={22} className="size-5.5 rounded-full object-cover" />
                        ) : (
                          <Swatch color={methodColor(method.code, index)} />
                        )}
                        <span className="text-text flex-1">{method.label}</span>
                        <span className="text-text-subtle ax-num text-xs">{percent(share)}</span>
                        <span className="ax-num text-text-strong w-28 text-right font-medium">{formatMoney(method.amount)}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <CardEmpty icon={IconCash}>Aucun paiement enregistré sur la période.</CardEmpty>
            )}
          </DashCard>
        )}

        {/* ── Retards, échéances à venir, occupation ── */}
        {finance && (
          <DashCard
            labelledBy="tdb-retards"
            className="ax-col--4"
            eyebrow="Impayés"
            title="Retards par ancienneté"
            href="/espace/echeances?etat=retard"
          >
            <div className="flex flex-col gap-4">
              <PartitionBar
                segments={finance.overdue.aging.map((bucket, index) => ({
                  label: bucket.bucket === "90+" ? "Plus de 90 j" : `${bucket.bucket} j`,
                  value: toNumber(bucket.amount),
                  color: ["var(--ax-viz-amber)", "var(--ax-accent)", "var(--ax-viz-red)", "var(--ax-danger-500)"][index],
                  display: formatMoney(bucket.amount),
                }))}
              />
              <LateList finance={finance} />
            </div>
          </DashCard>
        )}

        {finance && (
          <DashCard
            labelledBy="tdb-echeances"
            className="ax-col--4"
            eyebrow="30 prochains jours"
            title="Échéances à venir"
            href="/espace/echeances?etat=a_venir"
          >
            <UpcomingList finance={finance} />
          </DashCard>
        )}

        {portfolio && units && (
          <DashCard labelledBy="tdb-parc" className="ax-col--4" eyebrow="Patrimoine" title="Occupation du parc" href="/espace/biens">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <RateRing value={portfolio.occupancy_rate} size={92} label="Taux d'occupation" />
                <div className="grid flex-1 grid-cols-2 gap-3">
                  <MiniStat label="Biens" value={formatNumber(portfolio.properties)} />
                  <MiniStat label="Lots" value={formatNumber(portfolio.units)} />
                  <MiniStat label="Baux actifs" value={formatNumber(leases?.active ?? 0)} />
                  <MiniStat label="Loyers / mois (FCFA)" value={leases ? compactMoney(leases.monthly_rent_roll) : "—"} />
                </div>
              </div>
              <PartitionBar
                segments={[
                  { label: "Loués", value: units.RENTED, color: "var(--ax-brand)" },
                  { label: "Libres", value: units.FREE, color: "var(--ax-accent)" },
                  { label: "En travaux", value: units.MAINTENANCE, color: "var(--ax-viz-amber)" },
                  { label: "Vendus", value: units.SOLD, color: "var(--ax-text-subtle)" },
                ]}
              />
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {portfolio.units_by_category.map((row) => (
                  <li key={row.category} className="flex items-center gap-3 text-sm">
                    <span className="text-text w-32 shrink-0 truncate">{row.label}</span>
                    <span className="bg-surface-subtle h-1.5 flex-1 overflow-hidden rounded-full">
                      <span
                        className="bg-brand block h-full rounded-full"
                        style={{ width: `${(row.count / Math.max(1, portfolio.units)) * 100}%` }}
                      />
                    </span>
                    <span className="ax-num text-text-muted w-6 text-right text-xs">{row.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </DashCard>
        )}

        {/* ── Maintenance ── */}
        {maintenance && (
          <DashCard
            labelledBy="tdb-maintenance"
            className="ax-col--8"
            eyebrow="Maintenance"
            title="Interventions"
            subtitle="Tickets signalés et résolus chaque mois."
            href="/espace/maintenance"
          >
            <div className="mb-3 flex flex-wrap items-end gap-x-8 gap-y-3">
              <MiniStat label="Ouverts" value={formatNumber(maintenance.open)} />
              <MiniStat label="Prioritaires" value={formatNumber(maintenance.urgent_open)} tone={maintenance.urgent_open ? "danger" : undefined} />
              <MiniStat
                label="Délai moyen"
                value={maintenance.avg_resolution_days === null ? "—" : `${percent(maintenance.avg_resolution_days).replace(" %", "")} j`}
              />
              <div className="ml-auto flex items-center gap-4 text-xs">
                <span className="text-text-muted flex items-center gap-2">
                  <Swatch color="var(--ax-accent)" /> Signalés
                </span>
                <span className="text-text-muted flex items-center gap-2">
                  <Swatch color="var(--ax-viz-emerald)" /> Résolus
                </span>
              </div>
            </div>
            {maintenanceActive ? (
              <MaintenanceChart maintenance={maintenance} />
            ) : (
              <CardEmpty icon={IconTool}>Aucune intervention enregistrée pour le moment.</CardEmpty>
            )}
          </DashCard>
        )}

        {maintenance && (
          <DashCard labelledBy="tdb-tickets" className="ax-col--4" eyebrow="À traiter" title="Tickets ouverts" href="/espace/maintenance">
            <OpenTicketsList maintenance={maintenance} />
          </DashCard>
        )}

        {/* ── Annonces ── */}
        {listings && (
          <DashCard
            labelledBy="tdb-annonces"
            className="ax-col--8"
            eyebrow="Portail Dahoo"
            title="Demandes de visite"
            subtitle="Reçues sur vos annonces publiées."
            href="/espace/annonces"
          >
            {listings.interests_period > 0 ? (
              <div className="flex flex-col gap-4">
                <InterestsChart listings={listings} />
                <TopListings listings={listings} />
              </div>
            ) : (
              <CardEmpty
                icon={IconHomeSearch}
                action={
                  <Link href="/espace/annonces" className="ax-btn ax-btn--secondary ax-btn--sm">
                    <span className="ax-btn__label">Publier une annonce</span>
                  </Link>
                }
              >
                Vos annonces n&apos;ont pas encore reçu de demande de visite.
              </CardEmpty>
            )}
          </DashCard>
        )}

        {listings && (
          <DashCard labelledBy="tdb-prospects" className="ax-col--4" eyebrow="Prospects" title="Dernières demandes">
            <InterestsList listings={listings} />
          </DashCard>
        )}

        {/* ── Baux et paiements ── */}
        {leases && (
          <DashCard labelledBy="tdb-baux" className="ax-col--6" eyebrow="90 prochains jours" title="Baux à renouveler" href="/espace/baux">
            <EndingLeasesList leases={leases} />
          </DashCard>
        )}

        {finance && (
          <DashCard labelledBy="tdb-paiements" className="ax-col--6" eyebrow="Trésorerie" title="Derniers paiements" href="/espace/paiements">
            <RecentPaymentsList finance={finance} />
          </DashCard>
        )}

        {!finance && !portfolio && !maintenance && !listings && (
          <div className="ax-col--12">
            <CardEmpty icon={IconTool}>Votre rôle ne donne accès à aucun indicateur pour cette agence.</CardEmpty>
          </div>
        )}
      </div>
    </>
  );
}
