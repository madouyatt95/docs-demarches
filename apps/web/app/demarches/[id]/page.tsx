// ============================================
// DOCSBOX WEB - Démarche Detail Page
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';

interface Step {
    id: string;
    title: string;
    description?: string;
    isCompleted: boolean;
    completedAt?: string;
    requiredDocumentType?: string;
    documentId?: string;
    document?: {
        id: string;
        title: string;
        filePath: string;
        mimeType: string;
    };
}

interface Demarche {
    id: string;
    title: string;
    templateId: string;
    status: string;
    deadline?: string;
    notes?: string;
    steps: Step[];
    completedSteps: number;
    totalSteps: number;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    draft: { label: 'À préparer', color: '#6B7280', bg: 'rgba(107, 114, 128, 0.2)' },
    in_progress: { label: 'En cours', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.2)' },
    sent: { label: 'Envoyée', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.2)' },
    waiting: { label: 'En attente', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.2)' },
    completed: { label: 'Terminée', color: '#10B981', bg: 'rgba(16, 185, 129, 0.2)' },
};

const templateIcons: Record<string, string> = {
    carte_grise: '🚗',
    passeport: '🪪',
    permis: '🪪',
    demenagement: '🚚',
    caf: '🏠',
    assurance: '🛡️',
    impots: '📊',
};

export default function DemarcheDetailPage() {
    const params = useParams();
    const router = useRouter();
    const demarcheId = params.id as string;

    const [demarche, setDemarche] = useState<Demarche | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDemarche = useCallback(async () => {
        if (!demarcheId) return;

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/demarches/${demarcheId}`);
            if (!res.ok) {
                if (res.status === 404) {
                    throw new Error('Démarche introuvable');
                }
                throw new Error('Erreur lors du chargement');
            }
            const data = await res.json();
            setDemarche(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [demarcheId]);

    useEffect(() => {
        fetchDemarche();
    }, [fetchDemarche]);

    const handleToggleStep = async (stepId: string, isCompleted: boolean) => {
        try {
            const res = await fetch(`/api/demarches/${demarcheId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stepId,
                    isCompleted,
                }),
            });

            if (res.ok) {
                fetchDemarche();
            }
        } catch (err) {
            console.error('Error updating step:', err);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Supprimer cette démarche ?')) return;

        try {
            const res = await fetch(`/api/demarches/${demarcheId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                router.push('/demarches');
            }
        } catch (err) {
            console.error('Error deleting:', err);
        }
    };

    const handleChangeStatus = async (newStatus: string) => {
        try {
            const res = await fetch(`/api/demarches/${demarcheId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                fetchDemarche();
            }
        } catch (err) {
            console.error('Error changing status:', err);
        }
    };

    const [newStepTitle, setNewStepTitle] = useState('');
    const [showAddStep, setShowAddStep] = useState(false);

    const handleAddStep = async () => {
        if (!newStepTitle.trim()) return;

        try {
            const res = await fetch(`/api/demarches/${demarcheId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    addStep: {
                        title: newStepTitle.trim(),
                    },
                }),
            });

            if (res.ok) {
                setNewStepTitle('');
                setShowAddStep(false);
                fetchDemarche();
            }
        } catch (err) {
            console.error('Error adding step:', err);
        }
    };

    const handleRemoveStep = async (stepId: string) => {
        if (!confirm('Supprimer cette étape ?')) return;

        try {
            const res = await fetch(`/api/demarches/${demarcheId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ removeStepId: stepId }),
            });

            if (res.ok) {
                fetchDemarche();
            }
        } catch (err) {
            console.error('Error removing step:', err);
        }
    };

    const progress = demarche
        ? (demarche.completedSteps / demarche.totalSteps) * 100
        : 0;

    const status = demarche ? statusConfig[demarche.status] || statusConfig.draft : statusConfig.draft;
    const icon = demarche ? templateIcons[demarche.templateId] || '📋' : '📋';

    return (
        <div className="app-container">
            <Sidebar />
            <main className="flex-1 flex flex-col">
                <div className="dark-container">
                    {/* Back button */}
                    <Link href="/demarches" className="demarche-back-btn">
                        ← Retour
                    </Link>

                    {isLoading && (
                        <div className="dark-loading">
                            <div className="dark-spinner"></div>
                            <p>Chargement...</p>
                        </div>
                    )}

                    {error && (
                        <div className="dark-error">
                            <span>⚠️</span>
                            <span>{error}</span>
                            <button onClick={() => router.push('/demarches')}>Retour</button>
                        </div>
                    )}

                    {demarche && !isLoading && (
                        <>
                            {/* Header Card */}
                            <div className="demarche-header-card">
                                <div className="demarche-header-icon">{icon}</div>
                                <div className="demarche-header-info">
                                    <h1 className="demarche-header-title">{demarche.title}</h1>
                                    <span
                                        className="demarche-status-badge"
                                        style={{
                                            color: status.color,
                                            background: status.bg,
                                        }}
                                    >
                                        {status.label}
                                    </span>
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="demarche-progress-section">
                                <div className="demarche-progress-header">
                                    <span>Progression</span>
                                    <span>{demarche.completedSteps}/{demarche.totalSteps} étapes</span>
                                </div>
                                <div className="demarche-progress-bar">
                                    <div
                                        className="demarche-progress-fill"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Status change buttons */}
                            <div className="dark-section-header">
                                <h2 className="dark-section-title">📌 Statut</h2>
                            </div>
                            <div className="demarche-status-buttons">
                                {Object.entries(statusConfig).map(([key, config]) => (
                                    <button
                                        key={key}
                                        className={`demarche-status-btn ${demarche.status === key ? 'active' : ''}`}
                                        onClick={() => handleChangeStatus(key)}
                                    >
                                        {config.label}
                                    </button>
                                ))}
                            </div>

                            {/* Checklist */}
                            <div className="dark-section-header">
                                <h2 className="dark-section-title">📋 Checklist</h2>
                            </div>

                            <div className="demarche-checklist">
                                {demarche.steps.map((step, index) => (
                                    <div
                                        key={step.id}
                                        className={`demarche-step ${step.isCompleted ? 'completed' : ''}`}
                                    >
                                        <button
                                            className="demarche-step-checkbox"
                                            onClick={() => handleToggleStep(step.id, !step.isCompleted)}
                                        >
                                            {step.isCompleted ? '✓' : (index + 1)}
                                        </button>
                                        <div className="demarche-step-content">
                                            <div className="demarche-step-title">{step.title}</div>
                                            {step.description && (
                                                <div className="demarche-step-desc">{step.description}</div>
                                            )}
                                            {step.document && (
                                                <div className="demarche-step-doc">
                                                    📄 {step.document.title}
                                                </div>
                                            )}
                                            {step.requiredDocumentType && !step.document && !step.isCompleted && (
                                                <div className="demarche-step-missing">
                                                    ⚠️ Document requis
                                                </div>
                                            )}
                                            <div className="demarche-step-actions">
                                                <button
                                                    className="demarche-step-remove"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveStep(step.id);
                                                    }}
                                                >
                                                    🗑️ Supprimer
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Add new step */}
                                {showAddStep ? (
                                    <div className="demarche-step" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Titre de l'étape..."
                                            value={newStepTitle}
                                            onChange={(e) => setNewStepTitle(e.target.value)}
                                            autoFocus
                                        />
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="demarche-status-btn active"
                                                onClick={handleAddStep}
                                                disabled={!newStepTitle.trim()}
                                            >
                                                ✓ Ajouter
                                            </button>
                                            <button
                                                className="demarche-status-btn"
                                                onClick={() => { setShowAddStep(false); setNewStepTitle(''); }}
                                            >
                                                ✕ Annuler
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        className="demarche-add-step-btn"
                                        onClick={() => setShowAddStep(true)}
                                    >
                                        ➕ Ajouter une étape
                                    </button>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="demarche-actions">
                                <button className="demarche-delete-btn" onClick={handleDelete}>
                                    🗑️ Supprimer
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </main>
            <MobileNav />
        </div>
    );
}
