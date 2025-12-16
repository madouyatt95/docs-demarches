// ============================================
// DOCSBOX API - Single Document Route
// ============================================

import { NextRequest, NextResponse } from 'next/server';

// Mock DB (shared with main route - in prod use DB)
let documents = [
    {
        id: '1',
        title: "Carte d'identité",
        categoryId: 'cat_identity',
        filePath: '/uploads/docs/cni.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        expirationDate: '2025-03-15',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
    },
];

// GET /api/documents/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const doc = documents.find(d => d.id === params.id);

    if (!doc) {
        return NextResponse.json(
            { error: 'Document not found' },
            { status: 404 }
        );
    }

    return NextResponse.json(doc);
}

// PUT /api/documents/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const docIndex = documents.findIndex(d => d.id === params.id);

    if (docIndex === -1) {
        return NextResponse.json(
            { error: 'Document not found' },
            { status: 404 }
        );
    }

    try {
        const body = await request.json();

        documents[docIndex] = {
            ...documents[docIndex],
            ...body,
            updatedAt: new Date().toISOString(),
        };

        return NextResponse.json(documents[docIndex]);
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
        );
    }
}

// DELETE /api/documents/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const docIndex = documents.findIndex(d => d.id === params.id);

    if (docIndex === -1) {
        return NextResponse.json(
            { error: 'Document not found' },
            { status: 404 }
        );
    }

    documents.splice(docIndex, 1);

    return NextResponse.json({ success: true }, { status: 200 });
}
