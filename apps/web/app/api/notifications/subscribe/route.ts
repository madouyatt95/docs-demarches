// ============================================
// DOCSBOX WEB - Push Notification Subscription API
// Stores browser push subscriptions for users
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// POST: Subscribe to push notifications
export async function POST(request: NextRequest) {
    try {
        const { subscription, userId = 'demo_user' } = await request.json();

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json(
                { error: 'Subscription invalide' },
                { status: 400 }
            );
        }

        // Upsert subscription (update if exists, insert if not)
        const { error } = await getSupabase()
            .from('push_subscriptions')
            .upsert({
                user_id: userId,
                endpoint: subscription.endpoint,
                keys: subscription.keys,
                created_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id,endpoint',
            });

        if (error) {
            console.error('Error storing subscription:', error);
            return NextResponse.json(
                { error: 'Erreur lors de l\'enregistrement' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: 'Notifications activées' });
    } catch (error) {
        console.error('Subscription error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

// DELETE: Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
    try {
        const { endpoint, userId = 'demo_user' } = await request.json();

        const { error } = await getSupabase()
            .from('push_subscriptions')
            .delete()
            .eq('user_id', userId)
            .eq('endpoint', endpoint);

        if (error) {
            console.error('Error deleting subscription:', error);
            return NextResponse.json(
                { error: 'Erreur lors de la suppression' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: 'Notifications désactivées' });
    } catch (error) {
        console.error('Unsubscribe error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
