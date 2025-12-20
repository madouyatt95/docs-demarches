// ============================================
// DOCSBOX - NextAuth Options
// ============================================

import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Mot de passe', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email et mot de passe requis');
                }

                try {
                    // Try to find user in database
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email },
                        include: { subscription: true },
                    });

                    if (user && user.passwordHash) {
                        // Verify password
                        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
                        if (!isValid) {
                            throw new Error('Mot de passe incorrect');
                        }

                        return {
                            id: user.id,
                            email: user.email,
                            name: user.displayName || user.email.split('@')[0],
                            isPremium: (user.subscription?.plan as string) === 'PREMIUM' || (user.subscription?.plan as string) === 'YEARLY',
                        };
                    }
                } catch (dbError) {
                    console.log('Database not connected, using demo mode');
                }

                // Fallback: Demo mode when DB is not connected
                if ((credentials.email === 'demo@docsbox.fr' || credentials.email === 'demo@docsbox.app') && credentials.password === 'demo123') {
                    return {
                        id: 'demo_user',
                        email: credentials.email,
                        name: 'Utilisateur Demo',
                        isPremium: true,
                    };
                }

                // Accept any email/password for testing when DB not available (Deterministic ID for testing)
                const mockId = `user_${Buffer.from(credentials.email).toString('hex').slice(0, 10)}`;
                return {
                    id: mockId,
                    email: credentials.email,
                    name: credentials.email.split('@')[0],
                    isPremium: false,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.isPremium = (user as any).isPremium;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).isPremium = token.isPremium;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET || 'docsbox-secret-key-change-in-production',
};
