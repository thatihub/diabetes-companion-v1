import './src/env-setup.js';
import { pool } from './src/db.js';

console.log('✅ db.js loaded successfully');
console.log('Pool:', typeof pool);

// Keep alive for 3 seconds to see if it hangs
setTimeout(() => {
    console.log('✅ Still running after 3 seconds - no hang!');
    process.exit(0);
}, 3000);
