
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log('--- Users ---');
    const { data: users, error: err0 } = await supabase.from('users').select('id, email');
    if (err0) console.error(err0);
    else {
        console.log(`Found ${users.length} users`);
        users.forEach(u => console.log(`- User: ${u.id} (${u.email})`));
    }

    console.log('\n--- Subscriptions ---');
    const { data: subs, error: err1 } = await supabase.from('push_subscriptions').select('*');
    if (err1) console.error(err1);
    else {
        console.log(`Found ${subs.length} subscriptions`);
        subs.forEach(s => console.log(`- Subscription UserID: ${s.user_id}`));
    }

    console.log('\n--- Documents with Expiry ---');
    const { data: docs, error: err2 } = await supabase.from('documents').select('id, title, expirationDate, userId').not('expirationDate', 'is', null);
    if (err2) console.error(err2);
    else {
        const now = new Date();
        docs.forEach(d => {
            const exp = new Date(d.expirationDate);
            const days = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            console.log(`- ${d.title}: expires in ${days} days (User: ${d.userId})`);
        });
    }

    console.log('\n--- Matches ---');
    if (subs && docs) {
        docs.forEach(d => {
            const match = subs.find(s => s.user_id === d.userId);
            if (match) {
                console.log(`✓ Document "${d.title}" has a matching subscription for user ${d.userId}`);
            } else {
                console.log(`✗ Document "${d.title}" has NO subscription for user ${d.userId}`);
            }
        });
    }
}

debug();
