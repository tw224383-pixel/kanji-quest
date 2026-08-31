/**
 * public/images/themes に置いた元画像（.jfif/.jpg/.png）を、
 * 既存の背景テーマと同じ 1376px幅の WebP に変換する。
 *
 * Firebase Hosting の無料枠（10GiB/月）を一度使い切っているため、
 * 画質を保ちつつ転送量をできるだけ小さくするのが目的。
 * 元画像は 2816x1536・1枚3〜6MB あるので、そのままでは到底載せられない。
 *
 *   使い方: node scripts/convertThemeImages.js
 *   （変換後、元のjfif/jpgは手動で削除するかリポジトリに含めない）
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "public", "images", "themes");
const WIDTH = 1376;   // 既存の背景画像と同じ幅
const QUALITY = 72;   // 実測で 130〜190KB。既存(164〜349KB)より軽く、見た目の劣化はほぼ分からない

// 日本語のファイル名 → テーマID
const NAME_TO_ID = {
  "月夜の竹林": "moonlight_bamboo",
  "嵐の大海原": "storm_sea",
  "砂漠の星夜": "desert_night",
  "天空鉄道": "sky_railway",
  "ネオンアーケード": "neon_arcade",
  "雪明りの里": "snow_village",
  "雪あかりの里": "snow_village",
  "氷晶の宮殿": "crystal_palace",
  "不死鳥の空": "phoenix_sky",
  "夢幻の星雲": "dream_nebula",
  "黄金の神殿": "golden_shrine",
  "星海の竜宮": "celestial_dragon",
  "万象の始まり": "origin_of_all",
};

(async () => {
  const files = fs.readdirSync(DIR).filter(f => /\.(jfif|jpg|jpeg|png)$/i.test(f));
  if (files.length === 0) {
    console.log("変換対象の元画像がありません（すでに変換済みです）");
    return;
  }
  let total = 0;
  for (const file of files) {
    const base = path.basename(file, path.extname(file));
    const id = NAME_TO_ID[base];
    if (!id) {
      console.log(`⚠️  ${file}: 対応するテーマIDが不明なのでスキップしました`);
      continue;
    }
    const out = path.join(DIR, `bg_${id}.webp`);
    const buf = await sharp(path.join(DIR, file))
      .resize(WIDTH)
      .webp({ quality: QUALITY, effort: 6, smartSubsample: true })
      .toBuffer();
    fs.writeFileSync(out, buf);
    total += buf.length;
    const before = fs.statSync(path.join(DIR, file)).size;
    console.log(
      `✅ ${file} → bg_${id}.webp  ` +
      `${(before / 1048576).toFixed(1)}MB → ${(buf.length / 1024).toFixed(0)}KB`
    );
  }
  console.log(`\n合計: ${(total / 1024).toFixed(0)}KB`);
})();
