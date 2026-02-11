
import pg from 'pg';
const { Pool } = pg;

const connectionString = "postgresql://postgres.bomtkattpkvfpebpyfsk:Rajaveedhi%401000@aws-0-us-west-2.pooler.supabase.com:6543/postgres";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log("Connecting...");
        const client = await pool.connect();
        console.log("Connected.");

        console.log("Querying table existence...");
        const res = await client.query("SELECT to_regclass('public.glucose_readings');");
        console.log("Table check result:", res.rows[0]);

        if (res.rows[0].to_regclass) {
            console.log("Querying count...");
            const countRes = await client.query("SELECT count(*) FROM glucose_readings");
            console.log("Count:", countRes.rows[0]);

            console.log("Inserting test record...");
            const ins = await client.query("INSERT INTO glucose_readings (glucose_mgdl, measured_at, notes, source) VALUES (999, NOW(), 'Script Test', 'manual') RETURNING *");
            console.log("Inserted:", ins.rows[0]);
        } else {
            console.log("Table does NOT exist!");
        }

        client.release();
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await pool.end();
    }
}

run();
