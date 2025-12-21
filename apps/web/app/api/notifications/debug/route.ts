import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

    return NextResponse.json({
        deployment: {
            url: request.headers.get('host'),
            time: new Date().toISOString(),
        },
        env: {
            NEXT_PUBLIC_VAPID_PUBLIC_KEY: vapidPublic ? `${vapidPublic.substring(0, 5)}...${vapidPublic.slice(-3)}` : 'MISSING',
            VAPID_PUBLIC_LENGTH: vapidPublic ? vapidPublic.length : 0,
            VAPID_PRIVATE_KEY_PRESENT: !!vapidPrivate,
            VAPID_PRIVATE_KEY_CHECK: vapidPrivate ? `${vapidPrivate.substring(0, 5)}...${vapidPrivate.slice(-3)}` : 'N/A',
            VAPID_PRIVATE_LENGTH: vapidPrivate ? vapidPrivate.length : 0
        }
    });
}
