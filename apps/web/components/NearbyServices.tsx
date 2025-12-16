// ============================================
// DOCSBOX - Nearby Services Component
// ============================================

'use client';

import { useState } from 'react';

interface Service {
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

const serviceTypes = [
    { id: 'mairie', name: 'Mairie', icon: '🏛️' },
    { id: 'prefecture', name: 'Préfecture', icon: '🏢' },
    { id: 'sous_prefecture', name: 'Sous-préfecture', icon: '🏢' },
    { id: 'caf', name: 'CAF', icon: '👨‍👩‍👧' },
    { id: 'cpam', name: 'CPAM (Sécu)', icon: '🏥' },
    { id: 'pole_emploi', name: 'France Travail', icon: '💼' },
    { id: 'tresorerie', name: 'Trésorerie', icon: '💰' },
];

interface NearbyServicesProps {
    defaultType?: string;
    onClose: () => void;
}

export function NearbyServices({ defaultType = 'mairie', onClose }: NearbyServicesProps) {
    const [selectedType, setSelectedType] = useState(defaultType);
    const [postalCode, setPostalCode] = useState('');
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchMethod, setSearchMethod] = useState<'gps' | 'postal'>('gps');

    const searchByGPS = async () => {
        setIsLoading(true);
        setError(null);
        setServices([]);

        try {
            // Request geolocation permission
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                });
            });

            const { latitude, longitude } = position.coords;

            const res = await fetch(
                `/api/services/nearby?lat=${latitude}&lng=${longitude}&type=${selectedType}`
            );
            const data = await res.json();

            if (data.services) {
                setServices(data.services);
            }
        } catch (err: any) {
            if (err.code === 1) {
                setError('Géolocalisation refusée. Utilisez la recherche par code postal.');
                setSearchMethod('postal');
            } else {
                setError('Erreur lors de la recherche. Essayez par code postal.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const searchByPostalCode = async () => {
        if (!postalCode || postalCode.length !== 5) {
            setError('Entrez un code postal valide (5 chiffres)');
            return;
        }

        setIsLoading(true);
        setError(null);
        setServices([]);

        try {
            const res = await fetch(
                `/api/services/nearby?postalCode=${postalCode}&type=${selectedType}`
            );
            const data = await res.json();

            if (data.services) {
                setServices(data.services);
            }
        } catch (err) {
            setError('Erreur lors de la recherche');
        } finally {
            setIsLoading(false);
        }
    };

    const openMaps = (service: Service) => {
        const query = encodeURIComponent(`${service.name} ${service.address} ${service.city}`);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    };

    return (
        <div className="nearby-modal-backdrop" onClick={onClose}>
            <div className="nearby-modal" onClick={(e) => e.stopPropagation()}>
                <div className="nearby-header">
                    <h2>📍 Services proches</h2>
                    <button className="nearby-close" onClick={onClose}>✕</button>
                </div>

                {/* Service type selector */}
                <div className="nearby-types">
                    {serviceTypes.map((type) => (
                        <button
                            key={type.id}
                            className={`nearby-type-btn ${selectedType === type.id ? 'active' : ''}`}
                            onClick={() => setSelectedType(type.id)}
                        >
                            <span>{type.icon}</span>
                            <span>{type.name}</span>
                        </button>
                    ))}
                </div>

                {/* Search method tabs */}
                <div className="nearby-search-tabs">
                    <button
                        className={`nearby-tab ${searchMethod === 'gps' ? 'active' : ''}`}
                        onClick={() => setSearchMethod('gps')}
                    >
                        📍 Ma position
                    </button>
                    <button
                        className={`nearby-tab ${searchMethod === 'postal' ? 'active' : ''}`}
                        onClick={() => setSearchMethod('postal')}
                    >
                        ✉️ Code postal
                    </button>
                </div>

                {/* Search inputs */}
                <div className="nearby-search">
                    {searchMethod === 'gps' ? (
                        <button
                            className="nearby-gps-btn"
                            onClick={searchByGPS}
                            disabled={isLoading}
                        >
                            {isLoading ? '🔄 Recherche...' : '📍 Utiliser ma position'}
                        </button>
                    ) : (
                        <div className="nearby-postal-input">
                            <input
                                type="text"
                                placeholder="Code postal (ex: 75001)"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                                maxLength={5}
                            />
                            <button onClick={searchByPostalCode} disabled={isLoading}>
                                {isLoading ? '🔄' : '🔍'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="nearby-error">{error}</div>
                )}

                {/* Results */}
                <div className="nearby-results">
                    {services.length > 0 ? (
                        services.map((service) => (
                            <div key={service.id} className="nearby-service">
                                <div className="nearby-service-info">
                                    <h3>{service.name}</h3>
                                    <p className="nearby-service-address">
                                        {service.address}, {service.postalCode} {service.city}
                                    </p>
                                    {service.distance && (
                                        <span className="nearby-service-distance">
                                            📍 {service.distance} km
                                        </span>
                                    )}
                                    {service.phone && (
                                        <a href={`tel:${service.phone}`} className="nearby-service-phone">
                                            📞 {service.phone}
                                        </a>
                                    )}
                                </div>
                                <div className="nearby-service-actions">
                                    <button
                                        className="nearby-service-btn"
                                        onClick={() => openMaps(service)}
                                    >
                                        🗺️ Itinéraire
                                    </button>
                                    {service.url && (
                                        <a
                                            href={service.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="nearby-service-btn"
                                        >
                                            🌐 Site
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        !isLoading && !error && (
                            <p className="nearby-empty">
                                Recherchez des services proches de chez vous
                            </p>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
