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

    // Repair: unsubscribe and resubscribe with current VAPID keys
    const repairSubscription = async () => {
        setIsLoading(true);
        showToast('Réparation en cours...', 'info');

        try {
            const registration = await navigator.serviceWorker.ready;
            const oldSubscription = await registration.pushManager.getSubscription();

            // Unsubscribe from old
            if (oldSubscription) {
                await oldSubscription.unsubscribe();
                await fetch('/api/notifications/subscribe', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ endpoint: oldSubscription.endpoint }),
                });
            }

            // Wait a moment
            await new Promise(resolve => setTimeout(resolve, 500));

            // Subscribe with current VAPID keys
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidPublicKey) {
                throw new Error('VAPID key missing');
            }

            const newSubscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            });

            // Save new subscription
            const response = await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscription: newSubscription }),
            });

            if (response.ok) {
                setIsSubscribed(true);
                showToast('Notifications réparées ! 🔧✅', 'success');
            } else {
                throw new Error('Failed to save new subscription');
            }
        } catch (error) {
            console.error('Repair error:', error);
            showToast('Erreur lors de la réparation', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const sendTestNotification = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/notifications/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();

            if (data.success) {
                showToast('Push envoyé ! Vérifie ton iPhone 🔔', 'success');
            } else {
                showToast(data.error || 'Erreur lors de l\'envoi', 'error');
            }
        } catch (error) {
            console.error('Test notification error:', error);
            showToast('Erreur de connexion au serveur', 'error');
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

    // Detect iOS
    const isIOS = isClient && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = isClient && (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone);

    // Don't render until client-side
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

    // iOS-specific message
    if (isIOS && !isStandalone) {
        return (
            <div className="notification-settings">
                <div className="notification-settings-header">
                    <span className="notification-icon">🔔</span>
                    <div className="notification-settings-info">
                        <h3>Notifications</h3>
                        <p style={{ color: '#FFA500', fontSize: '0.85rem' }}>
                            📲 Pour activer les notifications sur iOS, ajoutez l'app à l'écran d'accueil :
                            Appuyez sur <strong>Partager</strong> → <strong>Sur l'écran d'accueil</strong>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // iOS in standalone mode but notifications not supported (iOS < 16.4)
    if (isIOS && isStandalone && (!('Notification' in window) || !('PushManager' in window))) {
        return (
            <div className="notification-settings">
                <div className="notification-settings-header">
                    <span className="notification-icon">🔔</span>
                    <div className="notification-settings-info">
                        <h3>Notifications</h3>
                        <p style={{ color: '#FF6B6B', fontSize: '0.85rem' }}>
                            ⚠️ Les notifications nécessitent iOS 16.4 ou supérieur. Mettez à jour votre appareil.
                        </p>
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
                    <p style={{ fontSize: '10px', opacity: 0.5 }}>
                        VAPID: {process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? `${process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY.substring(0, 5)}...` : 'MANQUANTE'}
                    </p>
                </div>
            </div>

            <div className="notification-settings-status">
                {permission === 'denied' ? (
                    <div className="notification-blocked">
                        <span>⚠️ Bloquées dans le navigateur</span>
                    </div>
                ) : permission === 'granted' ? (
                    <div className="notification-buttons">
                        <button
                            className="notification-toggle active"
                            onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
                            disabled={isLoading}
                        >
                            {isLoading ? '⏳' : isSubscribed ? '✓' : '🔔'} {isSubscribed ? 'Activées' : 'Activer'}
                        </button>
                        <button
                            className="notification-test-btn"
                            onClick={sendTestNotification}
                            disabled={isLoading}
                        >
                            🧪 Test
                        </button>
                        <button
                            className="notification-test-btn"
                            onClick={repairSubscription}
                            disabled={isLoading}
                            title="Réparer si les notifications automatiques ne fonctionnent pas"
                        >
                            🔧
                        </button>
                    </div>
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
