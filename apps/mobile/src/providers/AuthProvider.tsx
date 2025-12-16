// ============================================
// DOCSBOX MOBILE - Auth Provider
// ============================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';

import { User, Subscription, AuthTokens, SubscriptionPlan, SubscriptionStatus } from '@docsbox/core';
import { authService } from '../services/auth.service';

interface AuthContextType {
    user: User | null;
    subscription: Subscription | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isLocked: boolean;

    // Auth methods
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, displayName?: string) => Promise<void>;
    logout: () => Promise<void>;

    // Lock methods
    setupPin: (pin: string) => Promise<void>;
    unlockWithPin: (pin: string) => Promise<boolean>;
    unlockWithBiometrics: () => Promise<boolean>;
    lock: () => void;

    // Subscription
    refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

const KEYS = {
    ACCESS_TOKEN: 'docsbox_access_token',
    REFRESH_TOKEN: 'docsbox_refresh_token',
    USER: 'docsbox_user',
    PIN_HASH: 'docsbox_pin_hash',
    BIOMETRIC_ENABLED: 'docsbox_biometric',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLocked, setIsLocked] = useState(true);

    // Initialisation au démarrage
    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        try {
            const [accessToken, storedUser] = await Promise.all([
                SecureStore.getItemAsync(KEYS.ACCESS_TOKEN),
                SecureStore.getItemAsync(KEYS.USER),
            ]);

            if (accessToken && storedUser) {
                setUser(JSON.parse(storedUser));
                // Vérifier si un PIN est configuré
                const pinHash = await SecureStore.getItemAsync(KEYS.PIN_HASH);
                setIsLocked(!!pinHash);

                // Rafraîchir les infos utilisateur en arrière-plan
                refreshUserData();
            } else {
                setIsLocked(false);
            }
        } catch (error) {
            console.error('Error initializing auth:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshUserData = async () => {
        try {
            const { user: freshUser, subscription: freshSub } = await authService.getMe();
            setUser(freshUser);
            setSubscription(freshSub);
            await SecureStore.setItemAsync(KEYS.USER, JSON.stringify(freshUser));
        } catch (error) {
            console.error('Error refreshing user data:', error);
        }
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const { user, tokens, subscription } = await authService.login(email, password);

            await Promise.all([
                SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, tokens.accessToken),
                SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, tokens.refreshToken),
                SecureStore.setItemAsync(KEYS.USER, JSON.stringify(user)),
            ]);

            setUser(user);
            setSubscription(subscription);
            setIsLocked(false);

            router.replace('/(tabs)');
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (email: string, password: string, displayName?: string) => {
        setIsLoading(true);
        try {
            const { user, tokens, subscription } = await authService.register(email, password, displayName);

            await Promise.all([
                SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, tokens.accessToken),
                SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, tokens.refreshToken),
                SecureStore.setItemAsync(KEYS.USER, JSON.stringify(user)),
            ]);

            setUser(user);
            setSubscription(subscription);
            setIsLocked(false);

            router.replace('/onboarding');
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Error during logout:', error);
        }

        await Promise.all([
            SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
            SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
            SecureStore.deleteItemAsync(KEYS.USER),
        ]);

        setUser(null);
        setSubscription(null);
        setIsLocked(false);

        router.replace('/(auth)/login');
    };

    const setupPin = async (pin: string) => {
        // Hash simple pour le PIN (en prod, utiliser crypto)
        const pinHash = btoa(pin); // TODO: Utiliser expo-crypto pour un vrai hash
        await SecureStore.setItemAsync(KEYS.PIN_HASH, pinHash);
    };

    const unlockWithPin = async (pin: string): Promise<boolean> => {
        const storedHash = await SecureStore.getItemAsync(KEYS.PIN_HASH);
        const inputHash = btoa(pin);

        if (storedHash === inputHash) {
            setIsLocked(false);
            return true;
        }
        return false;
    };

    const unlockWithBiometrics = async (): Promise<boolean> => {
        try {
            const biometricEnabled = await SecureStore.getItemAsync(KEYS.BIOMETRIC_ENABLED);
            if (biometricEnabled !== 'true') {
                return false;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Déverrouillez DocsBox',
                cancelLabel: 'Utiliser le PIN',
                disableDeviceFallback: false,
            });

            if (result.success) {
                setIsLocked(false);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Biometric error:', error);
            return false;
        }
    };

    const lock = () => {
        setIsLocked(true);
    };

    const refreshSubscription = async () => {
        try {
            const { subscription: freshSub } = await authService.getMe();
            setSubscription(freshSub);
        } catch (error) {
            console.error('Error refreshing subscription:', error);
        }
    };

    const value: AuthContextType = {
        user,
        subscription,
        isLoading,
        isAuthenticated: !!user,
        isLocked,
        login,
        register,
        logout,
        setupPin,
        unlockWithPin,
        unlockWithBiometrics,
        lock,
        refreshSubscription,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
