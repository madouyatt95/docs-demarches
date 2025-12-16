// ============================================
// DOCSBOX WEB - Mobile Bottom Navigation
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
        <nav className="mobile-nav">
            <div className="mobile-nav-items">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`mobile-nav-item ${pathname === item.href ? 'active' : ''}`}
                    >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
