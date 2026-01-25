import 'dotenv/config';
import { query } from './src/db.js';

async function check() {
    try {
        const res = await query('SELECT * FROM glucose_readings ORDER BY created_at DESC LIMIT 5');
        console.table(res.rows.map(r => ({
            id: r.id,
            glucose: r.glucose_mgdl,
            time: new Date(r.measured_at).toLocaleString(),
            notes: r.notes,
            created: new Date(r.created_at).toLocaleTimeString()
        })));
    } catch (err) {
        console.error(err);
    }
}
check();
