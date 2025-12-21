// ============================================
// DOCSBOX WEB - Démarches Page (Premium)
// ============================================

'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DemarchesView } from '@/components/DemarchesView';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';

export default function DemarchesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    // Show loading while checking auth
    if (status === 'loading') {
        return (
            <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    // Don't render if not authenticated
    if (status === 'unauthenticated') {
        return null;
    }

    return (
        <div className="app-container">
            <Sidebar />
            <main className="flex-1 flex flex-col" style={{ overflow: 'auto' }}>
                <DemarchesView />
            </main>
            <MobileNav />
        </div>
    );
}
