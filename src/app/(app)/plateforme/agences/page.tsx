import type { Metadata } from "next";

import { OrganizationsScreen } from "./OrganizationsScreen";

export const metadata: Metadata = {
  title: "Agences clientes",
  description: "Agences clientes de Dahoo : essais, abonnements, accès et création de nouvelles agences.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <OrganizationsScreen />;
}
