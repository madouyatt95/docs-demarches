// ============================================
// DOCSBOX - Seed Script for Initial Data
// ============================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Default categories
const defaultCategories = [
    { id: 'cat_identity', name: 'Identité', icon: '🪪', color: '#3B82F6', sortOrder: 1 },
    { id: 'cat_housing', name: 'Logement', icon: '🏠', color: '#10B981', sortOrder: 2 },
    { id: 'cat_work', name: 'Travail', icon: '💼', color: '#8B5CF6', sortOrder: 3 },
    { id: 'cat_vehicle', name: 'Véhicule', icon: '🚗', color: '#F59E0B', sortOrder: 4 },
    { id: 'cat_finance', name: 'Finance', icon: '💰', color: '#EF4444', sortOrder: 5 },
    { id: 'cat_health', name: 'Santé', icon: '🏥', color: '#EC4899', sortOrder: 6 },
    { id: 'cat_education', name: 'Éducation', icon: '🎓', color: '#06B6D4', sortOrder: 7 },
    { id: 'cat_other', name: 'Autre', icon: '📁', color: '#6B7280', sortOrder: 8 },
];

// Demo user
const demoUser = {
    id: 'demo_user',
    email: 'demo@docsbox.app',
    passwordHash: '$2b$10$demo', // Not a real hash, just for demo
    displayName: 'Utilisateur Demo',
    biometricEnabled: false,
};

export async function seedCategories() {
    console.log('🌱 Seeding categories...');

    for (const category of defaultCategories) {
        const { error } = await supabase
            .from('categories')
            .upsert(category, { onConflict: 'id' });

        if (error) {
            console.error(`  ❌ Error inserting ${category.name}:`, error.message);
        } else {
            console.log(`  ✅ ${category.name}`);
        }
    }
}

export async function seedDemoUser() {
    console.log('🌱 Seeding demo user...');

    const { error } = await supabase
        .from('users')
        .upsert({
            ...demoUser,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }, { onConflict: 'id' });

    if (error) {
        console.error('  ❌ Error creating demo user:', error.message);
    } else {
        console.log('  ✅ Demo user created');
    }
}

export async function seed() {
    console.log('\n🚀 Starting DocsBox seed...\n');

    await seedCategories();
    await seedDemoUser();

    console.log('\n✨ Seed complete!\n');
}

// Export for use in API routes
export { defaultCategories, supabase };
