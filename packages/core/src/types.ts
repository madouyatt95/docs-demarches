// ============================================
// DOCSBOX - Types Partagés
// ============================================

// === ENUMS ===

export enum SubscriptionPlan {
    FREE = 'free',
    PREMIUM = 'premium',
}

export enum SubscriptionStatus {
    ACTIVE = 'active',
    EXPIRED = 'expired',
    CANCELLED = 'cancelled',
    TRIAL = 'trial',
}

export enum SyncStatus {
    LOCAL = 'local',
    SYNCED = 'synced',
    PENDING = 'pending',
    CONFLICT = 'conflict',
}

export enum DemarcheStatus {
    DRAFT = 'draft',
    IN_PROGRESS = 'in_progress',
    SENT = 'sent',
    WAITING = 'waiting',
    COMPLETED = 'completed',
}

export enum PieceStatus {
    MISSING = 'missing',
    ATTACHED = 'attached',
    EXPIRED = 'expired',
}

export enum PackTemplateType {
    LOCATION = 'location',
    ECOLE = 'ecole',
    BANQUE = 'banque',
    CUSTOM = 'custom',
}

// === INTERFACES ===

export interface User {
    id: string;
    email: string;
    displayName?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Subscription {
    id: string;
    userId: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    startDate: Date;
    endDate?: Date;
    storeProductId?: string;
}

export interface Document {
    id: string;
    userId: string;
    title: string;
    categoryId: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    thumbnailPath?: string;
    expirationDate?: Date;
    ocrText?: string;
    syncStatus: SyncStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    isSystem: boolean;
}

export interface Tag {
    id: string;
    userId: string;
    name: string;
    color: string;
}

export interface Reminder {
    id: string;
    documentId: string;
    daysBeforeExpiration: number;
    scheduledDate: Date;
    notified: boolean;
    createdAt: Date;
}

export interface Pack {
    id: string;
    userId: string;
    name: string;
    templateType?: PackTemplateType;
    createdAt: Date;
    updatedAt: Date;
}

export interface PackDocument {
    packId: string;
    documentId: string;
    orderIndex: number;
    isRequired: boolean;
}

export interface ShareLink {
    id: string;
    packId: string;
    token: string;
    expiresAt: Date;
    password?: string;
    watermark?: string;
    accessCount: number;
    createdAt: Date;
}

export interface AccessLog {
    id: string;
    shareLinkId: string;
    ipAddress: string;
    userAgent: string;
    accessedAt: Date;
}

export interface Demarche {
    id: string;
    userId: string;
    templateId?: string;
    title: string;
    status: DemarcheStatus;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Step {
    id: string;
    demarcheId: string;
    orderIndex: number;
    title: string;
    done: boolean;
    dueDate?: Date;
}

export interface RequiredPiece {
    id: string;
    demarcheId: string;
    name: string;
    documentId?: string;
    status: PieceStatus;
}

export interface DemarcheTemplate {
    id: string;
    name: string;
    description: string;
    icon: string;
    defaultSteps: Omit<Step, 'id' | 'demarcheId'>[];
    defaultPieces: Omit<RequiredPiece, 'id' | 'demarcheId' | 'documentId' | 'status'>[];
}

// === API TYPES ===

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    displayName?: string;
}

export interface CreateDocumentRequest {
    title: string;
    categoryId: string;
    tags?: string[];
    expirationDate?: string;
}

export interface CreatePackRequest {
    name: string;
    templateType?: PackTemplateType;
    documentIds?: string[];
}

export interface CreateDemarcheRequest {
    templateId?: string;
    title: string;
}
