// ============================================
// DOCSBOX MOBILE - Démarches Screen (Premium + Paywall)
// ============================================

import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const isPremium = false; // TODO: from auth

const templates = [
    { id: 'carte_grise', name: 'Carte grise', icon: '🚗' },
    { id: 'passeport', name: 'Passeport', icon: '🪪' },
    { id: 'demenagement', name: 'Déménagement', icon: '🚚' },
    { id: 'caf', name: 'CAF / APL', icon: '🏠' },
    { id: 'impots', name: 'Impôts', icon: '📊' },
];

const mockDemarches = [
    { id: '1', title: 'Renouvellement passeport', status: 'in_progress', progress: 40, missing: 1 },
    { id: '2', title: 'Changement carte grise', status: 'draft', progress: 0, missing: 4 },
];

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
    draft: { label: 'À préparer', color: '#6B7280', bg: '#F3F4F6' },
    in_progress: { label: 'En cours', color: '#2563EB', bg: '#DBEAFE' },
    completed: { label: 'Terminée', color: '#059669', bg: '#D1FAE5' },
};

function Paywall() {
    return (
        <ScrollView style={styles.paywall} contentContainerStyle={styles.paywallContent}>
            <LinearGradient
                colors={['#3B82F6', '#8B5CF6']}
                style={styles.paywallIcon}
            >
                <Text style={{ fontSize: 40 }}>🚀</Text>
            </LinearGradient>

            <Text style={styles.paywallTitle}>Débloquez{'\n'}Mes Démarches</Text>
            <Text style={styles.paywallSubtitle}>
                Simplifiez vos démarches avec des checklists intelligentes
            </Text>

            <View style={styles.featuresList}>
                {[
                    'Checklists prêtes à l\'emploi',
                    'Suivi des pièces manquantes',
                    'Relances automatiques',
                    '7 templates de démarches',
                    'Documents illimités',
                    'Sync multi-appareils',
                ].map((f, i) => (
                    <View key={i} style={styles.featureRow}>
                        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                        <Text style={styles.featureText}>{f}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.priceCards}>
                <View style={styles.priceCard}>
                    <Text style={styles.pricePlan}>Mensuel</Text>
                    <Text style={styles.priceAmount}>3,99 €</Text>
                    <Text style={styles.pricePeriod}>/mois</Text>
                </View>
                <View style={[styles.priceCard, styles.priceCardActive]}>
                    <View style={styles.priceBadge}>
                        <Text style={styles.priceBadgeText}>-58%</Text>
                    </View>
                    <Text style={styles.pricePlan}>Annuel</Text>
                    <Text style={styles.priceAmount}>29,99 €</Text>
                    <Text style={styles.pricePeriod}>/an</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => router.push('/subscription')}
            >
                <Text style={styles.ctaButtonText}>Essayer Premium</Text>
            </TouchableOpacity>

            <Text style={styles.legalText}>
                Annulez à tout moment • Restaurer achats
            </Text>
        </ScrollView>
    );
}

export default function DemarchesScreen() {
    if (!isPremium) {
        return <Paywall />;
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Missing pieces alert */}
            <TouchableOpacity style={styles.alertBanner}>
                <View style={styles.alertIcon}>
                    <Ionicons name="alert-circle" size={20} color="#DC2626" />
                </View>
                <Text style={styles.alertText}>5 pièce(s) manquante(s)</Text>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>

            {/* Templates */}
            <Text style={styles.sectionTitle}>Démarrer une démarche</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatesRow}>
                {templates.map((t) => (
                    <TouchableOpacity key={t.id} style={styles.templateChip}>
                        <Text style={styles.templateChipEmoji}>{t.icon}</Text>
                        <Text style={styles.templateChipText}>{t.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Demarches */}
            <Text style={styles.sectionTitle}>Mes démarches</Text>
            {mockDemarches.map((d) => {
                const status = statusLabels[d.status];
                return (
                    <TouchableOpacity key={d.id} style={styles.demarcheCard}>
                        <View style={styles.demarcheHeader}>
                            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                                <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                            </View>
                            {d.missing > 0 && (
                                <View style={styles.missingBadge}>
                                    <Text style={styles.missingText}>{d.missing} pièce(s)</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.demarcheTitle}>{d.title}</Text>
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${d.progress}%` }]} />
                            </View>
                            <Text style={styles.progressText}>{d.progress}%</Text>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    content: {
        padding: 16,
    },

    // Paywall
    paywall: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    paywallContent: {
        alignItems: 'center',
        padding: 24,
        paddingTop: 48,
    },
    paywallIcon: {
        width: 100,
        height: 100,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    paywallTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 12,
    },
    paywallSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 32,
    },
    featuresList: {
        width: '100%',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
    },
    featureText: {
        fontSize: 15,
        color: '#374151',
    },
    priceCards: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    priceCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        alignItems: 'center',
    },
    priceCardActive: {
        borderColor: '#3B82F6',
        backgroundColor: '#EFF6FF',
    },
    priceBadge: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: '#10B981',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    priceBadgeText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '700',
    },
    pricePlan: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    priceAmount: {
        fontSize: 24,
        fontWeight: '700',
        color: '#3B82F6',
    },
    pricePeriod: {
        fontSize: 12,
        color: '#6B7280',
    },
    ctaButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 16,
        paddingHorizontal: 48,
        borderRadius: 16,
        marginBottom: 16,
    },
    ctaButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '700',
    },
    legalText: {
        fontSize: 12,
        color: '#9CA3AF',
    },

    // Main content
    alertBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
        gap: 12,
    },
    alertIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FECACA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertText: {
        flex: 1,
        fontWeight: '500',
        color: '#991B1B',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
    },
    templatesRow: {
        marginBottom: 24,
    },
    templateChip: {
        backgroundColor: '#EFF6FF',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        marginRight: 12,
        minWidth: 80,
    },
    templateChipEmoji: {
        fontSize: 24,
        marginBottom: 4,
    },
    templateChipText: {
        fontSize: 11,
        fontWeight: '500',
        color: '#1E40AF',
    },
    demarcheCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    demarcheHeader: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    missingBadge: {
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    missingText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#DC2626',
    },
    demarcheTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    progressBar: {
        flex: 1,
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#3B82F6',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
});
