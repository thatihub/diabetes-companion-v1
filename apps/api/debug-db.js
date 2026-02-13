import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, './.env') });

const { Pool } = pg;
const DATABASE_URL = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        console.log("Checking table count...");
        const res = await pool.query('SELECT COUNT(*) FROM glucose_readings;');
        console.log('Row count:', res.rows[0].count);

        console.log("Checking last 1 row...");
        const res2 = await pool.query('SELECT * FROM glucose_readings ORDER BY measured_at DESC LIMIT 1;');
        console.log('Last point:', res2.rows[0]);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

check();
