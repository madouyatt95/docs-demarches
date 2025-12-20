// ============================================
// DOCSBOX WEB - Expiry Check Cron API
// Checks for expiring documents and sends push notifications
// Uses web-push library for reliable notification delivery
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import webpush from 'web-push';

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

        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

        if (!vapidPublicKey || !vapidPrivateKey) {
            return NextResponse.json({
                error: 'VAPID keys not configured',
                sent: 0
            });
        }

        // Configure web-push with VAPID details
        webpush.setVapidDetails(
            'mailto:contact@docsbox.app',
            vapidPublicKey,
            vapidPrivateKey
        );

        // Get all documents with expiration dates
        const { data: documents, error: docsError } = await getSupabase()
            .from('documents')
            .select('id, title, expirationDate, userId')
            .not('expirationDate', 'is', null);

        if (docsError) {
            console.error('Error fetching documents:', docsError);
            return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 });
        }

        // Find documents expiring soon or recently expired (within -7 to +30 days)
        const expiringDocs = (documents || []).filter(doc => {
            if (!doc.expirationDate) return false;
            const days = daysUntil(doc.expirationDate);
            // Include: expired in last 7 days (-7 to 0) OR expiring soon (1 to 30 days)
            return days >= -7 && days <= 30;
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

        let sentCount = 0;
        let errorCount = 0;
        const errorDetails: string[] = [];

        // Send notifications for each expiring document
        for (const doc of expiringDocs) {
            const days = daysUntil(doc.expirationDate);

            const payload = JSON.stringify({
                title: '📋 DocsBox - Alerte expiration',
                body: days < 0
                    ? `"${doc.title}" a expiré il y a ${Math.abs(days)} jour${Math.abs(days) > 1 ? 's' : ''} !`
                    : days === 0
                        ? `"${doc.title}" expire aujourd'hui !`
                        : `"${doc.title}" expire dans ${days} jour${days > 1 ? 's' : ''}`,
                icon: '/icons/icon-192.png',
                badge: '/icons/icon-72.png',
                data: { url: '/' },
            });

            // Send to all subscribers (in a real app, filter by userId)
            for (const sub of subscriptions) {
                try {
                    // Create subscription object in web-push format
                    const pushSubscription = {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.keys?.p256dh || sub.keys?.['p256dh'],
                            auth: sub.keys?.auth || sub.keys?.['auth'],
                        }
                    };

                    await webpush.sendNotification(pushSubscription, payload);
                    sentCount++;
                } catch (pushError: any) {
                    console.error('Push error details:', {
                        error: pushError.message || pushError,
                        statusCode: pushError.statusCode,
                        endpoint: sub.endpoint?.substring(0, 50) + '...',
                        docTitle: doc.title,
                    });

                    errorDetails.push(`${doc.title}: ${pushError.message || 'Unknown error'} (HTTP ${pushError.statusCode || 'N/A'})`);
                    errorCount++;

                    // Remove invalid subscription (410 Gone or 404 Not Found)
                    if (pushError.statusCode === 410 || pushError.statusCode === 404) {
                        await getSupabase()
                            .from('push_subscriptions')
                            .delete()
                            .eq('endpoint', sub.endpoint);
                    }
                }
            }
        }

        return NextResponse.json({
            message: sentCount > 0 ? 'Notifications envoyées' : 'Erreurs lors de l\'envoi',
            expiringDocuments: expiringDocs.length,
            notificationsSent: sentCount,
            errors: errorCount,
            ...(errorCount > 0 && { errorDetails: errorDetails.slice(0, 10) }),
        });
    } catch (error: any) {
        console.error('Cron check-expiry error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur', details: error.message },
            { status: 500 }
        );
    }
}
