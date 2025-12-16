# Modèle de Données

## Schéma Entités

```
┌─────────────────┐       ┌─────────────────┐
│      User       │       │   Subscription  │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │──────<│ id (PK)         │
│ email           │       │ userId (FK)     │
│ passwordHash    │       │ plan            │
│ displayName     │       │ status          │
│ pinHash         │       │ startDate       │
│ biometricEnabled│       │ endDate         │
│ createdAt       │       │ storeProductId  │
│ updatedAt       │       │ receipt         │
└────────┬────────┘       └─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐       ┌─────────────────┐
│    Document     │       │   Reminder      │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │──────<│ id (PK)         │
│ userId (FK)     │       │ documentId (FK) │
│ title           │       │ daysBeforeExp   │
│ categoryId (FK) │       │ scheduledDate   │
│ filePath        │       │ notified        │
│ fileSize        │       │ createdAt       │
│ mimeType        │       └─────────────────┘
│ thumbnailPath   │
│ expirationDate  │       ┌─────────────────┐
│ ocrText         │       │  DocumentTag    │
│ encryptionKey   │       ├─────────────────┤
│ syncStatus      │       │ documentId (FK) │
│ createdAt       │───────│ tagId (FK)      │
│ updatedAt       │       └─────────────────┘
└─────────────────┘               │
                                  │
┌─────────────────┐       ┌───────▼─────────┐
│    Category     │       │      Tag        │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ name            │       │ userId (FK)     │
│ icon            │       │ name            │
│ color           │       │ color           │
│ isSystem        │       └─────────────────┘
└─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│      Pack       │       │   PackDocument  │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │──────<│ packId (FK)     │
│ userId (FK)     │       │ documentId (FK) │
│ name            │       │ orderIndex      │
│ templateType    │       │ isRequired      │
│ createdAt       │       └─────────────────┘
│ updatedAt       │
└─────────────────┘       ┌─────────────────┐
                          │   ShareLink     │
                          ├─────────────────┤
┌─────────────────┐       │ id (PK)         │
│    Demarche     │       │ packId (FK)     │
├─────────────────┤       │ token           │
│ id (PK)         │       │ expiresAt       │
│ userId (FK)     │       │ password        │
│ templateId      │       │ watermark       │
│ title           │       │ accessCount     │
│ status          │       │ createdAt       │
│ notes           │       └─────────────────┘
│ createdAt       │
│ updatedAt       │       ┌─────────────────┐
└────────┬────────┘       │   AccessLog     │
         │                ├─────────────────┤
    ┌────┴────┐           │ id (PK)         │
    │         │           │ shareLinkId(FK) │
    ▼         ▼           │ ipAddress       │
┌────────┐ ┌────────┐     │ userAgent       │
│  Step  │ │Required│     │ accessedAt      │
│        │ │  Piece │     └─────────────────┘
├────────┤ ├────────┤
│id      │ │id      │
│ordre   │ │name    │
│title   │ │docId   │
│done    │ │status  │
│dueDate │ │        │
└────────┘ └────────┘
```

## Définitions TypeScript

```typescript
// Enums
enum SubscriptionPlan { FREE = 'free', PREMIUM = 'premium' }
enum SubscriptionStatus { ACTIVE = 'active', EXPIRED = 'expired', CANCELLED = 'cancelled' }
enum SyncStatus { LOCAL = 'local', SYNCED = 'synced', PENDING = 'pending', CONFLICT = 'conflict' }
enum DemarcheStatus { DRAFT = 'draft', IN_PROGRESS = 'in_progress', SENT = 'sent', WAITING = 'waiting', COMPLETED = 'completed' }
enum PieceStatus { MISSING = 'missing', ATTACHED = 'attached', EXPIRED = 'expired' }

// Core Entities
interface User {
  id: string;
  email: string;
  displayName?: string;
  pinHash?: string;
  biometricEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Document {
  id: string;
  userId: string;
  title: string;
  categoryId: string;
  filePath: string; // chemin chiffré local
  fileSize: number;
  mimeType: string;
  thumbnailPath?: string;
  expirationDate?: Date;
  ocrText?: string; // premium only
  syncStatus: SyncStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isSystem: boolean;
}

interface Pack {
  id: string;
  userId: string;
  name: string;
  templateType?: 'location' | 'ecole' | 'banque' | 'custom';
  documents: PackDocument[];
  createdAt: Date;
}

interface Demarche {
  id: string;
  userId: string;
  templateId?: string;
  title: string;
  status: DemarcheStatus;
  steps: Step[];
  requiredPieces: RequiredPiece[];
  notes?: string;
  createdAt: Date;
}
```

## Index Recommandés

```sql
-- Performance queries fréquentes
CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_documents_category ON documents(category_id);
CREATE INDEX idx_documents_expiration ON documents(expiration_date);
CREATE INDEX idx_reminders_scheduled ON reminders(scheduled_date, notified);
CREATE INDEX idx_packs_user ON packs(user_id);
CREATE INDEX idx_demarches_user_status ON demarches(user_id, status);
CREATE INDEX idx_share_links_token ON share_links(token);
CREATE INDEX idx_share_links_expires ON share_links(expires_at);
```

## Contraintes

- `documents.user_id` → `users.id` ON DELETE CASCADE
- `reminders.document_id` → `documents.id` ON DELETE CASCADE
- `pack_documents.pack_id` → `packs.id` ON DELETE CASCADE
- `demarches.user_id` → `users.id` ON DELETE CASCADE
- `share_links.pack_id` → `packs.id` ON DELETE CASCADE
- Unique: `users.email`, `share_links.token`
- Check: `documents.file_size > 0`
- Check: `reminders.days_before_exp >= 0`
