
const webpush = require('web-push');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testPush() {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

    if (!vapidPublicKey || !vapidPrivateKey) {
        console.error('❌ VAPID keys missing in .env');
        return;
    }

    webpush.setVapidDetails(
        'mailto:contact@docsbox.app',
        vapidPublicKey,
        vapidPrivateKey
    );

    console.log('Fetching subscription for demo_user...');
    const { data: subs, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', 'demo_user')
        .limit(1);

    if (error || !subs || subs.length === 0) {
        console.error('❌ No subscription found for demo_user', error);
        return;
    }

    const sub = subs[0];
    const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth
        }
    };

    const payload = JSON.stringify({
        title: 'Test Notification',
        body: 'Ceci est un test manuel de notification push.',
        icon: '/icons/icon-192.png'
    });

    console.log('Sending notification to:', sub.endpoint.substring(0, 50) + '...');
    try {
        const response = await webpush.sendNotification(pushSubscription, payload);
        console.log('✅ Notification sent successfully!');
        console.log('Status:', response.statusCode);
    } catch (err) {
        console.error('❌ Error sending notification:', err.message);
        if (err.statusCode) console.log('Status code:', err.statusCode);
        if (err.body) console.log('Error body:', err.body);
    }
}

testPush();
