// ============================================
// DOCSBOX WEB - Toast Component
// Animated toast notifications
// ============================================

'use client';

import { useToast } from '@/lib/toast-context';

const icons: Record<string, string> = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
};

export function ToastContainer() {
    const { toasts, hideToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`toast toast-${toast.type}`}
                    onClick={() => hideToast(toast.id)}
                >
                    <span className="toast-icon">{icons[toast.type]}</span>
                    <span className="toast-message">{toast.message}</span>
                    <button className="toast-close" onClick={() => hideToast(toast.id)}>
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}
