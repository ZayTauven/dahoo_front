import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Connexion",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[52%_48%]">
      <aside className="relative hidden overflow-hidden lg:block" aria-hidden="true">
        <Image src="/images/site/slider-01.webp" alt="" fill preload sizes="52vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/85 via-brand-900/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-12 text-white">
          <p className="font-display text-3xl leading-tight font-semibold">
            Vos biens, vos locataires et vos loyers, au même endroit.
          </p>
          <p className="max-w-md text-white/80">
            Dahoo accompagne les agences immobilières : gestion locative, encaissements, maintenance et annonces.
          </p>
        </div>
      </aside>

      <main id="contenu" className="flex items-center justify-center px-6 py-10">
        <div className="flex w-full max-w-[420px] flex-col gap-8">
          <Link href="/" aria-label="Dahoo, retour au site">
            <Image src="/brand/logo.png" alt="Dahoo" width={150} height={49} loading="eager" />
          </Link>
          <header className="flex flex-col gap-1">
            <h1 className="font-display text-text-strong text-3xl font-bold">Connexion</h1>
            <p className="text-text-muted text-sm">Accédez à l&apos;espace de gestion de votre agence.</p>
          </header>
          {/* useSearchParams (retour à la page demandée) impose une frontière Suspense. */}
          <Suspense>
            <LoginForm />
          </Suspense>
          <p className="text-text-muted text-sm">
            Vous n&apos;avez pas encore de compte ?{" "}
            <Link className="ax-link font-medium" href="/pour-les-agences">
              Découvrir Dahoo pour les agences
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
