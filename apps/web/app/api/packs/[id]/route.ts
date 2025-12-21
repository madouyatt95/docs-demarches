// ============================================
// DOCSBOX API - Single Pack Route (Supabase)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET /api/packs/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = params;

    try {
        // Get pack with its documents
        const { data: pack, error } = await getSupabase()
            .from('packs')
            .select('*')
            .eq('id', id)
            .eq('userId', (session.user as any).id)
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
        const { data: packDocs, error: packDocsError } = await getSupabase()
            .from('pack_documents')
            .select('documentId')
            .eq('packId', id);

        console.log('[Pack API] Pack documents junction:', { packDocs, packDocsError });

        let documents: any[] = [];
        if (packDocs && packDocs.length > 0) {
            const docIds = packDocs.map(pd => pd.documentId);
            const { data: docs, error: docsError } = await getSupabase()
                .from('documents')
                .select('id, title, categoryId, filePath, mimeType, createdAt')
                .in('id', docIds);

            console.log('[Pack API] Fetched documents:', { docs, docsError });
            documents = docs || [];
        }

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
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    try {
        // Add documents to pack
        if (body.addDocumentIds && Array.isArray(body.addDocumentIds)) {
            console.log('[Pack API] Adding documents:', body.addDocumentIds, 'to pack:', id);
            const insertErrors: any[] = [];

            for (const docId of body.addDocumentIds) {
                // Use insert with select to verify
                const { data, error } = await getSupabase()
                    .from('pack_documents')
                    .insert({
                        id: `pd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        packId: id,
                        documentId: docId,
                    })
                    .select();

                console.log('[Pack API] Insert result:', { docId, data, error });

                if (error) {
                    insertErrors.push({ docId, error: error.message, code: error.code });
                    console.error('[Pack API] Insert error:', error);
                }
            }

            if (insertErrors.length > 0) {
                return NextResponse.json({
                    success: false,
                    errors: insertErrors
                }, { status: 400 });
            }
            console.log('[Pack API] Documents added successfully');
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
                .eq('userId', (session.user as any).id);

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
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

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
            .eq('userId', (session.user as any).id);

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
