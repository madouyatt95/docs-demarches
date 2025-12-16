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

export function DocumentsView() {
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
        <div className="ios-container">
            {/* Alert Card */}
            {expiringDocs.length > 0 && (
                <div className="ios-alert-card">
                    <div className="ios-alert-content">
                        <span className="ios-alert-icon">⚠️</span>
                        <div className="ios-alert-text">
                            <p className="ios-alert-title">
                                {expiringDocs.length} document{expiringDocs.length > 1 ? 's' : ''} expire{expiringDocs.length > 1 ? 'nt' : ''} bientôt
                            </p>
                            <p className="ios-alert-subtitle">
                                Pensez à les renouveler
                            </p>
                        </div>
                    </div>
                    <button className="ios-alert-action">Voir</button>
                </div>
            )}

            {/* Greeting Card */}
            <div className="ios-greeting-card">
                <div className="ios-greeting-emoji">👋</div>
                <div className="ios-greeting-text">
                    <p className="ios-greeting-hello">Bonjour,</p>
                    <p className="ios-greeting-name">{userName}</p>
                </div>
                <div className="ios-greeting-stats">
                    <span className="ios-stat-number">{documents.length}</span>
                    <span className="ios-stat-label">documents</span>
                </div>
            </div>

            {/* Section Header */}
            <div className="ios-section-header">
                <h2 className="ios-section-title">Mes Documents</h2>
                <button className="ios-section-action">Voir tout</button>
            </div>

            {/* Segmented Control */}
            <div className="ios-segmented-control">
                <button
                    className={`ios-segment ${activeTab === 'recent' ? 'active' : ''}`}
                    onClick={() => setActiveTab('recent')}
                >
                    Récents
                </button>
                <button
                    className={`ios-segment ${activeTab === 'categories' ? 'active' : ''}`}
                    onClick={() => setActiveTab('categories')}
                >
                    Catégories
                </button>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="ios-loading">
                    <div className="ios-spinner"></div>
                    <p>Chargement...</p>
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <div className="ios-error">
                    <span>⚠️</span>
                    <span>{error}</span>
                    <button onClick={fetchDocuments} className="ios-retry-btn">
                        Réessayer
                    </button>
                </div>
            )}

            {/* Documents Grid */}
            {!isLoading && !error && activeTab === 'recent' && (
                <div className="ios-grid">
                    {documents.slice(0, 6).map((doc) => {
                        const catInfo = getCategoryInfo(doc.categoryId);
                        const expiresIn = doc.expirationDate ? daysUntil(doc.expirationDate) : null;
                        const isExpiring = expiresIn !== null && expiresIn <= 30 && expiresIn > 0;
                        const isExpired = expiresIn !== null && expiresIn <= 0;

                        return (
                            <div key={doc.id} className="ios-doc-card">
                                <div
                                    className="ios-doc-icon"
                                    style={{ backgroundColor: `${catInfo.color}15` }}
                                >
                                    <span>{catInfo.emoji}</span>
                                </div>
                                <p className="ios-doc-title">{doc.title}</p>
                                <div className="ios-doc-footer">
                                    <span
                                        className="ios-doc-dot"
                                        style={{ backgroundColor: catInfo.color }}
                                    ></span>
                                    <span className="ios-doc-category">{catInfo.name}</span>
                                </div>
                                {(isExpiring || isExpired) && (
                                    <div className={`ios-doc-badge ${isExpired ? 'expired' : 'warning'}`}>
                                        {isExpired ? 'Expiré' : `${expiresIn}j`}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Categories View */}
            {!isLoading && !error && activeTab === 'categories' && (
                <div className="ios-categories">
                    {Object.entries(categoryConfig).filter(([key]) => key !== 'default').map(([catId, catInfo]) => {
                        const count = documentsByCategory[catId]?.length || 0;
                        return (
                            <div key={catId} className="ios-category-row">
                                <div
                                    className="ios-category-icon"
                                    style={{ backgroundColor: `${catInfo.color}15` }}
                                >
                                    <span>{catInfo.emoji}</span>
                                </div>
                                <div className="ios-category-info">
                                    <p className="ios-category-name">{catInfo.name}</p>
                                    <p className="ios-category-count">{count} document{count !== 1 ? 's' : ''}</p>
                                </div>
                                <span className="ios-category-chevron">›</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && documents.length === 0 && (
                <div className="ios-empty">
                    <div className="ios-empty-icon">📂</div>
                    <h3>Aucun document</h3>
                    <p>Commencez par ajouter votre premier document</p>
                </div>
            )}
        </div>
    );
}
