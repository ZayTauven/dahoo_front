import type { Metadata } from "next";

import { PropertiesScreen } from "./PropertiesScreen";

export const metadata: Metadata = {
  title: "Biens",
  description: "Les biens de l'agence, leurs bâtiments, leurs lots et leur taux d'occupation.",
};

export default function Page() {
  return <PropertiesScreen />;
}
