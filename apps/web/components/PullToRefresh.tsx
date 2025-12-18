// ============================================
// DOCSBOX WEB - Pull to Refresh Component
// Mobile pull-down gesture to refresh
// ============================================

'use client';

import { useState, useRef, useCallback, ReactNode } from 'react';

interface PullToRefreshProps {
    children: ReactNode;
    onRefresh: () => Promise<void>;
    disabled?: boolean;
}

export function PullToRefresh({ children, onRefresh, disabled = false }: PullToRefreshProps) {
    const [pulling, setPulling] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const startY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const threshold = 80; // Pull distance to trigger refresh

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (disabled || refreshing) return;
        const container = containerRef.current;
        if (container && container.scrollTop === 0) {
            startY.current = e.touches[0].clientY;
            setPulling(true);
        }
    }, [disabled, refreshing]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!pulling || disabled || refreshing) return;
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY.current;

        if (diff > 0) {
            // Apply resistance to the pull
            const resistance = Math.min(diff * 0.5, threshold * 1.5);
            setPullDistance(resistance);
        }
    }, [pulling, disabled, refreshing, threshold]);

    const handleTouchEnd = useCallback(async () => {
        if (!pulling || disabled) return;
        setPulling(false);

        if (pullDistance >= threshold && !refreshing) {
            setRefreshing(true);
            try {
                await onRefresh();
            } finally {
                setRefreshing(false);
            }
        }
        setPullDistance(0);
    }, [pulling, pullDistance, threshold, refreshing, onRefresh, disabled]);

    return (
        <div
            ref={containerRef}
            className="pull-to-refresh-container"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Pull indicator */}
            <div
                className={`pull-indicator ${refreshing ? 'refreshing' : ''}`}
                style={{
                    height: refreshing ? '50px' : `${pullDistance}px`,
                    opacity: pullDistance > 20 || refreshing ? 1 : 0,
                }}
            >
                <div className={`pull-spinner ${refreshing ? 'spinning' : ''}`}>
                    {refreshing ? '🔄' : pullDistance >= threshold ? '↓' : '↓'}
                </div>
                <span className="pull-text">
                    {refreshing ? 'Actualisation...' : pullDistance >= threshold ? 'Relâchez' : 'Tirez pour actualiser'}
                </span>
            </div>

            {/* Content */}
            <div
                className="pull-content"
                style={{
                    transform: `translateY(${pulling ? pullDistance : 0}px)`,
                    transition: pulling ? 'none' : 'transform 0.2s ease',
                }}
            >
                {children}
            </div>
        </div>
    );
}
