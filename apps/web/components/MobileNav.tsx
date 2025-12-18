// ============================================
// DOCSBOX WEB - Mobile Bottom Navigation (Floating Dock)
// ============================================

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
    { href: '/', icon: '🏠', label: 'Accueil' },
    { href: '/packs', icon: '📦', label: 'Packs' },
    { href: '/demarches', icon: '📋', label: 'Démarches' },
    { href: '/subscription', icon: '⭐', label: 'Premium' },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="floating-dock">
            <div className="floating-dock-inner">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`floating-dock-item ${isActive ? 'active' : ''}`}
                        >
                            <span className="floating-dock-icon">{item.icon}</span>
                            <span className="floating-dock-label">{item.label}</span>
                            {isActive && <span className="floating-dock-indicator" />}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

