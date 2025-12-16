// ============================================
// DOCSBOX WEB - Home Page (Documents) - iOS Style
// ============================================

'use client';

import { useState } from 'react';
import { DocumentsView } from '@/components/DocumentsView';
import { Sidebar } from '@/components/Sidebar';
import { AddDocumentModal } from '@/components/AddDocumentModal';
import { ScannerModal } from '@/components/ScannerModal';
import { PremiumGateModal } from '@/components/PremiumGateModal';
import { MobileNav } from '@/components/MobileNav';
import { usePremium } from '@/lib/premium-context';

export default function HomePage() {
    const { isPremium } = usePremium();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showScannerModal, setShowScannerModal] = useState(false);
    const [showPremiumGate, setShowPremiumGate] = useState(false);

    const openAddModal = () => setShowAddModal(true);

    const handleScannerClick = () => {
        if (isPremium) {
            setShowScannerModal(true);
        } else {
            setShowPremiumGate(true);
        }
    };

    const handleScannerSuccess = (data: { title: string; file: File; extractedText: string }) => {
        // TODO: Save the scanned document with OCR text
        console.log('Scanned document:', data);
        // For now, just refresh the documents list
        window.dispatchEvent(new CustomEvent('documents-refresh'));
    };

    return (
        <div className="app-container">
            <Sidebar />
            <main className="flex-1 flex flex-col">
                <DocumentsView
                    onOpenModal={openAddModal}
                    onScannerClick={handleScannerClick}
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

            {/* Premium Gate Modal */}
            <PremiumGateModal
                isOpen={showPremiumGate}
                onClose={() => setShowPremiumGate(false)}
                feature="Scanner avec OCR"
            />

            <MobileNav />
        </div>
    );
}
