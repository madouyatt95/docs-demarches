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

    try {
        let services: ServiceResult[] = [];

        // Use the French Annuaire API (service-public.fr)
        // API: https://api-lannuaire.service-public.fr
        const baseUrl = 'https://api-lannuaire.service-public.fr/api/explore/v2.1/catalog/datasets/api-lannuaire-administration/records';

        // Map our types to API types
        const typeMapping: Record<string, string> = {
            'mairie': 'mairie',
            'prefecture': 'prefecture',
            'sous_prefecture': 'sous_prefecture',
            'caf': 'caf',
            'cpam': 'cpam',
            'pole_emploi': 'pole_emploi',
            'tresorerie': 'tresorerie',
            'tribunal': 'ti',
        };

        const apiType = typeMapping[type] || 'mairie';

        let whereClause = `type_service_local="${apiType}"`;

        // If we have coordinates, search by distance
        if (lat && lng) {
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lng);

            // Use geofilter for nearby search (within 50km)
            const url = `${baseUrl}?limit=10&where=${encodeURIComponent(whereClause)}&geofilter.distance=${latitude},${longitude},50000`;

            console.log('[Services API] Fetching:', url);

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                services = (data.results || []).map((item: any) => ({
                    id: item.id || String(Math.random()),
                    name: item.nom || 'Service public',
                    type: item.type_service_local || type,
                    address: item.adresse || '',
                    postalCode: item.code_postal || '',
                    city: item.nom_commune || '',
                    phone: item.telephone || null,
                    email: item.email || null,
                    url: item.url || null,
                    latitude: item.latitude,
                    longitude: item.longitude,
                }));
            }
        } else if (postalCode) {
            // Search by postal code
            whereClause += ` AND code_postal="${postalCode}"`;
            const url = `${baseUrl}?limit=10&where=${encodeURIComponent(whereClause)}`;

            console.log('[Services API] Fetching by postal code:', url);

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                services = (data.results || []).map((item: any) => ({
                    id: item.id || String(Math.random()),
                    name: item.nom || 'Service public',
                    type: item.type_service_local || type,
                    address: item.adresse || '',
                    postalCode: item.code_postal || '',
                    city: item.nom_commune || '',
                    phone: item.telephone || null,
                    email: item.email || null,
                    url: item.url || null,
                    latitude: item.latitude,
                    longitude: item.longitude,
                }));
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

        return NextResponse.json({
            services,
            total: services.length,
            searchType: type,
        });

    } catch (error: any) {
        console.error('Error fetching services:', error);
        return NextResponse.json(
            { error: 'Failed to fetch services', details: error.message },
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
