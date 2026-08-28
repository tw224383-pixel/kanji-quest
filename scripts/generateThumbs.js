/**
 * 一覧表示用サムネイル（128px webp）を生成する。
 *
 * 一覧画面（ガチャの提供割合、図鑑、ショップのタブなど）は原寸1024pxの画像を
 * 20〜120px程度に縮めて並べているだけなので、原寸を読み込むと転送量が跳ね上がる。
 * lib/itemData.ts の getAvatarThumbUrl() が `<dir>/thumbs/<file>` を参照するので、
 * ここでその実体を作る。既にあるものはスキップするので何度実行しても安全。
 *
 * 実行: node scripts/generateThumbs.js
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..", "public");
const SIZE = 128;

// 一覧に出る画像が入っているディレクトリ
const DIRS = [
  "avatars",
  "avatars/ladies",
  "images/gacha2",
  "images/gacha_equipment",
  "images/gacha_equipment_ladies",
  "images/gacha_ladies",
  "images/gacha_equip",
  "images/avatars",
];

(async () => {
  let made = 0, skipped = 0, failed = 0, savedBytes = 0;
  for (const rel of DIRS) {
    const dir = path.join(ROOT, rel);
    if (!fs.existsSync(dir)) continue;
    const thumbDir = path.join(dir, "thumbs");
    const files = fs.readdirSync(dir).filter(f => /\.(webp|png|jpg|jpeg)$/i.test(f));
    if (files.length === 0) continue;
    if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });

    for (const f of files) {
      // getAvatarThumbUrl は拡張子を変えずに thumbs/ を挟むだけなので、名前はそのまま
      const out = path.join(thumbDir, f.replace(/\.(png|jpg|jpeg)$/i, ".webp"));
      const src = path.join(dir, f);
      if (fs.existsSync(out)) { skipped++; continue; }
      try {
        await sharp(src).resize(SIZE, SIZE, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 82 }).toFile(out);
        savedBytes += fs.statSync(src).size - fs.statSync(out).size;
        made++;
      } catch (e) {
        console.warn(`  変換失敗: ${rel}/${f} (${e.message})`);
        failed++;
      }
    }
  }
  console.log(`サムネイル生成: 新規 ${made} / 既存 ${skipped} / 失敗 ${failed}`);
  if (made) console.log(`新規分の削減量: ${(savedBytes / 1024 / 1024).toFixed(1)} MB 相当`);
})();
