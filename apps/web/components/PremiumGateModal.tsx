// ============================================
// DOCSBOX WEB - Premium Gate Modal
// Shows when non-premium users try to access premium features
// ============================================

'use client';

import { useRouter } from 'next/navigation';

interface PremiumGateModalProps {
    isOpen: boolean;
    onClose: () => void;
    feature: string;
}

export function PremiumGateModal({ isOpen, onClose, feature }: PremiumGateModalProps) {
    const router = useRouter();

    if (!isOpen) return null;

    const handleUpgrade = () => {
        onClose();
        router.push('/subscription');
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="premium-gate-modal" onClick={(e) => e.stopPropagation()}>
                <div className="premium-gate-icon">⭐</div>
                <h2 className="premium-gate-title">Fonctionnalité Premium</h2>
                <p className="premium-gate-desc">
                    <strong>{feature}</strong> est réservé aux abonnés Premium.
                </p>
                <p className="premium-gate-benefits">
                    Débloquez l'OCR intelligent, les démarches illimitées et bien plus !
                </p>
                <button className="premium-gate-cta" onClick={handleUpgrade}>
                    Passer à Premium
                </button>
                <button className="premium-gate-cancel" onClick={onClose}>
                    Plus tard
                </button>
            </div>
        </div>
    );
}
