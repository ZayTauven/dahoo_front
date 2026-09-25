import type { Metadata } from "next";

import { DashboardScreen } from "./_tableau-de-bord/DashboardScreen";

export const metadata: Metadata = { title: "Tableau de bord" };

export default function DashboardPage() {
  return <DashboardScreen />;
}
