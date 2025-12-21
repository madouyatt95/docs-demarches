// ============================================
// DOCSBOX WEB - Push Notification Subscription API
// Stores browser push subscriptions for users
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST: Subscribe to push notifications
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    try {
        const { subscription } = await request.json();

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json(
                { error: 'Subscription invalide' },
                { status: 400 }
            );
        }

        // First, delete ALL existing subscriptions for this user
        // This ensures old subscriptions with different VAPID keys are removed
        await getSupabase()
            .from('push_subscriptions')
            .delete()
            .eq('user_id', userId);

        // Then insert the new subscription
        const { error } = await getSupabase()
            .from('push_subscriptions')
            .insert({
                user_id: userId,
                endpoint: subscription.endpoint,
                keys: subscription.keys,
                created_at: new Date().toISOString(),
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
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    try {
        const { endpoint } = await request.json();

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
