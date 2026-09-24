"use client";

import { IconArrowLeft, IconFileSearch, IconPencil, IconTrash } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { EmptyState } from "@/components/app/EmptyState";
import { PageHead } from "@/components/app/shell/PageHead";
import { CheckboxField, SelectField } from "@/components/app/ui/fields";
import { ConfirmDialog } from "@/components/app/ui/Modal";
import { StatusBadge } from "@/components/app/ui/StatusBadge";
import { api } from "@/lib/api/client";
import { ApiError, unwrap } from "@/lib/api/errors";
import { useApiMutation } from "@/lib/api/useApiMutation";
import { useSession, type Me } from "@/lib/auth/useSession";
import { formatDate } from "@/lib/format";
import { TICKET_PRIORITY, TICKET_STATUS } from "@/lib/labels";

import {
  KEYS,
  TICKET_STATUSES,
  addLogQuietly,
  asStatus,
  formatDateTime,
  memberName,
  personName,
  useMembers,
  type Member,
  type Ticket,
  type TicketStatus,
} from "./data";
import { Panel } from "./Panel";
import { TicketFormModal } from "./TicketFormModal";
import { TicketJournal } from "./TicketJournal";

const LIST_HREF = "/espace/maintenance";

/** Fiche d'un ticket : signalement, statut, affectation, modification / suppression et journal d'intervention. */
export function TicketScreen({ id }: { id: number }) {
  const router = useRouter();
  const { can, isReadOnly, user, isLoading: sessionLoading } = useSession();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const ticket = useQuery({
    queryKey: KEYS.ticket(id),
    queryFn: async () => unwrap(await api.GET("/api/v1/maintenance/tickets/{id}/", { params: { path: { id } } })),
  });
  const members = useMembers(can("member.view"));

  const remove = useApiMutation({
    mutationFn: async () => unwrap(await api.DELETE("/api/v1/maintenance/tickets/{id}/", { params: { path: { id } } })),
    invalidate: [KEYS.tickets],
    success: `Ticket n°${id} supprimé.`,
    onSuccess: () => router.replace(LIST_HREF),
  });

  const title = `Ticket n°${id}`;
  const crumbs = [{ label: "Espace agence", href: "/espace" }, { label: "Maintenance", href: LIST_HREF }, { label: title }];

  // Attendre aussi les droits : sinon les messages « votre rôle ne permet pas… » s'afficheraient un instant.
  if (ticket.isLoading || (sessionLoading && !ticket.error)) {
    return (
      <>
        <PageHead title={title} crumbs={crumbs} />
        <div className="grid gap-5 lg:grid-cols-3" aria-busy="true">
          <div className="ax-card lg:col-span-2">
            <div className="ax-card__body flex flex-col gap-3">
              <span className="ax-skeleton ax-skeleton--text w-1/3" />
              <span className="ax-skeleton ax-skeleton--text w-full" />
              <span className="ax-skeleton ax-skeleton--text w-5/6" />
              <span className="ax-skeleton ax-skeleton--text w-2/3" />
            </div>
          </div>
          <div className="ax-card">
            <div className="ax-card__body flex flex-col gap-3">
              <span className="ax-skeleton ax-skeleton--text w-1/2" />
              <span className="ax-skeleton ax-skeleton--text w-full" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (ticket.error || !ticket.data) {
    const notFound = ticket.error instanceof ApiError && ticket.error.status === 404;
    return (
      <>
        <PageHead title={title} crumbs={crumbs} />
        <div className="ax-card">
          {notFound ? (
            <EmptyState
              icon={IconFileSearch}
              title="Ticket introuvable"
              action={
                <Link href={LIST_HREF} className="ax-btn ax-btn--secondary">
                  <IconArrowLeft className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
                  <span className="ax-btn__label">Retour aux tickets</span>
                </Link>
              }
            >
              Ce ticket n&apos;existe pas ou a été supprimé.
            </EmptyState>
          ) : (
            <div className="ax-card__body">
              <div className="ax-alert ax-alert--danger" role="alert">
                <div className="ax-alert__content">
                  <p className="ax-alert__message">{ticket.error?.message ?? "Le ticket n'a pas pu être chargé."}</p>
                </div>
                <div className="ax-alert__actions">
                  <button type="button" className="ax-btn ax-btn--sm ax-btn--ghost" onClick={() => ticket.refetch()}>
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

  const data = ticket.data;
  const canWrite = !isReadOnly;
  const canUpdate = can("maintenance.ticket.update") && canWrite;
  const canDelete = can("maintenance.ticket.delete") && canWrite;
  const canLog = can("maintenance.log.create") && canWrite;

  const actions = (canUpdate || canDelete) && (
    <>
      {canUpdate && (
        <button type="button" className="ax-btn ax-btn--secondary" onClick={() => setEditing(true)}>
          <IconPencil className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
          <span className="ax-btn__label">Modifier</span>
        </button>
      )}
      {canDelete && (
        <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setDeleting(true)}>
          <IconTrash className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
          <span className="ax-btn__label">Supprimer</span>
        </button>
      )}
    </>
  );

  return (
    <>
      <PageHead
        title={title}
        crumbs={crumbs}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge entries={TICKET_STATUS} value={data.status} />
            <StatusBadge entries={TICKET_PRIORITY} value={data.priority} />
            <span>{data.unit_label}</span>
          </span>
        }
        actions={actions}
      />

      {/* Mobile : signalement, statut, affectation puis journal. Bureau : journal sous le signalement, actions à droite. */}
      <div className="grid items-start gap-5 lg:grid-cols-3 lg:grid-rows-[auto_1fr]">
        <div className="min-w-0 lg:col-span-2">
          <Panel title="Signalement">
            <p className="text-text-strong m-0 whitespace-pre-line break-words">{data.description}</p>
            <dl className="mt-5 grid gap-x-6 gap-y-4 border-t border-border-default pt-5 sm:grid-cols-2">
              <Fact label="Lot">{data.unit_label}</Fact>
              <Fact label="Catégorie">{data.category_label ?? <span className="text-text-subtle">Non renseignée</span>}</Fact>
              <Fact label="Priorité">
                <StatusBadge entries={TICKET_PRIORITY} value={data.priority} />
              </Fact>
              <Fact label="Statut">
                <StatusBadge entries={TICKET_STATUS} value={data.status} />
              </Fact>
              <Fact label="Signalé par">{personName(data.reported_by, members.data, user)}</Fact>
              <Fact label="Signalé le">{formatDate(data.created_at)}</Fact>
              <Fact label="Dernière mise à jour">{formatDateTime(data.updated_at)}</Fact>
            </dl>
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-5 lg:col-start-3 lg:row-span-2 lg:row-start-1">
          <StatusPanel key={data.status} ticket={data} canChange={can("maintenance.ticket.change_status") && canWrite} canLog={canLog} />
          <AssignPanel
            ticket={data}
            canAssign={can("maintenance.ticket.assign") && canWrite}
            canListMembers={can("member.view")}
            members={members.data}
            membersLoading={members.isLoading}
            membersError={members.error}
            me={user}
            canLog={canLog}
          />
        </div>

        <div className="min-w-0 lg:col-span-2">
          <TicketJournal ticket={data} members={members.data} me={user} canView={can("maintenance.log.view")} canCreate={canLog} />
        </div>
      </div>

      {editing && <TicketFormModal ticket={data} onClose={() => setEditing(false)} />}

      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        onConfirm={() => remove.mutate()}
        pending={remove.isPending}
        title="Supprimer ce ticket ?"
        confirmLabel="Supprimer"
        danger
      >
        <p className="m-0">
          Le ticket n°{data.id} ({data.unit_label}) et tout son journal d&apos;intervention seront définitivement supprimés. Pour
          garder une trace d&apos;une intervention terminée, préférez le statut « Clôturé ».
        </p>
        {remove.formError && <p className="text-danger mt-3 mb-0">{remove.formError}</p>}
      </ConfirmDialog>
    </>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="text-text-muted text-xs font-medium">{label}</dt>
      <dd className="text-text-strong m-0 break-words">{children}</dd>
    </div>
  );
}

/** Changement de statut (droit `maintenance.ticket.change_status`), avec trace facultative dans le journal. */
function StatusPanel({ ticket, canChange, canLog }: { ticket: Ticket; canChange: boolean; canLog: boolean }) {
  const [next, setNext] = useState<TicketStatus>(ticket.status);
  const [note, setNote] = useState(true);

  const change = useApiMutation({
    mutationFn: async (target: TicketStatus) => {
      const updated = unwrap(
        await api.POST("/api/v1/maintenance/tickets/{id}/status/", { params: { path: { id: ticket.id } }, body: { status: target } }),
      );
      if (canLog && note) {
        await addLogQuietly(ticket.id, `Statut modifié : ${TICKET_STATUS[ticket.status].label} → ${TICKET_STATUS[target].label}.`);
      }
      return updated;
    },
    invalidate: [KEYS.tickets, KEYS.ticket(ticket.id)],
    success: (updated) => `Statut du ticket : ${TICKET_STATUS[updated.status].label}.`,
  });

  return (
    <Panel title="Statut" subtitle={canChange ? "Faites avancer le ticket au fil de l'intervention." : undefined}>
      {canChange ? (
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (next !== ticket.status && !change.isPending) change.mutate(next);
          }}
        >
          <SelectField
            label="Nouveau statut"
            value={next}
            onChange={(event) => {
              const status = asStatus(event.target.value);
              if (status) setNext(status);
            }}
            options={TICKET_STATUSES.map((status) => ({
              value: status,
              label: status === ticket.status ? `${TICKET_STATUS[status].label} (actuel)` : TICKET_STATUS[status].label,
            }))}
            error={change.fieldErrors.status}
          />
          {canLog && <CheckboxField label="Noter le changement dans le journal" checked={note} onChange={(event) => setNote(event.target.checked)} />}
          {change.formError && <p className="text-danger m-0 text-sm">{change.formError}</p>}
          <button
            type="submit"
            className={`ax-btn ax-btn--primary w-full${change.isPending ? " is-loading" : ""}`}
            disabled={next === ticket.status || change.isPending}
            aria-busy={change.isPending}
          >
            <span className="ax-btn__spinner" aria-hidden="true" />
            <span className="ax-btn__label">Mettre à jour le statut</span>
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-2">
          <StatusBadge entries={TICKET_STATUS} value={ticket.status} />
          <p className="text-text-muted m-0 text-sm">Votre rôle ne permet pas de modifier le statut de ce ticket.</p>
        </div>
      )}
    </Panel>
  );
}

/**
 * Affectation à un membre actif de l'équipe (droit `maintenance.ticket.assign`).
 * L'affectation en cours vient de l'API (assigned_to_name / assigned_at) ; chaque affectation peut
 * aussi être notée dans le journal pour en garder l'historique.
 */
function AssignPanel({
  ticket,
  canAssign,
  canListMembers,
  members,
  membersLoading,
  membersError,
  me,
  canLog,
}: {
  ticket: Ticket;
  canAssign: boolean;
  canListMembers: boolean;
  members: Member[] | undefined;
  membersLoading: boolean;
  membersError: Error | null;
  me: Me | undefined;
  canLog: boolean;
}) {
  const [userId, setUserId] = useState("");
  const [note, setNote] = useState(true);
  const [missing, setMissing] = useState(false);
  const [last, setLast] = useState<{ name: string; at: string } | null>(null);
  const current = last ?? (ticket.assigned_to_name && ticket.assigned_at ? { name: ticket.assigned_to_name, at: ticket.assigned_at } : null);
  const active = (members ?? []).filter((member) => member.is_active !== false);

  const assign = useApiMutation({
    mutationFn: async (assignedTo: number) => {
      const result = unwrap(
        await api.POST("/api/v1/maintenance/tickets/{id}/assign/", {
          params: { path: { id: ticket.id } },
          body: { assigned_to: assignedTo },
        }),
      );
      const name = personName(assignedTo, members, me).replace(" (vous)", "");
      if (canLog && note) await addLogQuietly(ticket.id, `Ticket affecté à ${name}.`);
      return { ...result, name };
    },
    invalidate: [KEYS.ticket(ticket.id)],
    success: (result) => `Ticket affecté à ${result.name}.`,
    onSuccess: (result) => {
      setLast({ name: result.name, at: result.assigned_at });
      setUserId("");
    },
  });

  if (!canAssign) {
    return (
      <Panel title="Affectation">
        <p className="text-text-muted m-0 text-sm">Votre rôle ne permet pas d&apos;affecter ce ticket à un membre de l&apos;équipe.</p>
      </Panel>
    );
  }

  return (
    <Panel title="Affectation" subtitle="Confiez l'intervention à un membre de l'équipe.">
      {current && (
        <div className="ax-alert ax-alert--success mb-4" role="status">
          <div className="ax-alert__content">
            <p className="ax-alert__message">
              Affecté à <strong>{current.name}</strong> le {formatDateTime(current.at)}.
            </p>
          </div>
        </div>
      )}
      {!canListMembers ? (
        <p className="text-text-muted m-0 text-sm">Votre rôle ne donne pas accès à la liste de l&apos;équipe : l&apos;affectation n&apos;est pas disponible.</p>
      ) : membersError ? (
        <p className="text-danger m-0 text-sm">La liste de l&apos;équipe n&apos;a pas pu être chargée.</p>
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!userId) {
              setMissing(true);
              return;
            }
            if (!assign.isPending) assign.mutate(Number(userId));
          }}
        >
          <SelectField
            label="Membre de l'équipe"
            value={userId}
            onChange={(event) => {
              setMissing(false);
              setUserId(event.target.value);
            }}
            options={active.map((member) => ({
              value: member.user.id,
              label: member.user.id === me?.id ? `${memberName(member.user)} (vous)` : memberName(member.user),
            }))}
            placeholder={membersLoading ? "Chargement de l'équipe…" : "Choisir un membre"}
            disabled={membersLoading}
            error={missing ? "Choisissez la personne à qui confier le ticket." : assign.fieldErrors.assigned_to}
            hint="Seuls les membres actifs de l'agence peuvent recevoir un ticket."
          />
          {canLog && <CheckboxField label="Noter l'affectation dans le journal" checked={note} onChange={(event) => setNote(event.target.checked)} />}
          {assign.formError && <p className="text-danger m-0 text-sm">{assign.formError}</p>}
          <button
            type="submit"
            className={`ax-btn ax-btn--secondary w-full${assign.isPending ? " is-loading" : ""}`}
            disabled={assign.isPending || membersLoading}
            aria-busy={assign.isPending}
          >
            <span className="ax-btn__spinner" aria-hidden="true" />
            <span className="ax-btn__label">Affecter le ticket</span>
          </button>
        </form>
      )}
    </Panel>
  );
}
