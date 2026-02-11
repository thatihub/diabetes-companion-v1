import pg from 'pg';
const { Pool } = pg;

const DATABASE_URL = 'postgresql://postgres.bomtkattpkvfpebpyfsk:Rajaveedhi%401000@aws-0-us-east-1.pooler.supabase.com:5432/postgres';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function test() {
    console.log('Testing US-EAST-1 Pooler PORT 5432...');
    try {
        const res = await pool.query('SELECT now();');
        console.log('✅ SUCCESS!');
    } catch (err) {
        console.error('❌ FAILED!', err.message);
    } finally {
        await pool.end();
    }
}

test();
