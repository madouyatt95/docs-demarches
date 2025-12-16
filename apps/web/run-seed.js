// Run: node run-seed.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

async function seed() {
    console.log('\n🚀 Seeding DocsBox database...\n');

    // Seed categories
    console.log('📁 Creating categories...');
    for (const cat of defaultCategories) {
        const { error } = await supabase
            .from('categories')
            .upsert(cat, { onConflict: 'id' });

        if (error) {
            console.log(`  ❌ ${cat.name}: ${error.message}`);
        } else {
            console.log(`  ✅ ${cat.name}`);
        }
    }

    // Create demo user
    console.log('\n👤 Creating demo user...');
    const demoUser = {
        id: 'demo_user',
        email: 'demo@docsbox.app',
        passwordHash: '$2b$10$demo',
        displayName: 'Utilisateur Demo',
        biometricEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const { error: userError } = await supabase
        .from('users')
        .upsert(demoUser, { onConflict: 'id' });

    if (userError) {
        console.log(`  ❌ Demo user: ${userError.message}`);
    } else {
        console.log('  ✅ demo@docsbox.app');
    }

    // Create demo subscription
    console.log('\n💎 Creating demo subscription...');
    const demoSubscription = {
        id: 'sub_demo',
        userId: 'demo_user',
        plan: 'FREE',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const { error: subError } = await supabase
        .from('subscriptions')
        .upsert(demoSubscription, { onConflict: 'id' });

    if (subError) {
        console.log(`  ❌ Subscription: ${subError.message}`);
    } else {
        console.log('  ✅ FREE subscription');
    }

    console.log('\n✨ Seed complete!\n');
}

seed().catch(console.error);
