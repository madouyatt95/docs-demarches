// ============================================
// DOCSBOX WEB - Subscription Page
// ============================================

import { Sidebar } from '@/components/Sidebar';
import { SubscriptionView } from '@/components/SubscriptionView';
import { MobileNav } from '@/components/MobileNav';

export default function SubscriptionPage() {
    return (
        <div className="app-container">
            <Sidebar />
            <main className="flex-1 flex flex-col">
                <SubscriptionView />
            </main>
            <MobileNav />
        </div>
    );
}
