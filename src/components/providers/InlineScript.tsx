"use client";

/**
 * Script en ligne exécuté pendant l'analyse du HTML (chargement complet uniquement). Côté client,
 * React le rend en `text/plain` : sinon il avertit qu'il a produit une balise <script> (visible sur
 * les pages 404, rendues à nouveau dans le navigateur). Cf. guide Next « preventing-flash-before-hydration ».
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
