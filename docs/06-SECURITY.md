# Plan de Sécurité

## 1. Authentification & Accès

### App Lock
- PIN 4-6 chiffres obligatoire après onboarding
- Biométrie optionnelle (Face ID, Touch ID, Fingerprint)
- Auto-lock configurable : immédiat, 1 min, 5 min, jamais
- Verrouillage après 5 tentatives PIN → délai exponentiel

### Auth Backend
- Passwords hashés avec Argon2id (ou bcrypt)
- JWT RS256 avec rotation des clés
- Refresh tokens en httpOnly secure cookies
- Session invalidation sur logout

---

## 2. Chiffrement

### Fichiers Locaux (Mobile)
```
┌─────────────────────────────────────────┐
│ 1. Génération clé maître (DEK)          │
│    - Dérivée du PIN via PBKDF2          │
│    - Stockée dans Keychain/Keystore     │
├─────────────────────────────────────────┤
│ 2. Chiffrement fichier                  │
│    - AES-256-GCM par fichier            │
│    - IV unique par fichier              │
│    - Clé fichier (FEK) wrappée par DEK  │
├─────────────────────────────────────────┤
│ 3. Stockage                             │
│    - Fichier.enc dans app sandbox       │
│    - Métadonnées (IV, FEK chiffré) en DB│
└─────────────────────────────────────────┘
```

### Base de Données Locale
- SQLCipher pour SQLite (WatermelonDB + encryption)
- Clé BDD dans Keychain/Keystore

### Sync Cloud (Premium)
- Chiffrement E2E optionnel
- Clé de chiffrement dérivée côté client
- Serveur ne voit que des blobs chiffrés
- Ou : chiffrement at-rest (AES-256) côté serveur si E2E désactivé

### Fichiers Cloud (S3)
- SSE-S3 au minimum
- SSE-KMS pour production
- Signed URLs pour download (expiration 5 min)

---

## 3. Stockage Sécurisé

| Donnée | Mobile | Web |
|--------|--------|-----|
| PIN hash | Keychain/Keystore | N/A (pas de PIN web) |
| Clé maître | Keychain/Keystore | Dérivée session |
| Access Token | SecureStore | httpOnly cookie |
| Refresh Token | SecureStore | httpOnly cookie |
| Fichiers | Chiffrés dans sandbox | IndexedDB + chiffré |

---

## 4. Menaces & Mitigations

| Menace | Impact | Mitigation |
|--------|--------|------------|
| Vol device | Accès documents | PIN + biométrie + chiffrement |
| Interception réseau | Token volé | HTTPS only + cert pinning |
| Injection SQL | Data breach | ORM + parameterized queries |
| XSS | Session hijack | CSP + httpOnly cookies |
| CSRF | Actions non voulues | CSRF tokens + SameSite cookies |
| Brute force | Accès compte | Rate limiting + lockout |
| Insider threat | Data exfil | Audit logs + least privilege |

---

## 5. RGPD Compliance

### Minimisation
- Collecte uniquement : email, documents uploadés
- Pas de tracking tiers sans consentement
- Analytics anonymisées

### Droits Utilisateur
- **Accès** : Export JSON + fichiers ZIP
- **Rectification** : Édition profil
- **Suppression** : Delete account → soft delete → purge 30j
- **Portabilité** : Export standard

### Consentement
- Notifications : opt-in explicite
- Analytics : opt-in ou anonymisé
- Sync cloud : opt-in

### Conservation
- Documents : jusqu'à suppression par user
- Logs serveur : 90 jours max
- Backups : 30 jours

### DPO
- Contact DPO dans Privacy Policy
- Procédure data breach documentée

---

## 6. Checklist Sécurité Release

- [ ] HTTPS everywhere
- [ ] Certificate pinning (mobile)
- [ ] Pas de secrets en clair dans le code
- [ ] Variables d'env pour les clés
- [ ] Rate limiting activé
- [ ] Headers sécurité (CSP, HSTS, X-Frame)
- [ ] Audit dépendances (npm audit)
- [ ] Tests de pénétration basiques
- [ ] Privacy Policy à jour
- [ ] CGU validées par juriste
