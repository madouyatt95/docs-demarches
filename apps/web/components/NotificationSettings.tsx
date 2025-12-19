// ============================================
// DOCSBOX WEB - Notification Settings Component
// Manage push notification permissions
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/lib/toast-context';

export function NotificationSettings() {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        setIsClient(true);
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
        checkSubscription();
    }, []);

    const checkSubscription = async () => {
        if (typeof window === 'undefined') return;
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                setIsSubscribed(!!subscription);
            } catch (error) {
                console.error('Error checking subscription:', error);
            }
        }
    };


    const subscribeToPush = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            showToast('Les notifications push ne sont pas supportées', 'error');
            return;
        }

        setIsLoading(true);

        try {
            // Request permission
            const permissionResult = await Notification.requestPermission();
            setPermission(permissionResult);

            if (permissionResult !== 'granted') {
                showToast('Permission refusée', 'warning');
                setIsLoading(false);
                return;
            }

            // Get service worker registration
            const registration = await navigator.serviceWorker.ready;

            // Get VAPID public key
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

            if (!vapidPublicKey) {
                showToast('Configuration VAPID manquante', 'error');
                setIsLoading(false);
                return;
            }

            // Subscribe to push
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            });

            // Send subscription to server
            const response = await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscription }),
            });

            if (response.ok) {
                setIsSubscribed(true);
                showToast('Notifications activées ! 🔔', 'success');
            } else {
                throw new Error('Failed to save subscription');
            }
        } catch (error) {
            console.error('Subscription error:', error);
            showToast('Erreur lors de l\'activation', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const unsubscribeFromPush = async () => {
        setIsLoading(true);

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                await subscription.unsubscribe();

                await fetch('/api/notifications/subscribe', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ endpoint: subscription.endpoint }),
                });
            }

            setIsSubscribed(false);
            showToast('Notifications désactivées', 'info');
        } catch (error) {
            console.error('Unsubscribe error:', error);
            showToast('Erreur lors de la désactivation', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to convert VAPID key
    function urlBase64ToUint8Array(base64String: string) {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // Don't render until client-side, or if push not supported
    if (!isClient) {
        return (
            <div className="notification-settings">
                <div className="notification-settings-header">
                    <span className="notification-icon">🔔</span>
                    <div className="notification-settings-info">
                        <h3>Notifications</h3>
                        <p>Chargement...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!('Notification' in window) || !('PushManager' in window)) {
        return null;
    }

    return (

        <div className="notification-settings">
            <div className="notification-settings-header">
                <span className="notification-icon">🔔</span>
                <div className="notification-settings-info">
                    <h3>Notifications</h3>
                    <p>Alertes pour les documents qui expirent</p>
                </div>
            </div>

            <div className="notification-settings-status">
                {permission === 'denied' ? (
                    <div className="notification-blocked">
                        <span>⚠️ Bloquées dans le navigateur</span>
                    </div>
                ) : isSubscribed ? (
                    <button
                        className="notification-toggle active"
                        onClick={unsubscribeFromPush}
                        disabled={isLoading}
                    >
                        {isLoading ? '⏳' : '✓'} Activées
                    </button>
                ) : (
                    <button
                        className="notification-toggle"
                        onClick={subscribeToPush}
                        disabled={isLoading}
                    >
                        {isLoading ? '⏳' : '🔔'} Activer
                    </button>
                )}
            </div>
        </div>
    );
}
