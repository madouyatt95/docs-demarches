// ============================================
// DOCSBOX MOBILE - Theme Provider
// ============================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    mode: ThemeMode;
    isDark: boolean;
    setMode: (mode: ThemeMode) => void;
    colors: typeof lightColors;
}

const lightColors = {
    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceSecondary: '#F3F4F6',
    text: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    primary: '#3B82F6',
    primaryLight: '#DBEAFE',
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
};

const darkColors = {
    background: '#111827',
    surface: '#1F2937',
    surfaceSecondary: '#374151',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textTertiary: '#9CA3AF',
    primary: '#60A5FA',
    primaryLight: '#1E3A5F',
    success: '#34D399',
    successLight: '#064E3B',
    warning: '#FBBF24',
    warningLight: '#78350F',
    error: '#F87171',
    errorLight: '#7F1D1D',
    border: '#374151',
    borderLight: '#4B5563',
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useColorScheme();
    const [mode, setMode] = useState<ThemeMode>('system');

    const isDark = mode === 'system'
        ? systemColorScheme === 'dark'
        : mode === 'dark';

    const colors = isDark ? darkColors : lightColors;

    const value: ThemeContextType = {
        mode,
        isDark,
        setMode,
        colors,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}
