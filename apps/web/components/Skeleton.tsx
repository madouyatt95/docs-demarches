// ============================================
// DOCSBOX WEB - Skeleton Loading Component
// Placeholder animations during loading
// ============================================

'use client';

interface SkeletonProps {
    variant?: 'card' | 'list' | 'text' | 'circle';
    width?: string;
    height?: string;
    count?: number;
}

export function Skeleton({ variant = 'text', width, height, count = 1 }: SkeletonProps) {
    const items = Array.from({ length: count }, (_, i) => i);

    if (variant === 'card') {
        return (
            <>
                {items.map((i) => (
                    <div key={i} className="skeleton-card">
                        <div className="skeleton-icon shimmer" />
                        <div className="skeleton-content">
                            <div className="skeleton-line shimmer" style={{ width: '70%' }} />
                            <div className="skeleton-line shimmer" style={{ width: '50%' }} />
                        </div>
                    </div>
                ))}
            </>
        );
    }

    if (variant === 'list') {
        return (
            <>
                {items.map((i) => (
                    <div key={i} className="skeleton-list-item">
                        <div className="skeleton-avatar shimmer" />
                        <div className="skeleton-content">
                            <div className="skeleton-line shimmer" style={{ width: '80%' }} />
                            <div className="skeleton-line shimmer" style={{ width: '60%' }} />
                        </div>
                    </div>
                ))}
            </>
        );
    }

    if (variant === 'circle') {
        return (
            <div
                className="skeleton-circle shimmer"
                style={{ width: width || '48px', height: height || '48px' }}
            />
        );
    }

    return (
        <>
            {items.map((i) => (
                <div
                    key={i}
                    className="skeleton-line shimmer"
                    style={{ width: width || '100%', height: height || '1rem' }}
                />
            ))}
        </>
    );
}

// Document card skeleton
export function DocumentSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="skeleton-documents">
            <Skeleton variant="card" count={count} />
        </div>
    );
}
