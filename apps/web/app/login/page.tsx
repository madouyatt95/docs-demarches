// ============================================
// DOCSBOX WEB - Login Page
// ============================================

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (err) {
            setError('Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #EFF6FF 0%, #F9FAFB 100%)',
            padding: '1rem',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                background: 'white',
                borderRadius: '1.5rem',
                padding: '2rem',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                        borderRadius: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        fontSize: '2rem',
                    }}>
                        📋
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>
                        Connexion à DocsBox
                    </h1>
                    <p style={{ color: '#6B7280', marginTop: '0.5rem' }}>
                        Gérez vos documents en toute sécurité
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{
                            background: '#FEE2E2',
                            color: '#DC2626',
                            padding: '0.75rem 1rem',
                            borderRadius: '0.75rem',
                            marginBottom: '1rem',
                            fontSize: '0.875rem',
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#374151',
                            marginBottom: '0.5rem',
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="votre@email.com"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                border: '1px solid #E5E7EB',
                                borderRadius: '0.75rem',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#374151',
                            marginBottom: '0.5rem',
                        }}>
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                border: '1px solid #E5E7EB',
                                borderRadius: '0.75rem',
                                fontSize: '1rem',
                                outline: 'none',
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '0.875rem',
                            background: isLoading ? '#9CA3AF' : 'linear-gradient(135deg, #3B82F6, #2563EB)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.75rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            marginBottom: '1rem',
                        }}
                    >
                        {isLoading ? '⏳ Connexion...' : 'Se connecter'}
                    </button>
                </form>

                {/* Demo hint */}
                <div style={{
                    background: '#F0F9FF',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    marginTop: '1rem',
                }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1E40AF', marginBottom: '0.25rem' }}>
                        🎯 Compte démo
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#3B82F6' }}>
                        Email: demo@docsbox.fr<br />
                        Mot de passe: demo123
                    </div>
                </div>

                {/* Register link */}
                <p style={{
                    textAlign: 'center',
                    marginTop: '1.5rem',
                    fontSize: '0.875rem',
                    color: '#6B7280',
                }}>
                    Pas encore de compte ?{' '}
                    <Link href="/register" style={{ color: '#3B82F6', fontWeight: 500, textDecoration: 'none' }}>
                        Créer un compte
                    </Link>
                </p>
            </div>
        </div>
    );
}
