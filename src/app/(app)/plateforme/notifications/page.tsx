import type { Metadata } from "next";

import { NotificationsScreen } from "@/components/app/notifications/NotificationsScreen";

export const metadata: Metadata = {
  title: "Notifications",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <NotificationsScreen crumbs={[{ label: "Plateforme Dahoo", href: "/plateforme" }, { label: "Notifications" }]} />
  );
}
