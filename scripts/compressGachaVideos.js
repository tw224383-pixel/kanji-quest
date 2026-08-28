/**
 * ガチャ演出動画を再エンコードして転送量を減らす。
 *
 * 元は 1280x720 / 2300kbps / 4秒 で1本あたり約1.2MB。演出は数秒しか映らないので、
 * 画質を大きく落とさない範囲でビットレートを下げる（CRFベース）。
 * 音声は本編側の <video> がミュートではない（効果音として鳴る）ので残す。
 *
 * 実行: node scripts/compressGachaVideos.js
 * 元ファイルは <name>.orig.mp4 として同じ場所に退避する（問題があれば戻せる）。
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const ffmpeg = require("ffmpeg-static");

const DIR = path.join(__dirname, "..", "public", "videos", "gacha");
const CRF = process.env.CRF || "30";

const files = fs.readdirSync(DIR).filter(f => f.endsWith(".mp4") && !f.endsWith(".orig.mp4"));
let before = 0, after = 0;

for (const f of files) {
  const src = path.join(DIR, f);
  const backup = path.join(DIR, f.replace(/\.mp4$/, ".orig.mp4"));
  const work = fs.existsSync(backup) ? backup : src;   // 2回目以降も元画質から再エンコード
  const tmp = path.join(DIR, f.replace(/\.mp4$/, ".tmp.mp4"));

  const srcSize = fs.statSync(work).size;
  execFileSync(ffmpeg, [
    "-y", "-hide_banner", "-loglevel", "error",
    "-i", work,
    "-c:v", "libx264", "-crf", CRF, "-preset", "slow", "-profile:v", "main", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "96k",
    "-movflags", "+faststart",   // 先頭にメタデータを置き、再生開始を早くする
    tmp,
  ]);
  const outSize = fs.statSync(tmp).size;

  if (outSize >= srcSize) {
    fs.unlinkSync(tmp);
    console.log(`${f}: 小さくならなかったので据え置き (${(srcSize / 1024).toFixed(0)} KB)`);
    before += srcSize; after += srcSize;
    continue;
  }
  if (!fs.existsSync(backup)) fs.renameSync(src, backup);
  fs.renameSync(tmp, src);
  before += srcSize; after += outSize;
  console.log(`${f}: ${(srcSize / 1024).toFixed(0)} KB → ${(outSize / 1024).toFixed(0)} KB  (${(100 - outSize / srcSize * 100).toFixed(0)}% 削減)`);
}

console.log(`\n合計: ${(before / 1048576).toFixed(2)} MB → ${(after / 1048576).toFixed(2)} MB`);
console.log("問題なければ *.orig.mp4 は削除してください（配信物に含めないため）。");
