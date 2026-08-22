const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');

function updateFilePaths(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.next', '.git', 'out', 'public', '.gemini', 'scripts'].includes(entry.name)) {
        updateFilePaths(fullPath);
      }
    } else if (entry.isFile() && /\.(ts|tsx|js|jsx|json)$/.test(entry.name)) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let original = content;

      // Replace /avatars/ladies/...
      content = content.replace(/\/avatars\/ladies\/([^"'\s]+)\.png/g, '/avatars/ladies/$1.webp');
      // Replace /images/gacha2/...
      content = content.replace(/\/images\/gacha2\/([^"'\s]+)\.png/g, '/images/gacha2/$1.webp');
      // Replace /images/gacha_equipment/...
      content = content.replace(/\/images\/gacha_equipment\/([^"'\s]+)\.png/g, '/images/gacha_equipment/$1.webp');
      
      // Replace /avatars/...
      content = content.replace(/\/avatars\/([^"'\s]+)\.(jpg|png)/g, (match, p1) => {
        if (fs.existsSync(path.join(publicDir, 'avatars', p1 + '.webp'))) {
          return '/avatars/' + p1 + '.webp';
        }
        return match;
      });

      // Replace /images/themes/...
      content = content.replace(/\/images\/themes\/([^"'\s]+)\.(jpg|png)/g, (match, p1) => {
        if (fs.existsSync(path.join(publicDir, 'images', 'themes', p1 + '.webp'))) {
          return '/images/themes/' + p1 + '.webp';
        }
        return match;
      });

      // Replace /images/ui/...
      content = content.replace(/\/images\/ui\/([^"'\s]+)\.(jpg|png)/g, (match, p1) => {
        if (fs.existsSync(path.join(publicDir, 'images', 'ui', p1 + '.webp'))) {
          return '/images/ui/' + p1 + '.webp';
        }
        return match;
      });

      // Replace /images/boss/...
      content = content.replace(/\/images\/boss\/([^"'\s]+)\.(jpg|png)/g, (match, p1) => {
        if (fs.existsSync(path.join(publicDir, 'images', 'boss', p1 + '.webp'))) {
          return '/images/boss/' + p1 + '.webp';
        }
        return match;
      });

      // Replace /images/boss/cute/...
      content = content.replace(/\/images\/boss\/cute\/([^"'\s]+)\.(jpg|png)/g, (match, p1) => {
        if (fs.existsSync(path.join(publicDir, 'images', 'boss', 'cute', p1 + '.webp'))) {
          return '/images/boss/cute/' + p1 + '.webp';
        }
        return match;
      });

      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log('Updated:', path.relative(rootDir, fullPath));
      }
    }
  }
}

updateFilePaths(rootDir);
console.log('Path updates complete!');
