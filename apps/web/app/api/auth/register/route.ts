// ============================================
// DOCSBOX API - Auth Register Route (with Prisma)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// POST /api/auth/register
export async function POST(request: NextRequest) {
    try {
        const { email, password, displayName } = await request.json();

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email et mot de passe requis' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Le mot de passe doit contenir au moins 6 caractères' },
                { status: 400 }
            );
        }

        try {
            // Try using Prisma
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                return NextResponse.json(
                    { error: 'Cet email est déjà utilisé' },
                    { status: 409 }
                );
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 12);

            // Create user in database
            const user = await prisma.user.create({
                data: {
                    email,
                    passwordHash,
                    displayName: displayName || email.split('@')[0],
                },
            });

            return NextResponse.json({
                user: {
                    id: user.id,
                    email: user.email,
                    displayName: user.displayName,
                },
                message: 'Compte créé avec succès. Vous pouvez maintenant vous connecter.',
            }, { status: 201 });

        } catch (dbError) {
            console.log('Database not connected, using mock registration');

            // Fallback: Mock registration when DB not connected
            const mockUser = {
                id: `user_${Date.now()}`,
                email,
                displayName: displayName || email.split('@')[0],
            };

            return NextResponse.json({
                user: mockUser,
                message: 'Compte créé en mode démo (base de données non connectée)',
            }, { status: 201 });
        }

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de l\'inscription' },
            { status: 500 }
        );
    }
}
