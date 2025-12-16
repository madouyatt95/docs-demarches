// ============================================
// DOCSBOX WEB - Sidebar Component
// ============================================

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'Documents', icon: '📁' },
        { href: '/packs', label: 'Packs', icon: '📦' },
        { href: '/demarches', label: 'Démarches', icon: '✅', premium: true },
    ];

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">📋</div>
                <span className="sidebar-logo-text">DocsBox</span>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                        >
                            <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                            <span style={{ flex: 1 }}>{item.label}</span>
                            {item.premium && <span className="nav-badge">PRO</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Upgrade Banner */}
            <div className="upgrade-banner">
                <h3>🚀 Passer Premium</h3>
                <p>Débloquez toutes les fonctionnalités</p>
                <Link href="/subscription">Voir les offres</Link>
            </div>

            {/* User section */}
            <div className="user-section">
                <div className="user-avatar">U</div>
                <div className="user-info">
                    <p className="user-name">Utilisateur</p>
                    <p className="user-email">user@example.com</p>
                </div>
            </div>
        </aside>
    );
}
