// ============================================
// DOCSBOX API - Single Document Route (Supabase)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET /api/documents/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    try {
        const { data, error } = await getSupabase()
            .from('documents')
            .select(`
                *,
                category:categories(id, name, icon, color)
            `)
            .eq('id', id)
            .eq('userId', 'demo_user')
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Document not found' },
                    { status: 404 }
                );
            }
            throw error;
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching document:', error);
        return NextResponse.json(
            { error: 'Failed to fetch document', details: error.message },
            { status: 500 }
        );
    }
}

// PATCH /api/documents/[id] - Update a document
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    const body = await request.json();

    try {
        const updateData: any = {
            updatedAt: new Date().toISOString(),
        };

        if (body.title !== undefined) updateData.title = body.title;
        if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
        if (body.expirationDate !== undefined) updateData.expirationDate = body.expirationDate;
        if (body.tags !== undefined) updateData.tags = body.tags;

        const { data, error } = await getSupabase()
            .from('documents')
            .update(updateData)
            .eq('id', id)
            .eq('userId', 'demo_user')
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error updating document:', error);
        return NextResponse.json(
            { error: 'Failed to update document', details: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/documents/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    try {
        // First get the document to get the file path
        const { data: doc } = await getSupabase()
            .from('documents')
            .select('filePath')
            .eq('id', id)
            .eq('userId', 'demo_user')
            .single();

        // Delete from database
        const { error } = await getSupabase()
            .from('documents')
            .delete()
            .eq('id', id)
            .eq('userId', 'demo_user');

        if (error) throw error;

        // Try to delete from storage if it exists
        if (doc?.filePath && doc.filePath.includes('docsbox-files')) {
            try {
                const pathParts = doc.filePath.split('/docsbox-files/');
                if (pathParts[1]) {
                    await getSupabase().storage
                        .from('docsbox-files')
                        .remove([pathParts[1]]);
                }
            } catch (storageError) {
                console.warn('Could not delete file from storage:', storageError);
            }
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
