"use client";

import {
  IconAlertTriangle,
  IconCalendarEvent,
  IconCash,
  IconFileText,
  IconHourglass,
  IconInbox,
  IconTool,
  IconUserCheck,
  type Icon,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import type { Page, Schema } from "@/lib/api/types";

export type InAppNotification = Schema<"InAppNotification">;
export type NotificationKind = InAppNotification["kind"];
type Tone = "accent" | "success" | "warning" | "danger";

export const NOTIFICATION_KEYS = {
  all: ["notifications"] as const,
  summary: ["notifications", "summary"] as const,
  list: (unread: boolean, page: number) => ["notifications", "list", { unread, page }] as const,
};

/** Pastille : rafraîchie toutes les minutes (et au retour sur l'onglet). */
const SUMMARY_INTERVAL = 60_000;

export const KIND_META: Record<NotificationKind, { icon: Icon; tone: Tone; label: string }> = {
  VISIT_REQUEST: { icon: IconCalendarEvent, tone: "accent", label: "Demande de visite" },
  PAYMENT_RECEIVED: { icon: IconCash, tone: "success", label: "Paiement" },
  TICKET_CREATED: { icon: IconTool, tone: "warning", label: "Maintenance" },
  TICKET_ASSIGNED: { icon: IconUserCheck, tone: "accent", label: "Ticket assigné" },
  RENT_OVERDUE: { icon: IconAlertTriangle, tone: "danger", label: "Loyer en retard" },
  LEASE_ENDING: { icon: IconFileText, tone: "warning", label: "Fin de bail" },
  TRIAL_ENDING: { icon: IconHourglass, tone: "warning", label: "Fin d'essai" },
  DEMO_REQUEST: { icon: IconInbox, tone: "accent", label: "Demande de démo" },
};

const TIME = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });
const DAY = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });
const DAY_YEAR = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" });

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** « À l'instant », « Il y a 5 min », « Il y a 3 h », « Hier à 14:05 », « 12 sept. ». */
export function relativeTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const minutes = Math.round((now.getTime() - date.getTime()) / 60_000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const days = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);
  if (days === 0) return `Il y a ${Math.floor(minutes / 60)} h`;
  if (days === 1) return `Hier à ${TIME.format(date)}`;
  return (date.getFullYear() === now.getFullYear() ? DAY : DAY_YEAR).format(date);
}

/** Libellé de groupe de la page Notifications : « Aujourd'hui », « Hier », « Cette semaine », « Plus ancien ». */
export function dayGroup(iso: string, now: Date = new Date()): string {
  const days = Math.round((startOfDay(now) - startOfDay(new Date(iso))) / 86_400_000);
  if (days <= 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 7) return "Cette semaine";
  return "Plus ancien";
}

export function useNotificationSummary(enabled = true) {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.summary,
    queryFn: async () => unwrap(await api.GET("/api/v1/notifications/inapp/summary/")),
    enabled,
    refetchInterval: SUMMARY_INTERVAL,
    refetchOnWindowFocus: true,
  });
}

export function useNotificationList({
  unread,
  page = 1,
  enabled = true,
}: {
  unread: boolean;
  page?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.list(unread, page),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/notifications/inapp/", {
          params: { query: { unread: unread || undefined, page: page > 1 ? page : undefined } },
        }),
      ),
    enabled,
  });
}

/** Marque une notification comme lue : mise à jour immédiate des listes et de la pastille. */
export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) =>
      unwrap(await api.PATCH("/api/v1/notifications/inapp/{id}/", { params: { path: { id } }, body: { read: true } })),
    onMutate: (id) => {
      queryClient.setQueriesData<Page<InAppNotification>>({ queryKey: [...NOTIFICATION_KEYS.all, "list"] }, (page) =>
        page
          ? { ...page, results: page.results.map((item) => (item.id === id ? { ...item, read: true } : item)) }
          : page,
      );
      queryClient.setQueryData<{ unread: number }>(NOTIFICATION_KEYS.summary, (summary) =>
        summary ? { unread: Math.max(0, summary.unread - 1) } : summary,
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all }),
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => unwrap(await api.POST("/api/v1/notifications/inapp/read-all/")),
    onMutate: () => {
      queryClient.setQueriesData<Page<InAppNotification>>({ queryKey: [...NOTIFICATION_KEYS.all, "list"] }, (page) =>
        page ? { ...page, results: page.results.map((item) => ({ ...item, read: true })) } : page,
      );
      queryClient.setQueryData(NOTIFICATION_KEYS.summary, { unread: 0 });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all }),
  });
}
