// ============================================
// DOCSBOX WEB - Test Push Notification API
// Manually trigger a test notification
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// POST: Send a test notification to verify push is working
export async function POST(request: NextRequest) {
    try {
        // Get subscriptions
        const { data: subscriptions } = await getSupabase()
            .from('push_subscriptions')
            .select('endpoint, keys')
            .limit(1);

        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({
                error: 'Aucun abonnement trouvé. Activez d\'abord les notifications.',
                success: false
            });
        }

        const sub = subscriptions[0];

        // Configure web-push
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

        if (!vapidPublicKey || !vapidPrivateKey) {
            return NextResponse.json({
                error: 'VAPID keys not configured in server environment',
                success: false
            });
        }

        webpush.setVapidDetails(
            'mailto:contact@docsbox.app',
            vapidPublicKey,
            vapidPrivateKey
        );

        // Create a simple notification payload
        const payload = JSON.stringify({
            title: '🔔 Test DocsBox',
            body: 'Les notifications fonctionnent parfaitement !',
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-72.png',
            data: { url: '/' },
        });

        // Send notification
        const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
                p256dh: (sub.keys as any)?.p256dh || (sub.keys as any)?.['p256dh'],
                auth: (sub.keys as any)?.auth || (sub.keys as any)?.['auth'],
            }
        };

        try {
            await webpush.sendNotification(pushSubscription, payload);
            return NextResponse.json({
                success: true,
                message: 'Notification de test envoyée !',
                endpoint: sub.endpoint.substring(0, 50) + '...',
            });
        } catch (pushError: any) {
            console.error('Push error:', pushError);
            return NextResponse.json({
                error: `Erreur d'envoi: ${pushError.message}`,
                success: false,
                statusCode: pushError.statusCode
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Test notification error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur', success: false },
            { status: 500 }
        );
    }
}
