# Plan de Tests

## 1. Stratégie de Tests

```
┌─────────────────────────────────────────────────────────────┐
│                    Pyramide de Tests                         │
├─────────────────────────────────────────────────────────────┤
│                         E2E (10%)                            │
│                    ┌─────────────┐                           │
│                    │  Detox/     │                           │
│                    │  Maestro    │                           │
│               ┌────┴─────────────┴────┐                      │
│               │    Integration (20%)   │                     │
│               │    React Testing Lib   │                     │
│          ┌────┴────────────────────────┴────┐                │
│          │         Unit Tests (70%)          │               │
│          │         Jest + Vitest             │               │
│          └──────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Tests Unitaires

### Couverture Cible : 80%

### Domaines Critiques

```typescript
// Exemple : quotas.test.ts
describe('Quota Service', () => {
  it('should allow document creation under limit', () => {
    const user = { isPremium: false, documentCount: 29 };
    expect(canAddDocument(user)).toBe(true);
  });
  
  it('should block document creation at limit', () => {
    const user = { isPremium: false, documentCount: 30 };
    expect(canAddDocument(user)).toBe(false);
  });
  
  it('should allow unlimited for premium', () => {
    const user = { isPremium: true, documentCount: 1000 };
    expect(canAddDocument(user)).toBe(true);
  });
});
```

### Fichiers à Tester
| Module | Fichiers | Priorité |
|--------|----------|----------|
| Auth | `auth.service.ts`, `token.utils.ts` | P0 |
| Quotas | `quota.service.ts`, `subscription.service.ts` | P0 |
| Crypto | `encryption.service.ts`, `keychain.utils.ts` | P0 |
| Documents | `document.repository.ts`, `pdf.service.ts` | P0 |
| Packs | `pack.service.ts`, `export.service.ts` | P1 |
| Demarches | `demarche.service.ts`, `template.service.ts` | P1 |

### Commandes
```bash
# Mobile (Jest)
cd apps/mobile && npm run test
npm run test:coverage

# Web (Vitest)
cd apps/web && npm run test
npm run test:coverage

# Watch mode
npm run test:watch
```

---

## 3. Tests d'Intégration

### API Tests (Supertest)

```typescript
// Example : auth.integration.test.ts
describe('POST /api/auth/register', () => {
  it('should create user and return tokens', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'Password123!' });
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user.email).toBe('test@example.com');
  });
  
  it('should reject duplicate email', async () => {
    await createUser('test@example.com');
    
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'Password123!' });
    
    expect(res.status).toBe(409);
  });
});
```

### Component Tests (React Testing Library)

```typescript
// Example : DocumentCard.test.tsx
describe('DocumentCard', () => {
  it('renders document info', () => {
    const doc = { title: 'Passport', category: 'Identité' };
    render(<DocumentCard document={doc} />);
    
    expect(screen.getByText('Passport')).toBeInTheDocument();
    expect(screen.getByText('Identité')).toBeInTheDocument();
  });
  
  it('shows expiration warning', () => {
    const doc = { title: 'CNI', expirationDate: addDays(new Date(), 7) };
    render(<DocumentCard document={doc} />);
    
    expect(screen.getByTestId('expiration-warning')).toBeInTheDocument();
  });
});
```

### Commandes
```bash
# API tests
cd apps/api && npm run test:integration

# Component tests
cd apps/mobile && npm run test:components
cd apps/web && npm run test:components
```

---

## 4. Tests E2E

### Mobile (Maestro)

```yaml
# flows/onboarding.yaml
appId: com.docsbox.app
---
- launchApp
- assertVisible: "Vos documents, toujours à portée"
- tapOn: "Suivant"
- assertVisible: "Ne ratez plus une échéance"
- tapOn: "Suivant"
- assertVisible: "Packs prêts en 10 secondes"
- tapOn: "Commencer"
- assertVisible: "Créer un compte"
```

```yaml
# flows/add_document.yaml
appId: com.docsbox.app
---
- launchApp:
    clearState: true
- runFlow: flows/login.yaml
- tapOn: 
    id: "fab-add"
- tapOn: "Importer un fichier"
- tapOn: "test_document.pdf"
- inputText:
    id: "input-title"
    text: "Mon passeport"
- tapOn: "Identité"
- tapOn: "Enregistrer"
- assertVisible: "Mon passeport"
```

### Web (Playwright)

```typescript
// tests/e2e/auth.spec.ts
test('user can register and login', async ({ page }) => {
  await page.goto('/register');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/documents');
  await expect(page.locator('text=Mes documents')).toBeVisible();
});

test('paywall shows for demarches', async ({ page }) => {
  await loginAsFreeTier(page);
  await page.click('text=Démarches');
  
  await expect(page.locator('text=Débloquez Mes Démarches')).toBeVisible();
});
```

### Commandes
```bash
# Mobile E2E
maestro test flows/

# Web E2E
cd apps/web && npx playwright test
npx playwright test --ui  # Mode debug
```

---

## 5. Tests Sécurité

### Checklist Manuelle
- [ ] Tentative SQL injection sur search
- [ ] XSS dans les champs texte
- [ ] IDOR : accès document d'un autre user
- [ ] Token expiration respectée
- [ ] Rate limiting fonctionne
- [ ] HTTPS enforced (no mixed content)
- [ ] Fichiers chiffrés sur device

### Tests Automatisés
```bash
# Audit dépendances
npm audit
npm audit --fix

# OWASP ZAP scan (optionnel)
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://staging.docsbox.fr
```

---

## 6. Tests Performance

### Métriques Cibles
| Métrique | Cible |
|----------|-------|
| Time to Interactive | < 3s |
| First Contentful Paint | < 1.5s |
| Liste 100 docs scroll | 60 FPS |
| Export PDF 10 docs | < 5s |

### Outils
```bash
# Lighthouse
npx lighthouse https://app.docsbox.fr --output html

# React Native Perf
# Utiliser Flipper + Perf Monitor
```

---

## 7. Checklist Release Stores

### iOS App Store
- [ ] Screenshots 6.7" et 5.5"
- [ ] App Preview video (optionnel)
- [ ] Description et mots-clés
- [ ] Privacy Policy URL
- [ ] Support URL
- [ ] Age rating : 4+
- [ ] IDFA declaration : Non
- [ ] IAP configurés et validés
- [ ] Test sur device réel (iPhone 12+)
- [ ] Test sur iOS 15, 16, 17

### Google Play Store
- [ ] Screenshots phone et tablet
- [ ] Feature graphic
- [ ] Description et tags
- [ ] Privacy Policy URL
- [ ] Content rating questionnaire
- [ ] IAP configurés
- [ ] Test sur device réel (Pixel, Samsung)
- [ ] Test sur Android 10, 11, 12, 13

### Pre-Release Checklist
- [ ] Version bump
- [ ] Changelog rédigé
- [ ] Tous les tests passent
- [ ] Build release signé
- [ ] TestFlight / Internal Testing
- [ ] Smoke test manuel
- [ ] Analytics events vérifiés
- [ ] Crash reporting activé (Sentry)
