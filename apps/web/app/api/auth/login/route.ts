// ============================================
// DOCSBOX API - Auth Routes
// ============================================

import { NextRequest, NextResponse } from 'next/server';

// Mock Users DB
const users = [
    {
        id: 'user_1',
        email: 'demo@docsbox.fr',
        passwordHash: 'demo123', // En prod: bcrypt hash
        displayName: 'Utilisateur Demo',
        createdAt: '2024-01-01T00:00:00Z',
    },
];

// Mock JWT (en prod: utiliser jose ou next-auth)
function generateToken(userId: string): string {
    return `mock_jwt_${userId}_${Date.now()}`;
}

// POST /api/auth/login
export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        // Trouver l'utilisateur
        const user = users.find(u => u.email === email);

        if (!user || user.passwordHash !== password) {
            return NextResponse.json(
                { error: 'Email ou mot de passe incorrect' },
                { status: 401 }
            );
        }

        // Générer les tokens
        const accessToken = generateToken(user.id);
        const refreshToken = generateToken(user.id);

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
            },
            tokens: {
                accessToken,
                refreshToken,
                expiresIn: 3600,
            },
            subscription: {
                plan: 'free',
                status: 'active',
                expiresAt: null,
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid request' },
            { status: 400 }
        );
    }
}
