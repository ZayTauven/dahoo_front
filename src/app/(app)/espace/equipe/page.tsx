import type { Metadata } from "next";

import { TeamScreen } from "./TeamScreen";

export const metadata: Metadata = {
  title: "Équipe",
  description: "Les membres de votre agence, leurs rôles et leurs accès.",
};

export default function Page() {
  return <TeamScreen />;
}
