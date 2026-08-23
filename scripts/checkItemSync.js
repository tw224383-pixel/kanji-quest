/**
 * ガチャ・実績・図鑑・ショップの各データファイル間で、IDや称号の参照が
 * 食い違っていないかをビルド前にチェックするツール。
 *
 * このプロジェクトはアイテムを追加するたびに gachaData.ts / itemData.ts /
 * avatarEncyclopediaData.ts / equipmentData.ts / achievementLogic.ts のうち
 * 複数を手作業で同期させる必要があり、更新漏れが起きやすい（レビュー指摘#17）。
 * TypeScriptの型は「文字列」であることまでしかチェックできず、
 * 「その文字列が他ファイルの実データと一致しているか」は検証できないため、
 * このスクリプトで簡易的に突き合わせる。
 *
 * 実行: node scripts/checkItemSync.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

const gachaSrc = read("lib/gachaData.ts");
const itemSrc = read("lib/itemData.ts");
const achievementSrc = read("lib/achievementLogic.ts");
const encyclopediaSrc = read("lib/avatarEncyclopediaData.ts");

let errors = 0;
let warnings = 0;

function fail(msg) {
  console.log(`❌ ${msg}`);
  errors++;
}
function warn(msg) {
  console.log(`⚠️  ${msg}`);
  warnings++;
}

// --- 1. ガチャのアバターに説明文(AVATAR_DESCRIPTIONS)が漏れなく付いているか ---
const descBlockMatch = itemSrc.match(/AVATAR_DESCRIPTIONS[^{]*\{([\s\S]*?)\n\};/);
const descKeys = new Set();
if (descBlockMatch) {
  const re = /^\s*"((?:[^"\\]|\\.)*)":/gm;
  let m;
  while ((m = re.exec(descBlockMatch[1]))) descKeys.add(m[1]);
}

const gachaAvatarRe = /\{\s*id:\s*"((?:[^"\\]|\\.)*)"\s*,\s*type:\s*"avatar"\s*,\s*name:\s*"((?:[^"\\]|\\.)*)"/g;
let gm;
const gachaAvatarIds = [];
while ((gm = gachaAvatarRe.exec(gachaSrc))) {
  gachaAvatarIds.push({ id: gm[1], name: gm[2].replace(/^アバター「|」$/g, "") });
}

for (const { id, name } of gachaAvatarIds) {
  if (!descKeys.has(id) && !descKeys.has(name)) {
    fail(`ガチャのアバター "${id}"（${name}）に AVATAR_DESCRIPTIONS の説明文がありません (itemData.ts)`);
  }
}

// --- 2. achievementLogic.ts の rewardTitle が itemData.ts の achievementTitles に登録されているか ---
const achTitlesBlockMatch = itemSrc.match(/achievementTitles[^=]*=\s*\[([\s\S]*?)\n\];/);
const achTitleIds = new Set();
if (achTitlesBlockMatch) {
  const re = /id:\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(achTitlesBlockMatch[1]))) achTitleIds.add(m[1]);
}

const rewardTitleRe = /rewardTitle:\s*"((?:[^"\\]|\\.)*)"/g;
let rm;
const rewardTitles = new Set();
while ((rm = rewardTitleRe.exec(achievementSrc))) rewardTitles.add(rm[1]);

for (const title of rewardTitles) {
  if (!achTitleIds.has(title)) {
    fail(`achievementLogic.ts の rewardTitle "${title}" が itemData.ts の achievementTitles リストに未登録です`);
  }
}

// --- 3. 実績の unlocked 条件が参照している称号(userData.titles.includes(...))が、
//        実際にどこかのコードで付与されているか（付与元が見つからない = 永久に解除不可能）---
const titleGrantSources = [];
// achievementLogic.ts の rewardTitle 自体は claim 時に付与されるので「付与元あり」とみなす
for (const t of rewardTitles) titleGrantSources.push(t);
// ショップで購入できる称号(shopTitles)も付与元とみなす
const shopTitlesMatch = itemSrc.match(/shopTitles\s*=\s*\[([\s\S]*?)\n\];/);
if (shopTitlesMatch) {
  const re = /id:\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(shopTitlesMatch[1]))) titleGrantSources.push(m[1]);
}
// ガチャで排出される称号も付与元とみなす
const gachaTitleRe = /type:\s*"title"\s*,\s*name:\s*"称号「((?:[^"\\]|\\.)*)」"/g;
let tm;
while ((tm = gachaTitleRe.exec(gachaSrc))) titleGrantSources.push(tm[1]);
// ゲーム内コード（app/**）で userData.titles / newTitles に直接文字列として追加されているものも付与元とみなす
const appDir = path.join(ROOT, "app");
function collectTsxFiles(dir) {
  let out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(collectTsxFiles(full));
    else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) out.push(full);
  }
  return out;
}
const appSrc = collectTsxFiles(appDir).map((f) => fs.readFileSync(f, "utf8")).join("\n");
// 「titles」という語を含む行の中で .includes("...") されている文字列を、称号の unlock 参照とみなす
function collectTitleReferences(src) {
  const found = new Set();
  for (const line of src.split("\n")) {
    if (!/titles/.test(line)) continue;
    const re = /\.includes\(\s*[`"]([^`"$]+)[`"]/g;
    let m;
    while ((m = re.exec(line))) found.add(m[1]);
  }
  return found;
}
const referencedTitles = new Set([
  ...collectTitleReferences(appSrc),
  ...collectTitleReferences(achievementSrc),
]);
const grantSet = new Set(titleGrantSources);
const addTitleRe = /newTitles\.add\(\s*[`"]([^`"$]+)[`"]/g;
let am;
while ((am = addTitleRe.exec(appSrc))) grantSet.add(am[1]);

// テンプレートリテラルで動的に付与される称号（例: `Lv${lv}討伐隊`）をパターンとして認識する。
// 変数経由で .add() される場合もあるため、.add(...) の中身に限定せず
// ソース全体からタイトルらしきテンプレートリテラルを拾う簡易ヒューリスティック。
const templateGrantPatterns = [];
const templateAddRe = /`([^`]*\$\{[^}]+\}[^`]*(?:称号|討伐隊|マスター|勇者)[^`]*)`/g;
let tam;
while ((tam = templateAddRe.exec(appSrc))) {
  const regexStr = "^" + tam[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\$\\\{[^}]*\\\}/g, ".+") + "$";
  templateGrantPatterns.push(new RegExp(regexStr));
}
function isGranted(title) {
  if (grantSet.has(title)) return true;
  return templateGrantPatterns.some((re) => re.test(title));
}

for (const title of referencedTitles) {
  if (!isGranted(title)) {
    fail(`称号 "${title}" は unlock 条件として参照されていますが、付与するコードが見つかりません（永久に解除不可能な実績の可能性）`);
  }
}

// --- 4. ガチャ限定アバターが図鑑(avatarEncyclopediaData.ts)に登録されているか（3000PT系ガチャのみ対象） ---
const richLadiesAvatarRe = /allRichLadiesGachaItems[\s\S]*?=\s*\[([\s\S]*?)\n\];/;
const richLadiesBlock = gachaSrc.match(richLadiesAvatarRe);
const encGachaItemIds = new Set();
const encIdRe = /gachaItemId:\s*"((?:[^"\\]|\\.)*)"/g;
let em;
while ((em = encIdRe.exec(encyclopediaSrc))) encGachaItemIds.add(em[1]);

if (richLadiesBlock) {
  const idRe = /id:\s*"((?:[^"\\]|\\.)*)"\s*,\s*type:\s*"avatar"/g;
  let m;
  while ((m = idRe.exec(richLadiesBlock[1]))) {
    if (!encGachaItemIds.has(m[1])) {
      warn(`ふわふわガチャのアバター "${m[1]}" が avatarEncyclopediaData.ts の図鑑に見つかりません`);
    }
  }
}

console.log(`\n--- 結果: エラー ${errors}件 / 警告 ${warnings}件 ---`);
if (errors > 0) process.exit(1);
