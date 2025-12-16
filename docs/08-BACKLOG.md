# Backlog Produit

## Epic 1 : Foundation & Auth
**Priorité** : P0 | **Sprint** : 1

### US-1.1 : Setup Projet
> En tant que dev, je veux un projet initialisé pour commencer le développement
- [x] Créer repo Git
- [ ] Init Expo app (mobile)
- [ ] Init Next.js app (web)
- [ ] Setup monorepo (turborepo)
- [ ] Config ESLint/Prettier
- [ ] Setup TypeScript strict
**Points** : 3

### US-1.2 : Navigation
> En tant qu'utilisateur, je veux naviguer entre les onglets
- [ ] Tab bar 3 onglets (Documents, Packs, Démarches)
- [ ] Stack navigation par tab
- [ ] Header avec bouton settings
- [ ] Badge premium sur Démarches
**Points** : 2

### US-1.3 : Auth Email
> En tant qu'utilisateur, je veux créer un compte et me connecter
- [ ] Écran Login (email/mdp)
- [ ] Écran Register
- [ ] Écran Forgot Password
- [ ] Validation formulaires (Zod)
- [ ] API auth (register, login, logout)
- [ ] Storage tokens sécurisé
**Points** : 5

### US-1.4 : Auth Social
> En tant qu'utilisateur, je veux me connecter avec Apple/Google
- [ ] Apple Sign In (iOS)
- [ ] Google Sign In (Android/Web)
- [ ] Fallback email sur web
**Points** : 3

### US-1.5 : App Lock
> En tant qu'utilisateur, je veux protéger mes documents par PIN
- [ ] Écran création PIN
- [ ] Écran unlock PIN
- [ ] Intégration biométrie
- [ ] Auto-lock settings
**Points** : 3

---

## Epic 2 : Documents
**Priorité** : P0 | **Sprint** : 1-2

### US-2.1 : Liste Documents
> En tant qu'utilisateur, je veux voir tous mes documents
- [ ] Liste avec cards (thumbnail, titre, catégorie)
- [ ] Search bar
- [ ] Filtres par catégorie
- [ ] Empty state
- [ ] Pull to refresh
**Points** : 3

### US-2.2 : Ajouter Document - Import
> En tant qu'utilisateur, je veux importer un fichier
- [ ] Bouton FAB "+"
- [ ] Bottom sheet (Scan/Import)
- [ ] Document picker
- [ ] Upload + traitement
- [ ] Écran métadonnées
**Points** : 3

### US-2.3 : Ajouter Document - Scan
> En tant qu'utilisateur, je veux scanner un document
- [ ] Ouverture caméra
- [ ] Détection bords
- [ ] Recadrage
- [ ] Multi-pages
- [ ] Génération PDF
**Points** : 5

### US-2.4 : Détail Document
> En tant qu'utilisateur, je veux voir les détails d'un document
- [ ] Preview PDF/Image
- [ ] Métadonnées éditables
- [ ] Date expiration
- [ ] Actions (partager, supprimer)
**Points** : 3

### US-2.5 : Catégories & Tags
> En tant qu'utilisateur, je veux organiser mes documents
- [ ] Catégories prédéfinies (Identité, Logement, etc.)
- [ ] Tags personnalisés
- [ ] Picker catégorie
- [ ] Chips tags
**Points** : 2

### US-2.6 : Rappels Échéances
> En tant qu'utilisateur, je veux être rappelé avant expiration
- [ ] Champ date expiration
- [ ] Config rappels (7j, 30j avant)
- [ ] Notifications locales
- [ ] Liste rappels à venir
**Points** : 3

---

## Epic 3 : Packs
**Priorité** : P0 | **Sprint** : 2

### US-3.1 : Liste Packs
> En tant qu'utilisateur, je veux voir mes packs
- [ ] Liste packs (nom, nb docs)
- [ ] Empty state
- [ ] Templates rapides
**Points** : 2

### US-3.2 : Créer Pack
> En tant qu'utilisateur, je veux créer un pack
- [ ] Choix template ou vide
- [ ] Sélection documents
- [ ] Ordre drag & drop
- [ ] Champ "requis"
**Points** : 3

### US-3.3 : Export Pack
> En tant qu'utilisateur, je veux exporter mon pack
- [ ] Preview compilé
- [ ] Export PDF
- [ ] Export ZIP
- [ ] Share sheet natif
**Points** : 3

### US-3.4 : Lien Partage (Premium)
> En tant qu'utilisateur premium, je veux partager via lien
- [ ] Générer lien unique
- [ ] Expiration configurable
- [ ] Password optionnel
- [ ] Filigrane
- [ ] Logs d'accès
**Points** : 5

---

## Epic 4 : Démarches (Premium)
**Priorité** : P1 | **Sprint** : 2

### US-4.1 : Paywall Démarches
> En tant qu'utilisateur gratuit, je vois le paywall
- [ ] Écran paywall principal
- [ ] Copy et design
- [ ] Redirection subscribe
**Points** : 2

### US-4.2 : Liste Démarches
> En tant qu'utilisateur premium, je vois mes démarches
- [ ] Liste avec statut
- [ ] Badge pièces manquantes
- [ ] Filtres statut
**Points** : 2

### US-4.3 : Créer Démarche
> En tant qu'utilisateur premium, je crée une démarche
- [ ] Sélection template
- [ ] Création démarche libre
- [ ] Pré-remplissage steps/pieces
**Points** : 3

### US-4.4 : Détail Démarche
> En tant qu'utilisateur premium, je suis ma démarche
- [ ] Checklist étapes
- [ ] Liste pièces requises
- [ ] Liaison documents
- [ ] Dates clés
- [ ] Notes
- [ ] Changement statut
**Points** : 5

### US-4.5 : Templates Démarches
> En tant qu'utilisateur, j'ai accès aux templates
- [ ] 7 templates de base
- [ ] Données steps/pieces
- [ ] Affichage liste templates
**Points** : 3

### US-4.6 : Vue Pièces Manquantes
> En tant qu'utilisateur, je vois toutes les pièces manquantes
- [ ] Agrégation cross-démarches
- [ ] Actions rapides
**Points** : 2

---

## Epic 5 : Abonnement
**Priorité** : P0 | **Sprint** : 2

### US-5.1 : Écran Abonnement
> En tant qu'utilisateur, je vois les offres
- [ ] Comparaison Free/Premium
- [ ] Toggle mensuel/annuel
- [ ] Prix affichés
- [ ] CTA subscribe
**Points** : 2

### US-5.2 : IAP iOS
> En tant qu'utilisateur iOS, je peux m'abonner
- [ ] StoreKit 2 integration
- [ ] Achat
- [ ] Vérification receipt
- [ ] Restore purchases
**Points** : 5

### US-5.3 : IAP Android
> En tant qu'utilisateur Android, je peux m'abonner
- [ ] Google Play Billing
- [ ] Achat
- [ ] Vérification
- [ ] Restore
**Points** : 5

### US-5.4 : Gestion Quotas
> En tant que système, je contrôle les accès
- [ ] Check quotas côté client
- [ ] Check quotas côté serveur
- [ ] Upgrade prompt
**Points** : 3

---

## Epic 6 : Storage & Sync
**Priorité** : P0 | **Sprint** : 1-2

### US-6.1 : Database Locale
> En tant que dev, je configure le storage offline
- [ ] WatermelonDB setup
- [ ] Modèles (Document, Pack, etc.)
- [ ] Migrations
- [ ] Repository pattern
**Points** : 5

### US-6.2 : Chiffrement Local
> En tant qu'utilisateur, mes données sont chiffrées
- [ ] Clé maître dans Keychain
- [ ] Chiffrement fichiers AES
- [ ] DB chiffrée (SQLCipher)
**Points** : 5

### US-6.3 : Sync Cloud (Premium)
> En tant qu'utilisateur premium, je sync mes données
- [ ] Upload fichiers S3
- [ ] Sync DB avec serveur
- [ ] Conflict resolution
- [ ] Indicateur sync status
**Points** : 8

---

## Epic 7 : Notifications
**Priorité** : P1 | **Sprint** : 2

### US-7.1 : Notifications Locales
> En tant qu'utilisateur, je reçois des rappels locaux
- [ ] Scheduling notifications
- [ ] Rappels échéances
- [ ] Rappels démarches
**Points** : 3

### US-7.2 : Push Notifications
> En tant qu'utilisateur sync, je reçois des push
- [ ] FCM/APNs setup
- [ ] Token registration
- [ ] Push server
**Points** : 5

### US-7.3 : Settings Notifications
> En tant qu'utilisateur, je configure mes notifs
- [ ] Toggle par type
- [ ] Heures silencieuses
- [ ] Permission request
**Points** : 2

---

## Epic 8 : Settings & RGPD
**Priorité** : P1 | **Sprint** : 2

### US-8.1 : Écran Settings
> En tant qu'utilisateur, je configure l'app
- [ ] Sections (Compte, Sécurité, Notifs, Données)
- [ ] Navigation vers sous-écrans
**Points** : 2

### US-8.2 : Export Données
> En tant qu'utilisateur, j'exporte mes données
- [ ] Bouton export
- [ ] Génération JSON + ZIP
- [ ] Download
**Points** : 3

### US-8.3 : Suppression Compte
> En tant qu'utilisateur, je supprime mon compte
- [ ] Confirmation
- [ ] Soft delete
- [ ] Purge programmée
**Points** : 2

### US-8.4 : Pages Légales
> En tant qu'utilisateur, j'accède aux CGU
- [ ] CGU
- [ ] Privacy Policy
- [ ] Mentions légales
**Points** : 1

---

## Résumé Sprints

### Sprint 1 (2 semaines)
- Epic 1 : Foundation & Auth
- Epic 2 : Documents (US-2.1 à 2.4)
- Epic 6 : Storage (US-6.1, 6.2)
**Total points** : ~35

### Sprint 2 (2 semaines)
- Epic 2 : Documents (US-2.5, 2.6)
- Epic 3 : Packs
- Epic 4 : Démarches
- Epic 5 : Abonnement
- Epic 7 : Notifications
- Epic 8 : Settings
**Total points** : ~45
