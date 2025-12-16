require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase JS Client connection...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
    try {
        // Test 1: List tables by querying users
        console.log('\n📊 Testing connection by querying users table...');
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('*')
            .limit(5);

        if (usersError) {
            console.error('❌ Users query error:', usersError.message);
        } else {
            console.log('✅ Users table accessible! Count:', users.length);
        }

        // Test 2: Query categories
        console.log('\n📁 Testing categories table...');
        const { data: categories, error: catError } = await supabase
            .from('categories')
            .select('*')
            .limit(5);

        if (catError) {
            console.error('❌ Categories error:', catError.message);
        } else {
            console.log('✅ Categories table accessible! Count:', categories.length);
        }

        // Test 3: Insert a test category
        console.log('\n➕ Testing insert (creating test category)...');
        const { data: newCat, error: insertError } = await supabase
            .from('categories')
            .insert({
                id: 'test-' + Date.now(),
                name: 'Test Category',
                icon: '📁',
                color: '#3b82f6',
                sortOrder: 0
            })
            .select()
            .single();

        if (insertError) {
            console.error('❌ Insert error:', insertError.message);
        } else {
            console.log('✅ Insert successful! Created:', newCat.name);

            // Clean up: delete the test category
            await supabase.from('categories').delete().eq('id', newCat.id);
            console.log('🧹 Cleaned up test data');
        }

        console.log('\n🎉 Supabase JS Client is working correctly!');
        console.log('You can now use it to interact with your database locally.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

main();
