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
    latitude?: number;
    longitude?: number;
    distance?: number;
}

// GET /api/services/nearby?lat=xxx&lng=xxx&type=mairie
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const type = searchParams.get('type') || 'mairie';
    const postalCode = searchParams.get('postalCode');

    console.log('[Services API] Request params:', { lat, lng, type, postalCode });

    try {
        let services: ServiceResult[] = [];

        // Use the French Annuaire API
        const baseUrl = 'https://api-lannuaire.service-public.fr/api/explore/v2.1/catalog/datasets/api-lannuaire-administration/records';

        // Map our types to API types
        const typeMapping: Record<string, string> = {
            'mairie': 'mairie',
            'prefecture': 'prefecture',
            'sous_prefecture': 'sous_prefecture',
            'caf': 'caf',
            'cpam': 'cpam',
            'pole_emploi': 'pe',
            'tresorerie': 'tresorerie',
            'tribunal': 'ti',
        };

        const apiType = typeMapping[type] || 'mairie';

        // Build query
        let queryParams = new URLSearchParams();
        queryParams.set('limit', '15');

        if (postalCode) {
            // Search by postal code - simpler query
            queryParams.set('where', `code_postal="${postalCode}"`);
        } else if (lat && lng) {
            // For geo search, we'll search broadly and filter
            const dept = '75'; // Default to Paris area, will be improved
            queryParams.set('where', `type_service_local="${apiType}"`);
        } else {
            // Default search
            queryParams.set('where', `type_service_local="${apiType}"`);
        }

        const url = `${baseUrl}?${queryParams.toString()}`;
        console.log('[Services API] Fetching:', url);

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
            },
        });

        console.log('[Services API] Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Services API] Error response:', errorText);
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('[Services API] Results count:', data.total_count || data.results?.length || 0);

        // Parse results - adapt to actual API response structure
        if (data.results && Array.isArray(data.results)) {
            services = data.results.map((item: any) => {
                // The API returns nested structure
                const fields = item;
                return {
                    id: fields.id || fields.identifiant || String(Math.random()),
                    name: fields.nom || fields.name || 'Service public',
                    type: fields.type_service_local || fields.pivot_local || type,
                    address: fields.adresse || fields.adresse_courriel || '',
                    postalCode: fields.code_postal || '',
                    city: fields.nom_commune || fields.commune || '',
                    phone: fields.telephone || fields.tel || null,
                    email: fields.adresse_courriel || fields.email || null,
                    url: fields.site_internet || fields.url || null,
                    latitude: fields.latitude ? parseFloat(fields.latitude) : null,
                    longitude: fields.longitude ? parseFloat(fields.longitude) : null,
                };
            });
        }

        // Filter by type if we have results
        if (apiType && services.length > 0) {
            const filtered = services.filter(s =>
                s.type?.toLowerCase().includes(apiType.toLowerCase()) ||
                s.name?.toLowerCase().includes(apiType.toLowerCase())
            );
            if (filtered.length > 0) {
                services = filtered;
            }
        }

        // Calculate distance if we have coordinates
        if (lat && lng && services.length > 0) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);

            services = services.map(service => {
                if (service.latitude && service.longitude) {
                    service.distance = calculateDistance(
                        userLat, userLng,
                        service.latitude, service.longitude
                    );
                }
                return service;
            }).sort((a, b) => (a.distance || 999) - (b.distance || 999));
        }

        console.log('[Services API] Returning', services.length, 'services');

        return NextResponse.json({
            services,
            total: services.length,
            searchType: type,
            debug: {
                url,
                resultCount: data.results?.length,
                firstResult: data.results?.[0]
            },
        });

    } catch (error: any) {
        console.error('Error fetching services:', error);
        return NextResponse.json(
            { error: 'Failed to fetch services', details: error.message, services: [] },
            { status: 500 }
        );
    }
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Distance in km, rounded to 1 decimal
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}
