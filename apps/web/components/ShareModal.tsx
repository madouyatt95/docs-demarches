// ============================================
// DOCSBOX WEB - Share Modal (Premium Feature)
// Generate temporary share links for documents
// ============================================

'use client';

import { useState } from 'react';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentId?: string;
    documentTitle?: string;
}

export function ShareModal({ isOpen, onClose, documentId, documentTitle }: ShareModalProps) {
    const [expirationDays, setExpirationDays] = useState(7);
    const [password, setPassword] = useState('');
    const [usePassword, setUsePassword] = useState(false);
    const [shareLink, setShareLink] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const resetState = () => {
        setExpirationDays(7);
        setPassword('');
        setUsePassword(false);
        setShareLink(null);
        setIsGenerating(false);
        setError(null);
        setCopied(false);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleGenerateLink = async () => {
        if (!documentId) return;

        setIsGenerating(true);
        setError(null);

        try {
            const res = await fetch('/api/share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentId,
                    expirationDays,
                    password: usePassword ? password : null,
                }),
            });

            if (!res.ok) {
                throw new Error('Erreur lors de la génération du lien');
            }

            const data = await res.json();
            setShareLink(data.shareUrl);
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la génération');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyLink = async () => {
        if (!shareLink) return;

        try {
            await navigator.clipboard.writeText(shareLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareLink;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleNativeShare = async () => {
        if (!shareLink) return;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: documentTitle || 'Document partagé',
                    text: `Voici un lien vers ${documentTitle || 'mon document'}`,
                    url: shareLink,
                });
            } catch (err) {
                // User cancelled or error
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-container share-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <h2>📤 Partager</h2>
                    <button className="modal-close-btn" onClick={handleClose}>×</button>
                </div>

                {/* Body */}
                <div className="modal-body">
                    {!shareLink ? (
                        <>
                            <p className="share-doc-title">{documentTitle || 'Document'}</p>

                            {error && (
                                <div className="modal-error">{error}</div>
                            )}

                            {/* Expiration */}
                            <div className="form-group">
                                <label className="form-label">Expiration du lien</label>
                                <select
                                    className="form-input"
                                    value={expirationDays}
                                    onChange={(e) => setExpirationDays(Number(e.target.value))}
                                >
                                    <option value={1}>1 jour</option>
                                    <option value={3}>3 jours</option>
                                    <option value={7}>7 jours</option>
                                    <option value={14}>14 jours</option>
                                    <option value={30}>30 jours</option>
                                </select>
                            </div>

                            {/* Password protection */}
                            <div className="form-group">
                                <label className="share-toggle-label">
                                    <input
                                        type="checkbox"
                                        checked={usePassword}
                                        onChange={(e) => setUsePassword(e.target.checked)}
                                    />
                                    <span>Protéger par mot de passe</span>
                                </label>
                            </div>

                            {usePassword && (
                                <div className="form-group">
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Mot de passe"
                                    />
                                </div>
                            )}

                            <button
                                className="share-generate-btn"
                                onClick={handleGenerateLink}
                                disabled={isGenerating || (usePassword && !password)}
                            >
                                {isGenerating ? '⏳ Génération...' : '🔗 Générer le lien'}
                            </button>
                        </>
                    ) : (
                        <div className="share-success">
                            <div className="share-success-icon">✅</div>
                            <h3>Lien créé !</h3>
                            <p className="share-expiry">Expire dans {expirationDays} jour(s)</p>

                            <div className="share-link-box">
                                <input
                                    type="text"
                                    className="form-input share-link-input"
                                    value={shareLink}
                                    readOnly
                                />
                            </div>

                            <div className="share-actions">
                                <button className="share-copy-btn" onClick={handleCopyLink}>
                                    {copied ? '✓ Copié !' : '📋 Copier'}
                                </button>
                                {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                                    <button className="share-native-btn" onClick={handleNativeShare}>
                                        📤 Partager
                                    </button>
                                )}
                            </div>

                            {usePassword && (
                                <p className="share-password-reminder">
                                    🔒 Mot de passe : <strong>{password}</strong>
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
