// ============================================
// DOCSBOX WEB - Packs View Component (iOS Style)
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Pack {
    id: string;
    name: string;
    templateId: string | null;
    documentCount: number;
    createdAt: string;
    updatedAt: string;
}

interface ApiResponse {
    data: Pack[];
    total: number;
}

const templates = [
    { id: 'location', name: 'Dossier Location', icon: '🏠', description: 'Pour candidature logement' },
    { id: 'ecole', name: 'Inscription École', icon: '🎓', description: 'Pour inscription scolaire' },
    { id: 'banque', name: 'Ouverture Compte', icon: '🏦', description: 'Pour ouvrir un compte' },
    { id: 'emploi', name: 'Candidature Emploi', icon: '💼', description: 'Pour recherche d\'emploi' },
    { id: 'sante', name: 'Dossier Santé', icon: '🏥', description: 'Documents médicaux' },
    { id: 'voyage', name: 'Voyage', icon: '✈️', description: 'Documents de voyage' },
];

export function PacksView() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPack, setEditingPack] = useState<Pack | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [packName, setPackName] = useState('');
    const [packs, setPacks] = useState<Pack[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchPacks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/packs');
            if (!res.ok) throw new Error('Erreur chargement packs');
            const data: ApiResponse = await res.json();
            setPacks(data.data);
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPacks();
    }, [fetchPacks]);

    const handleCreatePack = async () => {
        if (!packName.trim()) return;

        setIsCreating(true);
        try {
            const res = await fetch('/api/packs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: packName.trim(),
                    templateId: selectedTemplate,
                }),
            });

            if (!res.ok) throw new Error('Erreur création pack');

            setShowCreateModal(false);
            setPackName('');
            setSelectedTemplate(null);
            fetchPacks();
        } catch (err: any) {
            console.error('Create pack error:', err);
            setError(err.message || 'Erreur lors de la création du pack');
        } finally {
            setIsCreating(false);
        }
    };

    const handleEditPack = async () => {
        if (!editingPack || !packName.trim()) return;

        setIsCreating(true);
        try {
            const res = await fetch('/api/packs', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingPack.id,
                    name: packName.trim(),
                    templateId: selectedTemplate,
                }),
            });

            if (!res.ok) throw new Error('Erreur modification pack');

            setShowEditModal(false);
            setEditingPack(null);
            setPackName('');
            setSelectedTemplate(null);
            fetchPacks();
        } catch (err) {
            console.error('Edit pack error:', err);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeletePack = async (packId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm('Êtes-vous sûr de vouloir supprimer ce pack ?')) return;

        setIsDeleting(packId);
        try {
            const res = await fetch(`/api/packs?id=${packId}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Erreur suppression pack');
            fetchPacks();
        } catch (err: any) {
            console.error('Delete pack error:', err);
            setError(err.message || 'Erreur lors de la suppression du pack');
        } finally {
            setIsDeleting(null);
        }
    };

    const openTemplateModal = (templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        setSelectedTemplate(templateId);
        setPackName(template?.name || '');
        setShowCreateModal(true);
    };

    const openEditModal = (pack: Pack, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingPack(pack);
        setPackName(pack.name);
        setSelectedTemplate(pack.templateId);
        setShowEditModal(true);
    };

    const openCustomModal = () => {
        setSelectedTemplate(null);
        setPackName('');
        setShowCreateModal(true);
    };

    const getPackIcon = (templateId: string | null) => {
        const template = templates.find(t => t.id === templateId);
        return template?.icon || '📦';
    };

    const getPackIconClass = (templateId: string | null) => {
        return templateId || 'default';
    };

    return (
        <div className="ios-container">
            {/* Section Header */}
            <div className="ios-section-header">
                <h2 className="ios-section-title">Créer un pack</h2>
            </div>

            {/* Templates Grid */}
            <div className="ios-template-grid">
                {templates.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => openTemplateModal(t.id)}
                        className="ios-template-card"
                    >
                        <div className="ios-template-icon">{t.icon}</div>
                        <p className="ios-template-name">{t.name}</p>
                        <p className="ios-template-desc">{t.description}</p>
                    </button>
                ))}
                {/* Custom Pack Button */}
                <button onClick={openCustomModal} className="ios-template-card">
                    <div className="ios-template-icon">➕</div>
                    <p className="ios-template-name">Personnalisé</p>
                    <p className="ios-template-desc">Créer votre pack</p>
                </button>
            </div>

            {/* Loading state */}
            {isLoading && (
                <div className="ios-loading">
                    <div className="ios-spinner"></div>
                    <p>Chargement des packs...</p>
                </div>
            )}

            {/* Error state */}
            {error && !isLoading && (
                <div className="ios-error">
                    <span>⚠️</span>
                    <span>{error}</span>
                    <button onClick={fetchPacks} className="ios-retry-btn">Réessayer</button>
                </div>
            )}

            {/* My Packs */}
            {!isLoading && !error && (
                <>
                    <div className="ios-section-header">
                        <h2 className="ios-section-title">Mes packs ({packs.length})</h2>
                    </div>

                    <div className="ios-categories">
                        {packs.map((pack) => (
                            <Link key={pack.id} href={`/packs/${pack.id}`} style={{ textDecoration: 'none' }}>
                                <div className="ios-pack-card">
                                    <div className={`ios-pack-icon ${getPackIconClass(pack.templateId)}`}>
                                        {getPackIcon(pack.templateId)}
                                    </div>
                                    <div className="ios-pack-info">
                                        <p className="ios-pack-name">{pack.name}</p>
                                        <p className="ios-pack-count">{pack.documentCount} documents</p>
                                    </div>
                                    <div className="ios-pack-actions">
                                        <button
                                            onClick={(e) => openEditModal(pack, e)}
                                            className="ios-pack-action edit"
                                            title="Modifier"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={(e) => handleDeletePack(pack.id, e)}
                                            disabled={isDeleting === pack.id}
                                            className="ios-pack-action delete"
                                            title="Supprimer"
                                        >
                                            {isDeleting === pack.id ? '⏳' : '🗑️'}
                                        </button>
                                    </div>
                                    <span className="ios-pack-chevron">›</span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {packs.length === 0 && (
                        <div className="ios-empty">
                            <div className="ios-empty-icon">📦</div>
                            <h3>Aucun pack</h3>
                            <p>Créez votre premier pack en choisissant un template ci-dessus</p>
                        </div>
                    )}
                </>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="ios-modal-backdrop" onClick={() => setShowCreateModal(false)}>
                    <div className="ios-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ios-modal-handle"></div>
                        <h2 className="ios-modal-title">Créer un pack</h2>

                        <input
                            type="text"
                            placeholder="Nom du pack..."
                            value={packName}
                            onChange={(e) => setPackName(e.target.value)}
                            className="ios-modal-input"
                            autoFocus
                        />

                        <div style={{ marginBottom: '1.5rem' }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.75rem', color: '#374151' }}>
                                Catégorie
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                {templates.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setSelectedTemplate(t.id)}
                                        style={{
                                            padding: '0.75rem',
                                            border: selectedTemplate === t.id ? '2px solid #3B82F6' : '1px solid #E5E7EB',
                                            borderRadius: '0.75rem',
                                            background: selectedTemplate === t.id ? '#EFF6FF' : 'white',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                        }}
                                    >
                                        <div style={{ fontSize: '1.25rem' }}>{t.icon}</div>
                                        <div style={{ fontSize: '0.65rem', color: '#374151', marginTop: '0.25rem' }}>{t.name}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleCreatePack}
                            disabled={isCreating || !packName.trim()}
                            className="ios-modal-btn primary"
                            style={{ opacity: isCreating || !packName.trim() ? 0.6 : 1 }}
                        >
                            {isCreating ? '⏳ Création...' : 'Créer le pack'}
                        </button>
                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="ios-modal-btn secondary"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingPack && (
                <div className="ios-modal-backdrop" onClick={() => setShowEditModal(false)}>
                    <div className="ios-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ios-modal-handle"></div>
                        <h2 className="ios-modal-title">Modifier le pack</h2>

                        <input
                            type="text"
                            placeholder="Nom du pack..."
                            value={packName}
                            onChange={(e) => setPackName(e.target.value)}
                            className="ios-modal-input"
                            autoFocus
                        />

                        <div style={{ marginBottom: '1.5rem' }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.75rem', color: '#374151' }}>
                                Catégorie
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                {templates.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setSelectedTemplate(t.id)}
                                        style={{
                                            padding: '0.75rem',
                                            border: selectedTemplate === t.id ? '2px solid #3B82F6' : '1px solid #E5E7EB',
                                            borderRadius: '0.75rem',
                                            background: selectedTemplate === t.id ? '#EFF6FF' : 'white',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                        }}
                                    >
                                        <div style={{ fontSize: '1.25rem' }}>{t.icon}</div>
                                        <div style={{ fontSize: '0.65rem', color: '#374151', marginTop: '0.25rem' }}>{t.name}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleEditPack}
                            disabled={isCreating || !packName.trim()}
                            className="ios-modal-btn primary"
                            style={{ opacity: isCreating || !packName.trim() ? 0.6 : 1 }}
                        >
                            {isCreating ? '⏳ Sauvegarde...' : 'Enregistrer'}
                        </button>
                        <button
                            onClick={() => setShowEditModal(false)}
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

