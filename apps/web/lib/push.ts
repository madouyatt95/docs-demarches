import webpush from 'web-push';

export interface PushNotificationPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    data?: any;
}

export async function sendPushNotification(subscription: any, payload: PushNotificationPayload) {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

    if (!vapidPublicKey || !vapidPrivateKey) {
        throw new Error('VAPID keys not configured');
    }

    // Set details globally for the library (standard pattern)
    webpush.setVapidDetails(
        'mailto:contact@docsbox.app',
        vapidPublicKey,
        vapidPrivateKey
    );

    // Format subscription keys safely
    const keys = typeof subscription.keys === 'string'
        ? JSON.parse(subscription.keys)
        : subscription.keys;

    const pushSub = {
        endpoint: subscription.endpoint,
        keys: {
            p256dh: keys?.p256dh || keys?.['p256dh'],
            auth: keys?.auth || keys?.['auth'],
        }
    };

    return await webpush.sendNotification(pushSub, JSON.stringify({
        ...payload,
        icon: payload.icon || '/icons/icon-192.png',
        badge: payload.badge || '/icons/icon-72.png',
    }));
}
