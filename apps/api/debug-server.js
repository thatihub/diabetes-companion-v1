
import 'dotenv/config';
import express from 'express';
import fs from 'fs';

fs.writeFileSync('debug.log', 'Starting debug server...\n');
console.log("Starting debug server...");
console.log("PORT from env:", process.env.PORT);

const app = express();

app.get('/', (req, res) => {
    res.send('Debug server working');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Debug Server listening on port ${PORT}`);
});
