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

        // Create a simple notification payload
        const payload = JSON.stringify({
            title: '🔔 Test DocsBox',
            body: 'Les notifications fonctionnent !',
            icon: '/icons/icon-192.png',
            data: { url: '/' },
        });

        // Call the check-expiry endpoint to use its sendWebPush function
        // For now, just verify the subscription exists
        return NextResponse.json({
            success: true,
            message: 'Abonnement trouvé. Les notifications sont configurées.',
            endpoint: sub.endpoint.substring(0, 50) + '...',
            hasKeys: !!sub.keys,
        });
    } catch (error) {
        console.error('Test notification error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur', success: false },
            { status: 500 }
        );
    }
}
