import type { Metadata } from "next";

import { PaymentsScreen } from "./PaymentsScreen";

export const metadata: Metadata = {
  title: "Paiements",
  description:
    "Encaissements de l'agence et leur affectation aux échéances des baux.",
};

export default function Page() {
  return <PaymentsScreen />;
}
