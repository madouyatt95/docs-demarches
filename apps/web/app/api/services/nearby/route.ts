// ============================================
// DOCSBOX API - Nearby Services (using French API)
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
    email?: string;
    url?: string;
    distance?: number;
}

// GET /api/services/nearby?postalCode=75001&type=mairie
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const type = searchParams.get('type') || 'mairie';
    const postalCode = searchParams.get('postalCode');

    console.log('[Services API] Request:', { lat, lng, type, postalCode });

    try {
        let services: ServiceResult[] = [];

        // Use geo.api.gouv.fr to get commune code from postal code
        let cityCode = '';
        let cityName = '';

        if (postalCode) {
            const geoUrl = `https://geo.api.gouv.fr/communes?codePostal=${postalCode}&fields=code,nom&limit=1`;
            console.log('[Services API] Getting city code from:', geoUrl);

            const geoRes = await fetch(geoUrl);
            if (geoRes.ok) {
                const geoData = await geoRes.json();
                if (geoData.length > 0) {
                    cityCode = geoData[0].code;
                    cityName = geoData[0].nom;
                    console.log('[Services API] Found city:', cityName, 'code:', cityCode);
                }
            }
        }

        if (!cityCode && !lat) {
            // Default to Paris 1er
            cityCode = '75101';
            cityName = 'Paris 1er';
        }

        // Map our types to API type codes
        const typeMapping: Record<string, string> = {
            'mairie': 'mairie',
            'prefecture': 'prefecture',
            'sous_prefecture': 'sous_prefecture',
            'caf': 'caf',
            'cpam': 'cpam',
            'pole_emploi': 'pole_emploi',
            'tresorerie': 'ddfip',
            'tribunal': 'ti',
        };

        const apiType = typeMapping[type] || 'mairie';

        // Use etablissements-publics API
        const baseUrl = `https://etablissements-publics.api.gouv.fr/v3/communes/${cityCode}/${apiType}`;
        console.log('[Services API] Fetching:', baseUrl);

        const response = await fetch(baseUrl, {
            headers: { 'Accept': 'application/json' },
        });

        console.log('[Services API] Response status:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('[Services API] Got data:', data.features?.length || 0, 'results');

            if (data.features && Array.isArray(data.features)) {
                services = data.features.map((feature: any) => {
                    const props = feature.properties || {};
                    const adresse = props.adresses?.[0] || {};

                    return {
                        id: props.id || String(Math.random()),
                        name: props.nom || 'Service public',
                        type: props.pivot?.[0]?.type_service_local || type,
                        address: adresse.lignes?.join(', ') || '',
                        postalCode: adresse.codePostal || postalCode || '',
                        city: adresse.commune || cityName || '',
                        phone: props.telephone || null,
                        email: props.email || null,
                        url: props.url || null,
                    };
                });
            }
        } else {
            console.log('[Services API] etablissements-publics failed, using fallback');
            // Fallback: just show city info
            services = [{
                id: cityCode,
                name: `Mairie de ${cityName || 'votre commune'}`,
                type: 'mairie',
                address: `Recherchez "${type} ${cityName}" sur Google Maps`,
                postalCode: postalCode || '',
                city: cityName || '',
                phone: null,
                email: null,
                url: `https://www.google.com/maps/search/${encodeURIComponent(type + ' ' + cityName)}`,
            }];
        }

        console.log('[Services API] Returning', services.length, 'services');

        return NextResponse.json({
            services,
            total: services.length,
            searchType: type,
        });

    } catch (error: any) {
        console.error('[Services API] Error:', error);
        return NextResponse.json({
            error: 'Failed to fetch services',
            details: error.message,
            services: [],
        });
    }
}
