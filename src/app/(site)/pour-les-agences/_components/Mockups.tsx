import {
  IconBell,
  IconCalendarEvent,
  IconCheck,
  IconCircleCheck,
  IconEye,
  IconMapPin,
  IconTool,
  IconUser,
} from "@tabler/icons-react";
import Image from "next/image";
import type { ReactNode } from "react";

import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

/*
 * Maquettes stylisées de l'espace agence (HTML/CSS, pas de fausses captures d'écran).
 * Purement illustratives : masquées aux lecteurs d'écran, le texte voisin porte l'information.
 * Noms, lots et montants sont fictifs.
 */

const FRAME_SHADOW = "shadow-[0_30px_60px_-30px_rgba(20,27,71,0.45)]";

function AppFrame({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("bg-surface-solid border-border-default overflow-hidden rounded-xl border", FRAME_SHADOW, className)}>
      <div className="border-border-default bg-surface-subtle flex items-center gap-1.5 border-b px-4 py-3">
        <span className="bg-danger/70 h-2.5 w-2.5 rounded-full" />
        <span className="bg-warning/70 h-2.5 w-2.5 rounded-full" />
        <span className="bg-success/70 h-2.5 w-2.5 rounded-full" />
        <span className="text-text-muted ml-2 truncate text-xs font-medium">{title}</span>
      </div>
      {children}
    </div>
  );
}

function FloatingCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("bg-surface-solid border-border-default flex items-start gap-3 rounded-lg border p-3", FRAME_SHADOW, className)}>
      {children}
    </div>
  );
}

type Tone = "success" | "warning" | "danger" | "info" | "accent" | "neutral";

function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`ax-badge ax-badge--${tone}`}>{children}</span>;
}

const SCHEDULES: { unit: string; tenant: string; amount: number; tone: Tone; status: string }[] = [
  { unit: "Résidence Baobab · A12", tenant: "Awa Ndiaye", amount: 350_000, tone: "success", status: "Payé · Wave" },
  { unit: "Villa Saly Portudal", tenant: "Moussa Diop", amount: 600_000, tone: "success", status: "Payé · Orange Money" },
  { unit: "Immeuble Sacré-Cœur · B3", tenant: "Fatou Sarr", amount: 225_000, tone: "warning", status: "Partiel" },
  { unit: "Studio Ouakam · 4", tenant: "Ibrahima Fall", amount: 150_000, tone: "danger", status: "En retard" },
];

/** Hero : tableau des échéances du mois, avec une demande de visite et un ticket en surimpression. */
export function HeroMockup() {
  return (
    <div aria-hidden="true" className="relative pb-10 select-none sm:pb-14 lg:pr-6">
      <AppFrame title="Espace agence · Échéances de septembre">
        <div className="grid grid-cols-3 gap-px bg-[var(--ax-border)]">
          {[
            { label: "Attendu", value: formatMoney(4_850_000), className: "text-text-strong" },
            { label: "Encaissé", value: formatMoney(3_900_000), className: "text-success" },
            { label: "En retard", value: "2 échéances", className: "text-danger" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-surface-solid flex flex-col gap-1 px-3 py-3 sm:px-4">
              <span className="text-text-subtle text-[0.65rem] font-semibold tracking-wide uppercase sm:text-xs">{kpi.label}</span>
              <span className={cn("ax-num text-[0.7rem] font-bold sm:text-sm", kpi.className)}>{kpi.value}</span>
            </div>
          ))}
        </div>
        <ul className="divide-border-default m-0 list-none divide-y p-0">
          {SCHEDULES.map((row) => (
            <li key={row.unit} className="flex items-center gap-3 px-4 py-3">
              <span className="bg-accent-wash text-accent-text flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                {row.tenant
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-text-strong truncate text-sm font-semibold">{row.unit}</span>
                <span className="text-text-muted truncate text-xs">{row.tenant}</span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1">
                <span className="ax-num text-text-strong text-xs font-semibold sm:text-sm">{formatMoney(row.amount)}</span>
                <Badge tone={row.tone}>{row.status}</Badge>
              </span>
            </li>
          ))}
        </ul>
      </AppFrame>

      <FloatingCard className="absolute -top-6 right-2 hidden w-64 sm:flex lg:-right-6">
        <span className="bg-accent text-on-accent flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
          <IconCalendarEvent size={18} stroke={1.75} />
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-text-strong text-sm font-semibold">Demande de visite</span>
          <span className="text-text-muted text-xs">Appartement F4 · Almadies</span>
          <span className="text-text-subtle text-xs">Reçue depuis le portail Dahoo</span>
        </span>
      </FloatingCard>

      <FloatingCard className="absolute bottom-0 left-4 w-60 sm:left-auto sm:right-10 lg:-left-8 lg:right-auto">
        <span className="bg-brand text-on-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
          <IconTool size={18} stroke={1.75} />
        </span>
        <span className="flex min-w-0 flex-col gap-1">
          <span className="text-text-strong text-sm font-semibold">Fuite d&apos;eau · A12</span>
          <span className="flex flex-wrap gap-1">
            <Badge tone="danger">Urgent</Badge>
            <Badge tone="info">En cours</Badge>
          </span>
        </span>
      </FloatingCard>
    </div>
  );
}

/** Loyers : un paiement Wave enregistré puis affecté à deux échéances. */
export function PaymentMockup() {
  return (
    <div aria-hidden="true" className="select-none">
      <AppFrame title="Paiements · Nouveau paiement">
        <div className="flex flex-col gap-4 p-4 sm:p-5">
          <dl className="m-0 grid grid-cols-2 gap-3 text-sm">
            {[
              ["Payeur", "Awa Ndiaye"],
              ["Moyen", "Wave"],
              ["Référence", "T-58K2Q9"],
              ["Montant", formatMoney(700_000)],
            ].map(([term, detail]) => (
              <div key={term} className="border-border-default flex flex-col gap-0.5 rounded-md border px-3 py-2">
                <dt className="text-text-subtle text-xs">{term}</dt>
                <dd className="text-text-strong m-0 truncate font-semibold">{detail}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-col gap-2">
            <p className="text-text-strong m-0 text-xs font-semibold tracking-wide uppercase">Affectation aux échéances</p>
            {[
              ["Loyer août · A12", 350_000],
              ["Loyer septembre · A12", 350_000],
            ].map(([label, amount]) => (
              <div key={label} className="bg-surface-subtle flex items-center gap-3 rounded-md px-3 py-2.5">
                <IconCircleCheck size={18} stroke={1.75} className="text-success shrink-0" />
                <span className="text-text flex-1 truncate text-sm">{label}</span>
                <span className="ax-num text-text-strong text-sm font-semibold">{formatMoney(amount)}</span>
                <Badge tone="success">Soldée</Badge>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="text-text-muted flex justify-between text-xs">
              <span>Affecté</span>
              <span className="ax-num">{formatMoney(700_000)} / {formatMoney(700_000)}</span>
            </div>
            <div className="bg-surface-subtle h-2 overflow-hidden rounded-full">
              <div className="bg-success h-full w-full rounded-full" />
            </div>
          </div>
          <p className="text-text-subtle m-0 flex items-center gap-1.5 text-xs">
            <IconUser size={14} stroke={1.75} /> Saisi par Mame Diarra, comptable · aujourd&apos;hui 10:42
          </p>
        </div>
      </AppFrame>
    </div>
  );
}

/** Maintenance : fiche d'un ticket avec son journal d'intervention. */
export function TicketMockup() {
  const journal = [
    { who: "Aminata, gestionnaire", what: "Ticket ouvert : fuite sous l'évier signalée par la locataire.", when: "Lun. 09:15" },
    { who: "Aminata, gestionnaire", what: "Assigné à Ousmane. Priorité passée à « Urgent ».", when: "Lun. 09:18" },
    { who: "Ousmane", what: "Intervention : joint remplacé, test d'étanchéité concluant.", when: "Lun. 16:40" },
  ];
  return (
    <div aria-hidden="true" className="select-none">
      <AppFrame title="Maintenance · Ticket n° 128">
        <div className="flex flex-col gap-4 p-4 sm:p-5">
          <div className="flex flex-col gap-2">
            <p className="font-display text-text-strong m-0 text-lg font-semibold">Fuite d&apos;eau sous l&apos;évier</p>
            <p className="text-text-muted m-0 flex items-center gap-1.5 text-sm">
              <IconMapPin size={15} stroke={1.75} /> Résidence Baobab · Bâtiment A · A12
            </p>
            <div className="flex flex-wrap gap-1.5">
              <Badge tone="danger">Urgent</Badge>
              <Badge tone="success">Résolu</Badge>
              <Badge tone="neutral">Assigné à Ousmane</Badge>
            </div>
          </div>
          <ol className="border-border-default m-0 flex list-none flex-col gap-4 border-l-2 p-0 pl-4">
            {journal.map((entry) => (
              <li key={entry.when} className="relative flex flex-col gap-0.5">
                <span className="bg-accent border-surface-solid absolute top-1 -left-[23px] h-3 w-3 rounded-full border-2" />
                <span className="text-text-strong text-sm">{entry.what}</span>
                <span className="text-text-subtle text-xs">
                  {entry.who} · {entry.when}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </AppFrame>
    </div>
  );
}

/** Portail : l'annonce telle que la voit le public, et la demande de visite qui arrive dans l'espace agence. */
export function PortalMockup() {
  return (
    <div aria-hidden="true" className="relative pb-24 select-none sm:pb-16">
      <div className={cn("bg-surface-solid border-border-default max-w-sm overflow-hidden rounded-xl border", FRAME_SHADOW)}>
        <div className="relative aspect-[600/415]">
          <Image src="/images/site/property-02.webp" alt="" fill sizes="(min-width: 640px) 384px, 90vw" className="object-cover" />
          <span className="bg-accent text-on-accent absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-bold uppercase">
            À louer
          </span>
          <span className="bg-surface-solid/90 text-text-strong absolute top-3 right-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold">
            <IconEye size={14} stroke={1.75} /> Publiée
          </span>
        </div>
        <div className="flex flex-col gap-2 p-4">
          <p className="font-display text-text-strong m-0 font-semibold">Villa 4 chambres avec jardin</p>
          <p className="text-text-muted m-0 flex items-center gap-1 text-sm">
            <IconMapPin size={15} stroke={1.75} /> Ngor, Dakar
          </p>
          <p className="font-display text-text-strong m-0 text-lg font-bold">{formatMoney(900_000)} / mois</p>
        </div>
      </div>

      <FloatingCard className="absolute right-0 bottom-0 w-72 sm:-right-4">
        <span className="bg-brand text-on-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
          <IconBell size={18} stroke={1.75} />
        </span>
        <span className="flex min-w-0 flex-col gap-1">
          <span className="text-text-strong text-sm font-semibold">Nouvelle demande de visite</span>
          <span className="text-text-muted text-xs">Khady S. · « Est-elle disponible samedi matin ? »</span>
          <span className="text-success flex items-center gap-1 text-xs font-semibold">
            <IconCheck size={14} stroke={2} /> Dans votre espace agence
          </span>
        </span>
      </FloatingCard>
    </div>
  );
}
