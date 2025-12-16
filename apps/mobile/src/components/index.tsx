// ============================================
// DOCSBOX MOBILE - Common UI Components
// ============================================

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Document, Pack, Demarche, formatDate, daysUntil, DEFAULT_CATEGORIES } from '@docsbox/core';

const { width } = Dimensions.get('window');

// === Document Card ===
interface DocumentCardProps {
    document: Document;
    onPress: () => void;
}

export function DocumentCard({ document, onPress }: DocumentCardProps) {
    const category = DEFAULT_CATEGORIES.find(c => c.id === document.categoryId);
    const expiresIn = document.expirationDate ? daysUntil(document.expirationDate) : null;
    const isExpiringSoon = expiresIn !== null && expiresIn <= 30 && expiresIn > 0;
    const isExpired = expiresIn !== null && expiresIn <= 0;

    return (
        <TouchableOpacity style={styles.documentCard} onPress={onPress}>
            <View style={[styles.documentIcon, { backgroundColor: category?.color + '20' }]}>
                <Ionicons
                    name="document-text"
                    size={24}
                    color={category?.color || colors.primary}
                />
            </View>
            <View style={styles.documentInfo}>
                <Text style={styles.documentTitle} numberOfLines={1}>
                    {document.title}
                </Text>
                <Text style={styles.documentCategory}>
                    {category?.name || 'Non classé'}
                </Text>
            </View>
            {(isExpiringSoon || isExpired) && (
                <View style={[
                    styles.expirationBadge,
                    isExpired ? styles.expiredBadge : styles.expiringSoonBadge
                ]}>
                    <Text style={styles.expirationText}>
                        {isExpired ? 'Expiré' : `${expiresIn}j`}
                    </Text>
                </View>
            )}
            <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
        </TouchableOpacity>
    );
}

// === Pack Card ===
interface PackCardProps {
    pack: Pack & { documentCount?: number };
    onPress: () => void;
}

export function PackCard({ pack, onPress }: PackCardProps) {
    return (
        <TouchableOpacity style={styles.packCard} onPress={onPress}>
            <View style={styles.packIcon}>
                <Ionicons name="albums" size={24} color={colors.primary} />
            </View>
            <View style={styles.packInfo}>
                <Text style={styles.packTitle} numberOfLines={1}>
                    {pack.name}
                </Text>
                <Text style={styles.packSubtitle}>
                    {pack.documentCount ?? 0} document(s)
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
        </TouchableOpacity>
    );
}

// === Demarche Card ===
interface DemarcheCardProps {
    demarche: Demarche & { missingPiecesCount?: number; completedSteps?: number; totalSteps?: number };
    onPress: () => void;
}

const statusLabels: Record<string, { label: string; color: string }> = {
    draft: { label: 'À préparer', color: colors.gray500 },
    in_progress: { label: 'En cours', color: colors.primary },
    sent: { label: 'Envoyée', color: colors.warning },
    waiting: { label: 'En attente', color: colors.warning },
    completed: { label: 'Terminée', color: colors.success },
};

export function DemarcheCard({ demarche, onPress }: DemarcheCardProps) {
    const status = statusLabels[demarche.status] || statusLabels.draft;
    const progress = demarche.totalSteps
        ? (demarche.completedSteps || 0) / demarche.totalSteps
        : 0;

    return (
        <TouchableOpacity style={styles.demarcheCard} onPress={onPress}>
            <View style={styles.demarcheHeader}>
                <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                    <Text style={[styles.statusText, { color: status.color }]}>
                        {status.label}
                    </Text>
                </View>
                {(demarche.missingPiecesCount ?? 0) > 0 && (
                    <View style={styles.missingBadge}>
                        <Text style={styles.missingBadgeText}>
                            {demarche.missingPiecesCount} pièce(s) manquante(s)
                        </Text>
                    </View>
                )}
            </View>
            <Text style={styles.demarcheTitle}>{demarche.title}</Text>
            {demarche.totalSteps && (
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                    </View>
                    <Text style={styles.progressText}>
                        {demarche.completedSteps || 0}/{demarche.totalSteps}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

// === Empty State ===
interface EmptyStateProps {
    icon: string;
    title: string;
    description: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
    return (
        <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
                <Ionicons name={icon as any} size={48} color={colors.gray300} />
            </View>
            <Text style={styles.emptyTitle}>{title}</Text>
            <Text style={styles.emptyDescription}>{description}</Text>
        </View>
    );
}

// === Floating Action Button ===
interface FloatingActionButtonProps {
    icon: string;
    onPress: () => void;
}

export function FloatingActionButton({ icon, onPress }: FloatingActionButtonProps) {
    return (
        <TouchableOpacity style={styles.fab} onPress={onPress}>
            <Ionicons name={icon as any} size={28} color="#ffffff" />
        </TouchableOpacity>
    );
}

// === Category Filter ===
interface CategoryFilterProps {
    selectedCategory: string | null;
    onSelectCategory: (category: string | null) => void;
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
    return (
        <View style={styles.categoryFilter}>
            <TouchableOpacity
                style={[
                    styles.categoryChip,
                    !selectedCategory && styles.categoryChipActive,
                ]}
                onPress={() => onSelectCategory(null)}
            >
                <Text style={[
                    styles.categoryChipText,
                    !selectedCategory && styles.categoryChipTextActive,
                ]}>
                    Tous
                </Text>
            </TouchableOpacity>
            {DEFAULT_CATEGORIES.slice(0, 5).map((category) => (
                <TouchableOpacity
                    key={category.id}
                    style={[
                        styles.categoryChip,
                        selectedCategory === category.id && styles.categoryChipActive,
                        selectedCategory === category.id && { backgroundColor: category.color },
                    ]}
                    onPress={() => onSelectCategory(category.id)}
                >
                    <Text style={[
                        styles.categoryChipText,
                        selectedCategory === category.id && styles.categoryChipTextActive,
                    ]}>
                        {category.name}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

// === Lock Screen ===
interface LockScreenProps {
    onUnlock: () => Promise<boolean>;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
    const [pin, setPin] = React.useState('');
    const [error, setError] = React.useState(false);

    React.useEffect(() => {
        // Tenter le déverrouillage biométrique au chargement
        onUnlock();
    }, []);

    const handlePinPress = (digit: string) => {
        if (pin.length < 6) {
            const newPin = pin + digit;
            setPin(newPin);
            setError(false);

            if (newPin.length === 4 || newPin.length === 6) {
                // TODO: Vérifier le PIN
            }
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
        setError(false);
    };

    return (
        <View style={styles.lockScreen}>
            <Ionicons name="lock-closed" size={48} color={colors.primary} />
            <Text style={styles.lockTitle}>Déverrouiller DocsBox</Text>

            <View style={styles.pinDots}>
                {[0, 1, 2, 3].map((i) => (
                    <View
                        key={i}
                        style={[
                            styles.pinDot,
                            pin.length > i && styles.pinDotFilled,
                            error && styles.pinDotError,
                        ]}
                    />
                ))}
            </View>

            <View style={styles.keypad}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((key) => (
                    <TouchableOpacity
                        key={key}
                        style={styles.keypadButton}
                        onPress={() => key === 'del' ? handleDelete() : key && handlePinPress(key)}
                        disabled={!key}
                    >
                        {key === 'del' ? (
                            <Ionicons name="backspace-outline" size={24} color={colors.text} />
                        ) : (
                            <Text style={styles.keypadText}>{key}</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.biometricButton} onPress={onUnlock}>
                <Ionicons name="finger-print" size={32} color={colors.primary} />
                <Text style={styles.biometricText}>Utiliser la biométrie</Text>
            </TouchableOpacity>
        </View>
    );
}

// === Placeholder Modals (à implémenter complètement) ===
export function AddDocumentModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
    if (!visible) return null;
    return (
        <View style={styles.modalPlaceholder}>
            <Text>Add Document Modal - TODO</Text>
            <TouchableOpacity onPress={onClose}><Text>Fermer</Text></TouchableOpacity>
        </View>
    );
}

export function CreatePackModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
    if (!visible) return null;
    return (
        <View style={styles.modalPlaceholder}>
            <Text>Create Pack Modal - TODO</Text>
            <TouchableOpacity onPress={onClose}><Text>Fermer</Text></TouchableOpacity>
        </View>
    );
}

export function CreateDemarcheModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
    if (!visible) return null;
    return (
        <View style={styles.modalPlaceholder}>
            <Text>Create Demarche Modal - TODO</Text>
            <TouchableOpacity onPress={onClose}><Text>Fermer</Text></TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    // Document Card
    documentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    documentIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    documentInfo: {
        flex: 1,
    },
    documentTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    documentCategory: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    expirationBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 8,
    },
    expiredBadge: {
        backgroundColor: colors.errorLight,
    },
    expiringSoonBadge: {
        backgroundColor: colors.warningLight,
    },
    expirationText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.warning,
    },

    // Pack Card
    packCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    packIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    packInfo: {
        flex: 1,
    },
    packTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    packSubtitle: {
        fontSize: 13,
        color: colors.textSecondary,
    },

    // Demarche Card
    demarcheCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
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
        backgroundColor: colors.errorLight,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    missingBadgeText: {
        fontSize: 12,
        fontWeight: '500',
        color: colors.error,
    },
    demarcheTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 12,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressBar: {
        flex: 1,
        height: 6,
        backgroundColor: colors.gray200,
        borderRadius: 3,
        marginRight: 12,
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 3,
    },
    progressText: {
        fontSize: 13,
        color: colors.textSecondary,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.gray100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    emptyDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 24,
    },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },

    // Category Filter
    categoryFilter: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    categoryChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: colors.gray100,
    },
    categoryChipActive: {
        backgroundColor: colors.primary,
    },
    categoryChipText: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.gray600,
    },
    categoryChipTextActive: {
        color: '#ffffff',
    },

    // Lock Screen
    lockScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 24,
    },
    lockTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.text,
        marginTop: 16,
        marginBottom: 32,
    },
    pinDots: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 32,
    },
    pinDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: colors.gray300,
    },
    pinDotFilled: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    pinDotError: {
        borderColor: colors.error,
        backgroundColor: colors.error,
    },
    keypad: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: 240,
        gap: 16,
        marginBottom: 32,
    },
    keypadButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.gray100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    keypadText: {
        fontSize: 24,
        fontWeight: '500',
        color: colors.text,
    },
    biometricButton: {
        alignItems: 'center',
    },
    biometricText: {
        fontSize: 14,
        color: colors.primary,
        marginTop: 8,
    },

    // Modal Placeholder
    modalPlaceholder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
