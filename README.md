# DocsBox - Documents & Démarches

Application B2C freemium pour centraliser vos documents administratifs et simplifier vos démarches.

## 🚀 Quick Start

### Prérequis
- Node.js >= 18
- npm ou yarn

### Installation

```bash
# Cloner et installer les dépendances
cd docs-demarches
npm install

# Lancer l'app mobile (Expo)
npm run mobile

# Lancer l'app web (Next.js)
npm run web
```

## 📁 Structure du Projet

```
docs-demarches/
├── apps/
│   ├── mobile/          # Expo/React Native app (iOS/Android)
│   │   ├── app/         # Expo Router pages
│   │   └── src/         # Components, hooks, services
│   └── web/             # Next.js PWA
│       ├── app/         # App Router pages
│       └── components/  # React components
├── packages/
│   └── core/            # Shared TypeScript code
│       └── src/
│           ├── types.ts      # All type definitions
│           ├── constants.ts  # Quotas, pricing, templates
│           └── utils.ts      # Utility functions
└── docs/                # Specifications
    ├── 01-PRD.md
    ├── 02-UX-FLOWS.md
    ├── 03-DATA-MODEL.md
    ├── 04-ARCHITECTURE.md
    ├── 05-API-SPEC.md
    ├── 06-SECURITY.md
    ├── 07-MONETIZATION.md
    ├── 08-BACKLOG.md
    └── 09-TESTS.md
```

## 🎯 Fonctionnalités

### Gratuit
- ✅ Coffre-fort documents (30 max)
- ✅ Scan caméra → PDF
- ✅ Catégories et tags
- ✅ Rappels d'échéances (5 max)
- ✅ Packs justificatifs (3 max)
- ✅ Export PDF/ZIP

### Premium (3,99€/mois ou 29,99€/an)
- ✅ Démarches avec checklists
- ✅ Vue pièces manquantes
- ✅ Relances automatiques
- ✅ Documents illimités
- ✅ OCR et recherche texte
- ✅ Liens de partage sécurisés
- ✅ Sync multi-appareils

## 🛠 Stack Technique

| Layer | Technology |
|-------|------------|
| Mobile | React Native + Expo |
| Web | Next.js 14 + Tailwind |
| State | Zustand + React Query |
| DB Local | WatermelonDB (mobile) |
| Auth | JWT + Biométrie |
| Backend | Next.js API Routes |

## 📖 Documentation

Voir le dossier `/docs` pour :
- PRD complet
- UX flows et arborescence
- Modèle de données
- Architecture technique
- Spécification API
- Plan de sécurité
- Plan de monétisation
- Backlog (Epics/Stories)
- Plan de tests

## 🔐 Sécurité

- PIN + biométrie obligatoire
- Chiffrement AES-256 des fichiers
- Clés dans Keychain/Keystore
- RGPD compliant

## 📱 Scripts

```bash
# Mobile
npm run mobile         # Start Expo dev server
cd apps/mobile && npx expo start --ios
cd apps/mobile && npx expo start --android

# Web
npm run web           # Start Next.js dev server
cd apps/web && npm run build

# Tests
npm run test          # Run all tests

# Lint
npm run lint          # Lint all packages
```

## 📄 License

Proprietary - All rights reserved.
