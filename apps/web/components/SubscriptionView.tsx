// ============================================
// DOCSBOX WEB - Subscription View Component (Dark Mode)
// ============================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePremium } from '@/lib/premium-context';

export function SubscriptionView() {
    const router = useRouter();
    const { isPremium, unlockPremium } = usePremium();
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubscribe = async () => {
        setIsProcessing(true);
        // Simulate payment processing
        await new Promise(r => setTimeout(r, 1500));
        unlockPremium();
        setIsProcessing(false);
        router.push('/demarches');
    };

    const features = [
        { icon: '✅', title: 'Démarches illimitées', desc: 'Checklists et suivi complet' },
        { icon: '📄', title: 'Documents illimités', desc: 'Plus de limite de 30 docs' },
        { icon: '🔍', title: 'OCR intelligent', desc: 'Recherche dans vos documents' },
        { icon: '🔗', title: 'Liens sécurisés', desc: 'Partagez avec expiration' },
        { icon: '☁️', title: 'Sync multi-appareils', desc: 'Accès partout, chiffré' },
        { icon: '🔔', title: 'Rappels illimités', desc: 'Ne ratez plus d\'échéances' },
    ];

    const comparisonData = [
        { name: 'Documents', free: '30', premium: '∞' },
        { name: 'Rappels', free: '5', premium: '∞' },
        { name: 'Packs', free: '3', premium: '∞' },
        { name: 'Démarches', free: '❌', premium: '✅' },
        { name: 'OCR', free: '❌', premium: '✅' },
        { name: 'Liens partagés', free: '❌', premium: '✅' },
        { name: 'Sync', free: '❌', premium: '✅' },
    ];

    return (
        <div className="premium-container">
            {/* Header */}
            <div className="premium-header">
                <div className="premium-icon-badge">⭐</div>
                <h1 className="premium-title">Passez à Premium</h1>
                <p className="premium-subtitle">
                    Débloquez toutes les fonctionnalités
                </p>
            </div>

            {/* Features Grid */}
            <div className="premium-features">
                {features.map((feature, i) => (
                    <div key={i} className="premium-feature-card">
                        <span className="premium-feature-icon">{feature.icon}</span>
                        <div className="premium-feature-text">
                            <div className="premium-feature-title">{feature.title}</div>
                            <div className="premium-feature-desc">{feature.desc}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pricing Cards */}
            <div className="premium-pricing">
                <button
                    className={`premium-plan-card ${selectedPlan === 'monthly' ? 'selected' : ''}`}
                    onClick={() => setSelectedPlan('monthly')}
                >
                    <div className="premium-plan-name">Mensuel</div>
                    <div className="premium-plan-price">3,99 €</div>
                    <div className="premium-plan-period">par mois</div>
                </button>

                <button
                    className={`premium-plan-card ${selectedPlan === 'yearly' ? 'selected' : ''}`}
                    onClick={() => setSelectedPlan('yearly')}
                >
                    <span className="premium-plan-badge">-58%</span>
                    <div className="premium-plan-name">Annuel</div>
                    <div className="premium-plan-price">29,99 €</div>
                    <div className="premium-plan-period">par an (2,50€/mois)</div>
                </button>
            </div>

            {/* CTA Button */}
            <button
                className={`premium-cta-btn ${isProcessing ? 'processing' : ''}`}
                onClick={handleSubscribe}
                disabled={isProcessing}
            >
                {isProcessing ? '⏳ Traitement...' : `S'abonner - ${selectedPlan === 'yearly' ? '29,99€/an' : '3,99€/mois'}`}
            </button>

            <p className="premium-legal">
                Paiement sécurisé via Stripe. Annulez à tout moment.
            </p>

            {/* Comparison Table */}
            <div className="premium-comparison">
                <div className="premium-comparison-header">
                    <div>Fonctionnalité</div>
                    <div>Gratuit</div>
                    <div className="premium-col">Premium</div>
                </div>
                {comparisonData.map((row, i) => (
                    <div key={i} className="premium-comparison-row">
                        <div>{row.name}</div>
                        <div className="free-col">{row.free}</div>
                        <div className="premium-col">{row.premium}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
