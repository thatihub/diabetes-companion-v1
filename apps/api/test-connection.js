import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const DATABASE_URL = process.env.DATABASE_URL;

console.log('Testing connection to:', DATABASE_URL?.replace(/:[^:]+@/, ':****@'));

// Force TLS bypass globally for this script
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function test() {
    try {
        const res = await pool.query('SELECT now();');
        console.log('✅ SUCCESS! Database time is:', res.rows[0].now);
    } catch (err) {
        console.error('❌ FAILED!', err.message);
        if (err.code === 'XX000') {
            console.log('Hint: This is often a Tenant/User mismatch on the pooler.');
        }
    } finally {
        await pool.end();
    }
}

test();
