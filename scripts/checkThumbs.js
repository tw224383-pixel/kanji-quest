/**
 * 一覧表示で使うサムネイル（getAvatarThumbUrl が指す先）が実在するか検証する。
 * 欠けているとブラウザが404を受け取り、画像が出ない or 原寸に戻ってしまうため、
 * デプロイ前にここで気づけるようにする。
 *
 * 実行: node scripts/checkThumbs.js
 */
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "thumbchk-"));
execSync(`npx tsc lib/itemData.ts lib/gachaData.ts lib/equipmentData.ts lib/avatarEncyclopediaData.ts --outDir "${tmp}" --module commonjs --target es2020 --esModuleInterop --skipLibCheck --resolveJsonModule`,
  { cwd: ROOT, stdio: "pipe" });

const itemData = require(path.join(tmp, "itemData.js"));
const gachaData = require(path.join(tmp, "gachaData.js"));

// 一覧に並ぶ画像パスを集める
const icons = new Set();
const push = (u) => { if (typeof u === "string" && u.startsWith("/")) icons.add(u); };
for (const key of Object.keys(gachaData)) {
  const v = gachaData[key];
  if (Array.isArray(v)) v.forEach(x => { if (x && x.icon) push(x.icon); if (x && Array.isArray(x.items)) x.items.forEach(i => push(i.icon)); });
}
(itemData.getAllAvatars?.() || []).forEach(a => push(a.icon));

let missing = [];
for (const icon of icons) {
  const thumb = itemData.getAvatarThumbUrl(icon);
  if (thumb === icon) continue; // サムネ対象外
  if (!fs.existsSync(path.join(ROOT, "public", thumb))) missing.push({ icon, thumb });
}

console.log(`一覧で使う画像: ${icons.size} 件 / サムネイル欠落: ${missing.length} 件`);
missing.slice(0, 20).forEach(m => console.log(`  ★ ${m.thumb}`));
if (missing.length) {
  console.log("\nscripts/generateThumbs.js を実行してください。");
  process.exit(1);
}
console.log("すべてのサムネイルが存在します。");
