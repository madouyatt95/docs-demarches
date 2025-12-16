// ============================================
// DOCSBOX MOBILE - Tab Layout (Simplified)
// ============================================

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

export default function TabLayout() {
    const isPremium = false; // TODO: from auth context

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#3B82F6',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopColor: '#E5E7EB',
                    paddingTop: 8,
                    paddingBottom: 8,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
                headerStyle: {
                    backgroundColor: '#ffffff',
                },
                headerShadowVisible: false,
                headerTitleStyle: {
                    fontWeight: '600',
                    fontSize: 18,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Documents',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="folder-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="packs"
                options={{
                    title: 'Packs',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="albums-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="demarches"
                options={{
                    title: 'Démarches',
                    tabBarIcon: ({ color, size }) => (
                        <View>
                            <Ionicons name="checkbox-outline" size={size} color={color} />
                            {!isPremium && (
                                <View style={styles.proBadge}>
                                    <Text style={styles.proBadgeText}>PRO</Text>
                                </View>
                            )}
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    proBadge: {
        position: 'absolute',
        top: -4,
        right: -12,
        backgroundColor: '#F59E0B',
        borderRadius: 4,
        paddingHorizontal: 4,
        paddingVertical: 1,
    },
    proBadgeText: {
        color: '#ffffff',
        fontSize: 8,
        fontWeight: '700',
    },
});
