"use client";

import { KIND_META, relativeTime, type InAppNotification } from "./data";

/** Une notification (cloche et page Notifications) : icône du type, titre, détail, date, pastille non lue. */
export function NotificationRow({
  item,
  onOpen,
}: {
  item: InAppNotification;
  onOpen: (item: InAppNotification) => void;
}) {
  const meta = KIND_META[item.kind];
  const KindIcon = meta.icon;
  return (
    <button type="button" className={`ax-notif__row${item.read ? "" : " is-unread"}`} onClick={() => onOpen(item)}>
      <span className={`ax-notif__chip ax-notif__chip--${meta.tone}`} aria-hidden="true">
        <KindIcon className="ax-icon" stroke={1.75} />
      </span>
      <span className="ax-notif__body">
        <span className="sr-only">{meta.label} : </span>
        <b className="ax-notif__title">{item.title}</b>
        {item.body && <span className="ax-notif__text">{item.body}</span>}
        <time className="ax-notif__time" dateTime={item.created_at}>
          {relativeTime(item.created_at)}
        </time>
      </span>
      {!item.read && (
        <span className="ax-notif__dot">
          <span className="sr-only">Non lue</span>
        </span>
      )}
    </button>
  );
}
