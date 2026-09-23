# Dahoo — Front web

Interface web de Dahoo (tableau de bord de gestion immobilière et site vitrine).
Stack : Next.js 16 (App Router), React 19, Tailwind CSS 4, TypeScript.

> État actuel : les écrans sont des maquettes alimentées par des données en dur ;
> ils ne sont pas encore branchés sur l'API ([dahoo_backend](https://github.com/ZayTauven/dahoo_backend)).

## Installation locale

Prérequis : Node.js 22.

```bash
npm ci
cp .env.example .env.local
npm run dev        # http://localhost:3000
```

## Scripts

| Commande        | Rôle                          |
| --------------- | ----------------------------- |
| `npm run dev`   | Serveur de développement      |
| `npm run build` | Build de production           |
| `npm run start` | Sert le build de production   |
| `npm run lint`  | ESLint                        |
