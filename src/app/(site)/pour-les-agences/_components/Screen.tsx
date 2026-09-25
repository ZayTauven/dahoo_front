import Image from "next/image";

import { cn } from "@/lib/utils";

import { OTHER_PAYMENTS, PAYMENT_LOGOS } from "./offer";

/**
 * Vraie capture de l'espace agence, mise en situation dans une fenêtre de navigateur (barre
 * d'adresse, filet, ombre d'encre) et recadrée sur la partie utile :
 * - `crop="full"` : tout l'écran, menu compris, sans le bas vide de la page ;
 * - `crop="content"` : zoom sur le contenu (le menu latéral sort du cadre), plus lisible en petit.
 */
export function Screen({
  src,
  alt,
  path,
  sizes,
  crop = "full",
  preload = false,
  className,
}: {
  src: string;
  alt: string;
  /** Adresse affichée dans la barre de la fenêtre (« espace/echeances »). */
  path: string;
  sizes: string;
  crop?: "full" | "content";
  preload?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border-strong bg-surface-solid overflow-hidden rounded-md border shadow-2xl shadow-text-strong/25",
        className,
      )}
    >
      <div aria-hidden="true" className="border-border-default flex items-center gap-3 border-b px-3 py-2">
        <span className="flex gap-1">
          <span className="bg-text-strong/15 size-1.5 rounded-full" />
          <span className="bg-text-strong/15 size-1.5 rounded-full" />
          <span className="bg-text-strong/15 size-1.5 rounded-full" />
        </span>
        <span className="text-text-muted bg-canvas truncate rounded-full px-3 py-0.5 font-mono text-[0.6rem] tracking-wide">
          dahoo.sn/{path}
        </span>
      </div>
      <div className={cn("relative overflow-hidden", crop === "full" ? "aspect-2/1" : "aspect-16/10")}>
        <Image
          src={src}
          alt={alt}
          width={2880}
          height={1800}
          preload={preload}
          sizes={sizes}
          className={cn("absolute top-0 h-auto max-w-none", crop === "full" ? "left-0 w-full" : "right-0 w-[124%]")}
        />
      </div>
    </div>
  );
}

/** Pastilles Wave et Orange Money (logos réels), plus les autres moyens en texte. */
export function PaymentPills({ className, withOthers = false }: { className?: string; withOthers?: boolean }) {
  return (
    <ul aria-label="Moyens de paiement enregistrés" className={cn("m-0 flex list-none flex-wrap items-center gap-2 p-0", className)}>
      {PAYMENT_LOGOS.map((payment) => (
        <li key={payment.name} className="flex items-center gap-2 rounded-full bg-white py-1 pr-3.5 pl-1 shadow-sm shadow-text-strong/10">
          <Image src={payment.src} alt="" width={28} height={28} className="size-7 rounded-full object-cover" />
          <span className="text-brand-900 text-sm font-medium whitespace-nowrap">{payment.name}</span>
        </li>
      ))}
      {withOthers &&
        OTHER_PAYMENTS.map((name) => (
          <li key={name} className="border-border-strong text-text-strong rounded-full border px-3.5 py-1.5 text-sm">
            {name}
          </li>
        ))}
    </ul>
  );
}
