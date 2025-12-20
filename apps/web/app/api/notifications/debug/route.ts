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
            NEXT_PUBLIC_VAPID_PUBLIC_KEY: vapidPublic ? `${vapidPublic.substring(0, 10)}...` : 'MISSING',
            VAPID_PRIVATE_KEY_PRESENT: !!vapidPrivate,
            VAPID_PRIVATE_KEY_START: vapidPrivate ? `${vapidPrivate.substring(0, 5)}...` : 'N/A',
        }
    });
}
