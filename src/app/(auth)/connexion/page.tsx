import { IconArrowLeft } from "@tabler/icons-react";
import type { Metadata, Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { Highlight, RevealLines } from "@/components/site/motion";
import { PHOTOS } from "@/components/site/photos";
import { Eyebrow } from "@/components/site/SectionHeading";

import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Connexion",
  robots: { index: false },
};

// Page publique : même sable que le site, toujours en thème clair.
export const viewport: Viewport = { themeColor: "#F2EDE4" };

export default function LoginPage() {
  return (
    <div className="site grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <aside className="bg-brand-900 relative hidden overflow-hidden lg:block" aria-hidden="true">
        <Image src={PHOTOS.villaPatioBleu.src} alt="" fill preload sizes="55vw" className="object-cover" />
        <div className="from-brand-900/90 via-brand-900/30 to-brand-900/10 absolute inset-0 bg-linear-to-t" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-6 p-12 text-white xl:p-16">
          <p className="site-label m-0 text-white/70">Espace agence</p>
          <p className="font-display m-0 max-w-xl text-6xl leading-[0.98] tracking-tight xl:text-7xl">
            Vos biens, vos locataires et vos loyers, <em className="italic">au même endroit.</em>
          </p>
        </div>
      </aside>

      <main id="contenu" className="flex flex-col px-5 py-8 sm:px-10 lg:px-16 lg:py-10">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="Dahoo, retour au site">
            <Image src="/brand/logo.png" alt="Dahoo" width={118} height={52} loading="eager" />
          </Link>
          <Link href="/" className="site-link text-text-muted inline-flex items-center gap-2 text-sm">
            <IconArrowLeft size={16} stroke={1.75} aria-hidden="true" /> Retour au site
          </Link>
        </div>

        <div className="flex flex-1 items-center py-16">
          <div className="flex w-full max-w-[440px] flex-col gap-10">
            <header className="flex flex-col gap-5">
              <Eyebrow>Connexion</Eyebrow>
              <h1 className="font-display text-text-strong m-0 text-6xl leading-[0.95] font-normal tracking-tight sm:text-7xl">
                <RevealLines play="mount" lines={[<Highlight key="titre">Bon retour.</Highlight>]} />
              </h1>
              <p className="text-text-muted m-0 leading-relaxed">Accédez à l&apos;espace de gestion de votre agence.</p>
            </header>
            {/* useSearchParams (retour à la page demandée) impose une frontière Suspense. */}
            <Suspense>
              <LoginForm />
            </Suspense>
            <p className="border-border-default text-text-muted m-0 border-t pt-6 text-sm">
              Pas encore de compte ?{" "}
              <Link className="site-link text-text-strong font-medium" href="/pour-les-agences">
                Découvrir Dahoo pour les agences
              </Link>
            </p>
          </div>
        </div>

        <p className="site-label text-text-subtle m-0">© Dahoo — Dakar, Sénégal</p>
      </main>
    </div>
  );
}
