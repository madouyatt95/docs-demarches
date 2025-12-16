// ============================================
// DOCSBOX MOBILE - Auth Service
// ============================================

import * as SecureStore from 'expo-secure-store';
import { User, Subscription, AuthTokens, LoginRequest, RegisterRequest } from '@docsbox/core';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

interface AuthResponse {
    user: User;
    tokens: AuthTokens;
    subscription: Subscription | null;
}

interface MeResponse {
    user: User;
    subscription: Subscription | null;
}

class AuthService {
    private async getAccessToken(): Promise<string | null> {
        return SecureStore.getItemAsync('docsbox_access_token');
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const token = await this.getAccessToken();

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Une erreur est survenue' }));
            throw new Error(error.message || 'Une erreur est survenue');
        }

        return response.json();
    }

    async login(email: string, password: string): Promise<AuthResponse> {
        return this.request<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async register(email: string, password: string, displayName?: string): Promise<AuthResponse> {
        return this.request<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, displayName }),
        });
    }

    async logout(): Promise<void> {
        await this.request('/auth/logout', { method: 'POST' });
    }

    async getMe(): Promise<MeResponse> {
        return this.request<MeResponse>('/auth/me');
    }

    async refreshToken(): Promise<AuthTokens> {
        const refreshToken = await SecureStore.getItemAsync('docsbox_refresh_token');
        if (!refreshToken) {
            throw new Error('No refresh token');
        }

        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            throw new Error('Token refresh failed');
        }

        const tokens: AuthTokens = await response.json();
        await SecureStore.setItemAsync('docsbox_access_token', tokens.accessToken);
        await SecureStore.setItemAsync('docsbox_refresh_token', tokens.refreshToken);

        return tokens;
    }

    async forgotPassword(email: string): Promise<void> {
        await this.request('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }

    async deleteAccount(): Promise<void> {
        await this.request('/auth/account', { method: 'DELETE' });
    }
}

export const authService = new AuthService();
