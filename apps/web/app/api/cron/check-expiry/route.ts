// ============================================
// DOCSBOX WEB - Expiry Check Cron API
// Checks for expiring documents and sends push notifications
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import * as crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Calculate days until date
function daysUntil(dateStr: string): number {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Convert base64url to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = Buffer.from(base64, 'base64');
    return new Uint8Array(rawData);
}

// Send Web Push notification using fetch
async function sendWebPush(
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
    payload: string,
    vapidPublicKey: string,
    vapidPrivateKey: string
): Promise<boolean> {
    try {
        const endpoint = new URL(subscription.endpoint);

        // Create JWT for VAPID
        const header = { typ: 'JWT', alg: 'ES256' };
        const now = Math.floor(Date.now() / 1000);
        const claims = {
            aud: `${endpoint.protocol}//${endpoint.host}`,
            exp: now + 12 * 60 * 60, // 12 hours
            sub: 'mailto:contact@docsbox.app',
        };

        const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
        const claimsB64 = Buffer.from(JSON.stringify(claims)).toString('base64url');
        const unsignedToken = `${headerB64}.${claimsB64}`;

        // Sign with ECDSA
        const privateKeyBuffer = urlBase64ToUint8Array(vapidPrivateKey);
        const key = crypto.createPrivateKey({
            key: Buffer.concat([
                Buffer.from('308141020100301306072a8648ce3d020106082a8648ce3d030107042730250201010420', 'hex'),
                privateKeyBuffer,
            ]),
            format: 'der',
            type: 'pkcs8',
        });

        const sign = crypto.createSign('SHA256');
        sign.update(unsignedToken);
        const signature = sign.sign({ key, dsaEncoding: 'ieee-p1363' });
        const signatureB64 = signature.toString('base64url');
        const jwt = `${unsignedToken}.${signatureB64}`;

        // Encrypt payload
        const userPublicKey = urlBase64ToUint8Array(subscription.keys.p256dh);
        const userAuth = urlBase64ToUint8Array(subscription.keys.auth);

        // Generate local keys
        const localKeyPair = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
        const localPublicKey = localKeyPair.publicKey.export({ type: 'spki', format: 'der' }).slice(-65);

        // Derive shared secret using ECDH
        const ecdh = crypto.createECDH('prime256v1');
        ecdh.setPrivateKey(localKeyPair.privateKey.export({ type: 'pkcs8', format: 'der' }).slice(-32));
        const sharedSecret = ecdh.computeSecret(Buffer.from(userPublicKey));

        // Create encryption keys using HKDF
        const salt = crypto.randomBytes(16);

        // PRK
        const authInfo = Buffer.concat([
            Buffer.from('Content-Encoding: auth\0', 'utf8'),
        ]);
        const prk = crypto.createHmac('sha256', userAuth).update(sharedSecret).digest();

        // IKM
        const keyInfo = Buffer.concat([
            Buffer.from('WebPush: info\0', 'utf8'),
            Buffer.from(userPublicKey),
            localPublicKey,
        ]);
        const ikm = crypto.createHmac('sha256', prk).update(Buffer.concat([keyInfo, Buffer.from([1])])).digest();

        // CEK and nonce
        const cekInfo = Buffer.from('Content-Encoding: aes128gcm\0', 'utf8');
        const nonceInfo = Buffer.from('Content-Encoding: nonce\0', 'utf8');

        const prkForExpansion = crypto.createHmac('sha256', salt).update(ikm).digest();
        const cek = crypto.createHmac('sha256', prkForExpansion)
            .update(Buffer.concat([cekInfo, Buffer.from([1])]))
            .digest()
            .slice(0, 16);
        const nonce = crypto.createHmac('sha256', prkForExpansion)
            .update(Buffer.concat([nonceInfo, Buffer.from([1])]))
            .digest()
            .slice(0, 12);

        // Encrypt with AES-128-GCM
        const cipher = crypto.createCipheriv('aes-128-gcm', cek, nonce);
        const paddedPayload = Buffer.concat([Buffer.from([0, 0]), Buffer.from(payload, 'utf8')]);
        const encrypted = Buffer.concat([cipher.update(paddedPayload), cipher.final(), cipher.getAuthTag()]);

        // Create body
        const recordSize = Buffer.alloc(4);
        recordSize.writeUInt32BE(4096, 0);
        const body = Buffer.concat([
            salt,
            recordSize,
            Buffer.from([localPublicKey.length]),
            localPublicKey,
            encrypted,
        ]);

        // Send request
        const response = await fetch(subscription.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Encoding': 'aes128gcm',
                'Content-Length': body.length.toString(),
                'TTL': '86400',
                'Authorization': `vapid t=${jwt}, k=${vapidPublicKey}`,
            },
            body,
        });

        return response.ok || response.status === 201;
    } catch (error) {
        console.error('Web Push error:', error);
        return false;
    }
}

// GET: Check expiring documents (called by Vercel cron or manually)
export async function GET(request: NextRequest) {
    try {
        // Verify cron secret (optional security)
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

        if (!vapidPublicKey || !vapidPrivateKey) {
            return NextResponse.json({
                error: 'VAPID keys not configured',
                sent: 0
            });
        }

        // Get all documents with expiration dates
        const { data: documents, error: docsError } = await getSupabase()
            .from('documents')
            .select('id, title, expirationDate, userId')
            .not('expirationDate', 'is', null);

        if (docsError) {
            console.error('Error fetching documents:', docsError);
            return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 });
        }

        // Find documents expiring in 7, 3, or 1 day
        const expiringDocs = (documents || []).filter(doc => {
            if (!doc.expirationDate) return false;
            const days = daysUntil(doc.expirationDate);
            return days === 7 || days === 3 || days === 1 || days === 0;
        });

        if (expiringDocs.length === 0) {
            return NextResponse.json({ message: 'Aucun document expirant', sent: 0 });
        }

        // Get all push subscriptions
        const { data: subscriptions } = await getSupabase()
            .from('push_subscriptions')
            .select('user_id, endpoint, keys');

        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({
                message: 'Aucun abonné aux notifications',
                expiringDocuments: expiringDocs.length,
                sent: 0
            });
        }

        let sentCount = 0;
        let errorCount = 0;

        // Send notifications for each expiring document
        for (const doc of expiringDocs) {
            const days = daysUntil(doc.expirationDate);
            const payload = JSON.stringify({
                title: '📋 DocsBox - Alerte expiration',
                body: days === 0
                    ? `"${doc.title}" expire aujourd'hui !`
                    : `"${doc.title}" expire dans ${days} jour${days > 1 ? 's' : ''}`,
                icon: '/icons/icon-192.png',
                badge: '/icons/icon-72.png',
                data: { url: '/documents' },
            });

            // Send to all subscribers (in a real app, filter by userId)
            for (const sub of subscriptions) {
                try {
                    const success = await sendWebPush(
                        { endpoint: sub.endpoint, keys: sub.keys },
                        payload,
                        vapidPublicKey,
                        vapidPrivateKey
                    );

                    if (success) {
                        sentCount++;
                    } else {
                        errorCount++;
                        // Remove invalid subscription
                        await getSupabase()
                            .from('push_subscriptions')
                            .delete()
                            .eq('endpoint', sub.endpoint);
                    }
                } catch (pushError) {
                    console.error('Push error:', pushError);
                    errorCount++;
                }
            }
        }

        return NextResponse.json({
            message: 'Notifications envoyées',
            expiringDocuments: expiringDocs.length,
            notificationsSent: sentCount,
            errors: errorCount,
        });
    } catch (error) {
        console.error('Cron check-expiry error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
