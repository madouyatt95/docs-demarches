// ============================================
// DOCSBOX WEB - Subscription View Component
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

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'linear-gradient(180deg, #EFF6FF 0%, #F9FAFB 100%)',
        }}>
            {/* Header */}
            <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                borderRadius: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                marginBottom: '1.5rem',
                boxShadow: '0 10px 40px rgba(59,130,246,0.3)',
            }}>
                ⭐
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>
                Passez à DocsBox Premium
            </h1>
            <p style={{ color: '#6B7280', marginBottom: '2rem', textAlign: 'center', maxWidth: '500px' }}>
                Débloquez toutes les fonctionnalités et simplifiez vos démarches administratives
            </p>

            {/* Features Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                marginBottom: '2rem',
                width: '100%',
                maxWidth: '600px',
            }}>
                {[
                    { icon: '✅', title: 'Démarches illimitées', desc: 'Checklists et suivi complet' },
                    { icon: '📄', title: 'Documents illimités', desc: 'Plus de limite de 30 docs' },
                    { icon: '🔍', title: 'OCR intelligent', desc: 'Recherche dans vos documents' },
                    { icon: '🔗', title: 'Liens sécurisés', desc: 'Partagez avec expiration' },
                    { icon: '☁️', title: 'Sync multi-appareils', desc: 'Accès partout, chiffré' },
                    { icon: '🔔', title: 'Rappels illimités', desc: 'Ne ratez plus d\'échéances' },
                ].map((feature, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.75rem',
                            padding: '1rem',
                            background: 'white',
                            borderRadius: '1rem',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        }}
                    >
                        <span style={{ fontSize: '1.5rem' }}>{feature.icon}</span>
                        <div>
                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{feature.title}</div>
                            <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>{feature.desc}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pricing Cards */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
            }}>
                {/* Monthly */}
                <button
                    onClick={() => setSelectedPlan('monthly')}
                    style={{
                        padding: '1.5rem 2rem',
                        background: selectedPlan === 'monthly' ? '#EFF6FF' : 'white',
                        border: `2px solid ${selectedPlan === 'monthly' ? '#3B82F6' : '#E5E7EB'}`,
                        borderRadius: '1rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                    }}
                >
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Mensuel</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3B82F6' }}>3,99 €</div>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>par mois</div>
                </button>

                {/* Yearly */}
                <button
                    onClick={() => setSelectedPlan('yearly')}
                    style={{
                        padding: '1.5rem 2rem',
                        background: selectedPlan === 'yearly' ? '#EFF6FF' : 'white',
                        border: `2px solid ${selectedPlan === 'yearly' ? '#3B82F6' : '#E5E7EB'}`,
                        borderRadius: '1rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                        position: 'relative',
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        background: '#10B981',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.5rem',
                    }}>
                        -58%
                    </div>
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Annuel</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3B82F6' }}>29,99 €</div>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>par an (2,50€/mois)</div>
                </button>
            </div>

            {/* CTA */}
            <button
                onClick={handleSubscribe}
                disabled={isProcessing}
                style={{
                    padding: '1rem 4rem',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: 'white',
                    background: isProcessing
                        ? '#9CA3AF'
                        : 'linear-gradient(135deg, #3B82F6, #2563EB)',
                    border: 'none',
                    borderRadius: '1rem',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    marginBottom: '1rem',
                    boxShadow: '0 4px 20px rgba(59,130,246,0.3)',
                    transition: 'transform 0.2s',
                }}
                onMouseOver={(e) => !isProcessing && (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
                {isProcessing ? '⏳ Traitement...' : `S'abonner - ${selectedPlan === 'yearly' ? '29,99€/an' : '3,99€/mois'}`}
            </button>

            {/* Footer */}
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF', textAlign: 'center', maxWidth: '400px' }}>
                Paiement sécurisé via Stripe. Annulez à tout moment depuis vos paramètres.
                L'abonnement sera renouvelé automatiquement sauf si vous l'annulez au moins 24h avant.
            </p>

            {/* Comparison Table */}
            <div style={{
                marginTop: '3rem',
                width: '100%',
                maxWidth: '600px',
                background: 'white',
                borderRadius: '1rem',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 80px 80px',
                    background: '#F9FAFB',
                    padding: '1rem',
                    fontWeight: 600,
                    borderBottom: '1px solid #E5E7EB',
                }}>
                    <div>Fonctionnalité</div>
                    <div style={{ textAlign: 'center' }}>Gratuit</div>
                    <div style={{ textAlign: 'center', color: '#3B82F6' }}>Premium</div>
                </div>
                {[
                    { name: 'Documents', free: '30', premium: '∞' },
                    { name: 'Rappels', free: '5', premium: '∞' },
                    { name: 'Packs', free: '3', premium: '∞' },
                    { name: 'Démarches', free: '❌', premium: '✅' },
                    { name: 'OCR', free: '❌', premium: '✅' },
                    { name: 'Liens partagés', free: '❌', premium: '✅' },
                    { name: 'Sync multi-appareils', free: '❌', premium: '✅' },
                ].map((row, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 80px 80px',
                            padding: '0.75rem 1rem',
                            borderBottom: i < 6 ? '1px solid #F3F4F6' : 'none',
                        }}
                    >
                        <div>{row.name}</div>
                        <div style={{ textAlign: 'center', color: '#6B7280' }}>{row.free}</div>
                        <div style={{ textAlign: 'center' }}>{row.premium}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
