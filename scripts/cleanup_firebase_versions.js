/**
 * Firebase Hosting 古いバージョン一括削除スクリプト
 * 最新リリース1件以外の全バージョンを削除してストレージを解放する
 */

const https = require('https');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');

const SITE_ID = 'kanji-quest-b1a45';
const CONFIG_PATH = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');

// アクセストークン取得
function getTokens() {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  return config.tokens;
}

// HTTPSリクエストのラッパー
function apiRequest(method, path, accessToken, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'firebasehosting.googleapis.com',
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data ? JSON.parse(data) : {});
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// アクセストークンをリフレッシュ
async function refreshAccessToken(tokens) {
  return new Promise((resolve, reject) => {
    const postData = `client_id=${tokens.client_id || '563584335869-fgurhfldacm.apps.googleusercontent.com'}&client_secret=${tokens.client_secret || 'j9iVZfS8uo'}&refresh_token=${tokens.refresh_token}&grant_type=refresh_token`;
    
    const options = {
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const parsed = JSON.parse(data);
        if (parsed.access_token) {
          resolve(parsed.access_token);
        } else {
          reject(new Error('Failed to get access token: ' + data));
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('🔑 Getting access token...');
  const tokens = getTokens();
  console.log('Token keys:', Object.keys(tokens));
  
  let accessToken;
  
  // まずaccess_tokenを試す、なければrefresh
  if (tokens.access_token) {
    accessToken = tokens.access_token;
  } else if (tokens.refresh_token) {
    console.log('Refreshing token...');
    try {
      accessToken = await refreshAccessToken(tokens);
      console.log('✅ Token refreshed successfully');
    } catch(e) {
      console.error('Token refresh failed:', e.message);
      // firebase CLIから直接試みる
      console.log('Trying firebase CLI method...');
      process.exit(1);
    }
  } else {
    console.error('No tokens found');
    process.exit(1);
  }

  console.log('\n📋 Fetching releases list...');
  try {
    const releasesData = await apiRequest(
      'GET',
      `/v1beta1/sites/${SITE_ID}/releases?pageSize=100`,
      accessToken
    );
    
    const releases = releasesData.releases || [];
    console.log(`Found ${releases.length} releases`);
    
    // リリースを表示
    releases.forEach((r, i) => {
      const date = r.releaseTime ? new Date(r.releaseTime).toLocaleString('ja-JP') : 'unknown';
      const versionId = r.version?.name?.split('/').pop() || 'N/A';
      const status = r.version?.status || 'unknown';
      console.log(`  [${i}] ${date} | ${status} | version: ${versionId}`);
    });
    
    if (releases.length <= 1) {
      console.log('✅ Only 1 release, nothing to delete');
      return;
    }
    
    // 最新1件以外を削除
    const toDelete = releases.slice(1); // index 0が最新
    console.log(`\n🗑️  Deleting ${toDelete.length} old versions...`);
    
    let deleted = 0;
    let failed = 0;
    
    for (const release of toDelete) {
      const versionName = release.version?.name;
      if (!versionName) {
        console.log('  ⚠️  No version name, skipping');
        continue;
      }
      
      const status = release.version?.status;
      // CLONEDやDELETEDは既に実体なし
      if (status === 'CLONED' || status === 'DELETED') {
        console.log(`  ⏭️  Skipping ${status} version`);
        continue;
      }
      
      const versionId = versionName.split('/').pop();
      try {
        await apiRequest('DELETE', `/v1beta1/${versionName}`, accessToken);
        console.log(`  ✅ Deleted: ${versionId} (${status})`);
        deleted++;
        await new Promise(r => setTimeout(r, 200)); // rate limit対策
      } catch(e) {
        console.log(`  ❌ Failed to delete ${versionId}: ${e.message}`);
        failed++;
      }
    }
    
    console.log(`\n✨ Done! Deleted: ${deleted}, Failed: ${failed}`);
    
  } catch(e) {
    console.error('Error:', e.message);
    if (e.message.includes('401') || e.message.includes('403')) {
      console.log('\n⚠️  Token expired, need to refresh. Try running: firebase logout && firebase login');
    }
  }
}

main();
