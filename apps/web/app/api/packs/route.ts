// ============================================
// DOCSBOX API - Packs Route (Supabase)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = 'force-dynamic';

// GET /api/packs
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    try {
        let query = getSupabase()
            .from('packs')
            .select(`
        *,
        documents:pack_documents(count)
      `)
            .eq('userId', 'demo_user') // TODO: get from auth session
            .order('updatedAt', { ascending: false });

        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        // Transform data to include document count
        const enriched = (data || []).map((pack: any) => ({
            id: pack.id,
            name: pack.name,
            templateId: pack.templateId,
            documentCount: pack.documents?.[0]?.count || 0,
            createdAt: pack.createdAt,
            updatedAt: pack.updatedAt,
        }));

        return NextResponse.json({
            data: enriched,
            total: enriched.length,
        });
    } catch (error: any) {
        console.error('Error fetching packs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch packs', details: error.message },
            { status: 500 }
        );
    }
}

// POST /api/packs
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const pack = {
            id: `pack_${Date.now()}`,
            userId: 'demo_user', // TODO: get from auth session
            name: body.name,
            templateId: body.templateId || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const { data, error } = await getSupabase()
            .from('packs')
            .insert(pack)
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        return NextResponse.json({
            ...data,
            documentCount: 0,
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating pack:', error);
        return NextResponse.json(
            { error: 'Failed to create pack', details: error.message },
            { status: 500 }
        );
    }
}

// PUT /api/packs - Update a pack
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, name, templateId } = body;

        if (!id) {
            return NextResponse.json({ error: 'Pack ID required' }, { status: 400 });
        }

        const { data, error } = await getSupabase()
            .from('packs')
            .update({
                name,
                templateId: templateId || null,
                updatedAt: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('userId', 'demo_user') // TODO: get from auth session
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error updating pack:', error);
        return NextResponse.json(
            { error: 'Failed to update pack', details: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/packs?id=xxx
export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Pack ID required' }, { status: 400 });
    }

    try {
        const { error } = await getSupabase()
            .from('packs')
            .delete()
            .eq('id', id)
            .eq('userId', 'demo_user'); // TODO: get from auth session

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting pack:', error);
        return NextResponse.json(
            { error: 'Failed to delete pack', details: error.message },
            { status: 500 }
        );
    }
}
