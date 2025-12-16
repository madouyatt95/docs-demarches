// ============================================
// DOCSBOX WEB - Home Page (Documents) - iOS Style
// ============================================

'use client';

import { useState } from 'react';
import { DocumentsView } from '@/components/DocumentsView';
import { Sidebar } from '@/components/Sidebar';
import { AddDocumentModal } from '@/components/AddDocumentModal';
import { ScannerModal } from '@/components/ScannerModal';
import { ShareModal } from '@/components/ShareModal';
import { PremiumGateModal } from '@/components/PremiumGateModal';
import { MobileNav } from '@/components/MobileNav';
import { usePremium } from '@/lib/premium-context';

export default function HomePage() {
    const { isPremium } = usePremium();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showScannerModal, setShowScannerModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showPremiumGate, setShowPremiumGate] = useState(false);
    const [premiumFeature, setPremiumFeature] = useState('');

    const openAddModal = () => setShowAddModal(true);

    const handleScannerClick = () => {
        if (isPremium) {
            setShowScannerModal(true);
        } else {
            setPremiumFeature('Scanner avec OCR');
            setShowPremiumGate(true);
        }
    };

    const handleShareClick = () => {
        if (isPremium) {
            setShowShareModal(true);
        } else {
            setPremiumFeature('Liens sécurisés');
            setShowPremiumGate(true);
        }
    };

    const handleScannerSuccess = () => {
        window.dispatchEvent(new CustomEvent('documents-refresh'));
        setShowScannerModal(false);
    };

    return (
        <div className="app-container">
            <Sidebar />
            <main className="flex-1 flex flex-col">
                <DocumentsView
                    onOpenModal={openAddModal}
                    onScannerClick={handleScannerClick}
                    onShareClick={handleShareClick}
                />
            </main>

            {/* Floating Action Button */}
            <button
                className="ios-fab"
                onClick={openAddModal}
                aria-label="Ajouter un document"
            >
                +
            </button>

            {/* Add Document Modal (classic import) */}
            <AddDocumentModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => {
                    window.dispatchEvent(new CustomEvent('documents-refresh'));
                    setShowAddModal(false);
                }}
            />

            {/* Scanner Modal with OCR (Premium) */}
            <ScannerModal
                isOpen={showScannerModal}
                onClose={() => setShowScannerModal(false)}
                onSuccess={handleScannerSuccess}
            />

            {/* Share Modal (Premium) */}
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
            />

            {/* Premium Gate Modal */}
            <PremiumGateModal
                isOpen={showPremiumGate}
                onClose={() => setShowPremiumGate(false)}
                feature={premiumFeature}
            />

            <MobileNav />
        </div>
    );
}
