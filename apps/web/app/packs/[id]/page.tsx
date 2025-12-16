// ============================================
// DOCSBOX WEB - Pack Detail Page
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Document {
    id: string;
    title: string;
    categoryId: string | null;
    filePath: string;
    mimeType: string;
    createdAt: string;
}

interface Pack {
    id: string;
    name: string;
    templateId: string | null;
    documentCount: number;
    documents: Document[];
    createdAt: string;
    updatedAt: string;
}

const templates: Record<string, { icon: string; name: string }> = {
    location: { icon: '🏠', name: 'Dossier Location' },
    ecole: { icon: '🎓', name: 'Inscription École' },
    banque: { icon: '🏦', name: 'Ouverture Compte' },
    emploi: { icon: '💼', name: 'Candidature Emploi' },
    sante: { icon: '🏥', name: 'Dossier Santé' },
    voyage: { icon: '✈️', name: 'Voyage' },
};

export default function PackDetailPage() {
    const params = useParams();
    const router = useRouter();
    const packId = params.id as string;

    const [pack, setPack] = useState<Pack | null>(null);
    const [availableDocs, setAvailableDocs] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

    const fetchPack = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/packs/${packId}`);
            if (!res.ok) {
                if (res.status === 404) {
                    setError('Pack non trouvé');
                } else {
                    throw new Error('Erreur chargement pack');
                }
                return;
            }
            const data = await res.json();
            setPack(data);
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    }, [packId]);

    const fetchAvailableDocs = useCallback(async () => {
        try {
            const res = await fetch('/api/documents');
            if (res.ok) {
                const data = await res.json();
                setAvailableDocs(data.data || []);
            }
        } catch (err) {
            console.error('Error fetching documents:', err);
        }
    }, []);

    useEffect(() => {
        fetchPack();
        fetchAvailableDocs();
    }, [fetchPack, fetchAvailableDocs]);

    const handleAddDocuments = async () => {
        if (selectedDocIds.length === 0) return;

        try {
            const res = await fetch(`/api/packs/${packId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    addDocumentIds: selectedDocIds,
                }),
            });

            if (res.ok) {
                setShowAddModal(false);
                setSelectedDocIds([]);
                fetchPack();
            }
        } catch (err) {
            console.error('Error adding documents:', err);
        }
    };

    const handleRemoveDocument = async (docId: string) => {
        if (!confirm('Retirer ce document du pack ?')) return;

        try {
            const res = await fetch(`/api/packs/${packId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    removeDocumentId: docId,
                }),
            });

            if (res.ok) {
                fetchPack();
            }
        } catch (err) {
            console.error('Error removing document:', err);
        }
    };

    const toggleDocSelection = (docId: string) => {
        setSelectedDocIds(prev =>
            prev.includes(docId)
                ? prev.filter(id => id !== docId)
                : [...prev, docId]
        );
    };

    const getTemplateInfo = (templateId: string | null) => {
        return templateId && templates[templateId]
            ? templates[templateId]
            : { icon: '📦', name: 'Pack personnalisé' };
    };

    // Documents not already in the pack
    const docsNotInPack = availableDocs.filter(
        doc => !pack?.documents?.some(pd => pd.id === doc.id)
    );

    if (isLoading) {
        return (
            <div className="dark-container">
                <div className="dark-loading">
                    <div className="dark-spinner"></div>
                    <p>Chargement du pack...</p>
                </div>
            </div>
        );
    }

    if (error || !pack) {
        return (
            <div className="dark-container">
                <div className="dark-error">
                    <span>⚠️</span>
                    <span>{error || 'Pack non trouvé'}</span>
                    <button onClick={() => router.push('/packs')} className="dark-retry-btn">
                        Retour aux packs
                    </button>
                </div>
            </div>
        );
    }

    const templateInfo = getTemplateInfo(pack.templateId);

    return (
        <div className="dark-container">
            {/* Back button */}
            <Link href="/packs" className="dark-back-link">
                ← Retour aux packs
            </Link>

            {/* Pack header */}
            <div className="dark-pack-header">
                <div className="dark-pack-icon-large">{templateInfo.icon}</div>
                <div className="dark-pack-header-info">
                    <h1 className="dark-pack-title">{pack.name}</h1>
                    <p className="dark-pack-subtitle">{templateInfo.name}</p>
                    <p className="dark-pack-meta">{pack.documents?.length || 0} documents</p>
                </div>
            </div>

            {/* Actions */}
            <div className="dark-pack-actions-bar">
                <button
                    className="dark-pack-action-btn primary"
                    onClick={() => setShowAddModal(true)}
                >
                    ➕ Ajouter
                </button>
                <button
                    className="dark-pack-action-btn secondary"
                    onClick={async () => {
                        if (!pack.documents?.length) {
                            alert('Le pack est vide');
                            return;
                        }
                        // Download each document
                        for (const doc of pack.documents) {
                            if (doc.filePath && doc.filePath !== '/demo/') {
                                window.open(doc.filePath, '_blank');
                            }
                        }
                    }}
                    disabled={!pack.documents?.length}
                >
                    📥 Exporter tout
                </button>
                <button
                    className="dark-pack-action-btn secondary"
                    onClick={async () => {
                        try {
                            const res = await fetch('/api/share', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    packId: pack.id,
                                    expirationDays: 7,
                                }),
                            });
                            const data = await res.json();
                            if (data.shareUrl) {
                                await navigator.clipboard.writeText(data.shareUrl);
                                alert(`Lien copié !\n\n${data.shareUrl}\n\nExpire dans 7 jours`);
                            }
                        } catch (err) {
                            console.error('Share error:', err);
                            alert('Erreur lors de la création du lien');
                        }
                    }}
                >
                    🔗 Partager
                </button>
            </div>

            {/* Documents list */}
            <div className="dark-section-header">
                <h2 className="dark-section-title">Documents du pack</h2>
                <span className="dark-section-count">{pack.documents?.length || 0}</span>
            </div>

            {pack.documents && pack.documents.length > 0 ? (
                <div className="dark-docs-list">
                    {pack.documents.map((doc) => (
                        <div key={doc.id} className="dark-doc-list-item">
                            <div className="dark-doc-list-icon">📄</div>
                            <div className="dark-doc-list-info">
                                <p className="dark-doc-list-title">{doc.title}</p>
                                <p className="dark-doc-list-meta">
                                    {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                            <div className="dark-doc-list-actions">
                                {doc.filePath && (
                                    <a
                                        href={doc.filePath}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="dark-doc-action-btn view"
                                    >
                                        👁️
                                    </a>
                                )}
                                <button
                                    className="dark-doc-action-btn delete"
                                    onClick={() => handleRemoveDocument(doc.id)}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="dark-empty">
                    <div className="dark-empty-icon">📂</div>
                    <h3>Aucun document</h3>
                    <p>Ajoutez des documents à ce pack</p>
                </div>
            )}

            {/* Add documents modal */}
            {showAddModal && (
                <div className="ios-modal-backdrop" onClick={() => setShowAddModal(false)}>
                    <div className="ios-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ios-modal-handle"></div>
                        <h2 className="ios-modal-title">Ajouter des documents</h2>

                        {docsNotInPack.length > 0 ? (
                            <div className="dark-modal-doc-list">
                                {docsNotInPack.map((doc) => (
                                    <label key={doc.id} className="dark-modal-doc-item">
                                        <input
                                            type="checkbox"
                                            checked={selectedDocIds.includes(doc.id)}
                                            onChange={() => toggleDocSelection(doc.id)}
                                        />
                                        <span className="dark-modal-doc-icon">📄</span>
                                        <span className="dark-modal-doc-title">{doc.title}</span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <p style={{ textAlign: 'center', color: '#6B7280', padding: '2rem' }}>
                                Tous vos documents sont déjà dans ce pack
                            </p>
                        )}

                        <button
                            onClick={handleAddDocuments}
                            disabled={selectedDocIds.length === 0}
                            className="ios-modal-btn primary"
                            style={{ opacity: selectedDocIds.length === 0 ? 0.6 : 1 }}
                        >
                            Ajouter {selectedDocIds.length > 0 ? `(${selectedDocIds.length})` : ''}
                        </button>
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="ios-modal-btn secondary"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
