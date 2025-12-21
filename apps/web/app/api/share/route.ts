// ============================================
// DOCSBOX API - Share Links Route (Supabase)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Generate a unique share token
function generateToken(): string {
    return crypto.randomBytes(16).toString('hex');
}

// POST /api/share - Create a new share link
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { documentId, packId, expirationDays = 7, password } = body;

        // Verify ownership
        if (documentId) {
            const { data: doc, error: docError } = await getSupabase()
                .from('documents')
                .select('id')
                .eq('id', documentId)
                .eq('userId', (session.user as any).id)
                .single();

            if (docError || !doc) {
                return NextResponse.json({ error: 'Document non trouvé ou accès refusé' }, { status: 403 });
            }
        } else if (packId) {
            const { data: pack, error: packError } = await getSupabase()
                .from('packs')
                .select('id')
                .eq('id', packId)
                .eq('userId', (session.user as any).id)
                .single();

            if (packError || !pack) {
                return NextResponse.json({ error: 'Pack non trouvé ou accès refusé' }, { status: 403 });
            }
        }

        const token = generateToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expirationDays);

        // Hash password if provided
        let passwordHash = null;
        if (password) {
            passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        }

        const shareLink = {
            id: `share_${Date.now()}`,
            documentId: documentId || null,
            packId: packId || null,
            token,
            expiresAt: expiresAt.toISOString(),
            password: passwordHash,
            maxDownloads: null,
            downloadCount: 0,
            createdAt: new Date().toISOString(),
        };

        const { data, error } = await getSupabase()
            .from('share_links')
            .insert(shareLink)
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        // Generate the public share URL
        const host = request.headers.get('host');
        const protocol = host?.includes('localhost') ? 'http' : 'https';
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
        const shareUrl = `${baseUrl}/share/${token}`;

        return NextResponse.json({
            ...data,
            shareUrl,
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating share link:', error);
        return NextResponse.json(
            { error: 'Failed to create share link', details: error.message },
            { status: 500 }
        );
    }
}

// GET /api/share?token=xxx - Get share link details and document
export async function GET(request: NextRequest) {
    // PUBLIC ACCESS (with token/password)
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const password = searchParams.get('password');

    if (!token) {
        return NextResponse.json(
            { error: 'Token is required' },
            { status: 400 }
        );
    }

    try {
        // Get the share link
        const { data: shareLink, error: shareError } = await getSupabase()
            .from('share_links')
            .select(`
                *,
                document:documents(id, title, filePath, mimeType),
                pack:packs(id, name)
            `)
            .eq('token', token)
            .single();

        if (shareError || !shareLink) {
            return NextResponse.json(
                { error: 'Share link not found' },
                { status: 404 }
            );
        }
        // ... (rest of the file remains same, keeping tokens and expiration checks)
        // Check expiration
        if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
            return NextResponse.json(
                { error: 'Share link has expired' },
                { status: 410 }
            );
        }

        // Check password if required
        if (shareLink.password) {
            if (!password) {
                return NextResponse.json(
                    { error: 'Password required', requiresPassword: true },
                    { status: 401 }
                );
            }
            const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
            if (passwordHash !== shareLink.password) {
                return NextResponse.json(
                    { error: 'Invalid password', requiresPassword: true },
                    { status: 401 }
                );
            }
        }

        // Increment download count
        await getSupabase()
            .from('share_links')
            .update({ downloadCount: (shareLink.downloadCount || 0) + 1 })
            .eq('id', shareLink.id);

        // If it's a pack, fetch the documents in the pack
        let packDocuments: any[] = [];
        if (shareLink.pack && shareLink.packId) {
            const { data: packDocs } = await getSupabase()
                .from('pack_documents')
                .select(`
                    document:documents(id, title, filePath, mimeType)
                `)
                .eq('packId', shareLink.packId);

            packDocuments = packDocs?.map((pd: any) => pd.document).filter(Boolean) || [];
        }

        return NextResponse.json({
            document: shareLink.document,
            pack: shareLink.pack,
            packDocuments,
            expiresAt: shareLink.expiresAt,
        });
    } catch (error: any) {
        console.error('Error fetching share link:', error);
        return NextResponse.json(
            { error: 'Failed to fetch share link', details: error.message },
            { status: 500 }
        );
    }
}
