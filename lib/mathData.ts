export type MathQuestion = {
  id: string;
  grade: number;
  word: string; // The math equation or question text
  wordKana?: string; // ふりがなモード用：word の漢字をすべてひらがなにした版
  okurigana?: string;
  reading: string; // The correct answer as a string
  type: "math";
  choices: string[]; // 4 choices including the correct answer
  choicesKana?: string[]; // ふりがなモード用：choices の漢字をすべてひらがなにした版
  category?: 'calc' | 'logic' | 'geometry';
  rationale?: string;
};

// ふりがなモード用：単位（u）の漢字をひらがなにした版。文章題テンプレートは
// scripts/generateFurigana.js が qKana/cKana を自動生成しているが、正解・不正解の
// 選択肢は generateWrongChoices() が実行時に数字+u で組み立てるため、
// 対応する ひらがな単位（uKana）をここで引けるようにしておく。
const UNIT_KANA: Record<string, string> = {
  "人": "にん", "倍": "ばい", "円": "えん", "日": "にち", "時間": "じかん",
  "本": "ほん", "点": "てん", "班": "はん", "通り": "とおり",
};
function unitKana(u: string): string {
  return UNIT_KANA[u] ?? u;
}
function kanaChoicesFromUnit(choices: string[], u: string): string[] {
  const uk = unitKana(u);
  if (uk === u) return choices;
  return choices.map(c => c.endsWith(u) ? c.slice(0, c.length - u.length) + uk : c);
}

export type MathSkill = {
  id: string;
  grade: number;
  name: string;
  category: 'calc' | 'logic' | 'geometry';
};

export const MATH_SKILLS: MathSkill[] = [
  // --- 計算スピード (Calculation) ---
  { id: 'g1_add', grade: 1, category: 'calc', name: '1桁のたしざん' },
  { id: 'g1_sub', grade: 1, category: 'calc', name: '1桁のひきざん' },
  { id: 'g2_add', grade: 2, category: 'calc', name: '2桁のたしざん' },
  { id: 'g2_sub', grade: 2, category: 'calc', name: '2桁のひきざん' },
  { id: 'g2_mul', grade: 2, category: 'calc', name: 'かけざん（九九）' },
  { id: 'g3_add', grade: 3, category: 'calc', name: '3桁のたしざん' },
  { id: 'g3_sub', grade: 3, category: 'calc', name: '3桁のひきざん' },
  { id: 'g3_mul', grade: 3, category: 'calc', name: 'かけざん（2桁×1桁）' },
  { id: 'g3_div', grade: 3, category: 'calc', name: 'わりざん（あまりなし）' },
  { id: 'g4_div', grade: 4, category: 'calc', name: 'わりざん（2桁÷1桁）' },
  { id: 'g4_dec_add', grade: 4, category: 'calc', name: '小数のたしざん' },
  { id: 'g4_dec_sub', grade: 4, category: 'calc', name: '小数のひきざん' },
  { id: 'g4_frac_addsub', grade: 4, category: 'calc', name: '分数のたしざん・ひきざん（同分母）' },
  { id: 'g5_dec_mul', grade: 5, category: 'calc', name: '小数の掛かけざん' },
  { id: 'g5_dec_div', grade: 5, category: 'calc', name: '小数のわりざん' },
  { id: 'g5_frac_addsub', grade: 5, category: 'calc', name: '分数のたしざん・ひきざん（異分母）' },
  { id: 'g6_frac_mul', grade: 6, category: 'calc', name: '分数のかけざん' },
  { id: 'g6_frac_div', grade: 6, category: 'calc', name: '分数のわりざん' },

  // --- 論理・思考力・文章題 (Logic & Word Problems) ---
  { id: 'g1_logic', grade: 1, category: 'logic', name: '1年生の文章題（あわせる・のこり・大小）' },
  { id: 'g2_logic', grade: 2, category: 'logic', name: '2年生の文章題（かけ算・買い物・時間）' },
  { id: 'g3_logic', grade: 3, category: 'logic', name: '3年生の文章題（わり算・あまり・おつり）' },
  { id: 'g4_logic', grade: 4, category: 'logic', name: '4年生の文章題（倍・規則性・整理・かっこ）' },
  { id: 'g5_logic', grade: 5, category: 'logic', name: '5年生の文章題（割合・割引・平均・単位量）' },
  { id: 'g6_logic', grade: 6, category: 'logic', name: '6年生の文章題（速さ・道のり・比・比例配分）' },

  // --- 空間・図形・単位 (Geometry & Units) ---
  { id: 'g1_geom', grade: 1, category: 'geometry', name: '1年生の図形・時計・長さ(m,cm)' },
  { id: 'g2_geom', grade: 2, category: 'geometry', name: '2年生の図形・かさ(L,dL)・長さ(mm)・直角' },
  { id: 'g3_geom', grade: 3, category: 'geometry', name: '3年生の三角形(180度)・重さ(kg,g)・円と球' },
  { id: 'g4_geom', grade: 4, category: 'geometry', name: '4年生の面積(cm²,m²)・角度(360度)・四角形' },
  { id: 'g5_geom', grade: 5, category: 'geometry', name: '5年生の体積(cm³,L)・三角形面積・多角形(540度)' },
  { id: 'g6_geom', grade: 6, category: 'geometry', name: '6年生の円の面積・円柱体積・線対称と点対称' },
];

function generateWrongChoices(correctAnswer: number, isDecimal = false, suffix = ""): string[] {
  const choices = new Set<string>();
  const correctStr = (isDecimal ? correctAnswer.toFixed(1).replace(/\.0$/, '') : correctAnswer.toString()) + suffix;
  choices.add(correctStr);

  while (choices.size < 4) {
    let wrong: number;
    if (isDecimal) {
      let offset = Math.floor(Math.random() * 5) + 1;
      if (Math.random() > 0.5) offset *= -1;
      wrong = Math.round((correctAnswer + offset * 0.1) * 10) / 10;
    } else {
      let offset = Math.floor(Math.random() * 5) + 1;
      if (Math.random() > 0.5) offset *= -1;
      if (correctAnswer >= 20 && Math.random() > 0.4) offset *= 10;
      else if (correctAnswer >= 200 && Math.random() > 0.5) offset *= 100;
      wrong = correctAnswer + offset;
      if (wrong < 0 && correctAnswer >= 0) wrong = correctAnswer + Math.abs(offset);
      if (wrong === correctAnswer) wrong += 2;
    }
    const wrongStr = (isDecimal ? wrong.toFixed(1).replace(/\.0$/, '') : wrong.toString()) + suffix;
    choices.add(wrongStr);
  }

  return Array.from(choices).sort(() => 0.5 - Math.random());
}

// 固定の選択肢セット（p.c / sel.c）をシャッフルしつつ、対応する ふりがな版（cKana）を
// 同じ並び順で作る。片方だけ独立にシャッフルすると choices と choicesKana の対応がずれるため。
function shuffledWithKana(c: string[], cKana?: string[]): [string[], string[]] {
  const kanaSrc = cKana && cKana.length === c.length ? cKana : c;
  const order = c.map((_, i) => i).sort(() => 0.5 - Math.random());
  return [order.map(i => c[i]), order.map(i => kanaSrc[i])];
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function simplifyFraction(n: number, d: number): string {
  if (n === 0) return "0";
  const common = gcd(Math.abs(n), Math.abs(d));
  const num = n / common;
  const den = d / common;
  if (den === 1) return num.toString();
  return `${num}/${den}`;
}

function generateWrongFractionChoices(correct: string): string[] {
  const choices = new Set<string>();
  choices.add(correct);
  let [nStr, dStr] = correct.split('/');
  let num = parseInt(nStr);
  let den = dStr ? parseInt(dStr) : 1;
  
  while (choices.size < 4) {
    let wrongNum = num + Math.floor(Math.random() * 5) - 2;
    if (wrongNum <= 0) wrongNum = 1;
    let wrongDen = den + Math.floor(Math.random() * 3) - 1;
    if (wrongDen <= 0) wrongDen = 1;
    choices.add(simplifyFraction(wrongNum, wrongDen));
  }
  return Array.from(choices).sort(() => 0.5 - Math.random());
}

function generateSkillQuestion(skillId: string): MathQuestion {
  const skill = MATH_SKILLS.find(s => s.id === skillId) || MATH_SKILLS[0];
  let word = "";
  let wordKana = ""; // 計算のみの問題（かず+記号）は漢字がないため word のままでよい
  let answerStr = "";
  let choices: string[] = [];
  let choicesKana: string[] = []; // 未設定なら関数末尾で choices をそのまま流用する

  let a = 0, b = 0, c = 0, answer = 0;

  switch (skillId) {
    // ==========================================
    // 1. 計算スピード (Calculation)
    // ==========================================
    case 'g1_add':
      a = Math.floor(Math.random() * 9) + 1;
      b = Math.floor(Math.random() * 9) + 1;
      word = `${a} + ${b}`;
      answerStr = (a + b).toString();
      choices = generateWrongChoices(a + b);
      break;
    case 'g1_sub':
      a = Math.floor(Math.random() * 9) + 1;
      b = Math.floor(Math.random() * a);
      word = `${a} - ${b}`;
      answerStr = (a - b).toString();
      choices = generateWrongChoices(a - b);
      break;
    case 'g2_add':
      a = Math.floor(Math.random() * 90) + 10;
      b = Math.floor(Math.random() * 90) + 10;
      word = `${a} + ${b}`;
      answerStr = (a + b).toString();
      choices = generateWrongChoices(a + b);
      break;
    case 'g2_sub':
      a = Math.floor(Math.random() * 90) + 10;
      b = Math.floor(Math.random() * (a - 10)) + 10;
      word = `${a} - ${b}`;
      answerStr = (a - b).toString();
      choices = generateWrongChoices(a - b);
      break;
    case 'g2_mul':
      a = Math.floor(Math.random() * 9) + 1;
      b = Math.floor(Math.random() * 9) + 1;
      word = `${a} × ${b}`;
      answerStr = (a * b).toString();
      choices = generateWrongChoices(a * b);
      break;
    case 'g3_add':
      a = Math.floor(Math.random() * 900) + 100;
      b = Math.floor(Math.random() * 900) + 100;
      word = `${a} + ${b}`;
      answerStr = (a + b).toString();
      choices = generateWrongChoices(a + b);
      break;
    case 'g3_sub':
      a = Math.floor(Math.random() * 900) + 100;
      b = Math.floor(Math.random() * (a - 100)) + 100;
      word = `${a} - ${b}`;
      answerStr = (a - b).toString();
      choices = generateWrongChoices(a - b);
      break;
    case 'g3_mul':
      a = Math.floor(Math.random() * 90) + 10;
      b = Math.floor(Math.random() * 9) + 1;
      word = `${a} × ${b}`;
      answerStr = (a * b).toString();
      choices = generateWrongChoices(a * b);
      break;
    case 'g3_div':
      b = Math.floor(Math.random() * 9) + 1;
      answer = Math.floor(Math.random() * 9) + 1;
      a = b * answer;
      word = `${a} ÷ ${b}`;
      answerStr = answer.toString();
      choices = generateWrongChoices(answer);
      break;
    case 'g4_div':
      b = Math.floor(Math.random() * 9) + 1;
      answer = Math.floor(Math.random() * 20) + 10;
      a = b * answer;
      word = `${a} ÷ ${b}`;
      answerStr = answer.toString();
      choices = generateWrongChoices(answer);
      break;
    case 'g4_dec_add':
      a = (Math.floor(Math.random() * 90) + 10) / 10;
      b = (Math.floor(Math.random() * 90) + 10) / 10;
      word = `${a.toFixed(1)} + ${b.toFixed(1)}`;
      answerStr = (a + b).toFixed(1).replace(/\.0$/, '');
      choices = generateWrongChoices(a + b, true);
      break;
    case 'g4_dec_sub':
      a = (Math.floor(Math.random() * 90) + 10) / 10;
      b = (Math.floor(Math.random() * (a * 10 - 10)) + 10) / 10;
      word = `${a.toFixed(1)} - ${b.toFixed(1)}`;
      answerStr = (a - b).toFixed(1).replace(/\.0$/, '');
      choices = generateWrongChoices(a - b, true);
      break;
    case 'g4_frac_addsub': {
      c = Math.floor(Math.random() * 5) + 3;
      const isAdd = Math.random() > 0.5;
      if (isAdd) {
        a = Math.floor(Math.random() * c) + 1;
        b = Math.floor(Math.random() * c) + 1;
        word = `${simplifyFraction(a, c)} + ${simplifyFraction(b, c)}`;
        answerStr = simplifyFraction(a + b, c);
      } else {
        a = Math.floor(Math.random() * c) + 2;
        b = Math.floor(Math.random() * (a - 1)) + 1;
        word = `${simplifyFraction(a, c)} - ${simplifyFraction(b, c)}`;
        answerStr = simplifyFraction(a - b, c);
      }
      choices = generateWrongFractionChoices(answerStr);
      break;
    }
    case 'g5_dec_mul':
      a = (Math.floor(Math.random() * 90) + 10) / 10;
      b = Math.floor(Math.random() * 9) + 1;
      word = `${a.toFixed(1)} × ${b}`;
      answerStr = (a * b).toFixed(1).replace(/\.0$/, '');
      choices = generateWrongChoices(a * b, true);
      break;
    case 'g5_dec_div':
      b = Math.floor(Math.random() * 9) + 1;
      answer = (Math.floor(Math.random() * 90) + 10) / 10;
      a = Math.round(b * answer * 10) / 10;
      word = `${a} ÷ ${b}`;
      answerStr = answer.toFixed(1).replace(/\.0$/, '');
      choices = generateWrongChoices(answer, true);
      break;
    case 'g5_frac_addsub': {
      const isAdd = Math.random() > 0.5;
      const denoms = [2, 3, 4, 5, 6].sort(() => 0.5 - Math.random());
      const d1 = denoms[0], d2 = denoms[1];
      const n1 = Math.floor(Math.random() * d1) + 1;
      const n2 = Math.floor(Math.random() * d2) + 1;
      const f1 = simplifyFraction(n1, d1);
      const f2 = simplifyFraction(n2, d2);
      if (isAdd) {
        word = `${f1} + ${f2}`;
        answerStr = simplifyFraction(n1 * d2 + n2 * d1, d1 * d2);
      } else {
        const val1 = n1 / d1;
        const val2 = n2 / d2;
        if (val1 > val2) {
          word = `${f1} - ${f2}`;
          answerStr = simplifyFraction(n1 * d2 - n2 * d1, d1 * d2);
        } else {
          word = `${f2} - ${f1}`;
          answerStr = simplifyFraction(n2 * d1 - n1 * d2, d1 * d2);
        }
      }
      choices = generateWrongFractionChoices(answerStr);
      break;
    }
    case 'g6_frac_mul': {
      const d1 = Math.floor(Math.random() * 4) + 2;
      const d2 = Math.floor(Math.random() * 4) + 2;
      const n1 = Math.floor(Math.random() * 3) + 1;
      const n2 = Math.floor(Math.random() * 3) + 1;
      const f1 = simplifyFraction(n1, d1);
      const f2 = simplifyFraction(n2, d2);
      word = `${f1} × ${f2}`;
      answerStr = simplifyFraction(n1 * n2, d1 * d2);
      choices = generateWrongFractionChoices(answerStr);
      break;
    }
    case 'g6_frac_div': {
      const d1 = Math.floor(Math.random() * 4) + 2;
      const d2 = Math.floor(Math.random() * 4) + 2;
      const n1 = Math.floor(Math.random() * 3) + 1;
      const n2 = Math.floor(Math.random() * 3) + 1;
      const f1 = simplifyFraction(n1, d1);
      const f2 = simplifyFraction(n2, d2);
      word = `${f1} ÷ ${f2}`;
      answerStr = simplifyFraction(n1 * d2, d1 * n2);
      choices = generateWrongFractionChoices(answerStr);
      break;
    }

    // ==========================================
    // 2. 論理・思考力・文章題 (Logic & Word Problems)
    // ==========================================
    case 'g1_logic': {
      a = Math.floor(Math.random() * 5) + 3;
      b = Math.floor(Math.random() * 4) + 1;
      if (a < b) { const t = a; a = b; b = t; } // ひき算で答えがマイナスにならないようにする
      const patterns = [
        { q: `あめが ${a}こ あります。${b}こ もらいました。ぜんぶで なんこ？`, qKana: `あめが ${a}こ あります。${b}こ もらいました。ぜんぶで なんこ？`, a: a + b, u: "こ" },
        { q: `りんごが ${a}こ あります。${b}こ たべました。のこりは なんこ？`, qKana: `りんごが ${a}こ あります。${b}こ たべました。のこりは なんこ？`, a: a - b, u: "こ" },
        { q: `とりが ${a}わ います。${b}わ とんできました。あわせて なんわ？`, qKana: `とりが ${a}わ います。${b}わ とんできました。あわせて なんわ？`, a: a + b, u: "わ" },
        { q: `あかいくるまが ${a}だい、あおいくるまが ${b}だい あります。あかは なんだい おおい？`, qKana: `あかいくるまが ${a}だい、あおいくるまが ${b}だい あります。あかは なんだい おおい？`, a: a - b, u: "だい" },
        { q: `こどもが まえから ${a}ばんめ に ならんでいます。うしろに ${b}にん います。ぜんぶで なんにん？`, qKana: `こどもが まえから ${a}ばんめ に ならんでいます。うしろに ${b}にん います。ぜんぶで なんにん？`, a: a + b, u: "にん" },
        { q: `10に なるには、${a} に あと いくつ たせば いい？`, qKana: `10に なるには、${a} に あと いくつ たせば いい？`, a: 10 - a, u: "" },
        { q: `ふうせんが ${a}こ あります。${b}こ われました。のこりは なんこ？`, qKana: `ふうせんが ${a}こ あります。${b}こ われました。のこりは なんこ？`, a: a - b, u: "こ" },
        { q: `つりで さかなを ${a}ひき つりました。おとうとは ${b}ひき つりました。あわせて なんびき？`, qKana: `つりで さかなを ${a}ひき つりました。おとうとは ${b}ひき つりました。あわせて なんびき？`, a: a + b, u: "ひき" },
        { q: `えんぴつを ${a}ほん もっています。おかあさんから ${b}ほん もらいました。ぜんぶで なんぼん？`, qKana: `えんぴつを ${a}ほん もっています。おかあさんから ${b}ほん もらいました。ぜんぶで なんぼん？`, a: a + b, u: "ほん" },
        { q: `きょうしつに こどもが ${a}にん います。${b}にん かえりました。のこりは なんにん？`, qKana: `きょうしつに こどもが ${a}にん います。${b}にん かえりました。のこりは なんにん？`, a: a - b, u: "にん" },
        { q: `どうぶつえんで さるを ${a}ひき、ぱんだを ${b}ひき みました。あわせて なんびき？`, qKana: `どうぶつえんで さるを ${a}ひき、ぱんだを ${b}ひき みました。あわせて なんびき？`, a: a + b, u: "ひき" },
        { q: `はこに みかんが ${a}こ はいっています。${b}こ たべました。のこりは なんこ？`, qKana: `はこに みかんが ${a}こ はいっています。${b}こ たべました。のこりは なんこ？`, a: a - b, u: "こ" }
      ];
      const p = patterns[Math.floor(Math.random() * patterns.length)];
      word = p.q;
      wordKana = ('qKana' in p && p.qKana) || word;
      answerStr = `${p.a}${p.u}`;
      choices = generateWrongChoices(p.a, false, p.u);
      choicesKana = kanaChoicesFromUnit(choices, p.u);
      break;
    }
    case 'g2_logic': {
      a = Math.floor(Math.random() * 6) + 3;
      b = Math.floor(Math.random() * 5) + 2;
      if (a < b) { const t = a; a = b; b = t; } // ひき算で答えがマイナスにならないようにする
      const totalKids = (a + 2) * 5;
      const girlsCount = b + 3;
      const patterns = [
        { q: `1さらに ケーキが ${a}こ あります。${b}さら では ぜんぶで 何こ？`, qKana: `1さらに ケーキが ${a}こ あります。${b}さら では ぜんぶで なんこ？`, a: a * b, u: "こ" },
        { q: `子どもが ${b}人 います。1人に ${a}本ずつ えんぴつを くばると、何本いる？`, qKana: `こどもが ${b}にん います。1にんに ${a}ほんずつ えんぴつを くばると、なんほんいる？`, a: a * b, u: "本" },
        { q: `${a * 10}円の ノートと ${b * 10}円の けしゴムを かいました。代金は 何円？`, qKana: `${a * 10}えんの ノートと ${b * 10}えんの けしゴムを かいました。だいきんは なんえん？`, a: (a + b) * 10, u: "円" },
        { q: `100円玉を 1まい 出して、${a * 10}円の アメを かいました。おつりは 何円？`, qKana: `100えんだまを 1まい だして、${a * 10}えんの アメを かいました。おつりは なんえん？`, a: 100 - (a * 10), u: "円" },
        { q: `50円玉が ${b}まい あります。ぜんぶで 何円？`, qKana: `50えんだまが ${b}まい あります。ぜんぶで なんえん？`, a: 50 * b, u: "円" },
        { q: `ぜんぶで ${totalKids}人 います。女子が ${girlsCount}人のとき、男子は 何人？`, qKana: `ぜんぶで ${totalKids}にん います。じょしが ${girlsCount}にんのとき、だんしは なんにん？`, a: totalKids - girlsCount, u: "人" },
        { q: `午前 9時 から 30分 たつと、何時何分？`, qKana: `ごぜん 9じ から 30ふん たつと、なんじなんふん？`, a: "9時30分", c: ["9時30分", "9時20分", "10時", "9時40分"], cKana: [`9じ30ふん`, `9じ20ふん`, `10じ`, `9じ40ふん`] },
        { q: `おりがみを ${a}まい もっています。${b}まい もらいました。あわせて 何まい？`, qKana: `おりがみを ${a}まい もっています。${b}まい もらいました。あわせて なんまい？`, a: a + b, u: "まい" },
        { q: `1はこに たまごが ${a}こ はいっています。${b}はこでは たまごは 何こ？`, qKana: `1はこに たまごが ${a}こ はいっています。${b}はこでは たまごは なんこ？`, a: a * b, u: "こ" },
        { q: `色紙が ${a}まい あります。${b}まい つかいました。のこりは 何まい？`, qKana: `いろがみが ${a}まい あります。${b}まい つかいました。のこりは なんまい？`, a: a - b, u: "まい" },
        { q: `午前 9時40分 から 30分 たつと、何時何分？`, qKana: `ごぜん 9じ40ふん から 30ふん たつと、なんじなんふん？`, a: "10時10分", c: ["10時10分", "9時70分", "10時", "9時10分"], cKana: [`10じ10ふん`, `9じ70ふん`, `10じ`, `9じ10ふん`] },
        { q: `午後 3時 から 40分 まえは 何時何分でしたか？`, qKana: `ごご 3じ から 40ふん まえは なんじなんふんでしたか？`, a: "2時20分", c: ["2時20分", "3時40分", "2時40分", "3時20分"], cKana: [`2じ20ふん`, `3じ40ふん`, `2じ40ふん`, `3じ20ふん`] }
      ];
      const p = patterns[Math.floor(Math.random() * patterns.length)];
      word = p.q;
      wordKana = ('qKana' in p && p.qKana) || word;
      if ('c' in p) {
        answerStr = p.a as string;
        [choices, choicesKana] = shuffledWithKana(p.c as string[], ('cKana' in p ? p.cKana : undefined) as string[] | undefined);
      } else {
        answerStr = `${p.a}${p.u}`;
        choices = generateWrongChoices(p.a as number, false, p.u);
      choicesKana = kanaChoicesFromUnit(choices, p.u);
      }
      break;
    }
    case 'g3_logic': {
      b = Math.floor(Math.random() * 4) + 3;
      answer = Math.floor(Math.random() * 6) + 2;
      a = b * answer;
      const price = (Math.floor(Math.random() * 4) + 1) * 50;
      const count = Math.floor(Math.random() * 3) + 2;
      const divisor2 = Math.floor(Math.random() * 3) + 3; // 3-5
      const remainder2 = Math.floor(Math.random() * (divisor2 - 1)) + 1;
      const quotient2 = Math.floor(Math.random() * 5) + 3;
      const dividend2 = divisor2 * quotient2 + remainder2;
      const patterns = [
        { q: `${a}この クッキーを ${b}人で 同じ数ずつ 分けると、1人 何こ？`, qKana: `${a}この クッキーを ${b}にんで おなじかずずつ わけると、1にん なんこ？`, a: answer, u: "こ" },
        { q: `${a}枚の シールを 1人に ${b}枚ずつ 配ると、何人に 配れる？`, qKana: `${a}まいの シールを 1にんに ${b}まいずつ くばると、なんにんに くばれる？`, a: answer, u: "人" },
        { q: `1本 ${price}円の ペンを ${count}本 買って 1000円さつを 出しました。おつりは 何円？`, qKana: `1ほん ${price}えんの ペンを ${count}ほん かって 1000えんさつを だしました。おつりは なんえん？`, a: 1000 - (price * count), u: "円" },
        { q: `${dividend2}こ の アメを ${divisor2}人で 同じ数ずつ 分けると、あまりは 何こ？`, qKana: `${dividend2}こ の アメを ${divisor2}にんで おなじかずずつ わけると、あまりは なんこ？`, a: remainder2, u: "こ" },
        { q: `長いす 1脚に ${b}人ずつ すわると、${answer}脚で 何人すわれる？`, qKana: `ながいす 1きゃくに ${b}にんずつ すわると、${answer}あしで なんにんすわれる？`, a: a, u: "人" },
        { q: `午後 1時30分 から 45分 たつと、何時何分？`, qKana: `ごご 1じ30ふん から 45ふん たつと、なんじなんふん？`, a: "午後2時15分", c: ["午後2時15分", "午後2時", "午後2時30分", "午後1時75分"], cKana: [`ごご2じ15ふん`, `ごご2じ`, `ごご2じ30ふん`, `ごご1じ75ふん`] },
        { q: `1箱に ${b}こ入りの チョコが ${answer}箱 あります。ぜんぶで 何こ？`, qKana: `1はこに ${b}こいりの チョコが ${answer}ばこ あります。ぜんぶで なんこ？`, a: a, u: "こ" },
        { q: `1本 ${price}円の ノートを 3本 かうと、代金は 何円？`, qKana: `1ほん ${price}えんの ノートを 3ほん かうと、だいきんは なんえん？`, a: price * 3, u: "円" },
        { q: `午前 10時15分 から 50分 たつと、何時何分？`, qKana: `ごぜん 10じ15ふん から 50ふん たつと、なんじなんふん？`, a: "午前11時5分", c: ["午前11時5分", "午前10時65分", "午前11時", "午前10時5分"], cKana: [`ごぜん11じ5ふん`, `ごぜん10じ65ふん`, `ごぜん11じ`, `ごぜん10じ5ふん`] },
        { q: `長さ ${b}m の リボンを ${answer}本 作るには、何m の リボンが ひつよう？`, qKana: `ながさ ${b}m の リボンを ${answer}ほん つくるには、なんm の リボンが ひつよう？`, a: a, u: "m" },
        { q: `画用紙が ${a}まい あります。${b}人で 同じ数ずつ 分けると、1人 何まい？`, qKana: `がようしが ${a}まい あります。${b}にんで おなじかずずつ わけると、1にん なんまい？`, a: answer, u: "まい" }
      ];
      const p = patterns[Math.floor(Math.random() * patterns.length)];
      word = p.q;
      wordKana = ('qKana' in p && p.qKana) || word;
      if ('c' in p) {
        answerStr = p.a as string;
        [choices, choicesKana] = shuffledWithKana(p.c as string[], ('cKana' in p ? p.cKana : undefined) as string[] | undefined);
      } else {
        answerStr = `${p.a}${p.u}`;
        choices = generateWrongChoices(p.a as number, false, p.u);
      choicesKana = kanaChoicesFromUnit(choices, p.u);
      }
      break;
    }
    case 'g4_logic': {
      a = (Math.floor(Math.random() * 5) + 2) * 20;
      b = Math.floor(Math.random() * 4) + 2;
      const groupSize = [3, 4, 5][Math.floor(Math.random() * 3)];
      const groupCount = Math.floor(Math.random() * 4) + 5; // 5-8
      const totalStudents = groupSize * groupCount;
      const girlsCount2 = Math.floor(totalStudents / 3);
      const boysCount2 = totalStudents - girlsCount2;
      const otherMoney = (Math.floor(Math.random() * 3) + 2) * 100; // 200-400
      const ratio = [2, 3, 4][Math.floor(Math.random() * 3)];
      const myMoney = otherMoney * ratio;
      const pagesPerDay = b * 5;
      const days = [4, 5, 6, 7][Math.floor(Math.random() * 4)];
      const totalPages = pagesPerDay * days;
      const moneySum = (Math.floor(Math.random() * 4) + 3) * 100; // 300-600
      const moneyDiff = (Math.floor(Math.random() * 3) + 1) * 100; // 100-300
      const lcmX = Math.floor(Math.random() * 6) + 2;
      const lcmY = Math.floor(Math.random() * 6) + 2;
      const lcmVal = (lcmX * lcmY) / gcd(lcmX, lcmY);
      const seqStart = Math.floor(Math.random() * 4) + 1;
      const seqStep = Math.floor(Math.random() * 3) + 2;
      const seqN = Math.floor(Math.random() * 3) + 4; // 4-6番目
      const px = Math.floor(Math.random() * 5) + 2;
      const py = Math.floor(Math.random() * 5) + 2;
      const pz = Math.floor(Math.random() * 4) + 2;
      const patterns = [
        { q: `1本 ${a}円の ジュースを ${b}本 買って 1000円 出したときの おつりは 何円？`, qKana: `1ほん ${a}えんの ジュースを ${b}ほん かって 1000えん だしたときの おつりは なんえん？`, a: 1000 - (a * b), u: "円" },
        { q: `${boysCount2 > girlsCount2 ? '男子' : '女子'}が ${Math.max(boysCount2, girlsCount2)}人、${boysCount2 > girlsCount2 ? '女子' : '男子'}が ${Math.min(boysCount2, girlsCount2)}人 います。${groupSize}人ずつの 班を作ると 何班できる？`, qKana: `${boysCount2 > girlsCount2 ? 'だんし' : 'じょし'}が ${Math.max(boysCount2, girlsCount2)}にん、${boysCount2 > girlsCount2 ? 'じょし' : 'だんし'}が ${Math.min(boysCount2, girlsCount2)}にん います。${groupSize}にんずつの はんをつくると なんはんできる？`, a: groupCount, u: "班" },
        { q: `兄は ${myMoney}円、弟は ${otherMoney}円 持っています。兄のお金は 弟の 何倍？`, qKana: `あには ${myMoney}えん、おとうとは ${otherMoney}えん もっています。あにのおかねは おとうとの なんばい？`, a: ratio, u: "倍" },
        { q: `1日に ${pagesPerDay}ページずつ 読むと、${totalPages}ページの本は 何日で 読み終わる？`, qKana: `1にちに ${pagesPerDay}ページずつ よむと、${totalPages}ページのほんは なんにちで よみおわる？`, a: days, u: "日" },
        { q: `2人の持っているお金の合計が ${moneySum}円で、差が ${moneyDiff}円です。多い方は 何円？`, qKana: `2にんのもっているおかねのごうけいが ${moneySum}えんで、さが ${moneyDiff}えんです。おおいほうは なんえん？`, a: (moneySum + moneyDiff) / 2, u: "円" },
        { q: `${lcmX} と ${lcmY} の 最小公倍数（さいしょうこうばいすう）は いくつ？`, qKana: `${lcmX} と ${lcmY} の さいしょうこうばいすうは いくつ？`, a: lcmVal, u: "" },
        { q: `${seqStart}から はじまり ${seqStep}ずつ 増える 数が ならんでいます。${seqN}番目の 数は 何？`, qKana: `${seqStart}から はじまり ${seqStep}ずつ ふえる かずが ならんでいます。${seqN}ばんめの かずは なに？`, a: seqStart + seqStep * (seqN - 1), u: "" },
        { q: `(${px} + ${py}) × ${pz} は いくつ？`, qKana: `(${px} + ${py}) × ${pz} は いくつ？`, a: (px + py) * pz, u: "" },
        { q: `本が ${totalStudents * 4}さつ あります。1つの たなに ${groupSize * 4}さつずつ ならべると、たなは 何つ ひつよう？`, qKana: `ほんが ${totalStudents * 4}さつ あります。1つの たなに ${groupSize * 4}さつずつ ならべると、たなは なんつ ひつよう？`, a: (totalStudents * 4) / (groupSize * 4), u: "つ" }
      ];
      const p = patterns[Math.floor(Math.random() * patterns.length)];
      word = p.q;
      wordKana = ('qKana' in p && p.qKana) || word;
      answerStr = `${p.a}${p.u}`;
      choices = generateWrongChoices(p.a, false, p.u);
      choicesKana = kanaChoicesFromUnit(choices, p.u);
      break;
    }
    case 'g5_logic': {
      const price = (Math.floor(Math.random() * 5) + 2) * 1000;
      const discount = [10, 20, 30, 40][Math.floor(Math.random() * 4)];
      const discountedPrice = price * (1 - discount / 100);
      const avg = (Math.floor(Math.random() * 10) + 6) * 5; // 30-75
      const total1 = (Math.floor(Math.random() * 5) + 2) * 100; // 200-600
      const percent1 = [10, 20, 30, 40][Math.floor(Math.random() * 4)];
      const classSize = [20, 25, 30, 35, 40][Math.floor(Math.random() * 5)];
      const percent2 = [20, 40, 60, 80][Math.floor(Math.random() * 4)];
      const area = [10, 20, 25, 50][Math.floor(Math.random() * 4)];
      const density = [100, 200, 300, 400, 500][Math.floor(Math.random() * 5)];
      const pop = area * density;
      const capacity = [20, 25, 50][Math.floor(Math.random() * 3)];
      const busPercent = [40, 60, 80][Math.floor(Math.random() * 3)];
      const riders = (capacity * busPercent) / 100;
      const price2 = (Math.floor(Math.random() * 5) + 2) * 100;
      const discount2 = [10, 20, 30, 40, 50][Math.floor(Math.random() * 5)];
      const perItemCount = [3, 4, 5, 6][Math.floor(Math.random() * 4)];
      const perItemPrice = [20, 30, 40, 50][Math.floor(Math.random() * 4)];
      const perItemTotal = perItemCount * perItemPrice;
      const patterns = [
        { q: `定価 ${price}円の 服が ${discount}%引き（${discount / 10}割引き）で 売られています。売り値は 何円？`, qKana: `ていか ${price}えんの ふくが ${discount}%びき（${discount / 10}わりびき）で うられています。うりねは なんえん？`, a: discountedPrice, u: "円" },
        { q: `テストの点数が ${avg - 5}点、${avg}点、${avg + 5}点 でした。3回の 平均点は 何点？`, qKana: `テストのてんすうが ${avg - 5}てん、${avg}てん、${avg + 5}てん でした。3かいの へいきんてんは なんてん？`, a: avg, u: "点" },
        { q: `全体で ${total1}人 います。そのうち ${percent1}% が メガネをかけています。何人？`, qKana: `ぜんたいで ${total1}にん います。そのうち ${percent1}% が メガネをかけています。なんにん？`, a: (total1 * percent1) / 100, u: "人" },
        { q: `${classSize}人のクラスで、男子が ${percent2}% です。男子は 何人？`, qKana: `${classSize}にんのクラスで、だんしが ${percent2}% です。だんしは なんにん？`, a: (classSize * percent2) / 100, u: "人" },
        { q: `面積 ${area}km² の町に ${pop}人 住んでいます。1km² あたりの人口（人口密度）は 何人？`, qKana: `めんせき ${area}km² のまちに ${pop}にん すんでいます。1km² あたりのじんこう（じんこうみつど）は なんにん？`, a: density, u: "人" },
        { q: `定員 ${capacity}人の バスに ${riders}人 乗っています。乗車率は 何%ですか？`, qKana: `ていいん ${capacity}にんの バスに ${riders}にん のっています。じょうしゃりつは なに%ですか？`, a: busPercent, u: "%" },
        { q: `定価 ${price2}円の 本が ${discount2}%引きで 売られています。何円 安くなりましたか？`, qKana: `ていか ${price2}えんの ほんが ${discount2}%びきで うられています。なんえん やすくなりましたか？`, a: (price2 * discount2) / 100, u: "円" },
        { q: `りんごが ${perItemCount}こで ${perItemTotal}円でした。1こあたり 何円？`, qKana: `りんごが ${perItemCount}こで ${perItemTotal}えんでした。1こあたり なんえん？`, a: perItemPrice, u: "円" }
      ];
      const p = patterns[Math.floor(Math.random() * patterns.length)];
      word = p.q;
      wordKana = ('qKana' in p && p.qKana) || word;
      answerStr = `${p.a}${p.u}`;
      choices = generateWrongChoices(p.a, false, p.u);
      choicesKana = kanaChoicesFromUnit(choices, p.u);
      break;
    }
    case 'g6_logic': {
      const speed = [40, 50, 60, 80][Math.floor(Math.random() * 4)];
      const hours = Math.floor(Math.random() * 3) + 2;
      const ratioPairs: [number, number][] = [[3, 2], [2, 3], [3, 4], [4, 5], [5, 3]];
      const ratioPair = ratioPairs[Math.floor(Math.random() * ratioPairs.length)];
      const ratioK = Math.floor(Math.random() * 4) + 3; // 3-6
      const ratioTotal = (ratioPair[0] + ratioPair[1]) * ratioK;
      const ratioAnswer = ratioPair[0] * ratioK;
      const rectHeight = Math.floor(Math.random() * 4) + 3; // 3-6
      const rectWidth = Math.floor(Math.random() * 4) + 6; // 6-9
      const rectArea = rectHeight * rectWidth;
      const combN = [4, 5, 6][Math.floor(Math.random() * 3)];
      const combAnswer = (combN * (combN - 1)) / 2;
      const speedB = [40, 50, 60][Math.floor(Math.random() * 3)];
      const timeX = Math.floor(Math.random() * 3) + 2;
      const distanceX = speedB * timeX;
      const speedPerMin = [60, 70, 80, 100][Math.floor(Math.random() * 4)];
      const minutesX = Math.floor(Math.random() * 4) + 3;
      const patterns = [
        { q: `時速 ${speed}km で走る 車が ${hours}時間 進むと、進んだ道のりは 何km？`, qKana: `じそく ${speed}km ではしる くるまが ${hours}じかん すすむと、すすんだみちのりは なんkm？`, a: speed * hours, u: "km" },
        { q: `${speed * hours}km の道のりを ${hours}時間 で走ったときの 時速は 何km？`, qKana: `${speed * hours}km のみちのりを ${hours}じかん ではしったときの じそくは なんkm？`, a: speed, u: "km" },
        { q: `姉と妹で チョコを ${ratioPair[0]} : ${ratioPair[1]} の比で 分けます。全体が ${ratioTotal}このとき、姉は 何こ？`, qKana: `あねといもうとで チョコを ${ratioPair[0]} : ${ratioPair[1]} のひで わけます。ぜんたいが ${ratioTotal}このとき、あねは なんこ？`, a: ratioAnswer, u: "こ" },
        { q: `面積が ${rectArea}cm² の長方形で、たてが ${rectHeight}cm のとき、横の長さは 何cm？`, qKana: `めんせきが ${rectArea}cm² のちょうほうけいで、たてが ${rectHeight}cm のとき、よこのながさは なんcm？`, a: rectWidth, u: "cm" },
        { q: `${combN}人（A, B, C, D...）の中から、リレーの選手 2人を選ぶ組み合わせは 何通り？`, qKana: `${combN}にん（A, B, C, D...）のなかから、リレーのせんしゅ 2にんをえらぶくみあわせは なんどおり？`, a: combAnswer, u: "通り" },
        { q: `${distanceX}km の道のりを 時速 ${speedB}km で走ると、何時間 かかる？`, qKana: `${distanceX}km のみちのりを じそく ${speedB}km ではしると、なんじかん かかる？`, a: timeX, u: "時間" },
        { q: `分速 ${speedPerMin}m で歩く人が ${minutesX}分間に 進む道のりは 何m？`, qKana: `ぶんそく ${speedPerMin}m であるくひとが ${minutesX}ぶんかんに すすむみちのりは なんm？`, a: speedPerMin * minutesX, u: "m" }
      ];
      const p = patterns[Math.floor(Math.random() * patterns.length)];
      word = p.q;
      wordKana = ('qKana' in p && p.qKana) || word;
      answerStr = `${p.a}${p.u}`;
      choices = generateWrongChoices(p.a, false, p.u);
      choicesKana = kanaChoicesFromUnit(choices, p.u);
      break;
    }

    // ==========================================
    // 3. 空間・図形・単位 (Geometry & Units)
    // ==========================================
    case 'g1_geom': {
      const pool = [
        { q: "1m（めーとる）は なんcm（せんちめーとる）ですか？", qKana: `1m（めーとる）は なんcm（せんちめーとる）ですか？`, a: "100cm", c: ["100cm", "10cm", "1000cm", "50cm"], cKana: [`100cm`, `10cm`, `1000cm`, `50cm`] },
        { q: "とけいの ながいはりが 12、みじかいはりが 4 をさしています。いまなにじ？", qKana: `とけいの ながいはりが 12、みじかいはりが 4 をさしています。いまなにじ？`, a: "4じ", c: ["4じ", "12じ", "4じはん", "3じ"], cKana: [`4じ`, `12じ`, `4じはん`, `3じ`] },
        { q: "ながしかくの かどは なんこ ありますか？", qKana: `ながしかくの かどは なんこ ありますか？`, a: "4こ", c: ["4こ", "3こ", "5こ", "6こ"], cKana: [`4こ`, `3こ`, `5こ`, `6こ`] },
        { q: "さいころ（はこのかたち）の めんは ぜんぶで なんこ ある？", qKana: `さいころ（はこのかたち）の めんは ぜんぶで なんこ ある？`, a: "6こ", c: ["6こ", "4こ", "8こ", "12こ"], cKana: [`6こ`, `4こ`, `8こ`, `12こ`] },
        { q: "とけいの ながいはりが 6、みじかいはりが 8と9のあいだを さしています。いまなにじ？", qKana: `とけいの ながいはりが 6、みじかいはりが 8と9のあいだを さしています。いまなにじ？`, a: "8じはん", c: ["8じはん", "8じ", "9じ", "6じ"], cKana: [`8じはん`, `8じ`, `9じ`, `6じ`] },
        { q: "さんかく（三角形）の かどは なんこ ありますか？", qKana: `さんかく（さんかっけい）の かどは なんこ ありますか？`, a: "3こ", c: ["3こ", "4こ", "2こ", "5こ"], cKana: [`3こ`, `4こ`, `2こ`, `5こ`] },
        { q: "1mの ものさしと 50cmの じょうぎ、ながいのは どちら？", qKana: `1mの ものさしと 50cmの じょうぎ、ながいのは どちら？`, a: "1mの ものさし", c: ["1mの ものさし", "50cmの じょうぎ", "おなじ", "わからない"], cKana: [`1mの ものさし`, `50cmの じょうぎ`, `おなじ`, `わからない`] }
      ];
      const sel = pool[Math.floor(Math.random() * pool.length)];
      word = sel.q;
      wordKana = ('qKana' in sel && sel.qKana) || word;
      answerStr = sel.a;
      [choices, choicesKana] = shuffledWithKana(sel.c, ('cKana' in sel ? sel.cKana : undefined) as string[] | undefined);
      break;
    }
    case 'g2_geom': {
      const pool = [
        { q: "1L（リットル）は 何dL（デシリットル）ですか？", qKana: `1L（リットル）は なんdL（デシリットル）ですか？`, a: "10dL", c: ["10dL", "100dL", "1000dL", "1dL"], cKana: [`10dL`, `100dL`, `1000dL`, `1dL`] },
        { q: "1dL（デシリットル）は 何mL（ミリリットル）ですか？", qKana: `1dL（デシリットル）は なんmL（ミリリットル）ですか？`, a: "100mL", c: ["100mL", "10mL", "1000mL", "50mL"], cKana: [`100mL`, `10mL`, `1000mL`, `50mL`] },
        { q: "1m（メートル）は 何mm（ミリメートル）ですか？", qKana: `1m（メートル）は なんmm（ミリメートル）ですか？`, a: "1000mm", c: ["1000mm", "100mm", "10mm", "10000mm"], cKana: [`1000mm`, `100mm`, `10mm`, `10000mm`] },
        { q: "直角（ちょっかく）は 何度（なんど）ですか？", qKana: `ちょっかくは なんどですか？`, a: "90度", c: ["90度", "180度", "60度", "45度"], cKana: [`90ど`, `180ど`, `60ど`, `45ど`] },
        { q: "正方形（せいほうけい）の 4つの辺の長さは どうなっていますか？", qKana: `せいほうけいの 4つのへんのながさは どうなっていますか？`, a: "すべて等しい", c: ["すべて等しい", "向かい合う辺だけ等しい", "すべてちがう", "2つだけ等しい"], cKana: [`すべてひとしい`, `むかいあうへんだけひとしい`, `すべてちがう`, `2つだけひとしい`] },
        { q: "はこの形（直方体）の ちょう点（かど）は 何こ ある？", qKana: `はこのかたち（ちょくほうたい）の ちょうてん（かど）は なんこ ある？`, a: "8こ", c: ["8こ", "6こ", "12こ", "4こ"], cKana: [`8こ`, `6こ`, `12こ`, `4こ`] },
        { q: "30dL（デシリットル）は 何Lですか？", qKana: `30dL（デシリットル）は なんLですか？`, a: "3L", c: ["3L", "30L", "300L", "0.3L"], cKana: [`3L`, `30L`, `300L`, `0.3L`] },
        { q: "長方形（ちょうほうけい）の むかいあう 2つの辺の長さは どうなっていますか？", qKana: `ちょうほうけいの むかいあう 2つのへんのながさは どうなっていますか？`, a: "等しい", c: ["等しい", "ちがう", "たしざんになる", "半分になる"], cKana: [`ひとしい`, `ちがう`, `たしざんになる`, `はんぶんになる`] },
        { q: "三角じょうぎには どんな かどが ある？", qKana: `さんかくじょうぎには どんな かどが ある？`, a: "直角", c: ["直角", "円", "曲線", "五角形"], cKana: [`ちょっかく`, `えん`, `きょくせん`, `ごかっけい`] }
      ];
      const sel = pool[Math.floor(Math.random() * pool.length)];
      word = sel.q;
      wordKana = ('qKana' in sel && sel.qKana) || word;
      answerStr = sel.a;
      [choices, choicesKana] = shuffledWithKana(sel.c, ('cKana' in sel ? sel.cKana : undefined) as string[] | undefined);
      break;
    }
    case 'g3_geom': {
      const diameter3 = [6, 8, 10, 12, 14][Math.floor(Math.random() * 5)];
      const pool = [
        { q: "1km（キロメートル）は 何m ですか？", qKana: `1km（キロメートル）は なんm ですか？`, a: "1000m", c: ["1000m", "100m", "10000m", "500m"], cKana: [`1000m`, `100m`, `10000m`, `500m`] },
        { q: "1kg（キログラム）は 何g ですか？", qKana: `1kg（キログラム）は なんg ですか？`, a: "1000g", c: ["1000g", "100g", "10000g", "10g"], cKana: [`1000g`, `100g`, `10000g`, `10g`] },
        { q: "1t（トン）は 何kg ですか？", qKana: `1t（トン）は なんkg ですか？`, a: "1000kg", c: ["1000kg", "100kg", "10000kg", "500kg"], cKana: [`1000kg`, `100kg`, `10000kg`, `500kg`] },
        { q: "三角形の 3つの角の大きさを合わせると 何度？", qKana: `さんかっけいの 3つのかくのおおきさをあわせると なんど？`, a: "180度", c: ["180度", "360度", "90度", "270度"], cKana: [`180ど`, `360ど`, `90ど`, `270ど`] },
        { q: "2つの辺の長さが等しい三角形を何という？", qKana: `2つのへんのながさがひとしいさんかっけいをなにという？`, a: "二等辺三角形", c: ["二等辺三角形", "正三角形", "直角三角形", "直角二等辺三角形"], cKana: [`にとうへんさんかっけい`, `せいさんかっけい`, `ちょっかくさんかっけい`, `ちょっかくにとうへんさんかっけい`] },
        { q: "3つの辺の長さがすべて等しい三角形を何という？", qKana: `3つのへんのながさがすべてひとしいさんかっけいをなにという？`, a: "正三角形", c: ["正三角形", "二等辺三角形", "鋭角三角形", "不等辺三角形"], cKana: [`せいさんかっけい`, `にとうへんさんかっけい`, `えいかくさんかっけい`, `ふとうへんさんかっけい`] },
        { q: "円の直径は、半径の 何倍ですか？", qKana: `えんのちょっけいは、はんけいの なんばいですか？`, a: "2倍", c: ["2倍", "3倍", "4倍", "半分"], cKana: [`2ばい`, `3ばい`, `4ばい`, `はんぶん`] },
        { q: `直径 ${diameter3}cm の 円の半径は 何cmですか？`, qKana: `ちょっけい ${diameter3}cm の えんのはんけいは なんcmですか？`, a: `${diameter3 / 2}cm`, c: [`${diameter3 / 2}cm`, `${diameter3}cm`, `${diameter3 * 2}cm`, `${diameter3 / 2 + 2}cm`], cKana: [`${diameter3 / 2}cm`, `${diameter3}cm`, `${diameter3 * 2}cm`, `${diameter3 / 2 + 2}cm`] },
        { q: "正三角形の 3つの角の大きさは、それぞれ 何度ですか？", qKana: `せいさんかっけいの 3つのかくのおおきさは、それぞれ なんどですか？`, a: "60度", c: ["60度", "90度", "45度", "180度"], cKana: [`60ど`, `90ど`, `45ど`, `180ど`] },
        { q: "コンパスを つかうと、なにを かくことが できますか？", qKana: `コンパスを つかうと、なにを かくことが できますか？`, a: "円", c: ["円", "直線", "四角形", "三角形"], cKana: [`えん`, `ちょくせん`, `しかっけい`, `さんかっけい`] }
      ];
      const sel = pool[Math.floor(Math.random() * pool.length)];
      word = sel.q;
      wordKana = ('qKana' in sel && sel.qKana) || word;
      answerStr = sel.a;
      [choices, choicesKana] = shuffledWithKana(sel.c, ('cKana' in sel ? sel.cKana : undefined) as string[] | undefined);
      break;
    }
    case 'g4_geom': {
      const w = Math.floor(Math.random() * 5) + 4;
      const h = Math.floor(Math.random() * 4) + 3;
      const angleA = [30, 40, 50, 60, 70][Math.floor(Math.random() * 5)];
      const pool = [
        { q: `たて ${h}cm、横 ${w}cm の長方形の面積は何cm²？`, qKana: `たて ${h}cm、よこ ${w}cm のちょうほうけいのめんせきはなんcm²？`, a: `${h * w}cm²`, c: [`${h * w}cm²`, `${h * w + (h + w)}cm²`, `${h * w + 4}cm²`, `${h * w - 3}cm²`], cKana: [`${h * w}cm²`, `${h * w + (h + w)}cm²`, `${h * w + 4}cm²`, `${h * w - 3}cm²`] },
        { q: `1辺が ${w}cm の正方形の面積は何cm²？`, qKana: `1へんが ${w}cm のせいほうけいのめんせきはなんcm²？`, a: `${w * w}cm²`, c: [`${w * w}cm²`, `${w * 2}cm²`, `${w * w + 5}cm²`, `${w * w - 4}cm²`], cKana: [`${w * w}cm²`, `${w * 2}cm²`, `${w * w + 5}cm²`, `${w * w - 4}cm²`] },
        { q: "四角形の 4つの角の大きさを合わせると 何度？", qKana: `しかっけいの 4つのかくのおおきさをあわせると なんど？`, a: "360度", c: ["360度", "180度", "270度", "540度"], cKana: [`360ど`, `180ど`, `270ど`, `540ど`] },
        { q: "1a（アール）は 何m² ですか？", qKana: `1a（アール）は なんm² ですか？`, a: "100m²", c: ["100m²", "10m²", "1000m²", "10000m²"], cKana: [`100m²`, `10m²`, `1000m²`, `10000m²`] },
        { q: "1ha（ヘクタール）は 何m² ですか？", qKana: `1ha（ヘクタール）は なんm² ですか？`, a: "10000m²", c: ["10000m²", "1000m²", "100m²", "100000m²"], cKana: [`10000m²`, `1000m²`, `100m²`, `100000m²`] },
        { q: "向かい合う2組の辺がどちらも平行な四角形を何という？", qKana: `むかいあう2くみのへんがどちらもへいこうなしかっけいをなにという？`, a: "平行四辺形", c: ["平行四辺形", "台形", "ひし形", "長方形"], cKana: [`へいこうしへんけい`, `だいけい`, `ひしがた`, `ちょうほうけい`] },
        { q: "4つの辺の長さがすべて等しい四角形を何という？", qKana: `4つのへんのながさがすべてひとしいしかっけいをなにという？`, a: "ひし形", c: ["ひし形", "台形", "長方形", "平行四辺形"], cKana: [`ひしがた`, `だいけい`, `ちょうほうけい`, `へいこうしへんけい`] },
        { q: `一直線の角度は 180度です。片方が ${angleA}度のとき、もう片方は 何度？`, qKana: `いっちょくせんのかくどは 180どです。かたほうが ${angleA}どのとき、もうかたほうは なんど？`, a: `${180 - angleA}度`, c: [`${180 - angleA}度`, `${angleA}度`, `${360 - angleA}度`, `${90 - angleA >= 0 ? 90 - angleA : angleA}度`], cKana: [`${180 - angleA}ど`, `${angleA}ど`, `${360 - angleA}ど`, `${90 - angleA >= 0 ? 90 - angleA : angleA}ど`] },
        { q: "平行四辺形の 向かい合う角の大きさは どうなっていますか？", qKana: `へいこうしへんけいの むかいあうかくのおおきさは どうなっていますか？`, a: "等しい", c: ["等しい", "たすと180度", "たすと360度", "ちがう"], cKana: [`ひとしい`, `たすと180ど`, `たすと360ど`, `ちがう`] }
      ];
      const sel = pool[Math.floor(Math.random() * pool.length)];
      word = sel.q;
      wordKana = ('qKana' in sel && sel.qKana) || word;
      answerStr = sel.a;
      [choices, choicesKana] = shuffledWithKana(sel.c, ('cKana' in sel ? sel.cKana : undefined) as string[] | undefined);
      break;
    }
    case 'g5_geom': {
      const base = (Math.floor(Math.random() * 4) + 3) * 2;
      const height = Math.floor(Math.random() * 5) + 3;
      const cubeSide = Math.floor(Math.random() * 4) + 3; // 3-6
      const cubeVolume = cubeSide ** 3;
      const pool = [
        { q: `底辺 ${base}cm、高さ ${height}cm の三角形の面積は何cm²？`, qKana: `ていへん ${base}cm、たかさ ${height}cm のさんかっけいのめんせきはなんcm²？`, a: `${(base * height) / 2}cm²`, c: [`${(base * height) / 2}cm²`, `${base * height}cm²`, `${(base * height) / 2 + 5}cm²`, `${(base * height) / 2 + base}cm²`], cKana: [`${(base * height) / 2}cm²`, `${base * height}cm²`, `${(base * height) / 2 + 5}cm²`, `${(base * height) / 2 + base}cm²`] },
        { q: `底辺 ${base}cm、高さ ${height}cm の平行四辺形の面積は何cm²？`, qKana: `ていへん ${base}cm、たかさ ${height}cm のへいこうしへんけいのめんせきはなんcm²？`, a: `${base * height}cm²`, c: [`${base * height}cm²`, `${(base * height) / 2}cm²`, `${base * height + 10}cm²`, `${base * height + height}cm²`], cKana: [`${base * height}cm²`, `${(base * height) / 2}cm²`, `${base * height + 10}cm²`, `${base * height + height}cm²`] },
        { q: "たて 4cm、横 5cm、高さ 3cm の直方体の体積は何cm³？", qKana: `たて 4cm、よこ 5cm、たかさ 3cm のちょくほうたいのたいせきはなんcm³？`, a: "60cm³", c: ["60cm³", "40cm³", "12cm³", "48cm³"], cKana: [`60cm³`, `40cm³`, `12cm³`, `48cm³`] },
        { q: "1m³（立方メートル）は 何L（リットル）ですか？", qKana: `1m³（りっぽうめーとる）は なんL（リットル）ですか？`, a: "1000L", c: ["1000L", "100L", "10000L", "10L"], cKana: [`1000L`, `100L`, `10000L`, `10L`] },
        { q: "五角形の内角の和は 何度ですか？", qKana: `ごかっけいのないかくのわは なんどですか？`, a: "540度", c: ["540度", "360度", "720度", "180度"], cKana: [`540ど`, `360ど`, `720ど`, `180ど`] },
        { q: "六角形の内角の和は 何度ですか？", qKana: `ろっかっけいのないかくのわは なんどですか？`, a: "720度", c: ["720度", "540度", "360度", "900度"], cKana: [`720ど`, `540ど`, `360ど`, `900ど`] },
        { q: "円周の長さを求める公式はどれですか？", qKana: `えんしゅうのながさをもとめるこうしきはどれですか？`, a: "直径 × 円周率", c: ["直径 × 円周率", "半径 × 円周率", "半径 × 半径 × 円周率", "直径 × 直径 × 円周率"], cKana: [`ちょっけい × えんしゅうりつ`, `はんけい × えんしゅうりつ`, `はんけい × はんけい × えんしゅうりつ`, `ちょっけい × ちょっけい × えんしゅうりつ`] },
        { q: `1辺が ${cubeSide}cm の 立方体の体積は 何cm³？`, qKana: `1へんが ${cubeSide}cm の りっぽうたいのたいせきは なんcm³？`, a: `${cubeVolume}cm³`, c: [`${cubeVolume}cm³`, `${cubeSide * 2}cm³`, `${cubeSide * cubeSide}cm³`, `${cubeVolume + cubeSide}cm³`], cKana: [`${cubeVolume}cm³`, `${cubeSide * 2}cm³`, `${cubeSide * cubeSide}cm³`, `${cubeVolume + cubeSide}cm³`] },
        { q: "三角柱の 面（めん）は ぜんぶで 何こ ありますか？", qKana: `さんかくちゅうの めんは ぜんぶで なんこ ありますか？`, a: "5こ", c: ["5こ", "6こ", "4こ", "8こ"], cKana: [`5こ`, `6こ`, `4こ`, `8こ`] }
      ];
      const sel = pool[Math.floor(Math.random() * pool.length)];
      word = sel.q;
      wordKana = ('qKana' in sel && sel.qKana) || word;
      answerStr = sel.a;
      [choices, choicesKana] = shuffledWithKana(sel.c, ('cKana' in sel ? sel.cKana : undefined) as string[] | undefined);
      break;
    }
    case 'g6_geom': {
      const r = [3, 4, 5, 10][Math.floor(Math.random() * 4)]; // r=2だと面積(4π)と円周(4π)が偶然一致するため除外
      const area = Math.round(r * r * 3.14 * 10) / 10;
      const circ = Math.round(2 * r * 3.14 * 10) / 10;
      const cylBase = [10, 15, 20, 25][Math.floor(Math.random() * 4)];
      const cylHeight = Math.floor(Math.random() * 5) + 4; // 4-8
      const cylVolume = cylBase * cylHeight;
      const pool = [
        { q: `半径 ${r}cm の円の面積は何cm²？ (円周率は3.14)`, qKana: `はんけい ${r}cm のえんのめんせきはなんcm²？ (えんしゅうりつは3.14)`, a: `${area}cm²`, c: [`${area}cm²`, `${circ}cm²`, `${area + 5}cm²`, `${area - 4}cm²`], cKana: [`${area}cm²`, `${circ}cm²`, `${area + 5}cm²`, `${area - 4}cm²`] },
        { q: `半径 ${r}cm の円の円周の長さは何cm？ (円周率は3.14)`, qKana: `はんけい ${r}cm のえんのえんしゅうのながさはなんcm？ (えんしゅうりつは3.14)`, a: `${circ}cm`, c: [`${circ}cm`, `${area}cm`, `${circ + 2}cm`, `${circ - 1}cm`], cKana: [`${circ}cm`, `${area}cm`, `${circ + 2}cm`, `${circ - 1}cm`] },
        { q: "底面積 20cm²、高さ 6cm の円柱の体積は何cm³？", qKana: `そこめんせき 20cm²、たかさ 6cm のえんちゅうのたいせきはなんcm³？`, a: "120cm³", c: ["120cm³", "60cm³", "240cm³", "80cm³"], cKana: [`120cm³`, `60cm³`, `240cm³`, `80cm³`] },
        { q: "線対称な図形で、対応する点を結ぶ直線と対称の軸はどう交わりますか？", qKana: `せんたいしょうなづけいで、たいおうするてんをむすぶちょくせんとたいしょうのじくはどうまじわりますか？`, a: "垂直に交わる", c: ["垂直に交わる", "平行になる", "交わらない", "斜めに交わる"], cKana: [`すいちょくにまじわる`, `へいこうになる`, `まじわらない`, `ななめにまじわる`] },
        { q: "点対称な図形で、対応する点を結ぶ直線は必ずどこを通る？", qKana: `てんたいしょうなづけいで、たいおうするてんをむすぶちょくせんはかならずどこをとおる？`, a: "対称の中心", c: ["対称の中心", "図形の頂点", "対称の軸", "外側"], cKana: [`たいしょうのちゅうしん`, `づけいのちょうてん`, `たいしょうのじく`, `そとがわ`] },
        { q: "拡大図や縮図で、対応する角の大きさはどうなりますか？", qKana: `かくだいずやしゅくずで、たいおうするかくのおおきさはどうなりますか？`, a: "すべて等しい", c: ["すべて等しい", "拡大した分大きくなる", "半分になる", "直角になる"], cKana: [`すべてひとしい`, `かくだいしたぶんおおきくなる`, `はんぶんになる`, `ちょっかくになる`] },
        { q: `底面積 ${cylBase}cm²、高さ ${cylHeight}cm の 角柱の体積は 何cm³？`, qKana: `そこめんせき ${cylBase}cm²、たかさ ${cylHeight}cm の かくちゅうのたいせきは なんcm³？`, a: `${cylVolume}cm³`, c: [`${cylVolume}cm³`, `${cylBase + cylHeight}cm³`, `${cylVolume / 2}cm³`, `${cylVolume + cylBase}cm³`], cKana: [`${cylVolume}cm³`, `${cylBase + cylHeight}cm³`, `${cylVolume / 2}cm³`, `${cylVolume + cylBase}cm³`] },
        { q: "2倍に拡大した図形で、もとの図形と対応する辺の長さの比は？", qKana: `2ばいにかくだいしたづけいで、もとのづけいとたいおうするへんのながさのひは？`, a: "1：2", c: ["1：2", "2：2", "1：1", "1：4"], cKana: [`1：2`, `2：2`, `1：1`, `1：4`] }
      ];
      const sel = pool[Math.floor(Math.random() * pool.length)];
      word = sel.q;
      wordKana = ('qKana' in sel && sel.qKana) || word;
      answerStr = sel.a;
      [choices, choicesKana] = shuffledWithKana(sel.c, ('cKana' in sel ? sel.cKana : undefined) as string[] | undefined);
      break;
    }

    default:
      a = Math.floor(Math.random() * 9) + 1;
      b = Math.floor(Math.random() * 9) + 1;
      word = `${a} + ${b}`;
      answerStr = (a + b).toString();
      choices = generateWrongChoices(a + b);
      break;
  }

  const uniqueId = Math.random().toString(36).substring(2, 9);
  return {
    id: `math_${skillId}_${uniqueId}`,
    grade: skill.grade,
    word,
    wordKana: wordKana || word,
    reading: answerStr,
    type: "math",
    category: skill.category,
    choices,
    choicesKana: choicesKana.length === choices.length ? choicesKana : choices
  };
}

export function getRandomMathQuestions(
  skillIds: string[] = [],
  count: number = 5,
  grade: number = 1,
  category?: 'calc' | 'logic' | 'geometry'
): MathQuestion[] {
  let targetSkillList: MathSkill[] = [];

  if (skillIds.length > 0) {
    targetSkillList = MATH_SKILLS.filter(s => skillIds.includes(s.id));
  }

  if (targetSkillList.length === 0) {
    if (category) {
      targetSkillList = MATH_SKILLS.filter(s => s.category === category && s.grade === grade);
      if (targetSkillList.length === 0) {
        targetSkillList = MATH_SKILLS.filter(s => s.category === category);
      }
    } else {
      // Default: math calculation skills for the user's grade
      targetSkillList = MATH_SKILLS.filter(s => s.category === 'calc' && s.grade === grade);
      if (targetSkillList.length === 0) {
        targetSkillList = MATH_SKILLS.filter(s => s.category === 'calc');
      }
    }
  }

  const questions: MathQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const selectedSkill = targetSkillList[Math.floor(Math.random() * targetSkillList.length)] || MATH_SKILLS[0];
    questions.push(generateSkillQuestion(selectedSkill.id));
  }

  return questions;
}

export function getRevengeMathQuestions(mistakeIds: string[], count: number = 5): MathQuestion[] {
  const validMistakes = mistakeIds.filter(id => id.startsWith('math_'));
  if (validMistakes.length === 0) return [];
  
  const shuffled = validMistakes.sort(() => 0.5 - Math.random()).slice(0, count);
  
  return shuffled.map(id => {
    const parts = id.split('_');
    const skillId = `${parts[1]}_${parts[2]}${parts[3] && !parts[3].match(/^[0-9a-z]{7}$/) ? '_' + parts[3] : ''}`;
    const match = MATH_SKILLS.find(s => s.id === skillId) || MATH_SKILLS.find(s => skillId.startsWith(s.id));
    
    if (match) {
      return generateSkillQuestion(match.id);
    } else {
      return generateSkillQuestion(MATH_SKILLS[0].id);
    }
  });
}
