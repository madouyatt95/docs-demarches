// ============================================
// DOCSBOX WEB - Header Component with Session
// ============================================

'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

interface HeaderProps {
    title: string;
    onAddClick?: () => void;
    onSearch?: (query: string) => void;
}

export function Header({ title, onAddClick, onSearch }: HeaderProps) {
    const { data: session } = useSession();
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        onSearch?.(query);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onSearch?.(searchQuery);
        }
    };

    return (
        <header className="header">
            <h1>{title}</h1>

            <div className="header-actions">
                {/* Search */}
                <div className="search-box">
                    <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' }}>🔍</span>
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={handleSearch}
                        onKeyDown={handleKeyDown}
                    />
                </div>

                {/* Notifications */}
                <button className="icon-btn">
                    🔔
                    <span className="badge" />
                </button>

                {/* Add button */}
                {onAddClick && (
                    <button onClick={onAddClick} className="btn-primary">
                        <span>➕</span>
                        <span>Ajouter</span>
                    </button>
                )}

                {/* User menu */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                        }}
                    >
                        {session?.user?.name?.charAt(0)?.toUpperCase() || session?.user?.email?.charAt(0)?.toUpperCase() || '?'}
                    </button>

                    {showUserMenu && (
                        <div
                            style={{
                                position: 'absolute',
                                right: 0,
                                top: '100%',
                                marginTop: '0.5rem',
                                background: 'white',
                                borderRadius: '0.75rem',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                minWidth: '200px',
                                zIndex: 100,
                                overflow: 'hidden',
                            }}
                        >
                            <div style={{
                                padding: '1rem',
                                borderBottom: '1px solid #E5E7EB',
                            }}>
                                <div style={{ fontWeight: 600, color: '#111827' }}>
                                    {session?.user?.name || 'Utilisateur'}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                                    {session?.user?.email || 'Non connecté'}
                                </div>
                            </div>

                            <div style={{ padding: '0.5rem' }}>
                                <Link href="/subscription" style={{ textDecoration: 'none' }}>
                                    <button
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            background: 'none',
                                            border: 'none',
                                            borderRadius: '0.5rem',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            color: '#374151',
                                        }}
                                    >
                                        ⭐ Abonnement
                                    </button>
                                </Link>

                                <button
                                    onClick={() => signOut({ callbackUrl: '/login' })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        background: 'none',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        color: '#DC2626',
                                    }}
                                >
                                    🚪 Déconnexion
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
