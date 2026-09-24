import type { Metadata } from "next";

import { TicketsScreen } from "./_components/TicketsScreen";

export const metadata: Metadata = {
  title: "Maintenance",
  description: "Tickets d'intervention de l'agence : signalement, affectation et suivi jusqu'à la clôture.",
};

export default function Page() {
  return <TicketsScreen />;
}
