// ============================================
// DOCSBOX WEB - Premium Context
// ============================================

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface PremiumContextType {
    isPremium: boolean;
    isLoading: boolean;
    unlockPremium: () => void;
    checkPremiumStatus: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export function PremiumProvider({ children }: { children: ReactNode }) {
    const { data: session } = useSession();
    const [isPremium, setIsPremium] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const checkPremiumStatus = async () => {
        setIsLoading(true);
        try {
            // In a real app, this would check the subscription status from the API
            // For now, we check if the session has isPremium flag
            const sessionPremium = (session?.user as any)?.isPremium;

            // Or check localStorage for demo purposes
            const storedPremium = typeof window !== 'undefined'
                ? localStorage.getItem('docsbox_premium') === 'true'
                : false;

            setIsPremium(sessionPremium || storedPremium);
        } catch (error) {
            console.error('Error checking premium status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const unlockPremium = () => {
        setIsPremium(true);
        // Store in localStorage for demo persistence
        if (typeof window !== 'undefined') {
            localStorage.setItem('docsbox_premium', 'true');
        }
    };

    useEffect(() => {
        checkPremiumStatus();
    }, [session]);

    return (
        <PremiumContext.Provider value={{ isPremium, isLoading, unlockPremium, checkPremiumStatus }}>
            {children}
        </PremiumContext.Provider>
    );
}

export function usePremium() {
    const context = useContext(PremiumContext);
    if (context === undefined) {
        throw new Error('usePremium must be used within a PremiumProvider');
    }
    return context;
}
