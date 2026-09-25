# Refonte du front Dahoo

Document de référence de la refonte : décisions d'architecture, conventions et découpage du travail.
Toute personne (ou agent) qui contribue à la refonte le lit **entièrement** avant d'écrire du code.

## 1. Décisions

| Sujet | Décision | Pourquoi |
| --- | --- | --- |
| Nombre d'applications | **Une seule app Next.js** (ce dépôt), découpée en groupes de routes | Une charte, un client API, une authentification et un déploiement. Le site public et l'espace agence partagent le design system. |
| Base technique | **Vireo** (React 19 + Tailwind 4, tokens `--ax-*`), porté en **Next 16** | Déjà en composants React, avec un design system à tokens, un shell, le thème clair/sombre et des graphiques. |
| Site public | **Réécriture** des pages immobilier de **Crafto** en React + Tailwind sur les tokens Dahoo | On n'importe **ni** le CSS de Crafto (≈ 1,5 Mo, Bootstrap), **ni** jQuery. Crafto sert de **référence visuelle**. |
| Comportements Crafto | `swiper/react` pour les carrousels, `motion/react` pour les animations (`data-anime`), cartes à venir | Remplace `main.js`, `vendors.min.js` et jQuery. |
| Authentification | **Backend-for-frontend** : jetons JWT en cookies `httpOnly`, relais Next `/api/backend/*` vers Django, `src/proxy.ts` pour les redirections | Aucun jeton accessible au JavaScript, une seule origine. Guide Next 16 `backend-for-frontend`. |
| Données | Site public : Server Components + `publicApi` (cache 60 s). Espace agence : React Query + `api` (relais) | Référencement pour les annonces, interactivité pour la gestion. |
| Types | Générés depuis l'OpenAPI du backend : `npm run api:types` (API lancée sur :8000) | Toute rupture de contrat casse la compilation. |
| Langue et devise | Français, FCFA (`formatMoney` dans `src/lib/format.ts`) | Marché cible. |

## 2. Charte Dahoo

- **Orange `#F7941D`** = accent (`bg-accent`, `text-accent-text` pour du texte orange lisible). **Le texte sur fond orange est indigo foncé** (`text-on-accent`), jamais blanc (contraste AA).
- **Indigo `#283891`** = marque (`bg-brand`, `text-brand`, rampes `brand-50…900`). Liens : `text-link`.
- Polices : `font-display` (Urbanist) pour les titres, Inter par défaut, `ax-num` / `font-mono` pour les chiffres.
- Couleurs de surface et de texte : `bg-canvas`, `bg-surface`, `bg-surface-subtle`, `bg-surface-solid`, `text-text-strong`, `text-text`, `text-text-muted`, `text-text-subtle`, `border-border-default`.
- **Aucune couleur en dur** (`#…`, `bg-blue-600`…) : uniquement les utilitaires ci-dessus ou `var(--ax-…)`. Thèmes clair et sombre doivent rester lisibles.
- Logo : `/brand/logo.png` (couleur), `/brand/logo-white.png` (sur fond sombre), `/brand/mark.png` (symbole seul).

### 2.1 Site public : direction « sable & encre » (depuis le 2026-09-24)

Le site public a son propre langage visuel, éditorial, défini dans `src/styles/site.css` et limité à la classe `.site` (posée par `(site)/layout.tsx`). L'espace agence garde Vireo.

- **Couleurs** : sable `#F2EDE4` (fond), encre `#12153A` (texte, boutons), orange **en étincelle seulement** (pastilles, survols, compteurs). Les rôles `--ax-*` sont surchargés dans `.site`, donc les utilitaires habituels (`bg-canvas`, `text-text-muted`, `border-border-default`…) donnent automatiquement la bonne teinte. Section sombre : `Section tone="brand"` ou la classe `site-dark` (inverse encre et sable). **Le site public et la connexion n'existent qu'en thème clair** (décision du 2026-09-24) : `ThemeProvider` force le clair hors de l'espace connecté (`isThemedPath` dans `src/lib/theme.ts`) sans toucher à la préférence mémorisée.
- **Typographie** : titres en **Instrument Serif** (`font-display`, une seule graisse 400 : ne jamais mettre `font-semibold`), texte en **Geist**, étiquettes et chiffres en **Geist Mono** (`site-label`). Mot fort d'un titre : `<Highlight>` = italique du serif (plus de soulignement orange).
- **Rythme** : `Container` 1360 px, grille de 12 colonnes, sections très aérées (`Section` gère les marges), filets fins plutôt que cartes à ombre, rayons serrés (4 à 10 px), numéros de section (`SectionHeading index="03"`).
- **Mouvement** (`src/components/site/motion.tsx`) : défilement fluide Lenis (désactivé si « réduire les animations »), `Reveal` (apparition), `RevealLines` (titre ligne par ligne sous masque), `RevealImage` (volet + dézoom), `Parallax`, `ScrollWords` (mots qui s'allument au défilement). Classes : `site-link` (soulignement qui se dessine), `site-marquee` (bandeau défilant), grain de fond automatique.
- **Boutons** : `ax-btn--primary` devient une pilule d'encre qui passe à l'orange au survol ; sur fond sombre, pilule orange.
- **Montrer plutôt que dire** (itération 2, 2026-09-25) : chaque section ouvre sur une photo, une vraie capture ou un chiffre ; le texte est une légende courte ; le détail passe derrière un geste (onglet, survol, dépliant). Grilles pleines (bento), marges de section resserrées.
- **Photos** : uniquement via `src/components/site/photos.ts` (`PHOTOS.villaPatioBleu`, `INTERIORS`…) : vraies photos du Sénégal et d'intérieurs fournies par Dahoo, avec texte alternatif et dimensions. Captures réelles de l'espace agence : `public/images/site/app/*.webp`. Logos de paiement : `public/images/site/logos/`.
- **Formulaires** : uniquement les champs de `src/components/site/form.tsx` (`SiteTextField`, `SiteSelectField`, `SiteTextareaField`, `SiteChoiceField`, `FormAlert`, `SubmitButton`, `Honeypot`).
- **Animations liées au défilement** : toujours `useTransform(valeur, (v) => …)` en fonction, jamais en plages (`[0, 1], [a, b]`) : Motion délègue sinon au moteur natif, qui calcule une progression fausse dans Chrome.

## 3. Routes

```
src/app/
  (site)/                     Site public (en-tête + pied de page du site)
    page.tsx                  Accueil
    louer/  acheter/          Listes d'annonces filtrables
    annonces/[id]/            Fiche d'une annonce + demande de visite
    agences/  agences/[id]/   Agences partenaires
    pour-les-agences/         Offre Dahoo + formulaire de démo (ancre #demo)
    tarifs/  a-propos/  contact/
  (auth)/connexion/           Connexion
  (app)/                      Espace connecté (shell Vireo, protégé par src/proxy.ts)
    espace/                   Tableau de bord de l'agence
    espace/biens | locataires | baux | echeances | paiements | maintenance | annonces | equipe | agence
    plateforme/agences | demandes   Espace admin Dahoo (staff)
  api/auth/*                  Connexion / déconnexion (cookies)
  api/backend/[...path]       Relais authentifié vers Django
```

## 4. Guide du contributeur

### 4.1 Accès aux données

**Espace agence** (composants client) — modèle : `src/app/(app)/espace/locataires/TenantsScreen.tsx`.
```ts
const list = useListParams(["status"] as const);           // page, recherche, filtres dans l'URL
const query = useQuery({
  queryKey: ["tickets", list.query],
  queryFn: async () => unwrap(await api.GET("/api/v1/maintenance/tickets/", { params: { query: list.query } })),
  placeholderData: keepPreviousData,
});
const save = useApiMutation({ mutationFn: …, invalidate: [["tickets"]], success: "Ticket créé.", onSuccess: close });
```
- `api` (`src/lib/api/client.ts`) : client typé, passe par le relais. `unwrap` lève une `ApiError` (`.message`, `.fields`).
- Clés React Query : premier élément = nom de la ressource (`["tenants"]`, `["leases"]`…), pour que `invalidate` rafraîchisse toutes les pages de la liste.
- Types : `Schema<"Tenant">` (lecture), `Schema<"TenantRequest">` (écriture) — `src/lib/api/types.ts`.
- Droits : `const { can, isReadOnly } = useSession()`. Masquer une action si `!can("lease.activate")` ou si `isReadOnly` (essai expiré). L'API reste seule juge.

**Site public** (Server Components) :
```ts
import { publicApi } from "@/lib/api/server";
const { data } = await publicApi.GET("/api/v1/public/listings/", { params: { query: { listing_type: "RENT" } } });
```
- Cache de 60 s déjà configuré. `searchParams` et `params` sont des **Promises** en Next 16 (`await props.searchParams`).
- Formulaires publics (demande de visite, demande de démo) : **Server Action** qui appelle Django via `publicApi.POST(…)` en ajoutant les en-têtes `forwardingHeaders(await headers())` (`src/lib/server/forwarding.ts`) pour la limitation de débit par visiteur.
- Images de l'API : `next/image` accepte `http://localhost:8000/media/**` (voir `next.config.ts`).

### 4.2 Composants disponibles

Espace agence (`src/components/app/`) :

| Composant | Rôle |
| --- | --- |
| `shell/PageHead` | Titre de page, sous-titre, fil d'Ariane (`crumbs`), actions |
| `ui/DataTable` + `Column<T>` | Tableau paginé : chargement, erreur (+ réessayer), vide, lignes cliquables (`rowHref`) |
| `ui/ListToolbar` | Recherche différée + emplacement filtres + actions |
| `ui/Modal`, `ui/FormModal`, `ui/ConfirmDialog` | Modales accessibles (focus piégé, Échap) |
| `ui/fields` | `TextField`, `TextareaField`, `SelectField`, `CheckboxField` (libellé, aide, erreur liés) |
| `ui/StatusBadge` | Pastille de statut à partir des énumérations de `src/lib/labels.ts` |
| `ui/Toast` | `useToast()` — notifications (déjà utilisé par `useApiMutation`) |
| `EmptyState`, `KpiCard`, `charts/ApexChart` | État vide, indicateur, graphiques |

Classes Vireo utilisables directement : `ax-card` / `ax-card__body` / `ax-card__header`, `ax-btn` (+ `--primary`, `--secondary`, `--ghost`, `--danger`, `--sm`, `--icon`), `ax-badge`, `ax-alert`, `ax-tabs`, `ax-list`, `ax-timeline`, `ax-progress`, `ax-skeleton`. Catalogue complet : sections numérotées de `src/styles/components.css`.

Site public (`src/components/site/`) : `PageHero` (fil d'Ariane + h1 des pages intérieures) et `Breadcrumbs`, `Pagination`, `Container`, `Section` (`tone="subtle" | "brand"`), `SectionHeading` (numéro, sur-titre, titre, intro) et `Eyebrow`, `Highlight` (italique), `Reveal`, `RevealLines`, `RevealImage`, `Parallax`, `ScrollWords`, `PropertyCard` (`size="feature"` pour une annonce à la une) + `listingPrice`. Voir §2.1.

Communs : `src/lib/format.ts` (`formatMoney`, `formatDate`, `formatNumber`, `daysUntil`), `src/lib/labels.ts` (libellés FR des énumérations), `cn()` dans `src/lib/utils.ts`.

### 4.3 Règles

- **Server Components par défaut**, `"use client"` seulement si nécessaire (état, effets, événements).
- **Pas de `any`**, pas de `// @ts-ignore`. Les types viennent du schéma.
- **Mise en page en utilitaires Tailwind** reliés aux tokens ; pas de styles en ligne sauf valeur calculée ; pas de nouveau fichier CSS global.
- **Accessibilité** : un seul `<h1>` par page, hiérarchie de titres respectée, libellés ARIA sur les boutons icône, états `aria-busy` / `aria-current`, contraste AA en clair et en sombre, navigation au clavier.
- **Textes en français**, crédibles pour le Sénégal (quartiers, prix en FCFA), sans lorem ipsum. Pas de faux témoignages attribués à de vraies personnes ou entreprises.
- **Responsive** : mobile (390 px) d'abord, puis tablette et bureau.
- **Métadonnées** : chaque page exporte `metadata` ou `generateMetadata` (titre, description ; `robots: noindex` dans l'espace connecté).
- Nouvelle dépendance npm : uniquement si indispensable, à justifier dans le compte rendu.

### 4.4 Travail en parallèle (agents)

- Chacun ne modifie **que les fichiers de son périmètre** (ses dossiers de routes, plus un dossier privé `_components/` à l'intérieur). Les fichiers partagés (`src/components/**`, `src/lib/**`, `src/styles/**`, `navigation.ts`, `package.json`) ne se modifient pas : un besoin partagé se signale dans le compte rendu.
- Vérifications avant de rendre : `npx tsc --noEmit` (sans erreur dans ses fichiers) et `npx eslint <ses dossiers>` (sans erreur).
- **Ne pas lancer** `next build`, `next dev` ni `next start` (serveur partagé, cache `.next` commun) : la recette visuelle est faite par l'orchestrateur.
- L'API tourne sur `http://127.0.0.1:8000` (documentation : `/api/docs/`) : l'interroger avec `curl` pour voir les données réelles. Données de démonstration : `python manage.py seed_demo` (déjà exécutée).

## 5. Phases

| Phase | Contenu | État |
| --- | --- | --- |
| **P0 Fondations** | Socle Vireo en Next 16, charte, layouts, authentification BFF, client API, kit d'interface, module de référence Locataires | Fait |
| **P1 Backend public** | API publique (annonces, agences, stats, tarifs, démo), photos, filtres et libellés, limitation de débit derrière le front | Fait (branche `feat/api-publique`) |
| **P2 Site public** | Conversion des pages Crafto, branchement sur l'API publique | Fait |
| **P3 Espace agence** | Un module par agent | Fait |
| **P4 Plateforme** | Écrans admin Dahoo | Fait |
| **P5 Recette** | 34 pages vérifiées dans le navigateur (statut, erreurs, titres, 390 px), parcours de connexion et module de référence ; correctifs backend issus de la recette | Fait (première passe) |

## 6. Points d'attention

- **Licences Envato.** Crafto et Vireo sont sous licence *Regular*. Pour un SaaS dont les utilisateurs paient l'accès, Envato exige en principe une licence *Extended* : à vérifier avant la mise en production.
- **Médias en production.** Les photos sont servies par Django uniquement en `DEBUG` : prévoir Nginx ou un stockage objet.
- **IP des visiteurs.** En production, le reverse proxy doit écraser `X-Real-IP` (`proxy_set_header X-Real-IP $remote_addr;`) et `DAHOO_PROXY_KEY` (front) doit égaler `INTERNAL_PROXY_KEY` (API).

## 8. Tableau de bord et analytics (2026-09-25)

- **API** : `GET /api/v1/analytics/dashboard/?months=6|12` (`analytics/dashboard.py`), calculée à la volée à partir des données de gestion. Sections `portfolio`, `leases`, `finance`, `maintenance`, `listings` (chacune `null` si le rôle n'a pas la capability correspondante) et `insights` (alertes déduites des données, jamais inventées). Tests : `tests/test_dashboard.py`.
- **Front** : `src/app/(app)/espace/_tableau-de-bord/` (écran, graphiques ApexCharts, listes, « Premiers pas » pour une agence sans trésorerie). Données partagées par `useDashboard()` et bandeaux d'indicateurs `StatStrip` (`src/components/app/analytics/`), utilisés aussi en tête des écrans Paiements et Annonces.
- **Graphiques** : `ApexChart` accepte `colors` (jetons `--ax-…`) et se re-thème sur `dahoo:theme-change`. Couleurs de marque pour Wave et Orange Money (`METHOD_COLORS`).
- **Piège CSS** : les styles de `.ax-card` l'emportent sur les utilitaires Tailwind (fond, direction flex). Mettre fond et mise en page sur un élément interne, pas sur la carte elle-même.
- **Démo** : `seed_demo` crée 12 mois d'historique pour Teranga (`_demo_history.py` : 8 baux, profils de paiement, impayés, 16 tickets, 34 demandes de visite) et l'échéance du mois prochain de chaque bail actif (`seed_upcoming`).
- **Raccourci** : `/espace/paiements?nouveau=1` ouvre la saisie d'un paiement.

## 9. Espace plateforme et personnaliseur d'apparence (2026-09-25)

- **Vue d'ensemble plateforme** : `GET /api/v1/platform/dashboard/` (`organizations/platform_dashboard.py`, admins Dahoo) : agences par statut, essais qui se terminent, inscriptions et demandes de démo par mois, abonnements et revenu mensuel, activité du portail, agences les plus actives. Écran `/plateforme` (`plateforme/_components/PlatformDashboard.tsx`). Démo : `_demo_platform.py` (dates d'inscription étalées, abonnements, essais, demandes de démo).
- **Personnaliseur (repris de Vireo)** : bouton palette de l'en-tête et carte « Apparence » de Mon agence. Couleur d'accent (13 presets + couleur libre), couleur de la barre latérale et de l'en-tête (clair, sombre, accent, dégradé, transparent), comportement de la barre, coque collée ou détachée, style des pages, largeur.
- **Deux portées** : « Toute l'agence » (administrateurs, `organization.update`, hors lecture seule), stockée dans `Organization.theme` (validée par `organizations/theme.py`, clés et valeurs fermées), renvoyée à tous les membres dans `/users/me/` (`memberships[].organization_theme`) ; « Moi seulement », dans le navigateur (`dahoo:ui:<id utilisateur>`), qui prime sur celle de l'agence. Tests : `tests/test_theme.py`.
- **Application** : `src/lib/uiTheme.ts` pose les attributs `data-ax-*` sur `<html>` ; `UiThemeProvider` (monté par AppShell) les applique dans l'espace et les retire en sortant : le site public reste clair et orange. Le dernier état appliqué (`dahoo:ui-applied`) est relu par `THEME_SCRIPT` pour éviter le flash au chargement.
- **Contrastes** : `src/styles/tokens/_accents.css` est généré à partir des presets Vireo avec contrôle AA (encre sur l'accent, `--ax-accent-text`, rails en dégradé `--ax-gradient-from/-to` + `--ax-on-gradient`). La couleur libre suit les mêmes règles (`customAccentCss`). Corrigé au passage : libellé actif invisible sur les rails colorés (la recette hors couche de `_recipes.css` l'emportait) et étiquettes d'axe des sparklines réaffichées au changement de thème.

## 10. Palette de commandes et notifications (2026-09-25)

- **Palette (Ctrl+K, ⌘K ou « / »)** : barre « Rechercher ou aller à… » de l'en-tête (icône sur mobile). Récemment ouverts, actions rapides selon les droits (enregistrer un paiement, ajouter un bien, un locataire, un bail, un incident, une annonce ; créer une agence pour l'équipe Dahoo ; mode sombre, apparence, site public), pages du menu, et recherche dans les données de l'agence. Clavier complet (↑ ↓ Entrée Échap), recherche sans accents côté front (`normalize`) comme côté serveur. Code : `src/components/app/command/`.
- **Recherche globale** : `GET /api/v1/search/?q=` (app `search`) : biens, lots, locataires, baux, annonces, tickets de l'agence active, 5 par type, seulement les types que le rôle peut consulter ; chaque résultat porte le chemin de l'écran (`link`). Sans accents grâce à l'extension PostgreSQL `unaccent` (migration `search.0001`, `django.contrib.postgres`) : **en production, l'utilisateur de la base doit pouvoir créer l'extension** (ou un administrateur la crée une fois).
- **Raccourci `?nouveau=1`** (`useNewParam`) : ouvre la création sur Biens, Locataires, Baux, Maintenance, Annonces et Paiements.
- **Notifications** : cloche de l'en-tête (pastille rafraîchie chaque minute, aperçu, « Tout marquer comme lu ») et page `/espace/notifications` (ou `/plateforme/notifications`), regroupée par jour. API `/api/v1/notifications/inapp/` (+ `summary/`, `read-all/`), limitée à l'agence active et aux notifications de la plateforme.
- **Origine des notifications** : signaux `notifications/signals.py` (demande de visite du portail, paiement enregistré par un collègue, nouveau ticket, ticket assigné, demande de démo pour l'équipe Dahoo), créées après validation de la transaction ; rappels calculés `notifications/services.py` (loyers en retard regroupés par bail, fins de bail à 30 jours, fin d'essai à 7 jours ; essais à 3 jours pour l'équipe Dahoo), dédoublonnés, recalculés au plus toutes les 15 minutes à la consultation. **À planifier en production** : `python manage.py sync_notifications` une fois par jour. Destinataires : membres dont le rôle ouvre l'écran concerné. `muted()` coupe les notifications (utilisé par `seed_demo`, qui crée ensuite un fil de démo daté).

## 7. Reste à faire

- **Direction « sable & encre » (§2.1)** : déployée sur tout le site public et la connexion (2026-09-24), puis itération « montrer plutôt que dire » (2026-09-25) : hero en mosaïque zoomée, vraies photos du Sénégal, vraies captures de l'espace agence, logos d'agences, formulaires unifiés. Pages raccourcies (« Pour les agences » : 14 290 → 7 708 px sur bureau).
- **Suites possibles** : filtre `?city=` sur `/public/agencies/` (l'annuaire filtre côté front, jusqu'à 50 agences) ; liste Louer longue sur mobile (≈ 9 800 px pour 8 biens).

- **Offres d'abonnement** : aucune n'est configurée ; les créer dans l'admin Django (la page Tarifs affiche « Tarifs sur mesure » en attendant). Un écran « Offres » dans l'espace plateforme reste à faire.
- **Génération automatique des échéances** à l'activation d'un bail (aujourd'hui saisies une à une).
- **Notifications hors application** : les modèles `Notification`, `NotificationTemplate` et `AutomationRule` (e-mail, SMS, WhatsApp) existent mais rien ne les envoie encore.
- **À confirmer** : l'adresse `contact@dahoo.sn` affichée sur la page Contact et les textes d'engagement (mission, valeurs).
- **Avant la production** : licences Envato Extended, service des médias (Nginx ou stockage objet), `X-Real-IP` posé par le reverse proxy, `DAHOO_PROXY_KEY` = `INTERNAL_PROXY_KEY`.
