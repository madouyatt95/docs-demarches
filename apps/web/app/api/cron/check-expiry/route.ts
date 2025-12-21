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
        const { searchParams } = new URL(request.url);
        const isManualTrigger = searchParams.get('debug') === 'true';

        if (!isManualTrigger && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
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

        let sentCount = 0;
        let errorCount = 0;
        const logs: string[] = [];

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

        console.log(`[Cron] Found ${expiringDocs.length} expiring documents out of ${(documents || []).length}`);

        if (expiringDocs.length === 0) {
            return NextResponse.json({ message: 'Aucun document expirant', totalDocs: documents?.length, sent: 0 });
        }

        // Get all push subscriptions
        const { data: subscriptions } = await getSupabase()
            .from('push_subscriptions')
            .select('user_id, endpoint, keys');

        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({
                message: 'Aucun abonné aux notifications',
                expiringDocuments: expiringDocs.length,
                totalDocuments: documents?.length,
                sent: 0
            });
        }

        // Send notifications for each expiring document
        for (const doc of expiringDocs) {
            const days = daysUntil(doc.expirationDate);

            // Filter subscriptions: only send to the owner of THIS document
            const userSubscriptions = subscriptions.filter(sub => sub.user_id === doc.userId);

            if (userSubscriptions.length === 0) {
                logs.push(`No subscription for user ${doc.userId} (document: ${doc.title})`);
                continue;
            }

            const payload = JSON.stringify({
                title: 'DocsBox - Alerte expiration',
                body: days < 0
                    ? `"${doc.title}" a expiré il y a ${Math.abs(days)} jour${Math.abs(days) > 1 ? 's' : ''} !`
                    : days === 0
                        ? `"${doc.title}" expire aujourd'hui !`
                        : `"${doc.title}" expire dans ${days} jour${days > 1 ? 's' : ''}`,
                icon: '/icons/icon-192.png',
                badge: '/icons/icon-72.png',
                data: { url: '/' },
            });

            for (const sub of userSubscriptions) {
                try {
                    // Safe key extraction
                    let keys = sub.keys;
                    if (typeof keys === 'string') {
                        try { keys = JSON.parse(keys); } catch (e) { }
                    }

                    const pushSubscription = {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: keys?.p256dh || keys?.['p256dh'],
                            auth: keys?.auth || keys?.['auth'],
                        }
                    };

                    if (!pushSubscription.keys.p256dh || !pushSubscription.keys.auth) {
                        logs.push(`Missing keys for user ${doc.userId}`);
                        continue;
                    }

                    await webpush.sendNotification(pushSubscription, payload);
                    sentCount++;
                    logs.push(`Sent to user ${doc.userId} for ${doc.title}`);
                } catch (pushError: any) {
                    console.error('Push error details:', pushError);
                    errorCount++;
                    const statusCode = pushError.statusCode || 'N/A';
                    let errorDetail = pushError.message || 'Unknown error';
                    if (pushError.body) {
                        errorDetail += ` (Body: ${pushError.body.trim()})`;
                    }

                    logs.push(`Error ${statusCode} for ${doc.userId}: ${errorDetail}`);

                    if (pushError.statusCode === 410 || pushError.statusCode === 404 || pushError.statusCode === 403) {
                        await getSupabase().from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
                    }
                }
            }
        }

        return NextResponse.json({
            version: '1.0.3',
            vapidKeys: {
                publicPresent: !!vapidPublicKey,
                privatePresent: !!vapidPrivateKey,
                publicStart: vapidPublicKey ? vapidPublicKey.substring(0, 5) : 'N/A'
            },
            message: sentCount > 0 ? 'Notifications envoyées' : 'Terminé',
            expiringDocuments: expiringDocs.length,
            notificationsSent: sentCount,
            errors: errorCount,
            logs: logs.slice(0, 50)
        });
    } catch (error: any) {
        console.error('Cron check-expiry error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur', details: error.message },
            { status: 500 }
        );
    }
}
