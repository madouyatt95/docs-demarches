// ============================================
// DOCSBOX WEB - Providers
// ============================================

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { useState } from 'react';
import { PremiumProvider } from '@/lib/premium-context';
import { OnboardingModal } from '@/components/OnboardingModal';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 1000 * 60 * 5, // 5 minutes
                        retry: 2,
                    },
                },
            })
    );

    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                <PremiumProvider>
                    {children}
                    <OnboardingModal />
                </PremiumProvider>
            </QueryClientProvider>
        </SessionProvider>
    );
}


