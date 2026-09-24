import type { Metadata } from "next";

import { DemoRequestsScreen } from "./DemoRequestsScreen";

export const metadata: Metadata = {
  title: "Demandes de démo",
  description: "Demandes de démonstration envoyées par les agences depuis le site : suivi et création des agences.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <DemoRequestsScreen />;
}
