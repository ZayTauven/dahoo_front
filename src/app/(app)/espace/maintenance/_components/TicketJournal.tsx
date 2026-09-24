"use client";

import { IconFlag, IconMessage2, IconSend } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { TextareaField } from "@/components/app/ui/fields";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { useApiMutation } from "@/lib/api/useApiMutation";
import type { Me } from "@/lib/auth/useSession";
import { cn } from "@/lib/utils";

import { KEYS, fetchTicketLogs, formatDateTime, personName, type Member, type Ticket } from "./data";
import { Panel } from "./Panel";

/**
 * Journal d'intervention (classes .ax-timeline) : le signalement en tête, puis les entrées dans l'ordre
 * chronologique, et le formulaire d'ajout en bas (droit `maintenance.log.create`).
 */
export function TicketJournal({
  ticket,
  members,
  me,
  canView,
  canCreate,
}: {
  ticket: Ticket;
  members: Member[] | undefined;
  me: Me | undefined;
  canView: boolean;
  canCreate: boolean;
}) {
  const [message, setMessage] = useState("");
  const [empty, setEmpty] = useState(false);

  const logs = useQuery({
    queryKey: KEYS.logs(ticket.id),
    queryFn: () => fetchTicketLogs(ticket.id),
    enabled: canView,
  });

  const add = useApiMutation({
    mutationFn: async (text: string) =>
      unwrap(await api.POST("/api/v1/maintenance/tickets/{id}/logs/", { params: { path: { id: ticket.id } }, body: { message: text } })),
    invalidate: [KEYS.logs(ticket.id)],
    success: "Entrée ajoutée au journal.",
    onSuccess: () => setMessage(""),
  });

  if (!canView) {
    return (
      <Panel title="Journal d'intervention">
        <p className="text-text-muted m-0 text-sm">Votre rôle ne donne pas accès au journal de ce ticket.</p>
      </Panel>
    );
  }

  const entries = logs.data ?? [];

  return (
    <Panel title="Journal d'intervention" subtitle="Appels, passages de l'artisan, devis, pièces commandées : tout ce qui fait avancer le ticket.">
      <div className="flex flex-col gap-6">
        {logs.error ? (
          <div className="ax-alert ax-alert--danger" role="alert">
            <div className="ax-alert__content">
              <p className="ax-alert__message">{logs.error.message}</p>
            </div>
            <div className="ax-alert__actions">
              <button type="button" className="ax-btn ax-btn--sm ax-btn--ghost" onClick={() => logs.refetch()}>
                <span className="ax-btn__label">Réessayer</span>
              </button>
            </div>
          </div>
        ) : (
          <ol className="ax-timeline" aria-busy={logs.isLoading} aria-label="Historique du ticket">
            <li className="ax-timeline__item">
              <span className="ax-timeline__marker">
                <IconFlag stroke={1.75} aria-hidden="true" />
              </span>
              <div className="ax-timeline__content">
                <time className="ax-timeline__time" dateTime={ticket.created_at}>
                  {formatDateTime(ticket.created_at)}
                </time>
                <p className="ax-timeline__title">Ticket signalé</p>
                <p className="ax-timeline__body m-0">Par {personName(ticket.reported_by, members, me)}.</p>
              </div>
            </li>
            {logs.isLoading && (
              <li className="ax-timeline__item ax-timeline__item--pending">
                <span className="ax-timeline__marker">
                  <IconMessage2 stroke={1.75} aria-hidden="true" />
                </span>
                <div className="ax-timeline__content flex flex-col gap-2">
                  <span className="ax-skeleton ax-skeleton--text w-28" />
                  <span className="ax-skeleton ax-skeleton--text w-3/4" />
                </div>
              </li>
            )}
            {entries.map((log, index) => (
              <li key={log.id} className={cn("ax-timeline__item", index === entries.length - 1 && "is-current")}>
                <span className="ax-timeline__marker">
                  <IconMessage2 stroke={1.75} aria-hidden="true" />
                </span>
                <div className="ax-timeline__content">
                  <time className="ax-timeline__time" dateTime={log.created_at}>
                    {formatDateTime(log.created_at)}
                  </time>
                  <p className="ax-timeline__title">{personName(log.user, members, me)}</p>
                  <p className="ax-timeline__body m-0 whitespace-pre-line break-words">{log.message}</p>
                </div>
              </li>
            ))}
          </ol>
        )}

        {logs.isSuccess && entries.length === 0 && (
          <p className="text-text-muted m-0 text-sm">
            Aucune entrée pour l&apos;instant.{canCreate ? " Notez la première démarche engagée ci-dessous." : ""}
          </p>
        )}

        {canCreate && (
          <form
            className="border-border-default flex flex-col gap-3 border-t pt-5"
            onSubmit={(event) => {
              event.preventDefault();
              const text = message.trim();
              if (!text) {
                setEmpty(true);
                return;
              }
              if (!add.isPending) add.mutate(text);
            }}
          >
            <TextareaField
              label="Nouvelle entrée"
              rows={3}
              placeholder="Ex. : plombier passé ce matin, joint remplacé. Repasse jeudi pour vérifier l'étanchéité."
              value={message}
              onChange={(event) => {
                setEmpty(false);
                setMessage(event.target.value);
              }}
              error={empty ? "Écrivez le contenu de l'entrée." : (add.fieldErrors.message ?? add.formError)}
            />
            <div className="flex justify-end">
              <button type="submit" className={`ax-btn ax-btn--primary max-sm:w-full${add.isPending ? " is-loading" : ""}`} disabled={add.isPending} aria-busy={add.isPending}>
                <span className="ax-btn__spinner" aria-hidden="true" />
                <IconSend className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
                <span className="ax-btn__label">Ajouter au journal</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </Panel>
  );
}
