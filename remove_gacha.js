const fs = require('fs');
let content = fs.readFileSync('lib/gachaData.ts', 'utf8');

// Find all lines with gacha_ and remove them, or parse and remove.
// Since it's a JS array, we can safely just remove lines that match `{ id: "gacha_`
const lines = content.split('\n');
const newLines = lines.filter(line => !line.includes('id: "gacha_'));

fs.writeFileSync('lib/gachaData.ts', newLines.join('\n'), 'utf8');
