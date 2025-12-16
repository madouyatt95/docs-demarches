// ============================================
// DOCSBOX MOBILE - Paywall Screen Component
// ============================================

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { PRICING } from '@docsbox/core';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

interface PaywallScreenProps {
    onClose?: () => void;
}

export function PaywallScreen({ onClose }: PaywallScreenProps) {
    const [selectedPlan, setSelectedPlan] = React.useState<'monthly' | 'yearly'>('yearly');

    const handleSubscribe = () => {
        // TODO: Implémenter l'achat IAP
        router.push('/subscription');
    };

    const handleRestorePurchases = () => {
        // TODO: Implémenter la restauration des achats
    };

    const features = [
        { icon: 'checkbox-outline', text: 'Démarches illimitées avec checklists' },
        { icon: 'alert-circle-outline', text: 'Vue des pièces manquantes' },
        { icon: 'notifications-outline', text: 'Relances automatiques' },
        { icon: 'folder-outline', text: 'Documents illimités' },
        { icon: 'scan-outline', text: 'OCR et recherche texte' },
        { icon: 'link-outline', text: 'Liens de partage sécurisés' },
        { icon: 'cloud-outline', text: 'Synchronisation multi-appareils' },
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            {onClose && (
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close" size={28} color={colors.text} />
                </TouchableOpacity>
            )}

            {/* Hero */}
            <View style={styles.hero}>
                <View style={styles.iconContainer}>
                    <LinearGradient
                        colors={['#3B82F6', '#8B5CF6']}
                        style={styles.iconGradient}
                    >
                        <Ionicons name="rocket" size={40} color="#ffffff" />
                    </LinearGradient>
                </View>
                <Text style={styles.title}>Débloquez{'\n'}Mes Démarches</Text>
                <Text style={styles.subtitle}>
                    Simplifiez toutes vos démarches administratives avec des checklists intelligentes
                </Text>
            </View>

            {/* Features */}
            <View style={styles.featuresContainer}>
                {features.map((feature, index) => (
                    <View key={index} style={styles.featureRow}>
                        <View style={styles.featureIcon}>
                            <Ionicons name={feature.icon as any} size={20} color={colors.primary} />
                        </View>
                        <Text style={styles.featureText}>{feature.text}</Text>
                    </View>
                ))}
            </View>

            {/* Plans */}
            <View style={styles.plansContainer}>
                <TouchableOpacity
                    style={[
                        styles.planCard,
                        selectedPlan === 'yearly' && styles.planCardSelected,
                    ]}
                    onPress={() => setSelectedPlan('yearly')}
                >
                    <View style={styles.planBadge}>
                        <Text style={styles.planBadgeText}>-58%</Text>
                    </View>
                    <View style={styles.planRadio}>
                        {selectedPlan === 'yearly' && (
                            <View style={styles.planRadioInner} />
                        )}
                    </View>
                    <View style={styles.planInfo}>
                        <Text style={styles.planName}>Annuel</Text>
                        <Text style={styles.planPrice}>
                            {PRICING.yearly.price.toFixed(2).replace('.', ',')} €/an
                        </Text>
                        <Text style={styles.planDetail}>
                            soit {(PRICING.yearly.price / 12).toFixed(2).replace('.', ',')} €/mois
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.planCard,
                        selectedPlan === 'monthly' && styles.planCardSelected,
                    ]}
                    onPress={() => setSelectedPlan('monthly')}
                >
                    <View style={styles.planRadio}>
                        {selectedPlan === 'monthly' && (
                            <View style={styles.planRadioInner} />
                        )}
                    </View>
                    <View style={styles.planInfo}>
                        <Text style={styles.planName}>Mensuel</Text>
                        <Text style={styles.planPrice}>
                            {PRICING.monthly.price.toFixed(2).replace('.', ',')} €/mois
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* CTA */}
            <TouchableOpacity style={styles.ctaButton} onPress={handleSubscribe}>
                <Text style={styles.ctaButtonText}>Essayer Premium</Text>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity onPress={handleRestorePurchases}>
                    <Text style={styles.restoreText}>Restaurer mes achats</Text>
                </TouchableOpacity>
                <Text style={styles.legalText}>
                    L'abonnement sera renouvelé automatiquement sauf si vous l'annulez au moins 24h avant la fin de la période en cours.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        padding: 24,
        paddingTop: 60,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
        padding: 8,
    },
    hero: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconContainer: {
        marginBottom: 24,
    },
    iconGradient: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    featuresContainer: {
        backgroundColor: colors.gray50,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    featureIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    featureText: {
        flex: 1,
        fontSize: 15,
        color: colors.text,
    },
    plansContainer: {
        gap: 12,
        marginBottom: 24,
    },
    planCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 2,
        borderColor: colors.gray200,
    },
    planCardSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
    },
    planBadge: {
        position: 'absolute',
        top: -10,
        right: 16,
        backgroundColor: '#10B981',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    planBadgeText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '700',
    },
    planRadio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    planRadioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.primary,
    },
    planInfo: {
        flex: 1,
    },
    planName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    planPrice: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.primary,
    },
    planDetail: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 2,
    },
    ctaButton: {
        backgroundColor: colors.primary,
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        marginBottom: 24,
    },
    ctaButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '700',
    },
    footer: {
        alignItems: 'center',
    },
    restoreText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '500',
        marginBottom: 16,
    },
    legalText: {
        fontSize: 11,
        color: colors.textTertiary,
        textAlign: 'center',
        lineHeight: 16,
    },
});
