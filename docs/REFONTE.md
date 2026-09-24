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

Site public (`src/components/site/`) : `Container`, `Section` (`tone="subtle" | "brand"`), `SectionHeading` (sur-titre, titre, intro), `Highlight` (mot souligné animé), `Reveal` (apparition au défilement), `PropertyCard` + `listingPrice`.

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

## 7. Reste à faire

- **Offres d'abonnement** : aucune n'est configurée ; les créer dans l'admin Django (la page Tarifs affiche « Tarifs sur mesure » en attendant). Un écran « Offres » dans l'espace plateforme reste à faire.
- **Génération automatique des échéances** à l'activation d'un bail (aujourd'hui saisies une à une).
- **Mise en commun** du bandeau de titre et de la pagination du site (`agences/_components`, `_annonces`) dans `src/components/site/`.
- **Tableau de bord** de l'espace agence : graphiques (encaissements, taux d'occupation).
- **À confirmer** : l'adresse `contact@dahoo.sn` affichée sur la page Contact et les textes d'engagement (mission, valeurs).
- **Avant la production** : licences Envato Extended, service des médias (Nginx ou stockage objet), `X-Real-IP` posé par le reverse proxy, `DAHOO_PROXY_KEY` = `INTERNAL_PROXY_KEY`.
