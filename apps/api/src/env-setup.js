import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from apps/api root (one level up from src)
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath, override: true });

console.log("DEBUG: Env Setup Complete.");
console.log("DEBUG: Loading .env from:", envPath);
console.log("DEBUG: OpenAI Key Length:", process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0);
