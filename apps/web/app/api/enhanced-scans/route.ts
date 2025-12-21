import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// In-memory storage for demo (in production, use database)
// Key: simulated user ID, Value: { count: number, resetAt: Date }
const userScansMap = new Map<string, { count: number; resetAt: Date }>();

const MAX_SCANS_PER_MONTH = 5;

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function getMonthStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
}

function shouldReset(resetAt: Date): boolean {
    return resetAt < getMonthStart();
}

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    try {
        const userData = userScansMap.get(userId);

        if (!userData || shouldReset(userData.resetAt)) {
            // Reset or initialize
            const newData = { count: 0, resetAt: getMonthStart() };
            userScansMap.set(userId, newData);

            return NextResponse.json({
                used: 0,
                remaining: MAX_SCANS_PER_MONTH,
                limit: MAX_SCANS_PER_MONTH,
                resetsAt: getMonthStart().toISOString(),
            });
        }

        return NextResponse.json({
            used: userData.count,
            remaining: Math.max(0, MAX_SCANS_PER_MONTH - userData.count),
            limit: MAX_SCANS_PER_MONTH,
            resetsAt: userData.resetAt.toISOString(),
        });

    } catch (error: any) {
        console.error('[Enhanced Scans API Error]:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    try {
        let userData = userScansMap.get(userId);

        // Reset if needed
        if (!userData || shouldReset(userData.resetAt)) {
            userData = { count: 0, resetAt: getMonthStart() };
        }

        // Check limit
        if (userData.count >= MAX_SCANS_PER_MONTH) {
            return NextResponse.json({
                success: false,
                error: 'Limite de scans atteinte pour ce mois',
                used: userData.count,
                remaining: 0,
                limit: MAX_SCANS_PER_MONTH,
            }, { status: 429 });
        }

        // Increment usage
        userData.count += 1;
        userScansMap.set(userId, userData);

        return NextResponse.json({
            success: true,
            used: userData.count,
            remaining: Math.max(0, MAX_SCANS_PER_MONTH - userData.count),
            limit: MAX_SCANS_PER_MONTH,
        });

    } catch (error: any) {
        console.error('[Enhanced Scans API Error]:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
