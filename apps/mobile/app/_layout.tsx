// ============================================
// DOCSBOX MOBILE - Root Layout (Simplified)
// ============================================

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';

export default function RootLayout() {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Simuler le chargement initial
        setTimeout(() => setIsReady(true), 500);
    }, []);

    if (!isReady) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    return (
        <>
            <StatusBar style="dark" />
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: '#ffffff' },
                    headerTintColor: '#111827',
                    headerTitleStyle: { fontWeight: '600' },
                }}
            >
                <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="login"
                    options={{
                        title: 'Connexion',
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="subscription"
                    options={{
                        title: 'Premium',
                        presentation: 'modal',
                    }}
                />
            </Stack>
        </>
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
});
