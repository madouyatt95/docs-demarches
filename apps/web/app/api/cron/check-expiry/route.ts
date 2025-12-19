// ============================================
// DOCSBOX WEB - Expiry Check Cron API
// Checks for expiring documents and sends notifications
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Calculate days until date
function daysUntil(dateStr: string): number {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// GET: Check expiring documents (called by Vercel cron or manually)
export async function GET(request: NextRequest) {
    try {
        // Verify cron secret (optional security)
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        // Get all documents with expiration dates
        const { data: documents, error: docsError } = await getSupabase()
            .from('documents')
            .select('id, title, expirationDate, userId')
            .not('expirationDate', 'is', null);

        if (docsError) {
            console.error('Error fetching documents:', docsError);
            return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 });
        }

        // Find documents expiring in 7, 3, or 1 day
        const expiringDocs = (documents || []).filter(doc => {
            if (!doc.expirationDate) return false;
            const days = daysUntil(doc.expirationDate);
            return days === 7 || days === 3 || days === 1 || days === 0;
        });

        if (expiringDocs.length === 0) {
            return NextResponse.json({ message: 'Aucun document expirant', sent: 0 });
        }

        // Get all push subscriptions
        const { data: subscriptions } = await getSupabase()
            .from('push_subscriptions')
            .select('user_id, endpoint, keys');

        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({
                message: 'Aucun abonné aux notifications',
                expiringDocuments: expiringDocs.length,
                sent: 0
            });
        }

        // For each expiring doc, prepare notification data
        const notificationData = expiringDocs.map(doc => {
            const days = daysUntil(doc.expirationDate);
            return {
                documentId: doc.id,
                title: doc.title,
                daysLeft: days,
                message: days === 0
                    ? `"${doc.title}" expire aujourd'hui !`
                    : `"${doc.title}" expire dans ${days} jour${days > 1 ? 's' : ''}`,
            };
        });

        // Note: Actual push sending requires web-push library with VAPID keys
        // For now, just return the data that would be sent
        return NextResponse.json({
            message: 'Vérification terminée',
            expiringDocuments: expiringDocs.length,
            notifications: notificationData,
            subscriberCount: subscriptions.length,
            // Push sending would happen here with VAPID keys configured
        });
    } catch (error) {
        console.error('Cron check-expiry error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
