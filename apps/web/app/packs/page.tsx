// ============================================
// DOCSBOX WEB - Packs Page
// ============================================

import { PacksView } from '@/components/PacksView';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';

export default function PacksPage() {
    return (
        <div className="app-container">
            <Sidebar />
            <main className="flex-1 flex flex-col">
                <Header title="Mes Packs" />
                <div className="main-content">
                    <PacksView />
                </div>
            </main>
            <MobileNav />
        </div>
    );
}
