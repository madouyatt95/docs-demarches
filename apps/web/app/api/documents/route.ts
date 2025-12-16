// ============================================
// DOCSBOX API - Documents Route (Supabase)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = 'force-dynamic';

// GET /api/documents
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const categoryFilter = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    try {
        // Build query
        let query = getSupabase()
            .from('documents')
            .select(`
        *,
        category:categories(id, name, icon, color)
      `, { count: 'exact' })
            .eq('userId', 'demo_user') // TODO: get from auth session
            .order('updatedAt', { ascending: false })
            .range(offset, offset + limit - 1);

        // Apply filters
        if (categoryFilter) {
            query = query.eq('categoryId', categoryFilter);
        }

        if (search) {
            query = query.ilike('title', `%${search}%`);
        }

        const { data, error, count } = await query;

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        return NextResponse.json({
            data: data || [],
            total: count || 0,
            page,
            limit,
            totalPages: Math.ceil((count || 0) / limit),
        });
    } catch (error: any) {
        console.error('Error fetching documents:', error);
        return NextResponse.json(
            { error: 'Failed to fetch documents', details: error.message },
            { status: 500 }
        );
    }
}

// POST /api/documents
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const document = {
            id: `doc_${Date.now()}`,
            userId: 'demo_user', // TODO: get from auth session
            title: body.title,
            categoryId: body.categoryId || null,
            filePath: body.filePath || '/uploads/temp.pdf',
            fileSize: body.fileSize || 0,
            mimeType: body.mimeType || 'application/pdf',
            ocrText: body.ocrText || null, // OCR extracted text (Premium)
            expirationDate: body.expirationDate || null,
            tags: body.tags || [],
            syncStatus: 'LOCAL_ONLY',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const { data, error } = await getSupabase()
            .from('documents')
            .insert(document)
            .select(`
        *,
        category:categories(id, name, icon, color)
      `)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        console.error('Error creating document:', error);
        return NextResponse.json(
            { error: 'Failed to create document', details: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/documents?id=xxx
export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    try {
        const { error } = await getSupabase()
            .from('documents')
            .delete()
            .eq('id', id)
            .eq('userId', 'demo_user'); // TODO: get from auth session

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting document:', error);
        return NextResponse.json(
            { error: 'Failed to delete document', details: error.message },
            { status: 500 }
        );
    }
}
