import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

console.log('Creating pool...');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
    query_timeout: 5000,
    statement_timeout: 5000
});

console.log('Pool created, attempting query...');

const timeout = setTimeout(() => {
    console.error('❌ Query timed out after 10 seconds');
    process.exit(1);
}, 10000);

pool.query('SELECT 1 as ok')
    .then(res => {
        clearTimeout(timeout);
        console.log('✅ Query successful:', res.rows[0]);
        return pool.end();
    })
    .then(() => {
        console.log('✅ Pool ended');
        process.exit(0);
    })
    .catch(err => {
        clearTimeout(timeout);
        console.error('❌ Error:', err.message);
        pool.end().then(() => process.exit(1));
    });
