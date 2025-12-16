// ============================================
// DOCSBOX API - Single Demarche Route (Supabase)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET /api/demarches/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    try {
        const { data, error } = await getSupabase()
            .from('demarches')
            .select(`
                *,
                steps:demarche_steps(
                    id,
                    title,
                    description,
                    sortOrder,
                    isCompleted,
                    completedAt,
                    requiredDocumentType,
                    documentId,
                    document:documents(id, title, filePath, mimeType)
                )
            `)
            .eq('id', id)
            .eq('userId', 'demo_user')
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Demarche not found' },
                    { status: 404 }
                );
            }
            throw error;
        }

        // Format and enrich
        const steps = data.steps || [];
        const completedSteps = steps.filter((s: any) => s.isCompleted).length;

        return NextResponse.json({
            id: data.id,
            title: data.title,
            templateId: data.templateId,
            status: data.status?.toLowerCase() || 'draft',
            deadline: data.deadline,
            notes: data.notes,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            completedSteps,
            totalSteps: steps.length,
            steps: steps.sort((a: any, b: any) => a.sortOrder - b.sortOrder).map((s: any) => ({
                id: s.id,
                title: s.title,
                description: s.description,
                isCompleted: s.isCompleted,
                completedAt: s.completedAt,
                requiredDocumentType: s.requiredDocumentType,
                documentId: s.documentId,
                document: s.document,
            })),
        });
    } catch (error: any) {
        console.error('Error fetching demarche:', error);
        return NextResponse.json(
            { error: 'Failed to fetch demarche', details: error.message },
            { status: 500 }
        );
    }
}

// PATCH /api/demarches/[id] - Update step status
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    const body = await request.json();

    try {
        // If updating a step
        if (body.stepId) {
            const updateData: any = {};

            if (typeof body.isCompleted === 'boolean') {
                updateData.isCompleted = body.isCompleted;
                updateData.completedAt = body.isCompleted ? new Date().toISOString() : null;
            }

            if (body.documentId !== undefined) {
                updateData.documentId = body.documentId;
            }

            const { error } = await getSupabase()
                .from('demarche_steps')
                .update(updateData)
                .eq('id', body.stepId)
                .eq('demarcheId', id);

            if (error) throw error;
        }

        // If updating the démarche itself
        if (body.status) {
            const { error } = await getSupabase()
                .from('demarches')
                .update({
                    status: body.status.toUpperCase(),
                    updatedAt: new Date().toISOString(),
                    completedAt: body.status === 'completed' ? new Date().toISOString() : null,
                })
                .eq('id', id);

            if (error) throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error updating demarche:', error);
        return NextResponse.json(
            { error: 'Failed to update demarche', details: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/demarches/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    try {
        const { error } = await getSupabase()
            .from('demarches')
            .delete()
            .eq('id', id)
            .eq('userId', 'demo_user');

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting demarche:', error);
        return NextResponse.json(
            { error: 'Failed to delete demarche', details: error.message },
            { status: 500 }
        );
    }
}
