const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();

function findOldExts(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory() && !['node_modules', '.next', '.git', 'out', 'scripts'].includes(f.name)) {
      findOldExts(full);
    } else if (f.isFile() && /\.(ts|tsx)$/.test(f.name)) {
      const content = fs.readFileSync(full, 'utf-8');
      const regex = /['"`]\/?(images|avatars)\/[^'"`\n]+\.(jpg|png)['"`]/g;
      const matches = content.match(regex) || [];
      if (matches.length > 0) {
        console.log(path.relative(rootDir, full), matches);
      }
    }
  }
}

findOldExts(rootDir);
console.log('Done scanning for old extensions.');
