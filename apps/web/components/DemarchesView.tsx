// ============================================
// DOCSBOX WEB - Démarches View Component (API Connected)
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePremium } from '@/lib/premium-context';

interface Demarche {
    id: string;
    title: string;
    templateId: string;
    status: 'draft' | 'in_progress' | 'sent' | 'waiting' | 'completed';
    completedSteps: number;
    totalSteps: number;
    missingPieces: number;
    deadline: string | null;
    createdAt: string;
    updatedAt: string;
}

interface ApiResponse {
    data: Demarche[];
    total: number;
    missingPiecesCount: number;
}

const templates = [
    { id: 'carte_grise', name: 'Carte grise', icon: '🚗' },
    { id: 'passeport', name: 'Passeport / CNI', icon: '🪪' },
    { id: 'permis', name: 'Permis de conduire', icon: '🪪' },
    { id: 'demenagement', name: 'Déménagement', icon: '🚚' },
    { id: 'caf', name: 'CAF / APL', icon: '🏠' },
    { id: 'assurance', name: 'Assurance habitation', icon: '🛡️' },
    { id: 'impots', name: 'Impôts', icon: '📊' },
    { id: 'naissance', name: 'Déclaration naissance', icon: '👶' },
    { id: 'mariage', name: 'Mariage civil', icon: '💍' },
    { id: 'deces', name: 'Décès / Succession', icon: '⚰️' },
    { id: 'operateur', name: 'Changer opérateur', icon: '📱' },
    { id: 'banque', name: 'Ouvrir compte bancaire', icon: '💳' },
    { id: 'secu', name: 'Sécurité sociale', icon: '🏥' },
    { id: 'vehicule_occasion', name: 'Achat véhicule occasion', icon: '🚙' },
    { id: 'rsa', name: 'RSA', icon: '💶' },
    { id: 'hlm', name: 'Demande HLM', icon: '🏢' },
    { id: 'allocations', name: 'Allocations familiales', icon: '👨‍👩‍👧' },
    { id: 'conge_parental', name: 'Congé maternité/paternité', icon: '🤰' },
    { id: 'cmu', name: 'CMU / CSS', icon: '💊' },
    { id: 'bourse', name: 'Bourse étudiante', icon: '🎓' },
    { id: 'apl', name: 'APL', icon: '🏠' },
    { id: 'mdph', name: 'MDPH Handicap', icon: '♿' },
    { id: 'france_travail', name: 'France Travail', icon: '📋' },
    { id: 'titre_sejour', name: 'Titre de séjour', icon: '📄' },
];

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
    draft: { label: 'À préparer', color: '#6B7280', bg: '#F3F4F6' },
    in_progress: { label: 'En cours', color: '#2563EB', bg: '#DBEAFE' },
    sent: { label: 'Envoyée', color: '#D97706', bg: '#FEF3C7' },
    waiting: { label: 'En attente', color: '#D97706', bg: '#FEF3C7' },
    completed: { label: 'Terminée', color: '#059669', bg: '#D1FAE5' },
};

// Paywall Component
function Paywall({ onUnlock }: { onUnlock: () => void }) {
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

    return (
        <div className="paywall-container">
            <div className="paywall-icon">
                🚀
            </div>

            <h2 className="paywall-title">
                Débloquez Mes Démarches
            </h2>
            <p className="paywall-subtitle">
                Simplifiez toutes vos démarches administratives avec des checklists intelligentes
            </p>

            <div className="paywall-features">
                {[
                    '✅ Checklists prêtes à l\'emploi',
                    '✅ Suivi des pièces manquantes',
                    '✅ Relances automatiques',
                    '✅ 7 templates de démarches',
                    '✅ Documents illimités',
                    '✅ OCR et recherche texte',
                ].map((feature, i) => (
                    <div key={i} className="paywall-feature">
                        {feature}
                    </div>
                ))}
            </div>

            <div className="paywall-plans">
                {/* Monthly Plan */}
                <button
                    onClick={() => setSelectedPlan('monthly')}
                    className={`paywall-plan ${selectedPlan === 'monthly' ? 'active' : ''}`}
                >
                    <div className="paywall-plan-name">Mensuel</div>
                    <div className="paywall-plan-price">3,99 €</div>
                    <div className="paywall-plan-period">/mois</div>
                </button>

                {/* Yearly Plan */}
                <button
                    onClick={() => setSelectedPlan('yearly')}
                    className={`paywall-plan ${selectedPlan === 'yearly' ? 'active' : ''}`}
                >
                    <span className="paywall-badge">-58%</span>
                    <div className="paywall-plan-name">Annuel</div>
                    <div className="paywall-plan-price">29,99 €</div>
                    <div className="paywall-plan-period">/an</div>
                </button>
            </div>

            <p className="paywall-selected">
                Plan sélectionné : <strong>{selectedPlan === 'monthly' ? '3,99 €/mois' : '29,99 €/an (2,50 €/mois)'}</strong>
            </p>

            <button onClick={onUnlock} className="paywall-cta">
                {selectedPlan === 'monthly' ? 'Souscrire à 3,99 €/mois' : 'Souscrire à 29,99 €/an'}
            </button>

            <p className="paywall-legal">
                Annulez à tout moment • Restaurer achats
            </p>
        </div>
    );
}



export function DemarchesView() {
    const { isPremium, unlockPremium, isLoading: premiumLoading } = usePremium();
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [demarches, setDemarches] = useState<Demarche[]>([]);
    const [totalMissingPieces, setTotalMissingPieces] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

    const fetchDemarches = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (statusFilter) {
                params.set('status', statusFilter);
            }
            const res = await fetch(`/api/demarches?${params.toString()}`);
            if (!res.ok) throw new Error('Erreur chargement démarches');
            const data: ApiResponse = await res.json();
            setDemarches(data.data);
            setTotalMissingPieces(data.missingPiecesCount);
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        if (isPremium) {
            fetchDemarches();
        }
    }, [isPremium, fetchDemarches]);

    const handleCreateDemarche = async (templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        if (!template) return;

        try {
            const res = await fetch('/api/demarches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: template.name,
                    templateId: template.id,
                }),
            });
            if (!res.ok) throw new Error('Erreur création');
            setShowCreateModal(false);
            fetchDemarches();
        } catch (err: any) {
            console.error('Create demarche error:', err);
            setError(err.message || 'Erreur lors de la création de la démarche');
        }
    };

    // Show paywall if not premium
    if (!isPremium) {
        return <Paywall onUnlock={unlockPremium} />;
    }

    const filteredDemarches = statusFilter
        ? demarches.filter(d => d.status === statusFilter)
        : demarches;

    return (
        <div className="dark-container">
            {/* Missing pieces alert */}
            {totalMissingPieces > 0 && (
                <div className="dark-alert-card">
                    <div className="dark-alert-content">
                        <span className="dark-alert-icon">⚠️</span>
                        <div className="dark-alert-text">
                            <p className="dark-alert-title">{totalMissingPieces} pièce(s) manquante(s)</p>
                            <p className="dark-alert-subtitle">Complétez vos démarches</p>
                        </div>
                    </div>
                    <button
                        className="dark-alert-action"
                        onClick={() => setStatusFilter('draft')}
                    >
                        Voir
                    </button>
                </div>
            )}

            {/* Section Header */}
            <div className="ios-section-header">
                <h2 className="ios-section-title">Démarrer une démarche</h2>
            </div>

            {/* Templates horizontal scroll */}
            <div className="ios-templates-scroll">
                {templates.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => handleCreateDemarche(t.id)}
                        className="ios-scroll-template"
                    >
                        <div className="ios-scroll-template-icon">{t.icon}</div>
                        <p className="ios-scroll-template-name">{t.name}</p>
                    </button>
                ))}
            </div>

            {/* Pill Filters */}
            <div className="ios-pills">
                {[
                    { key: null, label: 'Toutes' },
                    { key: 'draft', label: 'À préparer' },
                    { key: 'in_progress', label: 'En cours' },
                    { key: 'completed', label: 'Terminées' },
                ].map((filter) => (
                    <button
                        key={filter.key || 'all'}
                        onClick={() => setStatusFilter(filter.key)}
                        className={`ios-pill ${statusFilter === filter.key ? 'active' : ''}`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Loading state */}
            {isLoading && (
                <div className="ios-loading">
                    <div className="ios-spinner"></div>
                    <p>Chargement des démarches...</p>
                </div>
            )}

            {/* Error state */}
            {error && !isLoading && (
                <div className="ios-error">
                    <span>⚠️</span>
                    <span>{error}</span>
                    <button onClick={fetchDemarches} className="ios-retry-btn">Réessayer</button>
                </div>
            )}

            {/* Demarches list */}
            {!isLoading && !error && (
                <>
                    <div className="ios-section-header">
                        <h2 className="ios-section-title">Mes démarches ({filteredDemarches.length})</h2>
                    </div>

                    <div>
                        {filteredDemarches.map((demarche) => {
                            const status = statusLabels[demarche.status] || statusLabels.draft;
                            const progress = demarche.totalSteps > 0
                                ? (demarche.completedSteps / demarche.totalSteps) * 100
                                : 0;

                            const getStatusClass = (s: string) => {
                                switch (s) {
                                    case 'draft': return 'status-draft';
                                    case 'in_progress': return 'status-progress';
                                    case 'sent':
                                    case 'waiting': return 'status-waiting';
                                    case 'completed': return 'status-completed';
                                    default: return 'status-draft';
                                }
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
                            const icon = templateIcons[demarche.templateId] || '📋';

                            return (
                                <Link
                                    key={demarche.id}
                                    href={`/demarches/${demarche.id}`}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <div className="dark-demarche-card">
                                        <div className="dark-demarche-icon">{icon}</div>
                                        <div className="dark-demarche-content">
                                            <h3 className="dark-demarche-title">{demarche.title}</h3>
                                            <div className="dark-demarche-meta">
                                                <span className={`dark-demarche-badge ${getStatusClass(demarche.status)}`}>
                                                    {status.label}
                                                </span>
                                                {demarche.missingPieces > 0 && (
                                                    <span className="dark-demarche-badge missing">
                                                        {demarche.missingPieces} manquante(s)
                                                    </span>
                                                )}
                                            </div>
                                            <div className="dark-demarche-progress">
                                                <div className="dark-progress-bar">
                                                    <div
                                                        className="dark-progress-fill"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                                <span className="dark-progress-text">
                                                    {demarche.completedSteps}/{demarche.totalSteps}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="dark-demarche-chevron">›</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {filteredDemarches.length === 0 && (
                        <div className="ios-empty">
                            <div className="ios-empty-icon">📋</div>
                            <h3>Aucune démarche</h3>
                            <p>Commencez une nouvelle démarche en cliquant sur un template ci-dessus</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

