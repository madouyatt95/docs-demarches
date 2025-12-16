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

        // Predefined steps for each template
        const templateSteps: Record<string, Array<{ title: string; description?: string; requiredDocumentType?: string }>> = {
            carte_grise: [
                { title: 'Ancienne carte grise barrée', description: 'Barrer la carte grise et mentionner "vendu le [date]"', requiredDocumentType: 'carte_grise' },
                { title: 'Pièce d\'identité', description: 'CNI ou passeport en cours de validité', requiredDocumentType: 'identite' },
                { title: 'Justificatif de domicile', description: 'Moins de 6 mois', requiredDocumentType: 'domicile' },
                { title: 'Cerfa 13750', description: 'Formulaire de demande de certificat d\'immatriculation', requiredDocumentType: 'cerfa' },
                { title: 'Contrôle technique', description: 'Moins de 6 mois si véhicule > 4 ans', requiredDocumentType: 'controle_technique' },
                { title: 'Mandat d\'immatriculation', description: 'Si démarche effectuée par un tiers' },
            ],
            passeport: [
                { title: 'Pièce d\'identité actuelle', description: 'Ancien passeport ou CNI', requiredDocumentType: 'identite' },
                { title: 'Photo d\'identité', description: 'Aux normes, moins de 6 mois', requiredDocumentType: 'photo' },
                { title: 'Justificatif de domicile', description: 'Moins d\'un an', requiredDocumentType: 'domicile' },
                { title: 'Timbre fiscal', description: '86€ pour un adulte', requiredDocumentType: 'timbre' },
                { title: 'Prendre RDV en mairie', description: 'Réserver un créneau sur le site de la mairie' },
                { title: 'Se rendre au RDV', description: 'Apporter tous les documents' },
            ],
            permis: [
                { title: 'Pièce d\'identité', requiredDocumentType: 'identite' },
                { title: 'Photo d\'identité numérique', requiredDocumentType: 'photo' },
                { title: 'Justificatif de domicile', requiredDocumentType: 'domicile' },
                { title: 'ASSR ou ASR', description: 'Attestation scolaire de sécurité routière' },
                { title: 'Cerfa 02', description: 'Formulaire d\'inscription au permis' },
            ],
            demenagement: [
                { title: 'Résilier/transférer électricité', description: 'EDF, Engie ou autre fournisseur' },
                { title: 'Résilier/transférer internet', description: 'Contacter votre opérateur' },
                { title: 'Redirection courrier', description: 'La Poste - service de suivi du courrier' },
                { title: 'Changement adresse CAF', description: 'Mettre à jour sur caf.fr' },
                { title: 'Changement adresse impôts', description: 'Mettre à jour sur impots.gouv.fr' },
                { title: 'Changement carte grise', description: 'Obligatoire sous 1 mois' },
                { title: 'Inscription listes électorales', description: 'Mairie du nouveau domicile' },
            ],
            caf: [
                { title: 'Pièce d\'identité', requiredDocumentType: 'identite' },
                { title: 'RIB', description: 'Pour le versement des aides', requiredDocumentType: 'rib' },
                { title: 'Avis d\'imposition', description: 'De l\'année précédente', requiredDocumentType: 'impots' },
                { title: 'Justificatif de domicile', requiredDocumentType: 'domicile' },
                { title: 'Bail ou quittance de loyer', requiredDocumentType: 'bail' },
                { title: 'Attestation de loyer', description: 'Cerfa 10842 à faire remplir par le propriétaire' },
            ],
            assurance: [
                { title: 'Pièce d\'identité', requiredDocumentType: 'identite' },
                { title: 'RIB', requiredDocumentType: 'rib' },
                { title: 'Bail ou acte de propriété', requiredDocumentType: 'bail' },
                { title: 'Diagnostic immobilier', description: 'État des risques' },
                { title: 'Comparatif des offres', description: 'Utiliser un comparateur en ligne' },
                { title: 'Souscrire le contrat', description: 'Signature électronique ou papier' },
            ],
            impots: [
                { title: 'Bulletins de salaire', description: 'De l\'année concernée', requiredDocumentType: 'salaire' },
                { title: 'Relevés bancaires', description: 'Intérêts et dividendes perçus' },
                { title: 'Attestation employeur', description: 'Si télétravail' },
                { title: 'Frais réels', description: 'Justificatifs si option frais réels' },
                { title: 'Déclaration en ligne', description: 'Sur impots.gouv.fr' },
                { title: 'Vérifier l\'avis d\'imposition', description: 'Après traitement' },
            ],
        };

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

        // Get steps from body or use template defaults
        const stepsToInsert = body.steps || templateSteps[body.templateId] || [];

        if (stepsToInsert.length > 0) {
            const steps = stepsToInsert.map((step: any, index: number) => ({
                id: `step_${Date.now()}_${index}`,
                demarcheId: data.id,
                title: step.title,
                description: step.description || null,
                sortOrder: index,
                isCompleted: false,
                requiredDocumentType: step.requiredDocumentType || null,
            }));

            await getSupabase().from('demarche_steps').insert(steps);

            // ====================================
            // AUTO-LINK: Check if existing documents match any step requirements
            // ====================================
            try {
                console.log('[Auto-link] Starting auto-link for démarche:', data.id);

                // Map document types to category IDs
                const typeToCategoryMap: Record<string, string[]> = {
                    'identite': ['cat_identity'],
                    'passeport': ['cat_identity'],
                    'cni': ['cat_identity'],
                    'domicile': ['cat_housing'],
                    'bail': ['cat_housing'],
                    'quittance': ['cat_housing'],
                    'carte_grise': ['cat_vehicle'],
                    'permis': ['cat_vehicle'],
                    'controle_technique': ['cat_vehicle'],
                    'rib': ['cat_finance'],
                    'impots': ['cat_finance'],
                    'salaire': ['cat_finance', 'cat_work'],
                    'photo': ['cat_identity'],
                };

                // Get unique required document types from steps
                const requiredTypes = [...new Set(
                    steps
                        .filter((s: any) => s.requiredDocumentType)
                        .map((s: any) => s.requiredDocumentType)
                )];

                console.log('[Auto-link] Required types:', requiredTypes);

                if (requiredTypes.length > 0) {
                    // Get corresponding category IDs
                    const categoryIds: string[] = [];
                    requiredTypes.forEach(type => {
                        const cats = typeToCategoryMap[type] || [];
                        categoryIds.push(...cats);
                    });

                    console.log('[Auto-link] Looking for categories:', [...new Set(categoryIds)]);

                    // Fetch ALL user documents (simpler, more reliable than .in())
                    const { data: allDocs, error: docsError } = await getSupabase()
                        .from('documents')
                        .select('id, categoryId, title')
                        .eq('userId', 'demo_user');

                    console.log('[Auto-link] Total user docs:', allDocs?.length || 0);

                    // Filter to matching categories
                    const uniqueCats = [...new Set(categoryIds)];
                    const existingDocs = allDocs?.filter(doc =>
                        doc.categoryId && uniqueCats.includes(doc.categoryId)
                    ) || [];

                    console.log('[Auto-link] Matching docs:', existingDocs.length, docsError || '');

                    if (existingDocs && existingDocs.length > 0) {
                        // Build reverse map: category -> document
                        const categoryToDoc: Record<string, string> = {};
                        existingDocs.forEach(doc => {
                            if (doc.categoryId) {
                                categoryToDoc[doc.categoryId] = doc.id;
                                console.log(`[Auto-link] Mapped ${doc.categoryId} -> ${doc.title}`);
                            }
                        });

                        // Update steps with matching documents
                        let linkedCount = 0;
                        for (const step of steps) {
                            if (!step.requiredDocumentType) continue;

                            const matchingCategories = typeToCategoryMap[step.requiredDocumentType] || [];
                            for (const catId of matchingCategories) {
                                if (categoryToDoc[catId]) {
                                    const { error: updateError } = await getSupabase()
                                        .from('demarche_steps')
                                        .update({
                                            documentId: categoryToDoc[catId],
                                            isCompleted: true,
                                            completedAt: new Date().toISOString(),
                                        })
                                        .eq('id', step.id);

                                    if (!updateError) {
                                        linkedCount++;
                                        console.log(`[Auto-link] ✓ Linked doc to step "${step.title}"`);
                                    } else {
                                        console.log(`[Auto-link] ✗ Failed to link step:`, updateError);
                                    }
                                    break;
                                }
                            }
                        }
                        console.log(`[Auto-link] Total linked: ${linkedCount} steps`);
                    }
                }
            }
            } catch (linkError) {
            console.warn('[Auto-link] Failed (non-critical):', linkError);
        }
    }

        // Recalculate completed steps
        const { data: updatedSteps } = await getSupabase()
        .from('demarche_steps')
        .select('isCompleted')
        .eq('demarcheId', data.id);

    const completedCount = updatedSteps?.filter((s: any) => s.isCompleted).length || 0;

    return NextResponse.json({
        ...data,
        status: data.status?.toLowerCase() || 'draft',
        steps: [],
        completedSteps: completedCount,
        totalSteps: stepsToInsert.length,
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
