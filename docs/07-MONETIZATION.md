# Plan de Monétisation

## 1. Structure Freemium

### Tier Gratuit
| Ressource | Limite | Comportement quota atteint |
|-----------|--------|---------------------------|
| Documents | 30 | Modal upgrade |
| Rappels | 5 | Modal upgrade |
| Packs | 3 | Modal upgrade |
| Démarches | 0 | Paywall sur onglet |

### Tier Premium
| Ressource | Limite |
|-----------|--------|
| Documents | Illimité |
| Rappels | Illimité |
| Packs | Illimité |
| Démarches | Illimité |
| OCR | Inclus |
| Liens partage | Inclus |
| Sync cloud | Inclus |
| Profils famille | Jusqu'à 5 |

---

## 2. Pricing

| Plan | Prix | Économie |
|------|------|----------|
| Mensuel | 3,99 €/mois | - |
| Annuel | 29,99 €/an | 58% |

### Offres Spéciales (optionnel)
- Essai gratuit 7 jours (une fois)
- Offre de lancement -30% (3 premiers mois)
- Black Friday / Rentrée

---

## 3. Points de Conversion (Paywalls)

### Paywall Principal
**Trigger** : Tap sur onglet "Démarches"
```
┌─────────────────────────────────────┐
│         🚀 Débloquez                │
│       Mes Démarches                 │
├─────────────────────────────────────┤
│ ✓ Checklists prêtes à l'emploi     │
│ ✓ Suivi des pièces manquantes      │
│ ✓ Relances automatiques            │
│ ✓ 7 templates de démarches         │
├─────────────────────────────────────┤
│   ○ 3,99 €/mois                     │
│   ● 29,99 €/an (économisez 58%)    │
├─────────────────────────────────────┤
│      [ Essayer Premium ]            │
│      Restaurer achats               │
└─────────────────────────────────────┘
```

### Paywall Secondaire (Quotas)
**Trigger** : 30e document, 5e rappel, 3e pack
```
┌─────────────────────────────────────┐
│  📦 Vous avez atteint la limite    │
│                                     │
│  Passez Premium pour :              │
│  • Documents illimités              │
│  • Rappels illimités                │
│  • OCR et recherche texte           │
│  • Sync multi-appareils             │
├─────────────────────────────────────┤
│      [ Voir Premium ]               │
│      [ Plus tard ]                  │
└─────────────────────────────────────┘
```

### Paywall OCR
**Trigger** : Tentative de recherche texte
```
"La recherche dans le contenu est une 
fonctionnalité Premium. Essayez gratuitement !"
```

---

## 4. Écran Abonnement Complet

```
┌─────────────────────────────────────┐
│             DocsBox PRO             │
│    "Vos documents en ordre"         │
├─────────────────────────────────────┤
│ GRATUIT         │     PREMIUM       │
│ 30 documents    │ ∞ Illimité        │
│ 5 rappels       │ ∞ Illimité        │
│ 3 packs         │ ∞ Illimité        │
│ ✗ Démarches     │ ✓ Illimité        │
│ ✗ OCR           │ ✓ Inclus          │
│ ✗ Liens partage │ ✓ Inclus          │
│ ✗ Sync cloud    │ ✓ Inclus          │
├─────────────────────────────────────┤
│   [ ] Mensuel  3,99 €/mois          │
│   [●] Annuel  29,99 €/an BEST VALUE │
├─────────────────────────────────────┤
│      [ S'abonner maintenant ]       │
│                                     │
│   Annulez à tout moment             │
│   Restaurer achats                  │
│   Conditions · Confidentialité      │
└─────────────────────────────────────┘
```

---

## 5. Règles d'Accès

```typescript
const QUOTAS = {
  free: {
    maxDocuments: 30,
    maxReminders: 5,
    maxPacks: 3,
    maxDemarches: 0,
    hasOcr: false,
    hasShareLinks: false,
    hasCloudSync: false,
    hasFamilyProfiles: false,
  },
  premium: {
    maxDocuments: Infinity,
    maxReminders: Infinity,
    maxPacks: Infinity,
    maxDemarches: Infinity,
    hasOcr: true,
    hasShareLinks: true,
    hasCloudSync: true,
    hasFamilyProfiles: true,
  }
};

function canAddDocument(user: User): boolean {
  if (user.isPremium) return true;
  return user.documentCount < QUOTAS.free.maxDocuments;
}

function canAccessDemarches(user: User): boolean {
  return user.isPremium;
}
```

---

## 6. Intégration IAP

### iOS (StoreKit 2)
- Product IDs: `com.docsbox.premium.monthly`, `com.docsbox.premium.yearly`
- Vérification receipt côté serveur
- Restore purchases obligatoire

### Android (Google Play Billing)
- Product IDs identiques
- Vérification via Google API
- Grace period 3 jours

### Web (Stripe)
- Customer portal
- Webhooks pour sync
- Pas de free trial web (éviter abus)

---

## 7. KPIs Conversion

| Métrique | Objectif |
|----------|----------|
| Paywall view rate | > 30% des users |
| Trial start rate | > 10% des paywall views |
| Trial to paid | > 40% |
| LTV/CAC ratio | > 3:1 |
| Churn mensuel | < 8% |
