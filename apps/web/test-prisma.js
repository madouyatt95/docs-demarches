require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Testing Prisma connection to Supabase...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'));

    try {
        // Test connection by running a raw query
        const result = await prisma.$queryRaw`SELECT COUNT(*) as count FROM users`;
        console.log('✅ Connected successfully!');
        console.log('Users count:', result);

        // List all tables
        const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
        console.log('Tables found:', tables.map(t => t.table_name));

    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
