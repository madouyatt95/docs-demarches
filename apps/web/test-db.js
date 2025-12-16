require('dotenv').config();
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;
console.log('Testing connection to:', connectionString.replace(/:[^:@]+@/, ':****@'));

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

client.connect()
    .then(() => {
        console.log('✅ Connected successfully!');
        return client.query('SELECT version()');
    })
    .then(result => {
        console.log('PostgreSQL version:', result.rows[0].version);
        client.end();
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    });
