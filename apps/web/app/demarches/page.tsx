// ============================================
// DOCSBOX WEB - Démarches Page (Premium)
// ============================================

import { DemarchesView } from '@/components/DemarchesView';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';

export default function DemarchesPage() {
    return (
        <div className="app-container">
            <Sidebar />
            <main className="flex-1 flex flex-col">
                <Header title="Mes Démarches" />
                <div className="main-content">
                    <DemarchesView />
                </div>
            </main>
            <MobileNav />
        </div>
    );
}
