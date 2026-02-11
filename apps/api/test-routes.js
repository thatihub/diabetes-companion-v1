import './src/env-setup.js';
import { healthRouter } from "./src/routes/health.js";
import { glucoseRouter } from "./src/routes/glucose.js";
import { insightsRouter } from "./src/routes/insights.js";
import { dexcomRouter } from "./src/routes/dexcom.js";

console.log("✅ All routes imported successfully");
console.log("Health router:", !!healthRouter);
console.log("Glucose router:", !!glucoseRouter);
console.log("Insights router:", !!insightsRouter);
console.log("Dexcom router:", !!dexcomRouter);
