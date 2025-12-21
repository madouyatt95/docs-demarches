// ============================================
// DOCSBOX API - Export Pack Documents List
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/packs/[id]/export - Returns list of download URLs
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
        // Get pack
        const { data: pack, error: packError } = await getSupabase()
            .from('packs')
            .select('name')
            .eq('id', id)
            .eq('userId', (session.user as any).id)
            .single();

        if (packError || !pack) {
            return NextResponse.json(
                { error: 'Pack not found' },
                { status: 404 }
            );
        }

        // Get documents in this pack
        const { data: packDocs } = await getSupabase()
            .from('pack_documents')
            .select(`
                document:documents(
                    id, title, filePath, mimeType
                )
            `)
            .eq('packId', id);

        const documents = packDocs?.map(pd => pd.document).filter(Boolean) || [];

        if (documents.length === 0) {
            return NextResponse.json(
                { error: 'Pack is empty' },
                { status: 400 }
            );
        }

        // Return download info for each document
        const downloadList = documents
            .filter((doc: any) => doc.filePath && doc.filePath !== '/demo/')
            .map((doc: any) => ({
                id: doc.id,
                title: doc.title,
                url: doc.filePath,
                mimeType: doc.mimeType,
            }));

        return NextResponse.json({
            packName: pack.name,
            documents: downloadList,
            totalCount: downloadList.length,
        });

    } catch (error: any) {
        console.error('Error exporting pack:', error);
        return NextResponse.json(
            { error: 'Failed to export pack', details: error.message },
            { status: 500 }
        );
    }
}
