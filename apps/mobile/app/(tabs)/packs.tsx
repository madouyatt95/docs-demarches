// ============================================
// DOCSBOX MOBILE - Packs Screen
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

const templates = [
    { id: 'location', name: 'Dossier Location', icon: '🏠', color: '#10B981' },
    { id: 'ecole', name: 'Inscription École', icon: '🎓', color: '#8B5CF6' },
    { id: 'banque', name: 'Ouverture Compte', icon: '🏦', color: '#3B82F6' },
];

const mockPacks = [
    { id: '1', name: 'Dossier Location', template: 'location', documentCount: 5, date: '01/12/2024' },
    { id: '2', name: 'Inscription École Maternelle', template: 'ecole', documentCount: 3, date: '15/11/2024' },
];

export default function PacksScreen() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Templates */}
            <Text style={styles.sectionTitle}>Créer rapidement</Text>
            <View style={styles.templatesGrid}>
                {templates.map((t) => (
                    <TouchableOpacity key={t.id} style={styles.templateCard}>
                        <View style={[styles.templateIcon, { backgroundColor: t.color + '20' }]}>
                            <Text style={styles.templateEmoji}>{t.icon}</Text>
                        </View>
                        <Text style={styles.templateName}>{t.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Packs */}
            <Text style={styles.sectionTitle}>Mes packs ({mockPacks.length})</Text>
            {mockPacks.map((pack) => (
                <TouchableOpacity key={pack.id} style={styles.packCard}>
                    <View style={[styles.packIcon, { backgroundColor: '#DBEAFE' }]}>
                        <Ionicons name="albums" size={24} color="#3B82F6" />
                    </View>
                    <View style={styles.packContent}>
                        <Text style={styles.packTitle}>{pack.name}</Text>
                        <Text style={styles.packSubtitle}>{pack.documentCount} documents • {pack.date}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                </TouchableOpacity>
            ))}

            {/* Empty state if no packs */}
            {mockPacks.length === 0 && (
                <View style={styles.emptyState}>
                    <Ionicons name="albums-outline" size={48} color="#D1D5DB" />
                    <Text style={styles.emptyTitle}>Aucun pack</Text>
                    <Text style={styles.emptySubtitle}>Créez un pack en choisissant un template</Text>
                </View>
            )}
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
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
        marginTop: 8,
    },
    templatesGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    templateCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    templateIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    templateEmoji: {
        fontSize: 28,
    },
    templateName: {
        fontSize: 12,
        fontWeight: '500',
        color: '#374151',
        textAlign: 'center',
    },
    packCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    packIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    packContent: {
        flex: 1,
    },
    packTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    packSubtitle: {
        fontSize: 13,
        color: '#6B7280',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
});
