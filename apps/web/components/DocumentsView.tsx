// ============================================
// DOCSBOX WEB - Documents View Component (iOS Style)
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';

interface Document {
    id: string;
    title: string;
    categoryId: string | null;
    category: {
        id: string;
        name: string;
        color: string;
    } | null;
    filePath: string;
    mimeType: string;
    expirationDate: string | null;
    createdAt: string;
    updatedAt: string;
}

interface ApiResponse {
    data: Document[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Category configuration with emojis
const categoryConfig: Record<string, { emoji: string; color: string; name: string }> = {
    'cat_identity': { emoji: '🪪', color: '#3B82F6', name: 'Identité' },
    'cat_housing': { emoji: '🏠', color: '#10B981', name: 'Logement' },
    'cat_work': { emoji: '💼', color: '#8B5CF6', name: 'Travail' },
    'cat_vehicle': { emoji: '🚗', color: '#F59E0B', name: 'Véhicule' },
    'cat_finance': { emoji: '💰', color: '#EF4444', name: 'Finance' },
    'cat_health': { emoji: '🏥', color: '#EC4899', name: 'Santé' },
    'cat_education': { emoji: '🎓', color: '#06B6D4', name: 'Éducation' },
    'default': { emoji: '📄', color: '#6B7280', name: 'Autre' },
};

function daysUntil(dateStr: string): number {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getCategoryInfo(categoryId: string | null) {
    if (categoryId && categoryConfig[categoryId]) {
        return categoryConfig[categoryId];
    }
    return categoryConfig['default'];
}

interface DocumentsViewProps {
    onOpenModal?: () => void;
    onScannerClick?: () => void;
    onShareClick?: () => void;
}

export function DocumentsView({ onOpenModal, onScannerClick, onShareClick }: DocumentsViewProps) {
    const [activeTab, setActiveTab] = useState<'recent' | 'categories'>('recent');
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState('');

    // Count expiring documents
    const expiringDocs = documents.filter(doc => {
        if (!doc.expirationDate) return false;
        const days = daysUntil(doc.expirationDate);
        return days > 0 && days <= 30;
    });

    const fetchDocuments = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/documents');
            if (!res.ok) throw new Error('Erreur chargement documents');
            const data: ApiResponse = await res.json();
            setDocuments(data.data);
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDocuments();
        // Get user name from session or localStorage
        const storedName = localStorage.getItem('userName') || 'Utilisateur';
        setUserName(storedName);
    }, [fetchDocuments]);

    const handleDeleteDocument = async (docId: string) => {
        if (!confirm('Supprimer ce document ?')) return;

        try {
            const res = await fetch(`/api/documents/${docId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchDocuments();
            } else {
                alert('Erreur lors de la suppression');
            }
        } catch (err) {
            console.error('Error deleting document:', err);
            alert('Erreur lors de la suppression');
        }
    };

    // Listen for refresh events
    useEffect(() => {
        const handleRefresh = () => fetchDocuments();
        window.addEventListener('documents-refresh', handleRefresh);
        return () => window.removeEventListener('documents-refresh', handleRefresh);
    }, [fetchDocuments]);

    // Group documents by category for category view
    const documentsByCategory = documents.reduce((acc, doc) => {
        const catId = doc.categoryId || 'default';
        if (!acc[catId]) acc[catId] = [];
        acc[catId].push(doc);
        return acc;
    }, {} as Record<string, Document[]>);

    return (
        <div className="dark-container">
            {/* Stats Card */}
            <div className="dark-stats-card">
                <div className="dark-stats-item">
                    <span className="dark-stats-number">{documents.length}</span>
                    <span className="dark-stats-label">Documents</span>
                </div>
                <div className="dark-stats-divider"></div>
                <div className="dark-stats-item">
                    <span className="dark-stats-number dark-stats-alert">{expiringDocs.length}</span>
                    <span className="dark-stats-label">Alertes</span>
                </div>
            </div>

            {/* Quick Actions 2x2 Grid */}
            <div className="dark-section-header">
                <h2 className="dark-section-title">Actions rapides</h2>
            </div>
            <div className="dark-quick-actions">
                <button className="dark-action-btn" style={{ background: 'var(--gradient-blue)' }} onClick={onScannerClick}>
                    <span className="dark-action-icon">📷</span>
                    <span className="dark-action-label">Scanner</span>
                </button>
                <button className="dark-action-btn" style={{ background: 'var(--gradient-green)' }} onClick={onOpenModal}>
                    <span className="dark-action-icon">📁</span>
                    <span className="dark-action-label">Importer</span>
                </button>
                <button className="dark-action-btn" style={{ background: 'var(--gradient-purple)' }} onClick={() => window.location.href = '/packs'}>
                    <span className="dark-action-icon">📦</span>
                    <span className="dark-action-label">Pack</span>
                </button>
                <button className="dark-action-btn" style={{ background: 'var(--gradient-orange)' }} onClick={onShareClick}>
                    <span className="dark-action-icon">📤</span>
                    <span className="dark-action-label">Partager</span>
                </button>
            </div>

            {/* Category Pills */}
            <div className="dark-section-header">
                <h2 className="dark-section-title">Catégories</h2>
            </div>
            <div className="dark-category-pills">
                <button
                    className={`dark-pill ${activeTab === 'recent' ? 'active' : ''}`}
                    onClick={() => setActiveTab('recent')}
                >
                    Tous
                </button>
                {Object.entries(categoryConfig).filter(([key]) => key !== 'default').map(([catId, catInfo]) => (
                    <button key={catId} className="dark-pill">
                        <span>{catInfo.emoji}</span>
                        <span>{catInfo.name}</span>
                    </button>
                ))}
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="dark-loading">
                    <div className="dark-spinner"></div>
                    <p>Chargement...</p>
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <div className="dark-error">
                    <span>⚠️</span>
                    <span>{error}</span>
                    <button onClick={fetchDocuments} className="dark-retry-btn">
                        Réessayer
                    </button>
                </div>
            )}

            {/* Documents Section */}
            {!isLoading && !error && (
                <>
                    <div className="dark-section-header">
                        <h2 className="dark-section-title">Mes Documents</h2>
                        <span className="dark-section-count">{documents.length}</span>
                    </div>

                    {documents.length > 0 ? (
                        <div className="dark-docs-grid">
                            {documents.slice(0, 6).map((doc) => {
                                const catInfo = getCategoryInfo(doc.categoryId);
                                const expiresIn = doc.expirationDate ? daysUntil(doc.expirationDate) : null;
                                const isExpiring = expiresIn !== null && expiresIn <= 30 && expiresIn > 0;
                                const isExpired = expiresIn !== null && expiresIn <= 0;

                                return (
                                    <div key={doc.id} className="dark-doc-card">
                                        <div
                                            className="dark-doc-header"
                                            style={{ background: `linear-gradient(135deg, ${catInfo.color}40 0%, ${catInfo.color}20 100%)` }}
                                        >
                                            <span className="dark-doc-emoji">{catInfo.emoji}</span>
                                            {(isExpiring || isExpired) && (
                                                <span className={`dark-doc-badge ${isExpired ? 'expired' : 'warning'}`}>
                                                    {isExpired ? '⚠️' : `${expiresIn}j`}
                                                </span>
                                            )}
                                        </div>
                                        <div className="dark-doc-body">
                                            <p className="dark-doc-title">{doc.title}</p>
                                            <p className="dark-doc-category">{catInfo.name}</p>
                                            <div className="dark-doc-actions">
                                                {doc.filePath && doc.filePath !== '/demo/' && (
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
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteDocument(doc.id);
                                                    }}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="dark-empty">
                            <div className="dark-empty-icon">📂</div>
                            <h3>Aucun document</h3>
                            <p>Commencez par ajouter votre premier document</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
