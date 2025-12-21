// ============================================
// DOCSBOX - Login Page
// ============================================

'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

function LoginContent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
            } else {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (err) {
            setError('Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zm-3 9v2H8v-2h2zm0 4v2H8v-2h2zm6-4v2h-4v-2h4zm0 4v2h-4v-2h4z" />
                        </svg>
                    </div>
                    <h1>DocsBox</h1>
                    <p>Connectez-vous à votre espace</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="login-error">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="login-field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="demo@docsbox.fr"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="password">Mot de passe</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="login-spinner"></span>
                                Connexion...
                            </>
                        ) : (
                            'Se connecter'
                        )}
                    </button>
                </form>

                <div className="login-demo-hint">
                    <p>💡 <strong>Compte démo:</strong></p>
                    <p>Email: <code>demo@docsbox.fr</code></p>
                    <p>Mot de passe: <code>demo123</code></p>
                </div>
            </div>

            <style jsx>{`
                .login-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #1e3a5f 0%, #0f1f35 100%);
                    padding: 20px;
                }

                .login-card {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    padding: 40px;
                    width: 100%;
                    max-width: 400px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }

                .login-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .login-logo {
                    width: 72px;
                    height: 72px;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 16px;
                    color: white;
                }

                .login-header h1 {
                    color: white;
                    font-size: 28px;
                    font-weight: 700;
                    margin: 0 0 8px 0;
                }

                .login-header p {
                    color: rgba(255, 255, 255, 0.6);
                    margin: 0;
                    font-size: 14px;
                }

                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .login-error {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: rgba(239, 68, 68, 0.15);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    padding: 12px 16px;
                    border-radius: 12px;
                    color: #fca5a5;
                    font-size: 14px;
                }

                .login-field {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .login-field label {
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 14px;
                    font-weight: 500;
                }

                .login-field input {
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 12px;
                    padding: 14px 16px;
                    color: white;
                    font-size: 16px;
                    transition: all 0.2s ease;
                }

                .login-field input::placeholder {
                    color: rgba(255, 255, 255, 0.4);
                }

                .login-field input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    background: rgba(255, 255, 255, 0.12);
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
                }

                .login-button {
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    padding: 16px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    margin-top: 8px;
                }

                .login-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
                }

                .login-button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .login-spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .login-demo-hint {
                    margin-top: 24px;
                    padding: 16px;
                    background: rgba(59, 130, 246, 0.1);
                    border: 1px solid rgba(59, 130, 246, 0.2);
                    border-radius: 12px;
                }

                .login-demo-hint p {
                    color: rgba(255, 255, 255, 0.7);
                    margin: 0;
                    font-size: 13px;
                    line-height: 1.6;
                }

                .login-demo-hint p:first-child {
                    color: rgba(255, 255, 255, 0.9);
                    margin-bottom: 8px;
                }

                .login-demo-hint code {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: monospace;
                    color: #93c5fd;
                }
            `}</style>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="login-container"><div className="login-spinner"></div></div>}>
            <LoginContent />
        </Suspense>
    );
}
