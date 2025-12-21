// ============================================
// DOCSBOX WEB - Test Push Notification API
// Manually trigger a test notification
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import webpush from 'web-push';

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

        // Use unified utility
        const { sendPushNotification } = await import('@/lib/push');

        try {
            await sendPushNotification(sub, {
                title: '🔔 Test DocsBox',
                body: 'Les notifications fonctionnent parfaitement !',
                data: { url: '/' },
            });
            return NextResponse.json({
                version: '1.0.3',
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
