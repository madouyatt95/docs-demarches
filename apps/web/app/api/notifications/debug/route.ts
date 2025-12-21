import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

    // Get current subscription to check origin
    const { data: subs } = await getSupabase()
        .from('push_subscriptions')
        .select('endpoint')
        .limit(1);

    return NextResponse.json({
        deployment: {
            url: request.headers.get('host'),
            origin: request.nextUrl.origin,
            time: new Date().toISOString(),
        },
        subscription: {
            count: subs?.length || 0,
            endpointOrigin: subs?.[0]?.endpoint ? new URL(subs[0].endpoint).origin : 'NONE',
        },
        env: {
            NEXT_PUBLIC_VAPID_PUBLIC_KEY: vapidPublic ? `${vapidPublic.substring(0, 5)}...${vapidPublic.slice(-3)}` : 'MISSING',
            VAPID_PUBLIC_LENGTH: vapidPublic ? vapidPublic.length : 0,
            VAPID_PRIVATE_KEY_PRESENT: !!vapidPrivate,
            VAPID_PRIVATE_KEY_CHECK: vapidPrivate ? `${vapidPrivate.substring(0, 5)}...${vapidPrivate.slice(-3)}` : 'N/A',
            VAPID_PRIVATE_LENGTH: vapidPrivate ? vapidPrivate.length : 0,
            VAPID_PRIVATE_HASH: vapidPrivate ? Buffer.from(vapidPrivate).reduce((acc, val) => acc + val, 0) : 0
        }
    });
}
