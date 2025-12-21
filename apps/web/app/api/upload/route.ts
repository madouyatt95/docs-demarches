// ============================================
// DOCSBOX API - File Upload Route (Supabase Storage)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { randomUUID } from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// POST /api/upload - Upload a file to Supabase Storage
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/webp',
        ];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Allowed: PDF, JPEG, PNG, WebP' },
                { status: 400 }
            );
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File too large. Maximum size: 10MB' },
                { status: 400 }
            );
        }

        // Generate unique filename
        const ext = file.name.split('.').pop() || 'pdf';
        const fileName = `${randomUUID()}.${ext}`;
        const filePath = `documents/${fileName}`;

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Supabase Storage
        const supabase = getSupabase();
        const { data, error } = await supabase.storage
            .from('docsbox-files')
            .upload(filePath, buffer, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            console.error('Supabase Storage error:', error);

            // If bucket doesn't exist, try to create simple fallback
            if (error.message?.includes('not found') || error.message?.includes('Bucket')) {
                // Return a mock path for demo purposes
                return NextResponse.json({
                    success: true,
                    fileName,
                    filePath: `/demo/${fileName}`,
                    fileSize: file.size,
                    mimeType: file.type,
                    originalName: file.name,
                    note: 'Demo mode - configure Supabase Storage for production',
                });
            }

            throw error;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('docsbox-files')
            .getPublicUrl(filePath);

        return NextResponse.json({
            success: true,
            fileName,
            filePath: urlData.publicUrl || filePath,
            fileSize: file.size,
            mimeType: file.type,
            originalName: file.name,
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload file', details: error.message },
            { status: 500 }
        );
    }
}

// GET /api/upload - Get upload info
export async function GET() {
    return NextResponse.json({
        maxSize: '10MB',
        allowedTypes: ['PDF', 'JPEG', 'PNG', 'WebP'],
        storage: 'Supabase Storage',
    });
}
