/**
 * 理科・社会の問題データ（scienceData.ts / socialData.ts）の整合性を
 * ビルド前にチェックするツール。TypeScriptをその場でコンパイルして検証する。
 *
 * 実行: node scripts/checkQuestionData.js
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "kq-check-"));

execFileSync(
  "npx",
  [
    "tsc",
    "lib/scienceData.ts",
    "lib/socialData.ts",
    "--outDir", tmpDir,
    "--module", "commonjs",
    "--target", "es2020",
    "--esModuleInterop",
    "--skipLibCheck",
    "--resolveJsonModule",
  ],
  { cwd: ROOT, stdio: "inherit", shell: true }
);
// tsc の --outDir はディレクトリ構造を保持しないため .json はコピーされない。
// resolveJsonModule でコンパイルは通っても実行時の require が見つからず失敗するので、
// 生成された .js の隣に furigana JSON をコピーしておく。
fs.copyFileSync(path.join(ROOT, "lib", "scienceFurigana.json"), path.join(tmpDir, "scienceFurigana.json"));
fs.copyFileSync(path.join(ROOT, "lib", "socialFurigana.json"), path.join(tmpDir, "socialFurigana.json"));

let errors = 0;

function check(name, questions) {
  console.log(`\n=== ${name} (${questions.length}問) ===`);
  const ids = new Set();
  const words = new Set();
  let localIssues = 0;

  questions.forEach((q) => {
    if (ids.has(q.id)) {
      console.log(`❌ 重複ID: ${q.id}`);
      localIssues++;
    }
    ids.add(q.id);

    if (words.has(q.word)) {
      console.log(`❌ 重複した問題文: ${q.id} :: ${q.word}`);
      localIssues++;
    }
    words.add(q.word);

    if (!Array.isArray(q.choices) || q.choices.length !== 4) {
      console.log(`❌ 選択肢が4つではない: ${q.id}`);
      localIssues++;
    } else if (new Set(q.choices).size !== 4) {
      console.log(`❌ 選択肢が重複している: ${q.id} :: ${JSON.stringify(q.choices)}`);
      localIssues++;
    } else if (!q.choices.includes(q.reading)) {
      console.log(`❌ 正解が選択肢に含まれていない: ${q.id} :: 正解="${q.reading}"`);
      localIssues++;
    }

    if (!q.category) {
      console.log(`❌ カテゴリが未設定: ${q.id}`);
      localIssues++;
    }
    if (!q.rationale) {
      console.log(`❌ 解説（rationale）が未設定: ${q.id}`);
      localIssues++;
    }
  });

  const byGrade = {};
  questions.forEach((q) => {
    byGrade[q.grade] = (byGrade[q.grade] || 0) + 1;
  });
  console.log(`学年別: ${JSON.stringify(byGrade)}`);
  console.log(localIssues === 0 ? "✅ 問題なし" : `⚠️ ${localIssues}件の問題を検出`);
  errors += localIssues;
}

const sci = require(path.join(tmpDir, "scienceData.js")).SCIENCE_QUESTIONS;
const soc = require(path.join(tmpDir, "socialData.js")).SOCIAL_QUESTIONS;
check("理科", sci);
check("社会", soc);

fs.rmSync(tmpDir, { recursive: true, force: true });

console.log(`\n--- 結果: エラー ${errors}件 ---`);
if (errors > 0) process.exit(1);
