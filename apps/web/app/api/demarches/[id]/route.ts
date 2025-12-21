// ============================================
// DOCSBOX API - Single Demarche Route (Supabase)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET /api/demarches/[id]
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
            .eq('userId', (session.user as any).id)
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
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    try {
        // Verify ownership first
        const { data: demarche, error: checkError } = await getSupabase()
            .from('demarches')
            .select('id')
            .eq('id', id)
            .eq('userId', (session.user as any).id)
            .single();

        if (checkError || !demarche) {
            return NextResponse.json({ error: 'Démarche non trouvée ou accès refusé' }, { status: 403 });
        }

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

        // If adding a new step
        if (body.addStep) {
            // Get current max sortOrder
            const { data: existingSteps } = await getSupabase()
                .from('demarche_steps')
                .select('sortOrder')
                .eq('demarcheId', id)
                .order('sortOrder', { ascending: false })
                .limit(1);

            const maxSortOrder = existingSteps && existingSteps.length > 0 ? existingSteps[0].sortOrder : -1;

            const newStep = {
                id: `step_${Date.now()}`,
                demarcheId: id,
                title: body.addStep.title,
                description: body.addStep.description || null,
                sortOrder: maxSortOrder + 1,
                isCompleted: false,
            };

            const { error } = await getSupabase()
                .from('demarche_steps')
                .insert(newStep);

            if (error) throw error;
        }

        // If removing a step
        if (body.removeStepId) {
            const { error } = await getSupabase()
                .from('demarche_steps')
                .delete()
                .eq('id', body.removeStepId)
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
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = params;

    try {
        const { error } = await getSupabase()
            .from('demarches')
            .delete()
            .eq('id', id)
            .eq('userId', (session.user as any).id);

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
