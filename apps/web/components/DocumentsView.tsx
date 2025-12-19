// ============================================
// DOCSBOX WEB - Documents View Component (iOS Style)
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { DocumentSkeleton } from '@/components/Skeleton';
import { SwipeableItem } from '@/components/SwipeableItem';
import { PullToRefresh } from '@/components/PullToRefresh';
import { NotificationSettings } from '@/components/NotificationSettings';
import { useToast } from '@/lib/toast-context';



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

// Category configuration with emojis and validity periods (in months)
const categoryConfig: Record<string, { emoji: string; color: string; name: string; validityMonths?: number }> = {
    'cat_identity': { emoji: '🪪', color: '#3B82F6', name: 'Identité', validityMonths: undefined }, // No expiry for ID
    'cat_housing': { emoji: '🏠', color: '#10B981', name: 'Logement', validityMonths: 3 }, // 3 months for domicile
    'cat_work': { emoji: '💼', color: '#8B5CF6', name: 'Travail', validityMonths: 1 }, // 1 month for payslips
    'cat_vehicle': { emoji: '🚗', color: '#F59E0B', name: 'Véhicule', validityMonths: 6 }, // 6 months for control technique
    'cat_finance': { emoji: '💰', color: '#EF4444', name: 'Finance', validityMonths: 3 }, // 3 months for RIB/statements
    'cat_health': { emoji: '🏥', color: '#EC4899', name: 'Santé', validityMonths: 6 },
    'cat_education': { emoji: '🎓', color: '#06B6D4', name: 'Éducation', validityMonths: 12 },
    'cat_family': { emoji: '👨‍👩‍👧', color: '#8B5CF6', name: 'Famille', validityMonths: undefined },
    'default': { emoji: '📄', color: '#6B7280', name: 'Autre', validityMonths: undefined },
};

function daysUntil(dateStr: string): number {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Calculate document age in days
function daysSinceCreation(dateStr: string): number {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Check if document is expiring based on category validity period
function isDocumentExpiring(doc: Document): { expiring: boolean; daysLeft: number; reason: string } {
    const catInfo = getCategoryInfo(doc.categoryId);

    // If document has explicit expiration date
    if (doc.expirationDate) {
        const days = daysUntil(doc.expirationDate);
        if (days <= 0) return { expiring: true, daysLeft: days, reason: 'Expiré' };
        if (days <= 30) return { expiring: true, daysLeft: days, reason: `Expire dans ${days}j` };
    }

    // Check category-based validity
    if (catInfo.validityMonths) {
        const age = daysSinceCreation(doc.createdAt);
        const maxDays = catInfo.validityMonths * 30;
        const daysLeft = maxDays - age;

        if (daysLeft <= 0) return { expiring: true, daysLeft: 0, reason: `Ancien (+${catInfo.validityMonths} mois)` };
        if (daysLeft <= 30) return { expiring: true, daysLeft, reason: `Validité ${daysLeft}j` };
    }

    return { expiring: false, daysLeft: 999, reason: '' };
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
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState('');
    const { showToast } = useToast();

    // Edit document state
    const [editingDocId, setEditingDocId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editCategory, setEditCategory] = useState('');

    // Count expiring documents using category-based validity
    const expiringDocs = documents.filter(doc => {
        const status = isDocumentExpiring(doc);
        return status.expiring;
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
                showToast('Document supprimé', 'success');
                fetchDocuments();
            } else {
                showToast('Erreur lors de la suppression', 'error');
            }
        } catch (err) {
            console.error('Error deleting document:', err);
            showToast('Erreur lors de la suppression', 'error');
        }
    };


    const startEditDocument = (doc: Document) => {
        setEditingDocId(doc.id);
        setEditTitle(doc.title);
        setEditCategory(doc.categoryId || '');
    };

    const cancelEditDocument = () => {
        setEditingDocId(null);
        setEditTitle('');
        setEditCategory('');
    };

    const saveEditDocument = async () => {
        if (!editingDocId || !editTitle.trim()) return;

        try {
            const res = await fetch(`/api/documents/${editingDocId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editTitle.trim(),
                    categoryId: editCategory || null,
                }),
            });

            if (res.ok) {
                showToast('Document modifié', 'success');
                cancelEditDocument();
                fetchDocuments();
            } else {
                showToast('Erreur lors de la modification', 'error');
            }
        } catch (err) {
            console.error('Error editing document:', err);
            showToast('Erreur lors de la modification', 'error');
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
        <PullToRefresh onRefresh={async () => { await fetchDocuments(); }}>
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

                {/* Notification Settings */}
                <NotificationSettings />

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
                        className={`dark-pill ${selectedCategory === null ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(null)}
                    >
                        Tous
                    </button>
                    {Object.entries(categoryConfig).filter(([key]) => key !== 'default').map(([catId, catInfo]) => (
                        <button
                            key={catId}
                            className={`dark-pill ${selectedCategory === catId ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(catId)}
                        >
                            <span>{catInfo.emoji}</span>
                            <span>{catInfo.name}</span>
                        </button>
                    ))}
                </div>

                {/* Loading State */}
                {/* Loading State with Skeleton */}
                {isLoading && (
                    <div className="dark-loading-skeleton">
                        <DocumentSkeleton count={4} />
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
                                {documents
                                    .filter(doc => selectedCategory === null || doc.categoryId === selectedCategory)
                                    .slice(0, 6)
                                    .map((doc) => {
                                        const catInfo = getCategoryInfo(doc.categoryId);
                                        const expirationStatus = isDocumentExpiring(doc);

                                        return (
                                            <div key={doc.id} className={`dark-doc-card ${expirationStatus.expiring ? 'expiring' : ''}`}>
                                                <div
                                                    className="dark-doc-header"
                                                    style={{ background: `linear-gradient(135deg, ${catInfo.color}40 0%, ${catInfo.color}20 100%)` }}
                                                >
                                                    <span className="dark-doc-emoji">{catInfo.emoji}</span>
                                                    {expirationStatus.expiring && (
                                                        <span className={`dark-doc-badge ${expirationStatus.daysLeft <= 0 ? 'expired' : 'warning'}`}>
                                                            ⚠️ {expirationStatus.reason}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="dark-doc-body">
                                                    {editingDocId === doc.id ? (
                                                        <div className="dark-doc-edit-form">
                                                            <input
                                                                type="text"
                                                                className="form-input"
                                                                value={editTitle}
                                                                onChange={(e) => setEditTitle(e.target.value)}
                                                                placeholder="Titre du document"
                                                            />
                                                            <select
                                                                className="form-input"
                                                                value={editCategory}
                                                                onChange={(e) => setEditCategory(e.target.value)}
                                                            >
                                                                <option value="">Catégorie...</option>
                                                                <option value="cat_identity">🪪 Identité</option>
                                                                <option value="cat_housing">🏠 Logement</option>
                                                                <option value="cat_vehicle">🚗 Véhicule</option>
                                                                <option value="cat_finance">💰 Finance</option>
                                                                <option value="cat_health">🏥 Santé</option>
                                                                <option value="cat_work">📜 Travail</option>
                                                                <option value="cat_education">📚 Éducation</option>
                                                                <option value="cat_family">👨‍👩‍👧 Famille</option>
                                                            </select>
                                                            <div className="dark-doc-edit-actions">
                                                                <button className="dark-doc-action-btn save" onClick={saveEditDocument}>✓</button>
                                                                <button className="dark-doc-action-btn cancel" onClick={cancelEditDocument}>✕</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
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
                                                                    className="dark-doc-action-btn edit"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        startEditDocument(doc);
                                                                    }}
                                                                >
                                                                    ✏️
                                                                </button>
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
                                                        </>
                                                    )}
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
        </PullToRefresh>
    );
}

