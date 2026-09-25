"use client";

import { IconBell } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Dropdown } from "@/components/ui/Dropdown";

import {
  useMarkAllRead,
  useMarkRead,
  useNotificationList,
  useNotificationSummary,
  type InAppNotification,
} from "./data";
import { NotificationRow } from "./NotificationRow";

const PREVIEW = 8;

function BellPanel({ allHref, unread, close }: { allHref: string; unread: number; close: () => void }) {
  const router = useRouter();
  const [onlyUnread, setOnlyUnread] = useState(false);
  const list = useNotificationList({ unread: onlyUnread });
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const items = list.data?.results.slice(0, PREVIEW) ?? [];

  const open = (item: InAppNotification) => {
    if (!item.read) markRead.mutate(item.id);
    close();
    if (item.link) router.push(item.link);
  };

  return (
    <>
      <div className="ax-dropdown__head ax-notif__head">
        <span>Notifications</span>
        {unread > 0 && (
          <button type="button" className="ax-notif__mark-all" onClick={() => markAll.mutate()}>
            Tout marquer comme lu
          </button>
        )}
      </div>
      <div className="ax-notif__tabs" role="group" aria-label="Filtrer les notifications">
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
      {list.isPending ? (
        <p className="ax-notif__empty" aria-busy="true">
          Chargement…
        </p>
      ) : list.isError ? (
        <p className="ax-notif__empty" role="alert">
          Les notifications n&apos;ont pas pu être chargées.
        </p>
      ) : items.length === 0 ? (
        <p className="ax-notif__empty">
          {onlyUnread ? "Tout est lu. Beau travail !" : "Aucune notification pour l'instant."}
        </p>
      ) : (
        <ul className="ax-notif__list">
          {items.map((item) => (
            <li key={item.id}>
              <NotificationRow item={item} onOpen={open} />
            </li>
          ))}
        </ul>
      )}
      <Link className="ax-dropdown__foot" href={allHref} onClick={close}>
        Toutes les notifications
      </Link>
    </>
  );
}

/** Cloche de l'en-tête : pastille des non lues (rafraîchie chaque minute) et aperçu des dernières. */
export function NotificationBell({ allHref }: { allHref: string }) {
  const summary = useNotificationSummary();
  const unread = summary.data?.unread ?? 0;
  const label = unread ? `Notifications, ${unread} non lue${unread > 1 ? "s" : ""}` : "Notifications";

  return (
    <Dropdown
      className="ax-notif"
      panelClassName="ax-dropdown ax-notif__menu"
      panelRole="dialog"
      panelAriaLabel="Notifications"
      trigger={({ open, triggerProps }) => (
        <button
          type="button"
          className="ax-icon-btn ax-notif__trigger"
          aria-label={label}
          title="Notifications"
          {...triggerProps}
          aria-expanded={open}
        >
          <IconBell className="ax-icon" stroke={1.75} aria-hidden="true" />
          {unread > 0 && (
            <span className="ax-badge-count" aria-hidden="true">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      )}
    >
      {(close) => <BellPanel allHref={allHref} unread={unread} close={close} />}
    </Dropdown>
  );
}
