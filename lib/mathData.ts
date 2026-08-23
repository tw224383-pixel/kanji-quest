export type MathQuestion = {
  id: string;
  grade: number;
  word: string; // The math equation or question text
  okurigana?: string;
  reading: string; // The correct answer as a string
  type: "math";
  choices: string[]; // 4 choices including the correct answer
  category?: 'calc' | 'logic' | 'geometry';
  rationale?: string;
};

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
  let answerStr = "";
  let choices: string[] = [];
  
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
        { q: `あめが ${a}こ あります。${b}こ もらいました。ぜんぶで なんこ？`, a: a + b, u: "こ" },
        { q: `りんごが ${a}こ あります。${b}こ たべました。のこりは なんこ？`, a: a - b, u: "こ" },
        { q: `とりが ${a}わ います。${b}わ とんできました。あわせて なんわ？`, a: a + b, u: "わ" },
        { q: `あかいくるまが ${a}だい、あおいくるまが ${b}だい あります。あかは なんだい おおい？`, a: a - b, u: "だい" },
        { q: `こどもが まえから ${a}ばんめ に ならんでいます。うしろに ${b}にん います。ぜんぶで なんにん？`, a: a + b, u: "にん" },
        { q: `10に なるには、${a} に あと いくつ たせば いい？`, a: 10 - a, u: "" },
        { q: `ふうせんが ${a}こ あります。${b}こ われました。のこりは なんこ？`, a: a - b, u: "こ" },
        { q: `つりで さかなを ${a}ひき つりました。おとうとは ${b}ひき つりました。あわせて なんびき？`, a: a + b, u: "ひき" },
        { q: `えんぴつを ${a}ほん もっています。おかあさんから ${b}ほん もらいました。ぜんぶで なんぼん？`, a: a + b, u: "ほん" },
        { q: `きょうしつに こどもが ${a}にん います。${b}にん かえりました。のこりは なんにん？`, a: a - b, u: "にん" },
        { q: `どうぶつえんで さるを ${a}ひき、ぱんだを ${b}ひき みました。あわせて なんびき？`, a: a + b, u: "ひき" },
        { q: `はこに みかんが ${a}こ はいっています。${b}こ たべました。のこりは なんこ？`, a: a - b, u: "こ" }
      ];
      const p = patterns[Math.floor(Math.random() * patterns.length)];
      word = p.q;
      answerStr = `${p.a}${p.u}`;
      choices = generateWrongChoices(p.a, false, p.u);
      break;
    }
    case 'g2_logic': {
      a = Math.floor(Math.random() * 6) + 3;
      b = Math.floor(Math.random() * 5) + 2;
      if (a < b) { const t = a; a = b; b = t; } // ひき算で答えがマイナスにならないようにする
      const totalKids = (a + 2) * 5;
      const girlsCount = b + 3;
      const patterns = [
        { q: `1さらに ケーキが ${a}こ あります。${b}さら では ぜんぶで 何こ？`, a: a * b, u: "こ" },
        { q: `子どもが ${b}人 います。1人に ${a}本ずつ えんぴつを くばると、何本いる？`, a: a * b, u: "本" },
        { q: `${a * 10}円の ノートと ${b * 10}円の けしゴムを かいました。代金は 何円？`, a: (a + b) * 10, u: "円" },
        { q: `100円玉を 1まい 出して、${a * 10}円の アメを かいました。おつりは 何円？`, a: 100 - (a * 10), u: "円" },
        { q: `50円玉が ${b}まい あります。ぜんぶで 何円？`, a: 50 * b, u: "円" },
        { q: `ぜんぶで ${totalKids}人 います。女子が ${girlsCount}人のとき、男子は 何人？`, a: totalKids - girlsCount, u: "人" },
        { q: `午前 9時 から 30分 たつと、何時何分？`, a: "9時30分", c: ["9時30分", "9時20分", "10時", "9時40分"] },
        { q: `おりがみを ${a}まい もっています。${b}まい もらいました。あわせて 何まい？`, a: a + b, u: "まい" },
        { q: `1はこに たまごが ${a}こ はいっています。${b}はこでは たまごは 何こ？`, a: a * b, u: "こ" },
        { q: `色紙が ${a}まい あります。${b}まい つかいました。のこりは 何まい？`, a: a - b, u: "まい" },
        { q: `午前 9時40分 から 30分 たつと、何時何分？`, a: "10時10分", c: ["10時10分", "9時70分", "10時", "9時10分"] },
        { q: `午後 3時 から 40分 まえは 何時何分でしたか？`, a: "2時20分", c: ["2時20分", "3時40分", "2時40分", "3時20分"] }
      ];
      const p = patterns[Math.floor(Math.random() * patterns.length)];
      word = p.q;
      if ('c' in p) {
        answerStr = p.a as string;
        choices = (p.c as string[]).sort(() => 0.5 - Math.random());
      } else {
        answerStr = `${p.a}${p.u}`;
        choices = generateWrongChoices(p.a as number, false, p.u);
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
        { q: `${a}この クッキーを ${b}人で 同じ数ずつ 分けると、1人 何こ？`, a: answer, u: "こ" },
        { q: `${a}枚の シールを 1人に ${b}枚ずつ 配ると、何人に 配れる？`, a: answer, u: "人" },
        { q: `1本 ${price}円の ペンを ${count}本 買って 1000円さつを 出しました。おつりは 何円？`, a: 1000 - (price * count), u: "円" },
        { q: `${dividend2}こ の アメを ${divisor2}人で 同じ数ずつ 分けると、あまりは 何こ？`, a: remainder2, u: "こ" },
        { q: `長いす 1脚に ${b}人ずつ すわると、${answer}脚で 何人すわれる？`, a: a, u: "人" },
        { q: `午後 1時30分 から 45分 たつと、何時何分？`, a: "午後2時15分", c: ["午後2時15分", "午後2時", "午後2時30分", "午後1時75分"] },
        { q: `1箱に ${b}こ入りの チョコが ${answer}箱 あります。ぜんぶで 何こ？`, a: a, u: "こ" },
        { q: `1本 ${price}円の ノートを 3本 かうと、代金は 何円？`, a: price * 3, u: "円" },
        { q: `午前 10時15分 から 50分 たつと、何時何分？`, a: "午前11時5分", c: ["午前11時5分", "午前10時65分", "午前11時", "午前10時5分"] },
        { q: `長さ ${b}m の リボンを ${answer}本 作るには、何m の リボンが ひつよう？`, a: a, u: "m" },
        { q: `画用紙が ${a}まい あります。${b}人で 同じ数ずつ 分けると、1人 何まい？`, a: answer, u: "まい" }
      ];
      const p = patterns[Math.floor(Math.random() * patterns.length)];
      word = p.q;
      if ('c' in p) {
        answerStr = p.a as string;
        choices = (p.c as string[]).sort(() => 0.5 - Math.random());
      } else {
        answerStr = `${p.a}${p.u}`;
        choices = generateWrongChoices(p.a as number, false, p.u);
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
        { q: `1本 ${a}円の ジュースを ${b}本 買って 1000円 出したときの おつりは 何円？`, a: 1000 - (a * b), u: "円" },
        { q: `${boysCount2 > girlsCount2 ? '男子' : '女子'}が ${Math.max(boysCount2, girlsCount2)}人、${boysCount2 > girlsCount2 ? '女子' : '男子'}が ${Math.min(boysCount2, girlsCount2)}人 います。${groupSize}人ずつの 班を作ると 何班できる？`, a: groupCount, u: "班" },
        { q: `兄は ${myMoney}円、弟は ${otherMoney}円 持っています。兄のお金は 弟の 何倍？`, a: ratio, u: "倍" },
        { q: `1日に ${pagesPerDay}ページずつ 読むと、${totalPages}ページの本は 何日で 読み終わる？`, a: days, u: "日" },
        { q: `2人の持っているお金の合計が ${moneySum}円で、差が ${moneyDiff}円です。多い方は 何円？`, a: (moneySum + moneyDiff) / 2, u: "円" },
        { q: `${lcmX} と ${lcmY} の 最小公倍数（さいしょうこうばいすう）は いくつ？`, a: lcmVal, u: "" },
        { q: `${seqStart}から はじまり ${seqStep}ずつ 増える 数が ならんでいます。${seqN}番目の 数は 何？`, a: seqStart + seqStep * (seqN - 1), u: "" },
        { q: `(${px} + ${py}) × ${pz} は いくつ？`, a: (px + py) * pz, u: "" },
        { q: `本が ${totalStudents * 4}さつ あります。1つの たなに ${groupSize * 4}さつずつ ならべると、たなは 何つ ひつよう？`, a: (totalStudents * 4) / (groupSize * 4), u: "つ" }
      ];
      const p = patterns[Math.floor(Math.random() * patterns.length)];
      word = p.q;
      answerStr = `${p.a}${p.u}`;
      choices = generateWrongChoices(p.a, false, p.u);
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
        { q: `定価 ${price}円の 服が ${discount}%引き（${discount / 10}割引き）で 売られています。売り値は 何円？`, a: discountedPrice, u: "円" },
        { q: `テストの点数が ${avg - 5}点、${avg}点、${avg + 5}点 でした。3回の 平均点は 何点？`, a: avg, u: "点" },
        { q: `全体で ${total1}人 います。そのうち ${percent1}% が メガネをかけています。何人？`, a: (total1 * percent1) / 100, u: "人" },
        { q: `${classSize}人のクラスで、男子が ${percent2}% です。男子は 何人？`, a: (classSize * percent2) / 100, u: "人" },
        { q: `面積 ${area}km² の町に ${pop}人 住んでいます。1km² あたりの人口（人口密度）は 何人？`, a: density, u: "人" },
        { q: `定員 ${capacity}人の バスに ${riders}人 乗っています。乗車率は 何%ですか？`, a: busPercent, u: "%" },
        { q: `定価 ${price2}円の 本が ${discount2}%引きで 売られています。何円 安くなりましたか？`, a: (price2 * discount2) / 100, u: "円" },
        { q: `りんごが ${perItemCount}こで ${perItemTotal}円でした。1こあたり 何円？`, a: perItemPrice, u: "円" }
      ];
      const p = patterns[Math.floor(Math.random() * patterns.length)];
      word = p.q;
      answerStr = `${p.a}${p.u}`;
      choices = generateWrongChoices(p.a, false, p.u);
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
        { q: `時速 ${speed}km で走る 車が ${hours}時間 進むと、進んだ道のりは 何km？`, a: speed * hours, u: "km" },
        { q: `${speed * hours}km の道のりを ${hours}時間 で走ったときの 時速は 何km？`, a: speed, u: "km" },
        { q: `姉と妹で チョコを ${ratioPair[0]} : ${ratioPair[1]} の比で 分けます。全体が ${ratioTotal}このとき、姉は 何こ？`, a: ratioAnswer, u: "こ" },
        { q: `面積が ${rectArea}cm² の長方形で、たてが ${rectHeight}cm のとき、横の長さは 何cm？`, a: rectWidth, u: "cm" },
        { q: `${combN}人（A, B, C, D...）の中から、リレーの選手 2人を選ぶ組み合わせは 何通り？`, a: combAnswer, u: "通り" },
        { q: `${distanceX}km の道のりを 時速 ${speedB}km で走ると、何時間 かかる？`, a: timeX, u: "時間" },
        { q: `分速 ${speedPerMin}m で歩く人が ${minutesX}分間に 進む道のりは 何m？`, a: speedPerMin * minutesX, u: "m" }
      ];
      const p = patterns[Math.floor(Math.random() * patterns.length)];
      word = p.q;
      answerStr = `${p.a}${p.u}`;
      choices = generateWrongChoices(p.a, false, p.u);
      break;
    }

    // ==========================================
    // 3. 空間・図形・単位 (Geometry & Units)
    // ==========================================
    case 'g1_geom': {
      const pool = [
        { q: "1m（めーとる）は なんcm（せんちめーとる）ですか？", a: "100cm", c: ["100cm", "10cm", "1000cm", "50cm"] },
        { q: "とけいの ながいはりが 12、みじかいはりが 4 をさしています。いまなにじ？", a: "4じ", c: ["4じ", "12じ", "4じはん", "3じ"] },
        { q: "ながしかくの かどは なんこ ありますか？", a: "4こ", c: ["4こ", "3こ", "5こ", "6こ"] },
        { q: "さいころ（はこのかたち）の めんは ぜんぶで なんこ ある？", a: "6こ", c: ["6こ", "4こ", "8こ", "12こ"] },
        { q: "とけいの ながいはりが 6、みじかいはりが 8と9のあいだを さしています。いまなにじ？", a: "8じはん", c: ["8じはん", "8じ", "9じ", "6じ"] },
        { q: "さんかく（三角形）の かどは なんこ ありますか？", a: "3こ", c: ["3こ", "4こ", "2こ", "5こ"] },
        { q: "1mの ものさしと 50cmの じょうぎ、ながいのは どちら？", a: "1mの ものさし", c: ["1mの ものさし", "50cmの じょうぎ", "おなじ", "わからない"] }
      ];
      const sel = pool[Math.floor(Math.random() * pool.length)];
      word = sel.q;
      answerStr = sel.a;
      choices = sel.c.sort(() => 0.5 - Math.random());
      break;
    }
    case 'g2_geom': {
      const pool = [
        { q: "1L（リットル）は 何dL（デシリットル）ですか？", a: "10dL", c: ["10dL", "100dL", "1000dL", "1dL"] },
        { q: "1dL（デシリットル）は 何mL（ミリリットル）ですか？", a: "100mL", c: ["100mL", "10mL", "1000mL", "50mL"] },
        { q: "1m（メートル）は 何mm（ミリメートル）ですか？", a: "1000mm", c: ["1000mm", "100mm", "10mm", "10000mm"] },
        { q: "直角（ちょっかく）は 何度（なんど）ですか？", a: "90度", c: ["90度", "180度", "60度", "45度"] },
        { q: "正方形（せいほうけい）の 4つの辺の長さは どうなっていますか？", a: "すべて等しい", c: ["すべて等しい", "向かい合う辺だけ等しい", "すべてちがう", "2つだけ等しい"] },
        { q: "はこの形（直方体）の ちょう点（かど）は 何こ ある？", a: "8こ", c: ["8こ", "6こ", "12こ", "4こ"] },
        { q: "30dL（デシリットル）は 何Lですか？", a: "3L", c: ["3L", "30L", "300L", "0.3L"] },
        { q: "長方形（ちょうほうけい）の むかいあう 2つの辺の長さは どうなっていますか？", a: "等しい", c: ["等しい", "ちがう", "たしざんになる", "半分になる"] },
        { q: "三角じょうぎには どんな かどが ある？", a: "直角", c: ["直角", "円", "曲線", "五角形"] }
      ];
      const sel = pool[Math.floor(Math.random() * pool.length)];
      word = sel.q;
      answerStr = sel.a;
      choices = sel.c.sort(() => 0.5 - Math.random());
      break;
    }
    case 'g3_geom': {
      const diameter3 = [6, 8, 10, 12, 14][Math.floor(Math.random() * 5)];
      const pool = [
        { q: "1km（キロメートル）は 何m ですか？", a: "1000m", c: ["1000m", "100m", "10000m", "500m"] },
        { q: "1kg（キログラム）は 何g ですか？", a: "1000g", c: ["1000g", "100g", "10000g", "10g"] },
        { q: "1t（トン）は 何kg ですか？", a: "1000kg", c: ["1000kg", "100kg", "10000kg", "500kg"] },
        { q: "三角形の 3つの角の大きさを合わせると 何度？", a: "180度", c: ["180度", "360度", "90度", "270度"] },
        { q: "2つの辺の長さが等しい三角形を何という？", a: "二等辺三角形", c: ["二等辺三角形", "正三角形", "直角三角形", "直角二等辺三角形"] },
        { q: "3つの辺の長さがすべて等しい三角形を何という？", a: "正三角形", c: ["正三角形", "二等辺三角形", "鋭角三角形", "不等辺三角形"] },
        { q: "円の直径は、半径の 何倍ですか？", a: "2倍", c: ["2倍", "3倍", "4倍", "半分"] },
        { q: `直径 ${diameter3}cm の 円の半径は 何cmですか？`, a: `${diameter3 / 2}cm`, c: [`${diameter3 / 2}cm`, `${diameter3}cm`, `${diameter3 * 2}cm`, `${diameter3 / 2 + 2}cm`] },
        { q: "正三角形の 3つの角の大きさは、それぞれ 何度ですか？", a: "60度", c: ["60度", "90度", "45度", "180度"] },
        { q: "コンパスを つかうと、なにを かくことが できますか？", a: "円", c: ["円", "直線", "四角形", "三角形"] }
      ];
      const sel = pool[Math.floor(Math.random() * pool.length)];
      word = sel.q;
      answerStr = sel.a;
      choices = sel.c.sort(() => 0.5 - Math.random());
      break;
    }
    case 'g4_geom': {
      const w = Math.floor(Math.random() * 5) + 4;
      const h = Math.floor(Math.random() * 4) + 3;
      const angleA = [30, 40, 50, 60, 70][Math.floor(Math.random() * 5)];
      const pool = [
        { q: `たて ${h}cm、横 ${w}cm の長方形の面積は何cm²？`, a: `${h * w}cm²`, c: [`${h * w}cm²`, `${h * w + (h + w)}cm²`, `${h * w + 4}cm²`, `${h * w - 3}cm²`] },
        { q: `1辺が ${w}cm の正方形の面積は何cm²？`, a: `${w * w}cm²`, c: [`${w * w}cm²`, `${w * 2}cm²`, `${w * w + 5}cm²`, `${w * w - 4}cm²`] },
        { q: "四角形の 4つの角の大きさを合わせると 何度？", a: "360度", c: ["360度", "180度", "270度", "540度"] },
        { q: "1a（アール）は 何m² ですか？", a: "100m²", c: ["100m²", "10m²", "1000m²", "10000m²"] },
        { q: "1ha（ヘクタール）は 何m² ですか？", a: "10000m²", c: ["10000m²", "1000m²", "100m²", "100000m²"] },
        { q: "向かい合う2組の辺がどちらも平行な四角形を何という？", a: "平行四辺形", c: ["平行四辺形", "台形", "ひし形", "長方形"] },
        { q: "4つの辺の長さがすべて等しい四角形を何という？", a: "ひし形", c: ["ひし形", "台形", "長方形", "平行四辺形"] },
        { q: `一直線の角度は 180度です。片方が ${angleA}度のとき、もう片方は 何度？`, a: `${180 - angleA}度`, c: [`${180 - angleA}度`, `${angleA}度`, `${360 - angleA}度`, `${90 - angleA >= 0 ? 90 - angleA : angleA}度`] },
        { q: "平行四辺形の 向かい合う角の大きさは どうなっていますか？", a: "等しい", c: ["等しい", "たすと180度", "たすと360度", "ちがう"] }
      ];
      const sel = pool[Math.floor(Math.random() * pool.length)];
      word = sel.q;
      answerStr = sel.a;
      choices = sel.c.sort(() => 0.5 - Math.random());
      break;
    }
    case 'g5_geom': {
      const base = (Math.floor(Math.random() * 4) + 3) * 2;
      const height = Math.floor(Math.random() * 5) + 3;
      const cubeSide = Math.floor(Math.random() * 4) + 3; // 3-6
      const cubeVolume = cubeSide ** 3;
      const pool = [
        { q: `底辺 ${base}cm、高さ ${height}cm の三角形の面積は何cm²？`, a: `${(base * height) / 2}cm²`, c: [`${(base * height) / 2}cm²`, `${base * height}cm²`, `${(base * height) / 2 + 5}cm²`, `${(base * height) / 2 + base}cm²`] },
        { q: `底辺 ${base}cm、高さ ${height}cm の平行四辺形の面積は何cm²？`, a: `${base * height}cm²`, c: [`${base * height}cm²`, `${(base * height) / 2}cm²`, `${base * height + 10}cm²`, `${base * height + height}cm²`] },
        { q: "たて 4cm、横 5cm、高さ 3cm の直方体の体積は何cm³？", a: "60cm³", c: ["60cm³", "40cm³", "12cm³", "48cm³"] },
        { q: "1m³（立方メートル）は 何L（リットル）ですか？", a: "1000L", c: ["1000L", "100L", "10000L", "10L"] },
        { q: "五角形の内角の和は 何度ですか？", a: "540度", c: ["540度", "360度", "720度", "180度"] },
        { q: "六角形の内角の和は 何度ですか？", a: "720度", c: ["720度", "540度", "360度", "900度"] },
        { q: "円周の長さを求める公式はどれですか？", a: "直径 × 円周率", c: ["直径 × 円周率", "半径 × 円周率", "半径 × 半径 × 円周率", "直径 × 直径 × 円周率"] },
        { q: `1辺が ${cubeSide}cm の 立方体の体積は 何cm³？`, a: `${cubeVolume}cm³`, c: [`${cubeVolume}cm³`, `${cubeSide * 2}cm³`, `${cubeSide * cubeSide}cm³`, `${cubeVolume + cubeSide}cm³`] },
        { q: "三角柱の 面（めん）は ぜんぶで 何こ ありますか？", a: "5こ", c: ["5こ", "6こ", "4こ", "8こ"] }
      ];
      const sel = pool[Math.floor(Math.random() * pool.length)];
      word = sel.q;
      answerStr = sel.a;
      choices = sel.c.sort(() => 0.5 - Math.random());
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
        { q: `半径 ${r}cm の円の面積は何cm²？ (円周率は3.14)`, a: `${area}cm²`, c: [`${area}cm²`, `${circ}cm²`, `${area + 5}cm²`, `${area - 4}cm²`] },
        { q: `半径 ${r}cm の円の円周の長さは何cm？ (円周率は3.14)`, a: `${circ}cm`, c: [`${circ}cm`, `${area}cm`, `${circ + 2}cm`, `${circ - 1}cm`] },
        { q: "底面積 20cm²、高さ 6cm の円柱の体積は何cm³？", a: "120cm³", c: ["120cm³", "60cm³", "240cm³", "80cm³"] },
        { q: "線対称な図形で、対応する点を結ぶ直線と対称の軸はどう交わりますか？", a: "垂直に交わる", c: ["垂直に交わる", "平行になる", "交わらない", "斜めに交わる"] },
        { q: "点対称な図形で、対応する点を結ぶ直線は必ずどこを通る？", a: "対称の中心", c: ["対称の中心", "図形の頂点", "対称の軸", "外側"] },
        { q: "拡大図や縮図で、対応する角の大きさはどうなりますか？", a: "すべて等しい", c: ["すべて等しい", "拡大した分大きくなる", "半分になる", "直角になる"] },
        { q: `底面積 ${cylBase}cm²、高さ ${cylHeight}cm の 角柱の体積は 何cm³？`, a: `${cylVolume}cm³`, c: [`${cylVolume}cm³`, `${cylBase + cylHeight}cm³`, `${cylVolume / 2}cm³`, `${cylVolume + cylBase}cm³`] },
        { q: "2倍に拡大した図形で、もとの図形と対応する辺の長さの比は？", a: "1：2", c: ["1：2", "2：2", "1：1", "1：4"] }
      ];
      const sel = pool[Math.floor(Math.random() * pool.length)];
      word = sel.q;
      answerStr = sel.a;
      choices = sel.c.sort(() => 0.5 - Math.random());
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
    reading: answerStr,
    type: "math",
    category: skill.category,
    choices
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
