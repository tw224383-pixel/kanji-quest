// ふりがなモード用データ生成スクリプト（ビルド時に1回だけ実行、実行時コストはゼロ）。
// kuromoji（形態素解析）で漢字を含む語だけをひらがな読みに変換する。
//   - 理科・社会: 各設問に wordKana / readingKana / choicesKana / rationaleKana を
//     id引きできる別ファイル（lib/*Furigana.json）として出力する（元データは触らない）。
//   - 算数: 文章題テンプレートは ${a} のような変数展開を含むため、id引きではなく
//     mathData.ts の各パターン行に qKana / cKana をテンプレートリテラルとして直接
//     追記する（実行時に q と全く同じ変数展開が自動で効くので追加ロジック不要）。
//
// 実行方法: node scripts/generateFurigana.js
"use strict";
const fs = require("fs");
const path = require("path");
const kuromoji = require("kuromoji");

const dicPath = path.join(__dirname, "..", "node_modules", "kuromoji", "dict");
const KANJI_RE = /[一-鿿]/;

// 何+助数詞（何こ・何人・何時…）は「なん」と読むのが自然だが、kuromojiは単体で
// 「なに」を返すことが多いので、直後のトークンが助数詞っぽい場合だけ上書きする。
const NAN_COUNTER_RE = /^(こ|個|人|にん|台|だい|本|ほん|匹|ひき|枚|まい|回|かい|度|ど|時|じ|分|ふん|ぷん|月|がつ|日|にち|羽|わ|通り|倍|ばい|点|てん|つ|さつ|さら|皿|杯|はい|cm|km|mm|m|g|kg|t|L|dL|mL|a|ha)/;

// kuromojiの辞書(IPADIC)に載っていない歴史用語・理科の専門用語は、熟語として認識されず
// 1文字ずつ訓読みされてしまう（例: 承久→「うけたまわひさ」、元寇→「もと寇」）。
// ふりがなを必要とする子に誤った読みを教えてしまうため、既知の語はここで先に
// ひらがなへ置換してからトークナイズする（置換後はかななので kuromoji は手を出さない）。
// 長い語から順に適用するため、キーの登録順ではなく文字数で並べ替えて使う。
const TERM_OVERRIDES = {
  // --- 歴史・社会 ---
  "班田収授法": "はんでんしゅうじゅほう",
  "冠位十二階": "かんいじゅうにかい",
  "高松塚古墳": "たかまつづかこふん",
  "高冷地農業": "こうれいちのうぎょう",
  "盧舎那仏像": "るしゃなぶつぞう",
  "盧舎那仏": "るしゃなぶつ",
  "大山古墳": "だいせんこふん",
  "禁漁期間": "きんりょうきかん",
  "源頼朝": "みなもとのよりとも",
  "持統天皇": "じとうてんのう",
  "誤情報": "ごじょうほう",
  "遣隋使": "けんずいし",
  "遣唐使": "けんとうし",
  "防火衣": "ぼうかい",
  "千歯こき": "せんばこき",
  "承久": "じょうきゅう",
  "元寇": "げんこう",
  "享保": "きょうほう",
  "環濠": "かんごう",
  "刀狩": "かたながり",
  "銅鐸": "どうたく",
  "鉄鐸": "てったく",
  "太閤": "たいこう",
  "灌漑": "かんがい",
  // --- 理科 ---
  "ヨウ素液": "ようそえき",
  "維管束": "いかんそく",
  "水媒花": "すいばいか",
  "気孔束": "きこうそく",
  "極同士": "きょくどうし",
  "蛍光灯": "けいこうとう",
  "等星": "とうせい",
  "篩管": "しかん",
  "師管": "しかん",
  "道管": "どうかん",
  "羊膜": "ようまく",
  "泥岩": "でいがん",
  "柔毛": "じゅうもう",
  "上皿": "うわざら",
  "隕石": "いんせき",
  "一本": "いっぽん",
};
const OVERRIDE_KEYS = Object.keys(TERM_OVERRIDES).sort((a, b) => b.length - a.length);

function applyTermOverrides(text) {
  let out = text;
  for (const k of OVERRIDE_KEYS) {
    if (out.includes(k)) out = out.split(k).join(TERM_OVERRIDES[k]);
  }
  return out;
}

function katakanaToHiragana(str) {
  return str.replace(/[ァ-ヶ]/g, (m) => String.fromCharCode(m.charCodeAt(0) - 0x60));
}

function buildToHiraganaReading(tokenizer) {
  return function toHiraganaReading(text) {
    if (!text) return text;
    const tokens = tokenizer.tokenize(applyTermOverrides(text));
    let out = "";
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      const hasKanji = KANJI_RE.test(t.surface_form);
      if (!hasKanji) {
        out += t.surface_form;
        continue;
      }
      // このデータセット内での既知の誤読を手直しする（辺=へん、常に「側」の意味で使われる）。
      if (t.surface_form === "辺") { out += "へん"; continue; }
      if (t.surface_form === "土") { out += "つち"; continue; }
      if (t.surface_form === "人") {
        const prev = tokens[i - 1];
        // 数字や ${変数} の直後の「人」は助数詞（〜にん）として読む
        if (prev && /[0-9}]$/.test(prev.surface_form)) { out += "にん"; continue; }
      }
      if (t.surface_form === "何") {
        const next = tokens[i + 1];
        if (next && NAN_COUNTER_RE.test(next.surface_form)) { out += "なん"; continue; }
      }
      out += t.reading ? katakanaToHiragana(t.reading) : t.surface_form;
    }
    // 元の文章がすでに「漢字（かな読み）」の形で読みがなを添えている場合、変換後は
    // 「かな読み（かな読み）」という二重表示になってしまうため、その重複を畳む。
    out = out.replace(/([ぁ-んー]+)（\1）/g, "$1");
    return out;
  };
}

function extractQuoted(str) {
  // バッククォート文字列 or ダブルクォート文字列の中身を取り出す
  if (str.startsWith("`")) return str.slice(1, -1);
  return str.slice(1, -1);
}

async function main() {
  const tokenizer = await new Promise((resolve, reject) => {
    kuromoji.builder({ dicPath }).build((err, t) => (err ? reject(err) : resolve(t)));
  });
  const toKana = buildToHiraganaReading(tokenizer);

  // ---------- 理科・社会: id引きの別ファイルを生成 ----------
  function generateSubjectKana(tsFilePath, exportName, outJsonPath) {
    const tmpDir = fs.mkdtempSync(path.join(require("os").tmpdir(), "furigen-"));
    // scienceData.ts / socialData.ts は生成物である *Furigana.json を import しているため、
    // --resolveJsonModule が必要。また tsc は .json を outDir へコピーしないので、
    // 実行時の require が解決できるようこちらで隣に置く（初回実行時はまだ無いので空で作る）。
    require("child_process").execSync(
      `npx tsc "${tsFilePath}" --outDir "${tmpDir}" --module commonjs --target es2020 --esModuleInterop --skipLibCheck --resolveJsonModule`,
      { cwd: path.join(__dirname, ".."), stdio: "pipe" }
    );
    for (const j of ["scienceFurigana.json", "socialFurigana.json"]) {
      const src = path.join(__dirname, "..", "lib", j);
      fs.writeFileSync(path.join(tmpDir, j), fs.existsSync(src) ? fs.readFileSync(src, "utf8") : "{}", "utf8");
    }
    const compiledPath = path.join(tmpDir, path.basename(tsFilePath).replace(/\.ts$/, ".js"));
    delete require.cache[require.resolve(compiledPath)];
    const mod = require(compiledPath);
    const questions = mod[exportName];
    const out = {};
    for (const q of questions) {
      if (q.grade <= 2) continue; // 小1・小2はもともとひらがな中心なので変換不要
      out[q.id] = {
        wordKana: toKana(q.word),
        readingKana: toKana(q.reading),
        choicesKana: (q.choices || []).map(toKana),
      };
    }
    fs.writeFileSync(outJsonPath, JSON.stringify(out), "utf8");
    console.log(`Wrote ${Object.keys(out).length} entries to ${outJsonPath}`);
  }

  generateSubjectKana(
    path.join(__dirname, "..", "lib", "scienceData.ts"),
    "SCIENCE_QUESTIONS",
    path.join(__dirname, "..", "lib", "scienceFurigana.json")
  );
  generateSubjectKana(
    path.join(__dirname, "..", "lib", "socialData.ts"),
    "SOCIAL_QUESTIONS",
    path.join(__dirname, "..", "lib", "socialFurigana.json")
  );

  // ---------- 算数: mathData.ts の各パターン行に qKana / cKana を直接追記 ----------
  const mathPath = path.join(__dirname, "..", "lib", "mathData.ts");
  let src = fs.readFileSync(mathPath, "utf8");
  const lines = src.split("\n");
  let qCount = 0, cCount = 0;
  const STR_RE = /`[^`]*`|"[^"]*"/;
  const outLines = lines.map((line) => {
    // すでに qKana が付いている行は再実行時にスキップ（冪等性のため）
    if (line.includes("qKana:")) return line;
    const qMatch = line.match(new RegExp("q: (" + STR_RE.source + "),"));
    if (!qMatch || !/\bq:\s*[`"]/.test(line)) return line;
    const qRaw = extractQuoted(qMatch[1]);
    const qKana = toKana(qRaw);
    qCount++;
    let newLine = line.replace(qMatch[0], qMatch[0] + " qKana: `" + qKana + "`,");

    const cMatch = newLine.match(/c: (\[[^\]]*\])/);
    if (cMatch) {
      const arrBody = cMatch[1];
      const elems = arrBody.match(new RegExp(STR_RE.source, "g")) || [];
      const kanaElems = elems.map((el) => "`" + toKana(extractQuoted(el)) + "`");
      cCount++;
      newLine = newLine.replace(cMatch[0], cMatch[0] + ", cKana: [" + kanaElems.join(", ") + "]");
    }
    return newLine;
  });
  fs.writeFileSync(mathPath, outLines.join("\n"), "utf8");
  console.log(`mathData.ts: added qKana to ${qCount} patterns, cKana to ${cCount} patterns`);
}

main().catch((e) => { console.error(e); process.exit(1); });
