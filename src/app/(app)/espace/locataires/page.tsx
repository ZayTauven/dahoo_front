import type { Metadata } from "next";

import { TenantsScreen } from "./TenantsScreen";

export const metadata: Metadata = { title: "Locataires" };

export default function Page() {
  return <TenantsScreen />;
}
