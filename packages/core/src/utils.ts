// ============================================
// DOCSBOX - Utilitaires Partagés
// ============================================

import { QUOTAS } from './constants';
import { SubscriptionPlan, User, Subscription } from './types';

/**
 * Vérifie si un utilisateur peut ajouter un document
 */
export function canAddDocument(
    documentCount: number,
    subscription?: Subscription
): boolean {
    const plan = subscription?.status === 'active'
        ? subscription.plan
        : SubscriptionPlan.FREE;
    return documentCount < QUOTAS[plan].maxDocuments;
}

/**
 * Vérifie si un utilisateur peut ajouter un rappel
 */
export function canAddReminder(
    reminderCount: number,
    subscription?: Subscription
): boolean {
    const plan = subscription?.status === 'active'
        ? subscription.plan
        : SubscriptionPlan.FREE;
    return reminderCount < QUOTAS[plan].maxReminders;
}

/**
 * Vérifie si un utilisateur peut créer un pack
 */
export function canCreatePack(
    packCount: number,
    subscription?: Subscription
): boolean {
    const plan = subscription?.status === 'active'
        ? subscription.plan
        : SubscriptionPlan.FREE;
    return packCount < QUOTAS[plan].maxPacks;
}

/**
 * Vérifie si un utilisateur peut accéder aux démarches
 */
export function canAccessDemarches(subscription?: Subscription): boolean {
    return subscription?.status === 'active' &&
        subscription.plan === SubscriptionPlan.PREMIUM;
}

/**
 * Vérifie si un utilisateur peut utiliser l'OCR
 */
export function canUseOcr(subscription?: Subscription): boolean {
    const plan = subscription?.status === 'active'
        ? subscription.plan
        : SubscriptionPlan.FREE;
    return QUOTAS[plan].hasOcr;
}

/**
 * Vérifie si un utilisateur peut créer des liens de partage
 */
export function canUseShareLinks(subscription?: Subscription): boolean {
    const plan = subscription?.status === 'active'
        ? subscription.plan
        : SubscriptionPlan.FREE;
    return QUOTAS[plan].hasShareLinks;
}

/**
 * Récupère les quotas restants pour un utilisateur
 */
export function getRemainingQuotas(
    counts: { documents: number; reminders: number; packs: number },
    subscription?: Subscription
) {
    const plan = subscription?.status === 'active'
        ? subscription.plan
        : SubscriptionPlan.FREE;
    const quotas = QUOTAS[plan];

    return {
        documents: Math.max(0, quotas.maxDocuments - counts.documents),
        reminders: Math.max(0, quotas.maxReminders - counts.reminders),
        packs: Math.max(0, quotas.maxPacks - counts.packs),
        documentsWarning: counts.documents >= quotas.maxDocuments * 0.8,
        remindersWarning: counts.reminders >= quotas.maxReminders * 0.8,
        packsWarning: counts.packs >= quotas.maxPacks * 0.8,
    };
}

/**
 * Formate une date pour l'affichage
 */
export function formatDate(date: Date | string, locale = 'fr-FR'): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

/**
 * Calcule le nombre de jours avant une date
 */
export function daysUntil(date: Date | string): number {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Génère un ID unique
 */
export function generateId(prefix = ''): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
}

/**
 * Valide un email
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valide un mot de passe (min 8 chars, 1 majuscule, 1 chiffre)
 */
export function isValidPassword(password: string): boolean {
    return (
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password)
    );
}

/**
 * Tronque un texte avec ellipsis
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Formate la taille d'un fichier
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
