// ============================================
// DOCSBOX WEB - Notification Debug API
// Debug endpoint to check push subscriptions status
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET: Check push subscriptions status and test their validity
export async function GET(request: NextRequest) {
    try {
        // Get all push subscriptions
        const { data: subscriptions, error: subError } = await getSupabase()
            .from('push_subscriptions')
            .select('user_id, endpoint, keys, created_at');

        if (subError) {
            return NextResponse.json({
                status: 'error',
                message: 'Table push_subscriptions may not exist',
                error: subError.message,
                hint: 'Create the table in Supabase with columns: user_id (text), endpoint (text), keys (jsonb), created_at (timestamp)',
            }, { status: 500 });
        }

        // Check for documents with expiration dates
        const { data: documents, error: docsError } = await getSupabase()
            .from('documents')
            .select('id, title, expirationDate, userId')
            .not('expirationDate', 'is', null);

        // Calculate days until expiration for each doc
        const now = new Date();
        const docsWithDays = (documents || []).map(doc => {
            const expDate = new Date(doc.expirationDate);
            const days = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return {
                id: doc.id,
                title: doc.title,
                expirationDate: doc.expirationDate,
                daysUntilExpiry: days,
                status: days < 0 ? 'expired' : days === 0 ? 'expires_today' : days <= 7 ? 'urgent' : 'ok',
            };
        });

        // Check VAPID configuration
        const vapidConfigured = !!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

        return NextResponse.json({
            status: 'ok',
            vapidConfigured,
            subscriptions: {
                count: subscriptions?.length || 0,
                items: (subscriptions || []).map(sub => ({
                    userId: sub.user_id,
                    endpoint: sub.endpoint?.substring(0, 60) + '...',
                    hasKeys: !!(sub.keys?.p256dh && sub.keys?.auth),
                    createdAt: sub.created_at,
                })),
            },
            expiringDocuments: {
                count: docsWithDays.filter(d => d.daysUntilExpiry >= -7 && d.daysUntilExpiry <= 30).length,
                items: docsWithDays.slice(0, 10), // Show first 10
            },
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: error.message || 'Unknown error',
        }, { status: 500 });
    }
}
