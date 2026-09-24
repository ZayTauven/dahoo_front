import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Urbanist } from "next/font/google";
import type { ReactNode } from "react";

import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SITE_URL } from "@/lib/config";
import { THEME_SCRIPT } from "@/lib/theme";

import "@/styles/app.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-dahoo-sans", display: "swap" });
const display = Urbanist({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-dahoo-display", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-dahoo-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Dahoo — Gestion immobilière et annonces",
    template: "%s · Dahoo",
  },
  description:
    "Dahoo réunit les agences immobilières et leurs clients : annonces à louer et à vendre, gestion locative, loyers et maintenance.",
  applicationName: "Dahoo",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FCFBF9" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0C11" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // Le script de thème modifie <html> avant l'hydratation : l'écart est voulu.
    <html lang="fr" className={`${sans.variable} ${display.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
