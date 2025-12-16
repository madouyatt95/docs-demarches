// ============================================
// DOCSBOX API - Categories Route (Supabase)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/categories
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('sortOrder', { ascending: true });

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
    try {
        const body = await request.json();

        const category = {
            id: `cat_${Date.now()}`,
            userId: 'demo_user', // TODO: get from auth session
            name: body.name,
            icon: body.icon || '📁',
            color: body.color || '#6B7280',
            sortOrder: body.sortOrder || 99,
        };

        const { data, error } = await supabase
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
