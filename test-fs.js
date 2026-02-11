const fs = require('fs');
try {
    const data = fs.readFileSync('package.json', 'utf8');
    console.log('Successfully read package.json, length:', data.length);
} catch (err) {
    console.error('Failed to read package.json:', err);
}
