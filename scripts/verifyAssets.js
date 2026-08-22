const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');

let missingCount = 0;

function checkPaths(file) {
  const content = fs.readFileSync(file, 'utf-8');
  const regex = /(\/avatars\/[a-zA-Z0-9_\-%\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uffef\u4e00-\u9faf\.]+|\/images\/[a-zA-Z0-9_\-%\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uffef\u4e00-\u9faf\.]+)/g;
  const matches = content.match(regex) || [];
  for (const m of matches) {
    if (m.endsWith('.webp') || m.endsWith('.png') || m.endsWith('.jpg') || m.endsWith('.svg')) {
      const clean = m.replace(/['",]/g, '');
      const full = path.join(publicDir, clean.replace(/^\//, ''));
      if (!fs.existsSync(full)) {
        console.warn('Missing asset:', clean, 'in', path.relative(rootDir, file));
        missingCount++;
      }
    }
  }
}

function scan(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory() && !['node_modules', '.next', '.git', 'out', 'scripts'].includes(f.name)) {
      scan(full);
    } else if (f.isFile() && /\.(ts|tsx)$/.test(f.name)) {
      checkPaths(full);
    }
  }
}

scan(rootDir);
console.log('Verification finished! Total missing assets:', missingCount);
