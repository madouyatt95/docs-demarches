// ============================================
// DOCSBOX WEB - Swipeable Item Component
// Swipe left/right for actions
// ============================================

'use client';

import { useState, useRef, ReactNode, useCallback } from 'react';

interface SwipeableItemProps {
    children: ReactNode;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    leftAction?: { icon: string; label: string; color: string };
    rightAction?: { icon: string; label: string; color: string };
    threshold?: number;
}

export function SwipeableItem({
    children,
    onSwipeLeft,
    onSwipeRight,
    leftAction = { icon: '🗑️', label: 'Supprimer', color: '#EF4444' },
    rightAction = { icon: '📤', label: 'Partager', color: '#3B82F6' },
    threshold = 80,
}: SwipeableItemProps) {
    const [offset, setOffset] = useState(0);
    const [swiping, setSwiping] = useState(false);
    const startX = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX;
        setSwiping(true);
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!swiping) return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - startX.current;

        // Limit the swipe distance
        const maxOffset = threshold * 1.5;
        const limitedOffset = Math.max(-maxOffset, Math.min(maxOffset, diff));
        setOffset(limitedOffset);
    }, [swiping, threshold]);

    const handleTouchEnd = useCallback(() => {
        setSwiping(false);

        if (offset <= -threshold && onSwipeLeft) {
            onSwipeLeft();
        } else if (offset >= threshold && onSwipeRight) {
            onSwipeRight();
        }

        setOffset(0);
    }, [offset, threshold, onSwipeLeft, onSwipeRight]);

    const showLeftAction = offset < -20;
    const showRightAction = offset > 20;

    return (
        <div className="swipeable-container" ref={containerRef}>
            {/* Left action (delete) */}
            <div
                className="swipe-action swipe-action-left"
                style={{
                    backgroundColor: leftAction.color,
                    opacity: showLeftAction ? 1 : 0,
                    width: Math.abs(Math.min(offset, 0)),
                }}
            >
                <span className="swipe-action-icon">{leftAction.icon}</span>
                {Math.abs(offset) >= threshold && (
                    <span className="swipe-action-label">{leftAction.label}</span>
                )}
            </div>

            {/* Right action (share) */}
            <div
                className="swipe-action swipe-action-right"
                style={{
                    backgroundColor: rightAction.color,
                    opacity: showRightAction ? 1 : 0,
                    width: Math.max(offset, 0),
                }}
            >
                <span className="swipe-action-icon">{rightAction.icon}</span>
                {Math.abs(offset) >= threshold && (
                    <span className="swipe-action-label">{rightAction.label}</span>
                )}
            </div>

            {/* Content */}
            <div
                className="swipeable-content"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                    transform: `translateX(${offset}px)`,
                    transition: swiping ? 'none' : 'transform 0.2s ease',
                }}
            >
                {children}
            </div>
        </div>
    );
}
