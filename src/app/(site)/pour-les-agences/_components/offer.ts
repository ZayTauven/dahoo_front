/**
 * Faits de l'offre Dahoo, partagés par « Pour les agences » et « Tarifs » : uniquement ce que le
 * logiciel fait réellement (aucun chiffre inventé).
 */

/** Les six modules du logiciel, inclus dans toutes les offres. */
export const MODULES = ["Biens et lots", "Locataires et baux", "Échéances", "Paiements", "Maintenance", "Annonces"] as const;

/** Moyens de paiement enregistrés dans Dahoo, avec logo quand il existe. */
export const PAYMENT_LOGOS = [
  { name: "Wave", src: "/images/site/logos/wave.png" },
  { name: "Orange Money", src: "/images/site/logos/orange-money.png" },
] as const;

export const OTHER_PAYMENTS = ["Virement", "Espèces"] as const;

/** Les quatre rôles de l'équipe. */
export const ROLES = ["Administrateur", "Gestionnaire", "Comptable", "Lecture seule"] as const;

/** Captures réelles de l'espace agence (données de démonstration), 2880 × 1800. */
export const SCREENS = {
  tableauDeBord: "/images/site/app/tableau-de-bord.webp",
  biens: "/images/site/app/biens.webp",
  locataires: "/images/site/app/locataires.webp",
  baux: "/images/site/app/baux.webp",
  echeances: "/images/site/app/echeances.webp",
  paiements: "/images/site/app/paiements.webp",
  maintenance: "/images/site/app/maintenance.webp",
  annonces: "/images/site/app/annonces.webp",
} as const;

export const DEMO_HREF = "/pour-les-agences#demo";
