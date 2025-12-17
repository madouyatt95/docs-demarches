// ============================================
// DOCSBOX WEB - Mindee API Route (Enhanced Document Detection)
// ============================================

import { NextRequest, NextResponse } from 'next/server';

// Mindee API endpoint
const MINDEE_API_URL = 'https://api.mindee.net/v1/products/mindee/docti/v1/predict';

interface MindeeResponse {
    document_type: string;
    extracted_fields: Record<string, any>;
    confidence: number;
}

export async function POST(request: NextRequest) {
    try {
        const apiKey = process.env.MINDEE_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Mindee API key not configured' },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Convert file to base64
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        // Call Mindee API - using Universal endpoint for auto-detection
        const mindeeFormData = new FormData();
        mindeeFormData.append('document', file);

        const response = await fetch('https://api.mindee.net/v1/products/mindee/all-docs/v1/predict', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${apiKey}`,
            },
            body: mindeeFormData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Mindee API Error]:', errorText);
            return NextResponse.json(
                { error: 'Mindee API error', details: errorText },
                { status: response.status }
            );
        }

        const result = await response.json();

        // Extract relevant information from Mindee response
        const prediction = result.document?.inference?.prediction;

        if (!prediction) {
            return NextResponse.json(
                { error: 'No prediction in response' },
                { status: 500 }
            );
        }

        // Map Mindee document types to DocsBox categories
        const documentTypeMapping: Record<string, { category: string; name: string }> = {
            'identity_document': { category: 'cat_identity', name: 'Document d\'identité' },
            'passport': { category: 'cat_identity', name: 'Passeport' },
            'id_card': { category: 'cat_identity', name: 'Carte d\'identité' },
            'driver_license': { category: 'cat_vehicle', name: 'Permis de conduire' },
            'proof_of_address': { category: 'cat_housing', name: 'Justificatif de domicile' },
            'bank_statement': { category: 'cat_finance', name: 'Relevé bancaire' },
            'payslip': { category: 'cat_work', name: 'Bulletin de salaire' },
            'invoice': { category: 'cat_finance', name: 'Facture' },
            'receipt': { category: 'cat_finance', name: 'Reçu' },
            'tax_notice': { category: 'cat_finance', name: 'Avis d\'imposition' },
        };

        // Get detected document type
        const detectedType = prediction.document_type?.value || 'unknown';
        const mapping = documentTypeMapping[detectedType] || {
            category: null,
            name: 'Document'
        };

        // Extract common fields based on document type
        const extractedFields: Record<string, any> = {};

        // Try to extract common fields
        if (prediction.given_names) {
            extractedFields.firstName = prediction.given_names[0]?.value;
        }
        if (prediction.surname) {
            extractedFields.lastName = prediction.surname?.value;
        }
        if (prediction.birth_date) {
            extractedFields.birthDate = prediction.birth_date?.value;
        }
        if (prediction.address) {
            extractedFields.address = prediction.address?.value;
        }
        if (prediction.id_number) {
            extractedFields.idNumber = prediction.id_number?.value;
        }
        if (prediction.expiry_date) {
            extractedFields.expiryDate = prediction.expiry_date?.value;
        }
        if (prediction.issue_date) {
            extractedFields.issueDate = prediction.issue_date?.value;
        }
        if (prediction.total_amount) {
            extractedFields.amount = prediction.total_amount?.value;
        }

        return NextResponse.json({
            success: true,
            detectedType,
            documentName: mapping.name,
            suggestedCategory: mapping.category,
            extractedFields,
            confidence: prediction.document_type?.confidence || 0,
            rawPrediction: prediction,
        });

    } catch (error: any) {
        console.error('[Mindee API Error]:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
