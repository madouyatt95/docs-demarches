# UX Flows & Arborescence Écrans

## 1. Arborescence Navigation

```
App
├── 🔐 Splash + Unlock (PIN/Biométrie)
├── 📋 Onboarding (3 écrans)
│   ├── Welcome
│   ├── Features Overview
│   └── Permissions (Notifications, Caméra)
│
├── 🏠 Tab Bar (3 onglets)
│   ├── Documents (défaut)
│   ├── Packs
│   └── Démarches (🔒 Premium badge)
│
├── Documents Tab
│   ├── Liste Documents
│   │   ├── Barre recherche
│   │   ├── Filtres (catégorie, tags)
│   │   └── Liste cards
│   ├── Document Detail
│   │   ├── Preview PDF/Image
│   │   ├── Métadonnées
│   │   ├── Échéances
│   │   └── Actions (Partager, Supprimer)
│   ├── Add Document
│   │   ├── Scan Caméra
│   │   └── Import Fichier
│   └── Edit Document
│
├── Packs Tab
│   ├── Liste Packs
│   ├── Pack Detail
│   │   ├── Documents inclus
│   │   ├── Ordre/Requis
│   │   └── Actions (Preview, Export)
│   ├── Create Pack
│   │   ├── Choisir Template
│   │   └── Pack Vide
│   └── Edit Pack
│
├── Démarches Tab (Premium)
│   ├── 🔒 Paywall (si non premium)
│   ├── Liste Démarches
│   │   ├── Filtres statut
│   │   └── Badge "X pièces manquantes"
│   ├── Démarche Detail
│   │   ├── Header (titre, statut)
│   │   ├── Checklist étapes
│   │   ├── Pièces requises
│   │   ├── Dates clés
│   │   └── Notes
│   ├── Create Démarche
│   │   ├── Choisir Template
│   │   └── Démarche Libre
│   └── Vue Pièces Manquantes
│
├── ⚙️ Settings (via header/profile)
│   ├── Compte
│   │   ├── Email/Profil
│   │   ├── Abonnement
│   │   └── Déconnexion
│   ├── Sécurité
│   │   ├── PIN/Biométrie
│   │   └── Auto-lock
│   ├── Notifications
│   ├── Données
│   │   ├── Export
│   │   ├── Sync (Premium)
│   │   └── Supprimer compte
│   └── Légal
│       ├── CGU
│       ├── Privacy Policy
│       └── Mentions légales
│
└── 💎 Subscription Screen
    ├── Features comparison
    ├── Pricing (mensuel/annuel)
    ├── CTA Subscribe
    └── Restore Purchases
```

## 2. UX Flows Textuels

### Flow A : Premier Lancement
```
1. Splash animé (logo + tagline)
2. Onboarding écran 1 : "Vos documents, toujours à portée"
3. Onboarding écran 2 : "Ne ratez plus une échéance"
4. Onboarding écran 3 : "Packs prêts en 10 secondes"
5. Demande permissions (notifications)
6. Options : "Créer un compte" / "Continuer sans compte"
7. Si compte : Auth (email ou Apple/Google)
8. Configuration PIN
9. Arrivée sur Documents (vide state)
```

### Flow B : Ajouter un Document
```
1. Tap FAB "+" sur Documents
2. Bottom sheet : "Scan" / "Importer"
3a. Si Scan :
    - Ouverture caméra
    - Détection bords automatique
    - Capture + recadrage
    - Option multi-pages
    - Validation → génération PDF
3b. Si Import :
    - Picker fichier système
    - Sélection fichier
4. Écran métadonnées :
    - Titre (auto-suggest si OCR premium)
    - Catégorie (picker)
    - Tags (chips input)
    - Date expiration (optionnel)
5. Save → retour liste avec toast succès
```

### Flow C : Créer un Pack
```
1. Tap FAB "+" sur Packs
2. Choix template ou "Pack vide"
3. Si template → pré-rempli avec docs requis
4. Écran édition pack :
    - Nom du pack
    - Liste documents (drag to reorder)
    - Bouton "Ajouter document"
5. Sélection documents depuis le coffre
6. Preview : PDF compilé
7. Export : PDF ou ZIP
8. (Premium) Générer lien de partage
```

### Flow D : Suivre une Démarche (Premium)
```
1. Tap onglet Démarches
2. Si non premium → Paywall
3. Si premium → Liste démarches
4. Tap "+" → Choix template
5. Création avec étapes/pièces pré-remplies
6. Pour chaque pièce :
    - Tap → "Joindre depuis Documents" ou "Importer"
7. Checklist : cocher étapes terminées
8. Configurer relances (dates)
9. Changer statut au fur et à mesure
10. Notification automatique si pièce manquante proche deadline
```

### Flow E : Paywall
```
1. Trigger : Tap Démarches / Limite atteinte
2. Écran Paywall :
    - Titre accrocheur
    - 3-4 bullets bénéfices
    - Comparaison Gratuit vs Premium
    - Toggle Mensuel/Annuel
    - Prix affiché
    - CTA principal "Essayer Premium"
    - Lien "Restaurer achats"
    - Bouton fermer (X)
3. Si subscribe : Flow IAP natif
4. Succès → Déblocage immédiat + confetti
```

## 3. États Spéciaux

### Empty States
- Documents vides : Illustration + "Ajoutez votre premier document"
- Packs vides : "Créez votre premier pack justificatif"
- Démarches vides : "Lancez votre première démarche"

### Loading States
- Skeleton loaders sur les listes
- Spinner sur les actions longues

### Error States
- Offline : Banner "Mode hors ligne"
- Erreur sync : Bottom sheet avec retry
- Quota atteint : Modal upgrade

### Quota Warnings
- 25/30 docs : Badge warning
- 30/30 docs : Modal "Passez Premium"
- Idem pour rappels et packs
