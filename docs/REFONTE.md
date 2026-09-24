# Refonte du front Dahoo

Document de référence de la refonte : décisions d'architecture, conventions et découpage du travail.
Toute personne (ou agent) qui contribue à la refonte le lit avant d'écrire du code.

## 1. Décisions

| Sujet | Décision | Pourquoi |
| --- | --- | --- |
| Nombre d'applications | **Une seule app Next.js** (ce dépôt), découpée en groupes de routes | Une charte, un client API, une authentification et un déploiement. Le site public et l'espace agence partagent le design system. |
| Base technique | **Vireo** (Next + React 19 + Tailwind 4, tokens `--ax-*`), porté en Next 16 | Déjà en composants React, avec un design system à tokens, un shell, le thème clair/sombre et des graphiques. |
| Site public | **Réécriture** des pages immobilier de **Crafto** en React + Tailwind sur les tokens Dahoo | On n'importe **ni** le CSS de Crafto (≈ 1,5 Mo, Bootstrap), **ni** jQuery : il entrerait en conflit avec le dashboard et plomberait les performances. Crafto sert de **référence visuelle**. |
| Comportements Crafto | Swiper (`swiper/react`) pour les carrousels, `motion` pour les animations (`data-anime`), Leaflet pour les cartes | Remplace `main.js`, `vendors.min.js` et jQuery. |
| Authentification | **Backend-for-frontend** : jetons JWT en cookies `httpOnly`, relais Next `/api/backend/*` vers Django, `proxy.ts` pour les redirections | Aucun jeton accessible au JavaScript (XSS), une seule origine (pas de CORS en production). Conforme au guide Next 16 `backend-for-frontend`. |
| Données | Site public : Server Components qui interrogent Django directement (SEO, mise en cache). Espace agence : React Query côté client, via le relais | Référencement pour les annonces, interactivité pour la gestion. |
| Types | Générés depuis le schéma OpenAPI du backend (`openapi-typescript`) | Le front et l'API restent synchronisés ; toute rupture de contrat casse la compilation. |
| Langue et devise | Français, FCFA (`Intl.NumberFormat('fr-FR', { currency: 'XOF' })`) | Marché cible. La structure permet d'ajouter d'autres langues plus tard. |

## 2. Charte Dahoo

Couleurs tirées du logo (`public/Logo/`) :

| Rôle | Couleur | Usage |
| --- | --- | --- |
| Accent (primaire) | Orange `#F7941D` | Actions principales, liens, focus, mise en avant |
| Marque (secondaire) | Indigo `#283891` | Titres forts, en-têtes, sidebar, pied de page du site |

- Polices : **Urbanist** pour les titres (géométrique, proche du logo) et **Inter** pour le texte et l'interface.
- Tokens : preset d'accent `dahoo` dans `src/styles/tokens/_accents.css` (rampe 50→900 dérivée de l'orange), plus `--ax-brand-*` pour l'indigo. **Aucune couleur en dur dans les composants** : on passe par les tokens (`var(--ax-…)`) ou par les utilitaires Tailwind qui y sont reliés.
- Thème clair et sombre conservés. Le personnaliseur de Vireo (12 accents, RTL, dispositions) est retiré : la charte est fixe.

## 3. Organisation des routes

```
src/app/
  (site)/            Site public : portail d'annonces + vitrine SaaS (header/footer marketing)
    page.tsx                 Accueil
    louer/  acheter/         Listes d'annonces filtrables
    biens/[id]/              Fiche d'un bien + demande de visite
    agences/ agences/[id]/   Agences partenaires
    pour-les-agences/        Offre Dahoo (fonctionnalités)
    tarifs/                  Plans d'abonnement
    a-propos/  contact/
  (auth)/            Connexion, mot de passe oublié
  (app)/             Espace agence (shell Vireo, protégé)
    tableau-de-bord/ biens/ locataires/ baux/ paiements/ maintenance/
    annonces/ equipe/ organisation/
    plateforme/      Espace admin Dahoo (réservé au staff)
  api/
    auth/            login / logout / refresh (pose et efface les cookies)
    backend/[...path]  Relais authentifié vers l'API Django
```

## 4. Conventions de code

- Composants partagés : `src/components/site/*` (site public), `src/components/app/*` (espace agence), `src/components/ui/*` (communs).
- Pas de `any`. Les types de l'API viennent de `src/lib/api/schema.d.ts` (généré).
- Server Components par défaut ; `'use client'` uniquement quand il faut de l'état, des effets ou des gestionnaires d'événements.
- Images : `next/image`, fichiers dans `public/images/site/…` (issus de `Assets/` et de Crafto).
- Accessibilité : contrastes AA, focus visible, libellés ARIA sur les icônes seules, navigation au clavier.
- Textes en français, sans lorem ipsum : un contenu provisoire doit rester plausible pour Dahoo.
- Toute page livrée passe `tsc`, `eslint` et `next build`.

## 5. Phases

| Phase | Contenu | Qui |
| --- | --- | --- |
| **P0 Fondations** | Socle Vireo porté en Next 16, charte Dahoo, layouts des 3 groupes, composants partagés, authentification BFF, client API typé | Orchestrateur |
| **P1 Backend public** | API publique des annonces (liste filtrable, fiche), photos des annonces, caractéristiques des lots (chambres, salles de bain…), profil public d'agence, plans publics, demande de démo | Orchestrateur ou agent |
| **P2 Site public** | Conversion des pages Crafto (une page par agent), branchement sur l'API publique | Agents en parallèle |
| **P3 Espace agence** | Un module par agent : biens, locataires, baux, paiements, maintenance, annonces, équipe, organisation | Agents en parallèle |
| **P4 Plateforme** | Écrans admin Dahoo : agences, essais, abonnements | Agent |
| **P5 Recette** | Parcours complets, responsive, accessibilité, performances, SEO | Orchestrateur |

## 6. Points d'attention

- **Licences Envato.** Crafto et Vireo sont sous licence *Regular*. Pour un SaaS dont les utilisateurs paient l'accès, Envato exige en principe une licence *Extended* : à vérifier avant la mise en production.
- **Poids des images.** Les visuels de Crafto et de `Assets/` doivent être optimisés (WebP/AVIF, dimensions réelles) avant d'être versionnés.
