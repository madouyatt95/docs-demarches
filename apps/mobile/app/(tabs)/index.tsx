// ============================================
// DOCSBOX MOBILE - Documents Screen (Simplified)
// ============================================

import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Mock data
const mockDocuments = [
    { id: '1', title: "Carte d'identité", category: 'Identité', categoryColor: '#3B82F6', expiration: '15/03/2025', expiresIn: 90 },
    { id: '2', title: "Attestation assurance habitation", category: 'Logement', categoryColor: '#10B981', expiration: '01/01/2025', expiresIn: -15 },
    { id: '3', title: 'Bulletin de salaire - Dec 2024', category: 'Travail', categoryColor: '#8B5CF6', expiration: null, expiresIn: null },
    { id: '4', title: 'Carte grise Peugeot 308', category: 'Véhicule', categoryColor: '#F59E0B', expiration: '01/06/2026', expiresIn: 530 },
    { id: '5', title: "Avis d'imposition 2024", category: 'Finance', categoryColor: '#EF4444', expiration: null, expiresIn: null },
];

const categories = ['Tous', 'Identité', 'Logement', 'Travail', 'Véhicule', 'Finance'];

export default function DocumentsScreen() {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tous');
    const [refreshing, setRefreshing] = useState(false);

    const filteredDocs = mockDocuments.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'Tous' || doc.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    return (
        <View style={styles.container}>
            {/* Search */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher..."
                    placeholderTextColor="#9CA3AF"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* Categories */}
            <FlatList
                horizontal
                data={categories}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                style={styles.categoryList}
                contentContainerStyle={styles.categoryContent}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.categoryChip,
                            selectedCategory === item && styles.categoryChipActive,
                        ]}
                        onPress={() => setSelectedCategory(item)}
                    >
                        <Text
                            style={[
                                styles.categoryChipText,
                                selectedCategory === item && styles.categoryChipTextActive,
                            ]}
                        >
                            {item}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            {/* Documents */}
            <FlatList
                data={filteredDocs}
                keyExtractor={(item) => item.id}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card}>
                        <View style={[styles.cardIcon, { backgroundColor: item.categoryColor + '20' }]}>
                            <Ionicons name="document-text" size={24} color={item.categoryColor} />
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                            <Text style={styles.cardSubtitle}>{item.category}</Text>
                        </View>
                        {item.expiresIn !== null && (
                            <View style={[
                                styles.expirationBadge,
                                item.expiresIn <= 0 ? styles.expiredBadge :
                                    item.expiresIn <= 30 ? styles.warningBadge : null
                            ]}>
                                <Text style={[
                                    styles.expirationText,
                                    item.expiresIn <= 0 ? styles.expiredText :
                                        item.expiresIn <= 30 ? styles.warningText : null
                                ]}>
                                    {item.expiresIn <= 0 ? 'Expiré' : `${item.expiresIn}j`}
                                </Text>
                            </View>
                        )}
                        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
                        <Text style={styles.emptyTitle}>Aucun document</Text>
                        <Text style={styles.emptySubtitle}>Ajoutez votre premier document</Text>
                    </View>
                }
            />

            {/* FAB */}
            <TouchableOpacity style={styles.fab}>
                <Ionicons name="add" size={28} color="#ffffff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#111827',
    },
    categoryList: {
        maxHeight: 50,
    },
    categoryContent: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        marginRight: 8,
    },
    categoryChipActive: {
        backgroundColor: '#3B82F6',
    },
    categoryChipText: {
        color: '#6B7280',
        fontWeight: '500',
        fontSize: 14,
    },
    categoryChipTextActive: {
        color: '#ffffff',
    },
    list: {
        flex: 1,
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    card: {
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
    cardIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 13,
        color: '#6B7280',
    },
    expirationBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 8,
        backgroundColor: '#F3F4F6',
    },
    warningBadge: {
        backgroundColor: '#FEF3C7',
    },
    expiredBadge: {
        backgroundColor: '#FEE2E2',
    },
    expirationText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
    },
    warningText: {
        color: '#D97706',
    },
    expiredText: {
        color: '#DC2626',
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
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
