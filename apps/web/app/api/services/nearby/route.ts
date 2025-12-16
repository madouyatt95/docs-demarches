// ============================================
// DOCSBOX API - Nearby Services (Simple Version)
// ============================================

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface ServiceResult {
    id: string;
    name: string;
    type: string;
    address: string;
    postalCode: string;
    city: string;
    phone?: string;
    url?: string;
}

// Service type labels
const typeLabels: Record<string, string> = {
    'mairie': 'Mairie',
    'prefecture': 'Préfecture',
    'sous_prefecture': 'Sous-préfecture',
    'caf': 'CAF',
    'cpam': 'CPAM',
    'pole_emploi': 'France Travail',
    'tresorerie': 'Trésorerie',
    'tribunal': 'Tribunal',
};

// GET /api/services/nearby?postalCode=75001&type=mairie
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'mairie';
    const postalCode = searchParams.get('postalCode') || '';

    console.log('[Services API] Request:', { type, postalCode });

    try {
        const typeLabel = typeLabels[type] || 'Service public';

        // Get city name from postal code using geo.api.gouv.fr
        let cityName = '';

        if (postalCode) {
            try {
                const geoUrl = `https://geo.api.gouv.fr/communes?codePostal=${postalCode}&fields=nom&limit=1`;
                const geoRes = await fetch(geoUrl);

                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    if (geoData.length > 0) {
                        cityName = geoData[0].nom;
                    }
                }
            } catch (e) {
                console.log('[Services API] Could not resolve city name');
            }
        }

        // If we couldn't get city name, use postal code
        const location = cityName || postalCode || 'Paris';
        const searchQuery = `${typeLabel} ${location}`;

        // Generate helpful results with Google Maps links
        const services: ServiceResult[] = [
            {
                id: '1',
                name: `${typeLabel} de ${location}`,
                type: type,
                address: `Rechercher sur Google Maps`,
                postalCode: postalCode,
                city: location,
                phone: null,
                url: `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`,
            },
        ];

        // Add nearby alternatives based on type
        if (type === 'mairie') {
            services.push({
                id: '2',
                name: `Services municipaux ${location}`,
                type: 'mairie',
                address: 'Autres services de la mairie',
                postalCode: postalCode,
                city: location,
                url: `https://www.google.com/maps/search/${encodeURIComponent(`mairie annexe ${location}`)}`,
            });
        }

        if (type === 'prefecture' || type === 'sous_prefecture') {
            services.push({
                id: '2',
                name: `Point numérique`,
                type: type,
                address: 'Aide aux démarches en ligne',
                postalCode: postalCode,
                city: location,
                url: `https://www.google.com/maps/search/${encodeURIComponent(`france services ${location}`)}`,
            });
        }

        console.log('[Services API] Returning', services.length, 'services for', location);

        return NextResponse.json({
            services,
            total: services.length,
            searchType: type,
            city: location,
        });

    } catch (error: any) {
        console.error('[Services API] Error:', error);

        // Always return something useful
        return NextResponse.json({
            services: [{
                id: 'fallback',
                name: `Rechercher ${typeLabels[type] || 'service'}`,
                type: type,
                address: 'Ouvrir Google Maps',
                postalCode: postalCode,
                city: postalCode,
                url: `https://www.google.com/maps/search/${encodeURIComponent(typeLabels[type] + ' ' + postalCode)}`,
            }],
            total: 1,
            searchType: type,
        });
    }
}
