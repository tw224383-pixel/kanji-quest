/**
 * Firebase Hosting 古いバージョン一括削除スクリプト
 * 最新リリース以外の全バージョンを削除してストレージを解放する
 */

const { execSync } = require('child_process');
const https = require('https');

const SITE_ID = 'kanji-quest-b1a45';

// Firebase CLIからアクセストークンを取得
function getAccessToken() {
  try {
    // firebase CLIのキャッシュからトークンを取得
    const result = execSync('firebase --version 2>&1', { encoding: 'utf8' });
    console.log('Firebase CLI version:', result.trim());
  } catch (e) {}

  // firebase-toolsのconfig場所を探す
  const os = require('os');
  const path = require('path');
  const fs = require('fs');

  const possiblePaths = [
    path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json'),
    path.join(os.homedir(), 'AppData', 'Roaming', 'firebase-tools', 'credentials.json'),
    path.join(os.homedir(), '.config', 'firebase-tools.json'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      console.log('Found Firebase config at:', p);
      const data = JSON.parse(fs.readFileSync(p, 'utf8'));
      console.log('Config keys:', Object.keys(data));
      return data;
    }
  }

  // Windowsでの別の探し方
  try {
    const localAppData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
    const dirs = fs.readdirSync(localAppData).filter(d => d.includes('firebase') || d.includes('configstore'));
    console.log('Found in AppData:', dirs);
    for (const dir of dirs) {
      const full = path.join(localAppData, dir);
      if (fs.statSync(full).isDirectory()) {
        const files = fs.readdirSync(full).filter(f => f.includes('firebase'));
        console.log(`  ${dir}:`, files);
        for (const file of files) {
          const fp = path.join(full, file);
          try {
            const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
            console.log(`  Keys in ${file}:`, Object.keys(data));
          } catch(e) {}
        }
      }
    }
  } catch(e) {
    console.log('AppData scan error:', e.message);
  }
}

getAccessToken();
