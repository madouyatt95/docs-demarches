// ============================================
// DOCSBOX WEB - Public Share Page
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface SharedDocument {
    id: string;
    title: string;
    filePath: string;
    mimeType: string;
}

interface ShareData {
    document: SharedDocument | null;
    pack: { id: string; name: string } | null;
    expiresAt: string;
}

export default function SharePage() {
    const params = useParams();
    const token = params.token as string;

    const [shareData, setShareData] = useState<ShareData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [requiresPassword, setRequiresPassword] = useState(false);
    const [password, setPassword] = useState('');

    const fetchShareData = async (pwd?: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const url = pwd
                ? `/api/share?token=${token}&password=${encodeURIComponent(pwd)}`
                : `/api/share?token=${token}`;

            const res = await fetch(url);
            const data = await res.json();

            if (!res.ok) {
                if (data.requiresPassword) {
                    setRequiresPassword(true);
                    setError('Ce document est protégé par mot de passe');
                } else if (res.status === 410) {
                    setError('Ce lien de partage a expiré');
                } else if (res.status === 404) {
                    setError('Lien de partage introuvable');
                } else {
                    setError(data.error || 'Erreur lors du chargement');
                }
                return;
            }

            setShareData(data);
            setRequiresPassword(false);
        } catch (err) {
            setError('Erreur de connexion');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchShareData();
        }
    }, [token]);

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchShareData(password);
    };

    const handleDownload = () => {
        if (shareData?.document?.filePath) {
            window.open(shareData.document.filePath, '_blank');
        }
    };

    // Calculate time left
    const getTimeLeft = () => {
        if (!shareData?.expiresAt) return '';
        const expires = new Date(shareData.expiresAt);
        const now = new Date();
        const diff = expires.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `Expire dans ${days} jour${days > 1 ? 's' : ''}`;
        if (hours > 0) return `Expire dans ${hours} heure${hours > 1 ? 's' : ''}`;
        return 'Expire bientôt';
    };

    return (
        <div className="share-page">
            <div className="share-container">
                <div className="share-header">
                    <div className="share-logo">📦 DocsBox</div>
                    <h1>Document partagé</h1>
                </div>

                {isLoading && (
                    <div className="share-loading">
                        <div className="share-spinner"></div>
                        <p>Chargement...</p>
                    </div>
                )}

                {error && !requiresPassword && (
                    <div className="share-error">
                        <div className="share-error-icon">⚠️</div>
                        <p>{error}</p>
                    </div>
                )}

                {requiresPassword && (
                    <form onSubmit={handlePasswordSubmit} className="share-password-form">
                        <div className="share-lock-icon">🔒</div>
                        <p>Ce document est protégé par mot de passe</p>
                        <input
                            type="password"
                            placeholder="Entrez le mot de passe"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="share-password-input"
                            autoFocus
                        />
                        <button type="submit" className="share-submit-btn">
                            Accéder
                        </button>
                    </form>
                )}

                {shareData?.document && (
                    <div className="share-document">
                        <div className="share-doc-icon">📄</div>
                        <h2 className="share-doc-title">{shareData.document.title}</h2>
                        <p className="share-doc-type">{shareData.document.mimeType}</p>
                        <p className="share-doc-expires">{getTimeLeft()}</p>

                        <button onClick={handleDownload} className="share-download-btn">
                            📥 Télécharger
                        </button>
                    </div>
                )}

                <div className="share-footer">
                    <p>Partagé via <strong>DocsBox</strong> - Gestion de documents simplifiée</p>
                </div>
            </div>

            <style jsx>{`
                .share-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #1F2937 0%, #111827 100%);
                    padding: 1rem;
                }
                .share-container {
                    background: #1F2937;
                    border-radius: 1.5rem;
                    padding: 2rem;
                    max-width: 400px;
                    width: 100%;
                    text-align: center;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }
                .share-header {
                    margin-bottom: 2rem;
                }
                .share-logo {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #3B82F6;
                    margin-bottom: 0.5rem;
                }
                .share-header h1 {
                    font-size: 1.25rem;
                    color: white;
                    margin: 0;
                }
                .share-loading {
                    padding: 2rem;
                    color: #9CA3AF;
                }
                .share-spinner {
                    width: 2rem;
                    height: 2rem;
                    border: 3px solid #374151;
                    border-top-color: #3B82F6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .share-error {
                    padding: 2rem;
                    color: #EF4444;
                }
                .share-error-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }
                .share-password-form {
                    padding: 1rem;
                }
                .share-lock-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }
                .share-password-form p {
                    color: #9CA3AF;
                    margin-bottom: 1rem;
                }
                .share-password-input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid #374151;
                    border-radius: 0.5rem;
                    background: #111827;
                    color: white;
                    font-size: 1rem;
                    margin-bottom: 1rem;
                }
                .share-submit-btn {
                    width: 100%;
                    padding: 0.75rem;
                    background: #3B82F6;
                    color: white;
                    border: none;
                    border-radius: 0.5rem;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                }
                .share-submit-btn:hover {
                    background: #2563EB;
                }
                .share-document {
                    padding: 1rem;
                }
                .share-doc-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }
                .share-doc-title {
                    font-size: 1.25rem;
                    color: white;
                    margin: 0 0 0.5rem;
                }
                .share-doc-type {
                    color: #6B7280;
                    font-size: 0.85rem;
                    margin: 0 0 0.5rem;
                }
                .share-doc-expires {
                    color: #F59E0B;
                    font-size: 0.85rem;
                    margin: 0 0 1.5rem;
                }
                .share-download-btn {
                    padding: 1rem 2rem;
                    background: #10B981;
                    color: white;
                    border: none;
                    border-radius: 0.75rem;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .share-download-btn:hover {
                    background: #059669;
                    transform: scale(1.05);
                }
                .share-footer {
                    margin-top: 2rem;
                    padding-top: 1rem;
                    border-top: 1px solid #374151;
                    color: #6B7280;
                    font-size: 0.75rem;
                }
            `}</style>
        </div>
    );
}
