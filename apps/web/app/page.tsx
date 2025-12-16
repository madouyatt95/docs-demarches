// ============================================
// DOCSBOX WEB - Home Page (Documents) - iOS Style
// ============================================

'use client';

import { useState } from 'react';
import { DocumentsView } from '@/components/DocumentsView';
import { Sidebar } from '@/components/Sidebar';
import { AddDocumentModal } from '@/components/AddDocumentModal';
import { MobileNav } from '@/components/MobileNav';

export default function HomePage() {
    const [showAddModal, setShowAddModal] = useState(false);

    return (
        <div className="app-container">
            <Sidebar />
            <main className="flex-1 flex flex-col">
                {/* iOS-style header integrated into content */}
                <div className="main-content">
                    <DocumentsView />
                </div>
            </main>

            {/* Floating Action Button */}
            <button
                className="ios-fab"
                onClick={() => setShowAddModal(true)}
                aria-label="Ajouter un document"
            >
                +
            </button>

            <AddDocumentModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => {
                    window.dispatchEvent(new CustomEvent('documents-refresh'));
                    setShowAddModal(false);
                }}
            />

            <MobileNav />
        </div>
    );
}
