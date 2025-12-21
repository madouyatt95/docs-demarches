// ============================================
// DOCSBOX WEB - Document Classification API (Gemini)
// Auto-classify documents using AI
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Document categories available in DocsBox
const CATEGORIES = [
    { id: 'cat_identity', name: 'Identité', keywords: ['CNI', 'passeport', 'carte identité', 'permis', 'titre séjour'] },
    { id: 'cat_housing', name: 'Logement', keywords: ['facture', 'EDF', 'Engie', 'eau', 'électricité', 'loyer', 'bail', 'quittance'] },
    { id: 'cat_work', name: 'Travail', keywords: ['bulletin', 'paie', 'salaire', 'contrat travail', 'attestation employeur'] },
    { id: 'cat_vehicle', name: 'Véhicule', keywords: ['carte grise', 'assurance auto', 'contrôle technique', 'permis conduire'] },
    { id: 'cat_finance', name: 'Finance', keywords: ['RIB', 'relevé', 'banque', 'impôt', 'avis imposition', 'crédit'] },
    { id: 'cat_health', name: 'Santé', keywords: ['ordonnance', 'mutuelle', 'CPAM', 'attestation sécu', 'carte vitale'] },
    { id: 'cat_education', name: 'Éducation', keywords: ['diplôme', 'certificat', 'attestation scolaire', 'relevé notes'] },
    { id: 'cat_family', name: 'Famille', keywords: ['acte naissance', 'livret famille', 'mariage', 'divorce', 'PACS'] },
];

// Fallback classification using keywords (when Gemini API is not available)
function classifyByKeywords(text: string): { categoryId: string; confidence: number; method: string } {
    const lowerText = text.toLowerCase();

    for (const cat of CATEGORIES) {
        for (const keyword of cat.keywords) {
            if (lowerText.includes(keyword.toLowerCase())) {
                return {
                    categoryId: cat.id,
                    confidence: 0.7,
                    method: 'keywords',
                };
            }
        }
    }

    return {
        categoryId: 'default',
        confidence: 0.3,
        method: 'keywords',
    };
}

// Classify using Gemini API
async function classifyWithGemini(text: string, apiKey: string): Promise<{ categoryId: string; confidence: number; method: string; suggestedTitle?: string }> {
    const categoryList = CATEGORIES.map(c => `- ${c.id}: ${c.name}`).join('\n');

    const prompt = `Tu es un assistant qui classe des documents administratifs français.

Analyse le texte suivant extrait d'un document scanné et détermine :
1. La catégorie la plus appropriée
2. Un titre court et descriptif pour ce document

Catégories disponibles :
${categoryList}
- default: Autre (si aucune catégorie ne correspond)

Texte du document :
"""
${text.substring(0, 2000)}
"""

Réponds UNIQUEMENT au format JSON suivant, sans aucun texte avant ou après :
{
  "categoryId": "cat_xxx",
  "confidence": 0.9,
  "suggestedTitle": "Titre du document"
}`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 200,
                },
            }),
        });

        if (!response.ok) {
            console.error('Gemini API error:', response.status);
            throw new Error('Gemini API error');
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            return {
                categoryId: result.categoryId || 'default',
                confidence: result.confidence || 0.8,
                suggestedTitle: result.suggestedTitle,
                method: 'gemini',
            };
        }

        throw new Error('Invalid Gemini response format');
    } catch (error) {
        console.error('Gemini classification error:', error);
        throw error;
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const { text } = await request.json();
        // ... (rest of the logic)

        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { error: 'Le texte du document est requis' },
                { status: 400 }
            );
        }

        if (text.trim().length < 10) {
            return NextResponse.json(
                { error: 'Texte trop court pour classification' },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;

        // Try Gemini first, fallback to keywords
        if (apiKey) {
            try {
                const result = await classifyWithGemini(text, apiKey);
                return NextResponse.json({
                    success: true,
                    ...result,
                    categories: CATEGORIES.map(c => ({ id: c.id, name: c.name })),
                });
            } catch {
                // Fallback to keywords
                const result = classifyByKeywords(text);
                return NextResponse.json({
                    success: true,
                    ...result,
                    categories: CATEGORIES.map(c => ({ id: c.id, name: c.name })),
                });
            }
        } else {
            // No API key - use keywords only
            const result = classifyByKeywords(text);
            return NextResponse.json({
                success: true,
                ...result,
                categories: CATEGORIES.map(c => ({ id: c.id, name: c.name })),
            });
        }
    } catch (error) {
        console.error('Classification error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la classification' },
            { status: 500 }
        );
    }
}
