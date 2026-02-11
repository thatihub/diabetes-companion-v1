import './src/env-setup.js';
console.log("1. Env setup OK");

import express from "express";
console.log("2. Express imported OK");

import cors from "cors";
console.log("3. CORS imported OK");

const app = express();
console.log("4. Express app created OK");

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Test server running");
});

const PORT = 4000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Test server listening on port ${PORT}`);
});
