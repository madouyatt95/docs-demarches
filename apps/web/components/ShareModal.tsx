// ============================================
// DOCSBOX WEB - Share Modal (Premium Feature)
// Generate temporary share links for documents
// ============================================

'use client';

import { useState, useEffect } from 'react';

interface Document {
    id: string;
    title: string;
    categoryId: string | null;
}

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentId?: string;
    documentTitle?: string;
}

// Category emoji mapping
const categoryEmojis: Record<string, string> = {
    'cat_identity': '🪪',
    'cat_housing': '🏠',
    'cat_work': '💼',
    'cat_vehicle': '🚗',
    'cat_finance': '💰',
    'cat_health': '🏥',
    'cat_education': '🎓',
    'cat_family': '👨‍👩‍👧',
    'default': '📄',
};

export function ShareModal({ isOpen, onClose, documentId, documentTitle }: ShareModalProps) {
    const [expirationDays, setExpirationDays] = useState(7);
    const [password, setPassword] = useState('');
    const [usePassword, setUsePassword] = useState(false);
    const [shareLink, setShareLink] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Document selection state (when not pre-selected)
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDocId, setSelectedDocId] = useState<string | null>(documentId || null);
    const [selectedDocTitle, setSelectedDocTitle] = useState<string>(documentTitle || '');
    const [isLoadingDocs, setIsLoadingDocs] = useState(false);

    // Fetch documents when modal opens and no document is pre-selected
    useEffect(() => {
        if (isOpen && !documentId) {
            fetchDocuments();
        }
        if (documentId) {
            setSelectedDocId(documentId);
            setSelectedDocTitle(documentTitle || 'Document');
        }
    }, [isOpen, documentId, documentTitle]);

    const fetchDocuments = async () => {
        setIsLoadingDocs(true);
        try {
            const res = await fetch('/api/documents');
            if (res.ok) {
                const data = await res.json();
                setDocuments(data.data || []);
            }
        } catch (err) {
            console.error('Error fetching documents:', err);
        } finally {
            setIsLoadingDocs(false);
        }
    };

    const resetState = () => {
        setExpirationDays(7);
        setPassword('');
        setUsePassword(false);
        setShareLink(null);
        setIsGenerating(false);
        setError(null);
        setCopied(false);
        if (!documentId) {
            setSelectedDocId(null);
            setSelectedDocTitle('');
        }
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleSelectDocument = (doc: Document) => {
        setSelectedDocId(doc.id);
        setSelectedDocTitle(doc.title);
    };

    const handleGenerateLink = async () => {
        if (!selectedDocId) return;

        setIsGenerating(true);
        setError(null);

        try {
            const res = await fetch('/api/share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentId: selectedDocId,
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
                    title: selectedDocTitle || 'Document partagé',
                    text: `Voici un lien vers ${selectedDocTitle || 'mon document'}`,
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
                            {error && (
                                <div className="modal-error">{error}</div>
                            )}

                            {/* Document Selection (if not pre-selected) */}
                            {!documentId && (
                                <div className="form-group">
                                    <label className="form-label">Sélectionnez un document</label>
                                    {isLoadingDocs ? (
                                        <div className="dark-loading" style={{ padding: '1rem' }}>
                                            <div className="dark-spinner"></div>
                                        </div>
                                    ) : documents.length > 0 ? (
                                        <div className="share-doc-list">
                                            {documents.map((doc) => (
                                                <div
                                                    key={doc.id}
                                                    className={`share-doc-item ${selectedDocId === doc.id ? 'selected' : ''}`}
                                                    onClick={() => handleSelectDocument(doc)}
                                                >
                                                    <span className="share-doc-item-icon">
                                                        {categoryEmojis[doc.categoryId || 'default'] || '📄'}
                                                    </span>
                                                    <span className="share-doc-item-name">{doc.title}</span>
                                                    {selectedDocId === doc.id && <span>✓</span>}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '1rem' }}>
                                            Aucun document disponible
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Show selected document title */}
                            {selectedDocId && (
                                <p className="share-doc-title">📄 {selectedDocTitle}</p>
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
                                disabled={isGenerating || !selectedDocId || (usePassword && !password)}
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
