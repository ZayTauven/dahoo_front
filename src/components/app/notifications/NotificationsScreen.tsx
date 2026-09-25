"use client";

import { IconBellOff, IconChecks } from "@tabler/icons-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { EmptyState } from "@/components/app/EmptyState";
import { PageHead, type Crumb } from "@/components/app/shell/PageHead";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";

import {
  dayGroup,
  NOTIFICATION_KEYS,
  useMarkAllRead,
  useMarkRead,
  useNotificationSummary,
  type InAppNotification,
} from "./data";
import { NotificationRow } from "./NotificationRow";

/** Toutes les notifications (espace agence et espace plateforme), regroupées par jour. */
export function NotificationsScreen({ crumbs }: { crumbs: Crumb[] }) {
  const router = useRouter();
  const [onlyUnread, setOnlyUnread] = useState(false);
  const summary = useNotificationSummary();
  const unread = summary.data?.unread ?? 0;
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();

  const list = useInfiniteQuery({
    queryKey: [...NOTIFICATION_KEYS.all, "list", "infinite", { unread: onlyUnread }],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      unwrap(
        await api.GET("/api/v1/notifications/inapp/", {
          params: { query: { unread: onlyUnread || undefined, page: pageParam > 1 ? pageParam : undefined } },
        }),
      ),
    getNextPageParam: (last, pages) => (last.next ? pages.length + 1 : undefined),
  });

  const items = list.data?.pages.flatMap((page) => page.results) ?? [];
  const groups = items.reduce<{ label: string; items: InAppNotification[] }[]>((acc, item) => {
    const label = dayGroup(item.created_at);
    const group = acc.at(-1);
    if (group?.label === label) group.items.push(item);
    else acc.push({ label, items: [item] });
    return acc;
  }, []);

  const open = (item: InAppNotification) => {
    if (!item.read) markRead.mutate(item.id);
    if (item.link) router.push(item.link);
  };

  return (
    <>
      <PageHead
        title="Notifications"
        subtitle="Demandes de visite, paiements, tickets et rappels : tout ce qui demande votre attention."
        crumbs={crumbs}
        actions={
          unread > 0 && (
            <button type="button" className="ax-btn ax-btn--secondary" onClick={() => markAll.mutate()}>
              <IconChecks className="ax-btn__icon" stroke={1.75} aria-hidden="true" />
              <span className="ax-btn__label">Tout marquer comme lu</span>
            </button>
          )
        }
      />
      <section className="ax-card mx-auto w-full max-w-3xl" aria-label="Liste des notifications">
        <div className="ax-card__header">
          <div className="ax-notif__tabs m-0" role="group" aria-label="Filtrer les notifications">
            {(
              [
                [false, "Toutes"],
                [true, `Non lues${unread ? ` (${unread})` : ""}`],
              ] as const
            ).map(([value, label]) => (
              <button
                key={label}
                type="button"
                aria-pressed={onlyUnread === value}
                className={`ax-notif__tab${onlyUnread === value ? " is-active" : ""}`}
                onClick={() => setOnlyUnread(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="ax-card__body flex flex-col gap-5 pt-0">
          {list.isPending ? (
            <div className="flex flex-col gap-3" aria-busy="true" aria-label="Chargement">
              {[0, 1, 2, 3].map((index) => (
                <span key={index} className="ax-skeleton block h-14 rounded-xl" />
              ))}
            </div>
          ) : list.isError ? (
            <div className="ax-alert ax-alert--danger" role="alert">
              <div className="ax-alert__content">
                <p className="ax-alert__message">{list.error.message}</p>
              </div>
            </div>
          ) : groups.length === 0 ? (
            <EmptyState icon={IconBellOff} title={onlyUnread ? "Tout est lu" : "Aucune notification"}>
              {onlyUnread
                ? "Vous êtes à jour. Les prochaines demandes et alertes apparaîtront ici."
                : "Les demandes de visite, paiements, tickets et rappels de votre agence apparaîtront ici."}
            </EmptyState>
          ) : (
            groups.map((group) => (
              <div key={group.label} className="flex flex-col gap-1">
                <h2 className="ax-eyebrow m-0 px-3">{group.label}</h2>
                <ul className="ax-notif__list">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <NotificationRow item={item} onOpen={open} />
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
          {list.hasNextPage && (
            <button
              type="button"
              className="ax-btn ax-btn--ghost self-center"
              onClick={() => list.fetchNextPage()}
              disabled={list.isFetchingNextPage}
            >
              <span className="ax-btn__label">{list.isFetchingNextPage ? "Chargement…" : "Afficher plus"}</span>
            </button>
          )}
        </div>
      </section>
    </>
  );
}
