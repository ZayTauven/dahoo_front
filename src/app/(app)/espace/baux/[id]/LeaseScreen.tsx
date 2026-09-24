"use client";

import { IconArrowLeft, IconBan, IconCircleCheck, IconDoorExit, IconFileOff, IconPlayerPlay, type Icon } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { EmptyState } from "@/components/app/EmptyState";
import { PageHead } from "@/components/app/shell/PageHead";
import { ConfirmDialog } from "@/components/app/ui/Modal";
import { StatusBadge } from "@/components/app/ui/StatusBadge";
import { api } from "@/lib/api/client";
import { ApiError, unwrap } from "@/lib/api/errors";
import { useApiMutation } from "@/lib/api/useApiMutation";
import { useSession } from "@/lib/auth/useSession";
import { formatDate, formatMoney } from "@/lib/format";
import { enumLabel, LEASE_STATUS, PAYMENT_FREQUENCY, UNIT_STATUS } from "@/lib/labels";

import { KEYS, monthlyTotal, monthsPerPeriod, type Lease, type LeaseStatus, type Unit } from "../_components/data";
import { ScheduleSection } from "../_components/ScheduleSection";

type Action = "activate" | "terminate" | "complete" | "cancel";

interface ActionConfig {
  label: string;
  icon: Icon;
  capability: string;
  /** Statuts depuis lesquels la transition est permise (règles de leases/services.py). */
  from: readonly LeaseStatus[];
  variant: "primary" | "secondary" | "danger";
  title: string;
  confirm: string;
  success: string;
}

const ACTIONS: Record<Action, ActionConfig> = {
  activate: {
    label: "Activer",
    icon: IconPlayerPlay,
    capability: "lease.activate",
    from: ["DRAFT"],
    variant: "primary",
    title: "Activer ce bail ?",
    confirm: "Activer le bail",
    success: "Bail activé : le lot est désormais loué.",
  },
  complete: {
    label: "Clôturer",
    icon: IconCircleCheck,
    capability: "lease.complete",
    from: ["ACTIVE", "TERMINATED"],
    variant: "secondary",
    title: "Clôturer ce bail ?",
    confirm: "Clôturer le bail",
    success: "Bail clôturé.",
  },
  terminate: {
    label: "Résilier",
    icon: IconDoorExit,
    capability: "lease.terminate",
    from: ["ACTIVE"],
    variant: "secondary",
    title: "Résilier ce bail ?",
    confirm: "Résilier le bail",
    success: "Bail résilié : le lot est de nouveau libre.",
  },
  cancel: {
    label: "Annuler le bail",
    icon: IconBan,
    capability: "lease.cancel",
    from: ["DRAFT", "ACTIVE"],
    variant: "danger",
    title: "Annuler ce bail ?",
    confirm: "Annuler le bail",
    success: "Bail annulé.",
  },
};

const ACTION_ORDER: Action[] = ["activate", "complete", "terminate", "cancel"];

async function runTransition(action: Action, id: number): Promise<Lease> {
  const options = { params: { path: { id } } };
  switch (action) {
    case "activate":
      return unwrap(await api.POST("/api/v1/leases/{id}/activate/", options));
    case "terminate":
      return unwrap(await api.POST("/api/v1/leases/{id}/terminate/", options));
    case "complete":
      return unwrap(await api.POST("/api/v1/leases/{id}/complete/", options));
    case "cancel":
      return unwrap(await api.POST("/api/v1/leases/{id}/cancel/", options));
  }
}

/** Conséquence d'une transition, expliquée dans la demande de confirmation. */
function consequence(action: Action, lease: Lease, unit: Unit | undefined): ReactNode {
  const lot = <strong className="text-text-strong">{lease.unit_label}</strong>;
  switch (action) {
    case "activate":
      return (
        <>
          <p className="m-0">
            Le bail de {lease.tenant_name} prend effet et la date de signature est enregistrée à aujourd&apos;hui. Le lot {lot} passera
            en « Loué ».
          </p>
          <p className="text-text-muted mt-3 mb-0 text-sm">Un lot ne peut avoir qu&apos;un seul bail actif à la fois.</p>
          {unit?.status === "RENTED" && (
            <p className="text-danger mt-3 mb-0 text-sm font-medium">Ce lot est déjà indiqué comme loué : l&apos;activation risque d&apos;être refusée.</p>
          )}
        </>
      );
    case "terminate":
      return (
        <p className="m-0">
          Le bail prend fin avant son terme (départ anticipé, impayés…). Le lot {lot} redeviendra « Libre » et pourra accueillir un
          nouveau bail. Les échéances déjà créées sont conservées. Vous pourrez ensuite clôturer le bail.
        </p>
      );
    case "complete":
      return lease.status === "TERMINATED" ? (
        <p className="m-0">Le bail résilié sera archivé comme « Terminé ». Cette action est définitive.</p>
      ) : (
        <p className="m-0">
          Le bail arrive à son terme et sera marqué « Terminé ». Le lot {lot} redeviendra « Libre ». Cette action est définitive.
        </p>
      );
    case "cancel":
      return lease.status === "DRAFT" ? (
        <p className="m-0">Le brouillon sera annulé ; le lot {lot} n&apos;est pas modifié. Cette action est définitive.</p>
      ) : (
        <p className="m-0">
          Le bail sera annulé comme s&apos;il n&apos;avait pas eu lieu (erreur de saisie, désistement). Le lot {lot} redeviendra « Libre ».
          Cette action est définitive.
        </p>
      );
  }
}

export function LeaseScreen({ id }: { id: number }) {
  const { can, isReadOnly } = useSession();
  const [pendingAction, setPendingAction] = useState<Action | null>(null);

  const lease = useQuery({
    queryKey: [...KEYS.leases, id],
    queryFn: async () => unwrap(await api.GET("/api/v1/leases/{id}/", { params: { path: { id } } })),
  });
  const data = lease.data;

  const tenant = useQuery({
    queryKey: [...KEYS.tenants, data?.tenant],
    queryFn: async () => unwrap(await api.GET("/api/v1/leases/tenants/{id}/", { params: { path: { id: data?.tenant ?? 0 } } })),
    enabled: Boolean(data) && can("tenant.view"),
    retry: false,
  });
  const unit = useQuery({
    queryKey: [...KEYS.units, data?.unit],
    queryFn: async () => unwrap(await api.GET("/api/v1/properties/units/{id}/", { params: { path: { id: data?.unit ?? 0 } } })),
    enabled: Boolean(data) && can("unit.view"),
    retry: false,
  });

  const transition = useApiMutation({
    mutationFn: (action: Action) => runTransition(action, id),
    // Le statut du lot et le nombre de baux actifs du locataire changent aussi.
    invalidate: [KEYS.leases, KEYS.units, KEYS.tenants],
    success: (result) => ACTIONS[actionFor(result.status)].success,
    onSuccess: () => setPendingAction(null),
  });

  const closeDialog = () => {
    setPendingAction(null);
    transition.reset();
  };

  const crumbs = [
    { label: "Espace agence", href: "/espace" },
    { label: "Baux", href: "/espace/baux" },
    { label: `Bail n°${id}` },
  ];

  if (lease.error) {
    const notFound = lease.error instanceof ApiError && lease.error.status === 404;
    return (
      <>
        <PageHead title={`Bail n°${id}`} crumbs={crumbs} />
        <div className="ax-card">
          {notFound ? (
            <EmptyState icon={IconFileOff} title="Bail introuvable" action={<BackLink />}>
              Ce bail n&apos;existe pas ou n&apos;appartient pas à votre agence.
            </EmptyState>
          ) : (
            <div className="ax-card__body">
              <div className="ax-alert ax-alert--danger" role="alert">
                <div className="ax-alert__content">
                  <p className="ax-alert__message">{lease.error.message}</p>
                </div>
                <div className="ax-alert__actions">
                  <button type="button" className="ax-btn ax-btn--sm ax-btn--ghost" onClick={() => lease.refetch()}>
                    <span className="ax-btn__label">Réessayer</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  if (!data) return <LeaseSkeleton crumbs={crumbs} />;

  const available = ACTION_ORDER.filter((action) => ACTIONS[action].from.includes(data.status) && can(ACTIONS[action].capability) && !isReadOnly);
  const actions = available.length > 0 && (
    <div className="flex flex-wrap gap-2">
      {available.map((action) => {
        const config = ACTIONS[action];
        const ActionIcon = config.icon;
        const variant = config.variant === "primary" ? "ax-btn--primary" : config.variant === "danger" ? "ax-btn--soft-danger" : "ax-btn--secondary";
        return (
          <button key={action} type="button" className={`ax-btn ${variant}`} onClick={() => setPendingAction(action)}>
            <ActionIcon className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
            <span className="ax-btn__label">{config.label}</span>
          </button>
        );
      })}
    </div>
  );

  const frequencyMonths = monthsPerPeriod(data.payment_frequency);
  const tenantInfo = tenant.data;

  return (
    <>
      <PageHead
        title={`Bail n°${data.id}`}
        subtitle={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <StatusBadge entries={LEASE_STATUS} value={data.status} />
            <span>
              {data.tenant_name} · {data.unit_label}
            </span>
          </span>
        }
        crumbs={crumbs}
        actions={actions}
      />

      <div className="flex flex-col gap-5">
        {data.status === "DRAFT" && (
          <div className="ax-alert ax-alert--info" role="status">
            <div className="ax-alert__content">
              <p className="ax-alert__title">Bail en brouillon</p>
              <p className="ax-alert__message">
                Vérifiez les conditions puis activez le bail à la signature : le lot passera alors en « Loué ».
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-3">
          <InfoCard title="Parties et lot" titleId="bail-parties">
            <InfoRow label="Locataire">
              <span className="flex flex-col items-end">
                <span>{data.tenant_name}</span>
                {tenantInfo && <span className="text-text-muted ax-num text-xs font-normal">{tenantInfo.phone}</span>}
                {tenantInfo?.email && <span className="text-text-muted text-xs font-normal break-all">{tenantInfo.email}</span>}
              </span>
            </InfoRow>
            <InfoRow label="Lot">
              <span className="flex flex-col items-end">
                <span>{data.unit_label}</span>
                {unit.data && (
                  <span className="text-text-muted text-xs font-normal">
                    {[unit.data.category_label, unit.data.unit_type].filter(Boolean).join(" ")} · {unit.data.surface} m²
                  </span>
                )}
              </span>
            </InfoRow>
            {unit.data && (
              <InfoRow label="Statut du lot">
                <StatusBadge entries={UNIT_STATUS} value={unit.data.status} />
              </InfoRow>
            )}
          </InfoCard>

          <InfoCard title="Montants" titleId="bail-montants">
            <InfoRow label="Loyer mensuel" numeric>
              {formatMoney(data.rent_amount)}
            </InfoRow>
            <InfoRow label="Charges mensuelles" numeric>
              {formatMoney(data.charges_amount ?? 0)}
            </InfoRow>
            <InfoRow label="Total mensuel" numeric strong>
              {formatMoney(monthlyTotal(data))}
            </InfoRow>
            {frequencyMonths > 1 && (
              <InfoRow label="Par trimestre" numeric>
                {formatMoney(monthlyTotal(data) * frequencyMonths)}
              </InfoRow>
            )}
            <InfoRow label="Dépôt de garantie" numeric>
              {formatMoney(data.deposit_amount ?? 0)}
            </InfoRow>
            <InfoRow label="Fréquence">{enumLabel(PAYMENT_FREQUENCY, data.payment_frequency)}</InfoRow>
          </InfoCard>

          <InfoCard title="Dates" titleId="bail-dates">
            <InfoRow label="Début">{formatDate(data.start_date)}</InfoRow>
            <InfoRow label="Fin">{data.end_date ? formatDate(data.end_date) : "Sans terme fixé"}</InfoRow>
            <InfoRow label="Signé le">{data.signed_at ? formatDate(data.signed_at) : <span className="text-text-muted font-normal">Pas encore signé</span>}</InfoRow>
            <InfoRow label="Créé le">{formatDate(data.created_at)}</InfoRow>
          </InfoCard>
        </div>

        <ScheduleSection lease={data} canCreate={can("payment.schedule.create") && !isReadOnly && data.status !== "CANCELLED"} />

        <div>
          <BackLink />
        </div>
      </div>

      {pendingAction && (
        <ConfirmDialog
          open
          onClose={closeDialog}
          onConfirm={() => transition.mutate(pendingAction)}
          pending={transition.isPending}
          title={ACTIONS[pendingAction].title}
          confirmLabel={ACTIONS[pendingAction].confirm}
          danger={ACTIONS[pendingAction].variant === "danger" || pendingAction === "terminate"}
        >
          {consequence(pendingAction, data, unit.data)}
          {transition.error && (
            <div className="ax-alert ax-alert--danger mt-4" role="alert">
              <div className="ax-alert__content">
                <p className="ax-alert__message">{transition.error.message}</p>
              </div>
            </div>
          )}
        </ConfirmDialog>
      )}
    </>
  );
}

/** Action dont le statut résultant est `status` (pour le message de succès). */
function actionFor(status: LeaseStatus): Action {
  if (status === "ACTIVE") return "activate";
  if (status === "TERMINATED") return "terminate";
  if (status === "COMPLETED") return "complete";
  return "cancel";
}

function BackLink() {
  return (
    <Link href="/espace/baux" className="ax-btn ax-btn--ghost ax-btn--sm">
      <IconArrowLeft className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
      <span className="ax-btn__label">Tous les baux</span>
    </Link>
  );
}

function InfoCard({ title, titleId, children }: { title: string; titleId: string; children: ReactNode }) {
  return (
    <section className="ax-card" aria-labelledby={titleId}>
      <div className="ax-card__header">
        <h2 className="ax-card__title" id={titleId}>
          {title}
        </h2>
      </div>
      <div className="ax-card__body">
        <dl className="m-0 flex flex-col">{children}</dl>
      </div>
    </section>
  );
}

function InfoRow({ label, children, numeric, strong }: { label: string; children: ReactNode; numeric?: boolean; strong?: boolean }) {
  return (
    <div className="border-border-default flex items-start justify-between gap-4 border-b py-2.5 first:pt-0 last:border-b-0 last:pb-0">
      <dt className="text-text-muted shrink-0 text-sm">{label}</dt>
      <dd className={`m-0 min-w-0 text-right text-sm ${strong ? "text-text-strong font-semibold" : "text-text-strong font-medium"}${numeric ? " ax-num" : ""}`}>
        {children}
      </dd>
    </div>
  );
}

function LeaseSkeleton({ crumbs }: { crumbs: { label: string; href?: string }[] }) {
  return (
    <>
      <PageHead title="Bail" crumbs={crumbs} />
      <div className="grid gap-5 lg:grid-cols-3" aria-busy="true" aria-label="Chargement du bail">
        {Array.from({ length: 3 }, (_, card) => (
          <div key={card} className="ax-card">
            <div className="ax-card__body flex flex-col gap-3">
              <span className="ax-skeleton ax-skeleton--text" style={{ inlineSize: "40%" }} />
              {Array.from({ length: 4 }, (_, line) => (
                <span key={line} className="ax-skeleton ax-skeleton--text" style={{ inlineSize: `${85 - line * 10}%` }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
