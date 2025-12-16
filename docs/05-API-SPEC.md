# Spécification API

## Base URL
- Dev: `http://localhost:3000/api`
- Prod: `https://api.docsbox.fr/v1`

## Authentification
- JWT Bearer Token (header `Authorization: Bearer <token>`)
- Access token: 15min
- Refresh token: 30 jours (httpOnly cookie)

---

## Endpoints

### Auth

```
POST /auth/register
Body: { email, password, displayName? }
Response: { user, accessToken, refreshToken }

POST /auth/login
Body: { email, password }
Response: { user, accessToken, refreshToken }

POST /auth/logout
Response: 204 No Content

POST /auth/refresh
Cookie: refreshToken
Response: { accessToken }

POST /auth/forgot-password
Body: { email }
Response: 200 OK

POST /auth/reset-password
Body: { token, newPassword }
Response: 200 OK

GET /auth/me
Response: { user, subscription }

DELETE /auth/account
Response: 204 No Content (+ scheduled purge)
```

### Documents

```
GET /documents
Query: ?category=&tag=&search=&page=&limit=
Response: { documents[], total, page }

GET /documents/:id
Response: { document }

POST /documents
Body: FormData { file, title, categoryId, tags[], expirationDate? }
Response: { document }

PUT /documents/:id
Body: { title?, categoryId?, tags?, expirationDate? }
Response: { document }

DELETE /documents/:id
Response: 204 No Content

GET /documents/:id/download
Response: File stream (encrypted header)

POST /documents/:id/ocr (Premium)
Response: { ocrText }
```

### Categories

```
GET /categories
Response: { categories[] }

POST /categories
Body: { name, icon, color }
Response: { category }
```

### Reminders

```
GET /reminders
Query: ?documentId=&upcoming=true
Response: { reminders[] }

POST /reminders
Body: { documentId, daysBeforeExpiration }
Response: { reminder }

DELETE /reminders/:id
Response: 204 No Content
```

### Packs

```
GET /packs
Response: { packs[] }

GET /packs/:id
Response: { pack, documents[] }

POST /packs
Body: { name, templateType?, documentIds[] }
Response: { pack }

PUT /packs/:id
Body: { name?, documents[]? }
Response: { pack }

DELETE /packs/:id
Response: 204 No Content

GET /packs/:id/export
Query: ?format=pdf|zip
Response: File stream

POST /packs/:id/share (Premium)
Body: { expiresIn, password?, watermark? }
Response: { shareLink, token }
```

### Share Links

```
GET /share/:token
Response: { packInfo, documents[] } (ou 401 si password)

POST /share/:token/verify
Body: { password }
Response: { packInfo, documents[] }

GET /share/:token/download
Response: File stream

GET /share/:token/logs (Premium, owner only)
Response: { accessLogs[] }
```

### Demarches (Premium)

```
GET /demarches
Query: ?status=&hasMissingPieces=
Response: { demarches[], missingCount }

GET /demarches/:id
Response: { demarche, steps[], pieces[] }

POST /demarches
Body: { templateId?, title }
Response: { demarche }

PUT /demarches/:id
Body: { title?, status?, notes? }
Response: { demarche }

DELETE /demarches/:id
Response: 204 No Content

PUT /demarches/:id/steps/:stepId
Body: { done, dueDate? }
Response: { step }

PUT /demarches/:id/pieces/:pieceId
Body: { documentId?, status? }
Response: { piece }

GET /demarches/missing-pieces
Response: { pieces[] } (agrégé)
```

### Templates

```
GET /templates
Response: { templates[] }

GET /templates/:id
Response: { template, defaultSteps[], defaultPieces[] }
```

### Subscriptions

```
GET /subscription
Response: { subscription, quotas }

POST /subscription/verify
Body: { receipt, platform }
Response: { subscription }

POST /subscription/restore
Body: { platform }
Response: { subscription }

GET /subscription/products
Response: { products[] }
```

### Export RGPD

```
POST /export/request
Response: { exportId, estimatedTime }

GET /export/:id/status
Response: { status, downloadUrl? }

GET /export/:id/download
Response: ZIP file
```

---

## Codes Erreur

| Code | Description |
|------|-------------|
| 400 | Bad Request (validation) |
| 401 | Unauthorized |
| 403 | Forbidden (quota/premium) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 429 | Rate Limited |
| 500 | Server Error |

## Rate Limiting
- Auth: 5 req/min
- API: 100 req/min
- Upload: 10 req/min
