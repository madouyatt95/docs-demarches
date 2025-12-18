// ============================================
// DOCSBOX WEB - Page Transition Component
// Smooth iOS-style transitions between pages
// ============================================

'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

interface PageTransitionProps {
    children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
    const pathname = usePathname();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [displayChildren, setDisplayChildren] = useState(children);
    const previousPathname = useRef(pathname);

    useEffect(() => {
        if (pathname !== previousPathname.current) {
            setIsTransitioning(true);

            // Wait for exit animation
            const timer = setTimeout(() => {
                setDisplayChildren(children);
                setIsTransitioning(false);
                previousPathname.current = pathname;
            }, 150);

            return () => clearTimeout(timer);
        } else {
            setDisplayChildren(children);
        }
    }, [pathname, children]);

    return (
        <div
            className={`page-transition ${isTransitioning ? 'transitioning' : ''}`}
            style={{
                opacity: isTransitioning ? 0 : 1,
                transform: isTransitioning ? 'translateY(10px)' : 'translateY(0)',
                transition: 'opacity 0.15s ease, transform 0.15s ease',
            }}
        >
            {displayChildren}
        </div>
    );
}
