// ============================================
// DOCSBOX API - Categories Route (Supabase)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = 'force-dynamic';

// GET /api/categories
export async function GET() {
    const session = await getServerSession(authOptions);
    // Categories can be public (system categories) but usually better to have a session
    const userId = session?.user ? (session.user as any).id : null;

    try {
        let query = getSupabase()
            .from('categories')
            .select('*')
            .order('sortOrder', { ascending: true });

        if (userId) {
            // Get system categories (userId is null) OR user-specific categories
            query = query.or(`userId.is.null,userId.eq.${userId}`);
        } else {
            // If no session, only show system categories
            query = query.is('userId', null);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        return NextResponse.json(data || []);
    } catch (error: any) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories', details: error.message },
            { status: 500 }
        );
    }
}

// POST /api/categories (for custom categories)
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const body = await request.json();

        const category = {
            id: `cat_${Date.now()}`,
            userId: (session.user as any).id,
            name: body.name,
            icon: body.icon || '📁',
            color: body.color || '#6B7280',
            sortOrder: body.sortOrder || 99,
        };

        const { data, error } = await getSupabase()
            .from('categories')
            .insert(category)
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        console.error('Error creating category:', error);
        return NextResponse.json(
            { error: 'Failed to create category', details: error.message },
            { status: 500 }
        );
    }
}
