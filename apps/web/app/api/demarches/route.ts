// ============================================
// DOCSBOX API - Demarches Route (Supabase)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = 'force-dynamic';

// GET /api/demarches
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    try {
        let query = getSupabase()
            .from('demarches')
            .select(`
        *,
        steps:demarche_steps(*)
      `)
            .eq('userId', 'demo_user') // TODO: get from auth session
            .order('updatedAt', { ascending: false });

        if (status) {
            query = query.eq('status', status.toUpperCase());
        }

        const { data, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        // Enrich with computed fields
        const enriched = (data || []).map((d: any) => {
            const steps = d.steps || [];
            const completedSteps = steps.filter((s: any) => s.isCompleted).length;
            const missingPieces = steps.filter((s: any) => !s.isCompleted && s.requiredDocumentType && !s.documentId).length;

            return {
                id: d.id,
                title: d.title,
                templateId: d.templateId,
                status: d.status?.toLowerCase() || 'draft',
                steps: steps.map((s: any) => ({
                    id: s.id,
                    title: s.title,
                    completed: s.isCompleted,
                    documentId: s.documentId,
                })),
                deadline: d.deadline,
                notes: d.notes,
                createdAt: d.createdAt,
                updatedAt: d.updatedAt,
                completedSteps,
                totalSteps: steps.length,
                missingPieces,
            };
        });

        const totalMissingPieces = enriched.reduce((acc: number, d: any) => acc + d.missingPieces, 0);

        return NextResponse.json({
            data: enriched,
            total: enriched.length,
            missingPiecesCount: totalMissingPieces,
        });
    } catch (error: any) {
        console.error('Error fetching demarches:', error);
        return NextResponse.json(
            { error: 'Failed to fetch demarches', details: error.message },
            { status: 500 }
        );
    }
}

// POST /api/demarches
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const demarche = {
            id: `dem_${Date.now()}`,
            userId: 'demo_user', // TODO: get from auth session
            title: body.title,
            templateId: body.templateId,
            status: 'DRAFT',
            deadline: body.deadline || null,
            notes: body.notes || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const { data, error } = await getSupabase()
            .from('demarches')
            .insert(demarche)
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        // Insert steps if provided
        if (body.steps && body.steps.length > 0) {
            const steps = body.steps.map((step: any, index: number) => ({
                id: `step_${Date.now()}_${index}`,
                demarcheId: data.id,
                title: step.title,
                description: step.description || null,
                sortOrder: index,
                isCompleted: false,
                requiredDocumentType: step.requiredDocumentType || null,
            }));

            await getSupabase().from('demarche_steps').insert(steps);
        }

        return NextResponse.json({
            ...data,
            status: data.status?.toLowerCase() || 'draft',
            steps: [],
            completedSteps: 0,
            totalSteps: body.steps?.length || 0,
            missingPieces: 0,
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating demarche:', error);
        return NextResponse.json(
            { error: 'Failed to create demarche', details: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/demarches?id=xxx
export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Demarche ID required' }, { status: 400 });
    }

    try {
        const { error } = await getSupabase()
            .from('demarches')
            .delete()
            .eq('id', id)
            .eq('userId', 'demo_user'); // TODO: get from auth session

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting demarche:', error);
        return NextResponse.json(
            { error: 'Failed to delete demarche', details: error.message },
            { status: 500 }
        );
    }
}
