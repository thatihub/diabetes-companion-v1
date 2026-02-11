import dotenv from 'dotenv';

// Load environment variables with override enabled to fix issues where
// parent shell environment (e.g. from npm run dev) injects placeholder values.
dotenv.config({ override: true });

console.log("ENV Loaded. OPENAI_API_KEY length:", process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : "N/A");
