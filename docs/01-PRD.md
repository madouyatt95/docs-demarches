# PRD - Documents & Démarches

## 1. Résumé Exécutif

**Nom produit** : DocsBox (ou "Mes Documents")  
**Cible** : Grand public français (B2C)  
**Modèle** : Freemium  
**Plateformes** : iOS, Android, PWA Web

### Vision
Centraliser tous les documents administratifs personnels, ne jamais oublier une échéance, et simplifier les démarches administratives grâce à des checklists intelligentes.

### Hypothèses Clés
- Stack principale : React Native/Expo + Next.js (PWA)
- Backend : Node.js/Express ou Next.js API Routes
- BDD : SQLite/WatermelonDB (offline) + PostgreSQL (cloud)
- Stockage fichiers : Local chiffré + S3 (premium sync)
- OCR : Vision API on-device (ML Kit / Apple Vision) pour v1.1

---

## 2. Personas

### Persona 1 : Sophie, 32 ans, Locataire
- Cherche un appartement, doit fournir des dossiers complets
- Fatiguée de chercher ses documents à chaque demande
- Veut créer un pack location en 2 clics

### Persona 2 : Marc, 45 ans, Père de famille
- Gère les papiers de 4 personnes
- Oublie régulièrement les renouvellements (carte grise, assurance)
- A besoin de rappels automatiques

### Persona 3 : Julie, 28 ans, Expatriée de retour
- Doit refaire tous ses papiers français
- Ne connaît pas les démarches ni les pièces requises
- Veut un guide pas-à-pas

---

## 3. Modules Fonctionnels

### Module A : Coffre-fort Documents (GRATUIT)

| Fonctionnalité | Gratuit | Premium |
|----------------|---------|---------|
| Stockage documents | 30 max | Illimité |
| Scan caméra → PDF | ✓ | ✓ |
| Import fichier | ✓ | ✓ |
| Catégories/Tags | ✓ | ✓ |
| Rappels échéances | 5 max | Illimité |
| Recherche basique | ✓ | ✓ |
| OCR + recherche texte | ✗ | ✓ |
| Profils famille | ✗ | ✓ |
| Sync multi-devices | ✗ | ✓ |

### Module B : Packs Justificatifs (GRATUIT)

| Fonctionnalité | Gratuit | Premium |
|----------------|---------|---------|
| Packs enregistrés | 3 max | Illimité |
| Templates (Location, École, Banque) | ✓ | ✓ |
| Export PDF/ZIP | ✓ | ✓ |
| Lien de partage expirant | ✗ | ✓ |
| Filigrane personnalisé | ✗ | ✓ |
| Logs d'accès | ✗ | ✓ |

### Module C : Mes Démarches (PREMIUM)

| Fonctionnalité | Description |
|----------------|-------------|
| Démarches illimitées | Créer et suivre des démarches |
| Templates prédéfinis | 7 templates de base |
| Checklist étapes | To-do avec statuts |
| Pièces requises | Liste + liaison Documents |
| Vue pièces manquantes | Agrégée toutes démarches |
| Relances automatiques | Notifications configurables |
| Timeline/Historique | Suivi chronologique |
| Statuts | À préparer → Terminée |

---

## 4. Exigences Non-Fonctionnelles

### Sécurité
- PIN 4-6 chiffres + biométrie (Face ID / Touch ID / Fingerprint)
- Chiffrement AES-256 fichiers locaux
- Clés stockées dans Keychain/Keystore
- Auto-lock configurable (immédiat, 1min, 5min)
- Chiffrement E2E pour sync cloud (premium)

### RGPD
- Consentement explicite notifications
- Export données (JSON + fichiers ZIP)
- Suppression compte en 2 clics
- Minimisation : pas de tracking superflu
- Privacy policy + CGU obligatoires

### Performance
- Temps de chargement < 2s
- Scan document < 3s
- Export pack < 5s
- Mode offline complet

### Accessibilité
- VoiceOver / TalkBack compatible
- Contrastes WCAG AA
- Tailles de police ajustables

---

## 5. Templates Démarches

### T1 : Carte Grise
- Étapes : Rassembler pièces, Remplir ANTS, Payer, Attendre
- Pièces : Ancien CG, Identité, Justificatif domicile, Formulaires

### T2 : Passeport/CNI
- Étapes : Photo, Timbre fiscal, Mairie, Récupération
- Pièces : Photo, Timbre, Justificatif domicile, Acte naissance

### T3 : Permis
- Étapes : Déclaration perte, Demande ANTS, Attente
- Pièces : Identité, Photo, Justificatif domicile

### T4 : Déménagement
- Étapes : Préavis, EDF/Gaz, Internet, Impôts, CAF, Banque
- Pièces : Nouveau bail, Justificatifs ancienne/nouvelle adresse

### T5 : CAF/APL
- Étapes : Créer compte, Simulation, Dossier, Suivi
- Pièces : Identité, RIB, Bail, Revenus

### T6 : Assurance Habitation
- Étapes : Devis, Souscription, Attestation
- Pièces : Bail, Identité, RIB

### T7 : Impôts
- Étapes : Préparer pièces, Déclarer, Payer
- Pièces : Revenus, Charges déductibles, Avis N-1

---

## 6. Métriques Clés

### Acquisition
- Downloads, Inscriptions, Activation (1 doc ajouté)

### Engagement
- DAU/MAU, Documents ajoutés/user, Packs créés

### Conversion
- Paywall views, Trial starts, Subscriptions

### Rétention
- D1/D7/D30, Churn rate
