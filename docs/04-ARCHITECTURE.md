# Architecture Technique

## Option A : React Native/Expo + Next.js (RECOMMANDÉE)

### Avantages
- Code partagé TypeScript entre mobile et web
- Expo simplifie le build et les mises à jour OTA
- Next.js offre SSR, API routes, et PWA native
- Écosystème npm mature
- Facilité de recrutement

### Stack Détaillée

```
┌────────────────────────────────────────────────────────────┐
│                        CLIENTS                              │
├─────────────────────────┬──────────────────────────────────┤
│   Mobile (Expo/RN)      │         Web (Next.js PWA)        │
│   - iOS                 │         - SSR + CSR              │
│   - Android             │         - Service Worker         │
│   - Expo Go (dev)       │         - Responsive             │
└─────────────┬───────────┴──────────────────┬───────────────┘
              │                              │
              ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SHARED PACKAGES                           │
│   @docsbox/core     - Types, utils, validation              │
│   @docsbox/api      - API client, react-query hooks         │
│   @docsbox/ui       - Composants partagés (optionnel)       │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND                                 │
│   Next.js API Routes (ou Express séparé)                    │
│   - Auth (JWT + refresh tokens)                             │
│   - REST API                                                 │
│   - File upload/download                                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │PostgreSQL│ │   S3     │ │  Redis   │
        │ (Neon/   │ │(Cloudflr)│ │(sessions)│
        │ Supabase)│ │          │ │          │
        └──────────┘ └──────────┘ └──────────┘
```

### Technologies Mobile (Expo)
| Besoin | Package |
|--------|---------|
| Navigation | expo-router |
| Storage local | @nozbe/watermelondb |
| Chiffrement | expo-crypto + expo-secure-store |
| Caméra/Scan | expo-camera + expo-document-picker |
| Biométrie | expo-local-authentication |
| Notifications | expo-notifications |
| IAP | react-native-iap ou expo-in-app-purchases |
| PDF | react-native-pdf |

### Technologies Web (Next.js 14+)
| Besoin | Package |
|--------|---------|
| Framework | Next.js 14 App Router |
| Auth | next-auth ou Auth.js |
| PWA | next-pwa |
| State | Zustand + React Query |
| Forms | React Hook Form + Zod |
| UI | Tailwind CSS + Radix UI |
| PDF | pdf-lib, react-pdf |

---

## Option B : Flutter + Web (ALTERNATIVE)

### Avantages
- Un seul codebase pour mobile ET web
- Performance native excellente
- Hot reload très rapide
- UI consistante cross-platform

### Stack Détaillée

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUTTER APP                               │
│   Cible : iOS, Android, Web (WASM)                          │
├─────────────────────────────────────────────────────────────┤
│   State: Riverpod ou Bloc                                   │
│   Storage: Drift (SQLite) + flutter_secure_storage          │
│   API: Dio + Retrofit                                       │
│   Navigation: go_router                                      │
│   PDF: pdf, printing                                         │
│   Camera: camera, cunning_document_scanner                  │
│   IAP: in_app_purchase                                       │
│   Notifications: firebase_messaging                          │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND                                 │
│   Node.js/Express ou Dart (Serverpod)                       │
└─────────────────────────────────────────────────────────────┘
```

### Inconvénients Flutter
- Taille bundle web plus importante
- SEO limité (SPA)
- Moins de packages que npm
- Recrutement plus difficile en France

---

## Recommandation Finale

**→ Option A : React Native/Expo + Next.js**

Raisons :
1. Meilleure maturité écosystème France
2. SEO possible pour landing pages
3. PWA plus légère
4. Facilité de trouver des devs
5. TypeScript partagé = moins de bugs
