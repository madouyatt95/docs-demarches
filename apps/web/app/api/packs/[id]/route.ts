// ============================================
// DOCSBOX API - Single Pack Route (Supabase)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET /api/packs/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    try {
        // Get pack with its documents
        const { data: pack, error } = await getSupabase()
            .from('packs')
            .select('*')
            .eq('id', id)
            .eq('userId', 'demo_user')
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Pack not found' },
                    { status: 404 }
                );
            }
            throw error;
        }

        // Get documents in this pack via junction table
        const { data: packDocs } = await getSupabase()
            .from('pack_documents')
            .select(`
                document:documents(
                    id, title, categoryId, filePath, mimeType, createdAt
                )
            `)
            .eq('packId', id);

        const documents = packDocs?.map(pd => pd.document).filter(Boolean) || [];

        return NextResponse.json({
            ...pack,
            documents,
            documentCount: documents.length,
        });
    } catch (error: any) {
        console.error('Error fetching pack:', error);
        return NextResponse.json(
            { error: 'Failed to fetch pack', details: error.message },
            { status: 500 }
        );
    }
}

// PATCH /api/packs/[id] - Add/remove documents
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    const body = await request.json();

    try {
        // Add documents to pack
        if (body.addDocumentIds && Array.isArray(body.addDocumentIds)) {
            const insertData = body.addDocumentIds.map((docId: string) => ({
                packId: id,
                documentId: docId,
            }));

            const { error } = await getSupabase()
                .from('pack_documents')
                .upsert(insertData, { onConflict: 'packId,documentId' });

            if (error) {
                console.error('Error adding documents:', error);
                throw error;
            }
        }

        // Remove document from pack
        if (body.removeDocumentId) {
            const { error } = await getSupabase()
                .from('pack_documents')
                .delete()
                .eq('packId', id)
                .eq('documentId', body.removeDocumentId);

            if (error) {
                console.error('Error removing document:', error);
                throw error;
            }
        }

        // Update pack name if provided
        if (body.name) {
            const { error } = await getSupabase()
                .from('packs')
                .update({
                    name: body.name,
                    updatedAt: new Date().toISOString(),
                })
                .eq('id', id)
                .eq('userId', 'demo_user');

            if (error) throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error updating pack:', error);
        return NextResponse.json(
            { error: 'Failed to update pack', details: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/packs/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    try {
        // Delete pack documents first
        await getSupabase()
            .from('pack_documents')
            .delete()
            .eq('packId', id);

        // Delete the pack
        const { error } = await getSupabase()
            .from('packs')
            .delete()
            .eq('id', id)
            .eq('userId', 'demo_user');

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting pack:', error);
        return NextResponse.json(
            { error: 'Failed to delete pack', details: error.message },
            { status: 500 }
        );
    }
}
