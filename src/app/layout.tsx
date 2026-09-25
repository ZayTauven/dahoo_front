import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Instrument_Serif, JetBrains_Mono, Urbanist } from "next/font/google";
import type { ReactNode } from "react";

import { InlineScript } from "@/components/providers/InlineScript";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SITE_URL } from "@/lib/config";
import { THEME_SCRIPT } from "@/lib/theme";

import "@/styles/app.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-dahoo-sans", display: "swap" });
const display = Urbanist({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-dahoo-display", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-dahoo-mono", display: "swap" });

// Site public : titres en serif éditorial, texte en Geist, étiquettes et chiffres en Geist Mono.
const siteSerif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-site-serif", display: "swap" });
const siteSans = Geist({ subsets: ["latin"], variable: "--font-site-sans", display: "swap" });
const siteMono = Geist_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-site-mono", display: "swap" });

const FONT_VARIABLES = [sans, display, mono, siteSerif, siteSans, siteMono].map((font) => font.variable).join(" ");

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
    <html lang="fr" className={FONT_VARIABLES} suppressHydrationWarning>
      <head>
        <InlineScript html={THEME_SCRIPT} />
      </head>
      <body>
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
