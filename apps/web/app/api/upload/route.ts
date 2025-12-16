// ============================================
// DOCSBOX API - File Upload Route
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
async function ensureUploadDir() {
    try {
        await mkdir(UPLOAD_DIR, { recursive: true });
    } catch (error) {
        // Directory might already exist
    }
}

// POST /api/upload - Upload a file
export async function POST(request: NextRequest) {
    try {
        await ensureUploadDir();

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
        const filePath = join(UPLOAD_DIR, fileName);

        // Write file to disk
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Return public URL
        const publicUrl = `/uploads/${fileName}`;

        return NextResponse.json({
            success: true,
            fileName,
            filePath: publicUrl,
            fileSize: file.size,
            mimeType: file.type,
            originalName: file.name,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}

// GET /api/upload - Get upload info
export async function GET() {
    return NextResponse.json({
        maxSize: '10MB',
        allowedTypes: ['PDF', 'JPEG', 'PNG', 'WebP'],
        uploadDir: '/uploads',
    });
}
