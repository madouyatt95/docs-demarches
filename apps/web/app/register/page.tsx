// ============================================
// DOCSBOX WEB - Register Page
// ============================================

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setIsLoading(true);

        try {
            // Call register API
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, displayName: name }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erreur lors de l\'inscription');
            }

            // Auto login after register
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
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
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
                        Créer un compte
                    </h1>
                    <p style={{ color: '#6B7280', marginTop: '0.5rem' }}>
                        Commencez à organiser vos documents
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
                            Nom
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Votre nom"
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
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
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
                            minLength={6}
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

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#374151',
                            marginBottom: '0.5rem',
                        }}>
                            Confirmer le mot de passe
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                        }}
                    >
                        {isLoading ? '⏳ Création...' : 'Créer mon compte'}
                    </button>
                </form>

                {/* Login link */}
                <p style={{
                    textAlign: 'center',
                    marginTop: '1.5rem',
                    fontSize: '0.875rem',
                    color: '#6B7280',
                }}>
                    Déjà un compte ?{' '}
                    <Link href="/login" style={{ color: '#3B82F6', fontWeight: 500, textDecoration: 'none' }}>
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    );
}
