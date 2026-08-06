export type ScienceQuestion = {
  id: string;
  grade: number;
  word: string;     // 問題文
  reading: string;  // 正解（表示・判定用）
  choices: string[]; // 4択の選択肢（正解を含む）
};

export const SCIENCE_QUESTIONS: ScienceQuestion[] = [
  // --- 3年生 ---
  {
    id: "sci_g3_01",
    grade: 3,
    word: "昆虫（こんちゅう）の体の部分は、あたま・むね と あと一つは何？",
    reading: "はら",
    choices: ["はら", "あし", "はね", "くび"]
  },
  {
    id: "sci_g3_02",
    grade: 3,
    word: "ひまわりの種が発芽（はつが）するために必要なのは、水と空気とあと何？",
    reading: "てきとうな温度",
    choices: ["てきとうな温度", "肥料（ひりょう）", "土", "強い風"]
  },
  {
    id: "sci_g3_03",
    grade: 3,
    word: "虫めがねで太陽の光をあつめると、紙はどうなる？",
    reading: "こげてけむりが出る",
    choices: ["こげてけむりが出る", "ふくらむ", "こおる", "色が変わる"]
  },
  {
    id: "sci_g3_04",
    grade: 3,
    word: "じしゃくのN極とS極を近づけると、どうなる？",
    reading: "ひきあう",
    choices: ["ひきあう", "しりぞけあう", "なにもおきない", "熱くなる"]
  },
  {
    id: "sci_g3_05",
    grade: 3,
    word: "影（かげ）ができるのは、何があるとき？",
    reading: "光",
    choices: ["光", "風", "水", "土"]
  },

  // --- 4年生 ---
  {
    id: "sci_g4_01",
    grade: 4,
    word: "空気はあたためられると、体積（たいせき）はどうなる？",
    reading: "大きくなる",
    choices: ["大きくなる", "小さくなる", "変わらない", "半分になる"]
  },
  {
    id: "sci_g4_02",
    grade: 4,
    word: "水が冷やされて氷になるとき、体積はどうなる？",
    reading: "大きくなる",
    choices: ["大きくなる", "小さくなる", "変わらない", "消えてなくなる"]
  },
  {
    id: "sci_g4_03",
    grade: 4,
    word: "月が夜空で形を変えて見えるのはなぜ？",
    reading: "太陽の光があたる位置が変わるから",
    choices: ["太陽の光があたる位置が変わるから", "月が削れるから", "雲にかくれるから", "地球の影だから"]
  },
  {
    id: "sci_g4_04",
    grade: 4,
    word: "かん電池を2つ直列（ちょくれつ）につなぐと、豆電球の明るさはどうなる？",
    reading: "明るくなる",
    choices: ["明るくなる", "暗くなる", "変わらない", "きえる"]
  },
  {
    id: "sci_g4_05",
    grade: 4,
    word: "骨（ほね）と筋肉（きんにく）で、体が曲がる関節（かんせつ）の役割は何？",
    reading: "骨と骨をつなぎ曲げるため",
    choices: ["骨と骨をつなぎ曲げるため", "息をするため", "血を流すため", "体温をあげるため"]
  },

  // --- 5年生 ---
  {
    id: "sci_g5_01",
    grade: 5,
    word: "植物が日光を受けてでんぷん（養分）を作る働きを何という？",
    reading: "光合成（こうごうせい）",
    choices: ["光合成（こうごうせい）", "呼吸（こきゅう）", "蒸散（じょうさん）", "発酵（はっこう）"]
  },
  {
    id: "sci_g5_02",
    grade: 5,
    word: "胎児（たいじ）はお母さんの子宮の中で、何を通じて栄養や酸素をもらう？",
    reading: "へその緒（お）",
    choices: ["へその緒（お）", "心臓", "胃", "皮膚"]
  },
  {
    id: "sci_g5_03",
    grade: 5,
    word: "食塩を水に溶かしたとき、水溶液全体の重さはどうなる？",
    reading: "水と食塩の重さの合計になる",
    choices: ["水と食塩の重さの合計になる", "食塩の分だけ軽くなる", "水の重さだけになる", "重さが倍になる"]
  },
  {
    id: "sci_g5_04",
    grade: 5,
    word: "台風の雲の渦（うず）は、上空から見るとどちら回り？",
    reading: "反時計回り",
    choices: ["反時計回り", "時計回り", "直線状", "ランダム"]
  },
  {
    id: "sci_g5_05",
    grade: 5,
    word: "振り子（ふりこ）が1往復する時間は、何によって変わる？",
    reading: "振り子の長さ",
    choices: ["振り子の長さ", "おもりの重さ", "振り始める角度", "おもりの色"]
  },

  // --- 6年生 ---
  {
    id: "sci_g6_01",
    grade: 6,
    word: "物の燃え方で、集気びんの中でろうそくが燃え続けるために必要な気体は？",
    reading: "酸素（さんそ）",
    choices: ["酸素（さんそ）", "二酸化炭素", "窒素（ちっそ）", "水素"]
  },
  {
    id: "sci_g6_02",
    grade: 6,
    word: "唾液（だえき）に含まれる消化酵素アミラーゼは、でんぷんを何に変える？",
    reading: "麦芽糖（たんぱく質ではなく糖）",
    choices: ["麦芽糖（たんぱく質ではなく糖）", "脂肪", "ビタミン", "カルシウム"]
  },
  {
    id: "sci_g6_03",
    grade: 6,
    word: "てこの原理で、力を加える場所を何という？",
    reading: "力点（りきてん）",
    choices: ["力点（りきてん）", "支点（してん）", "作用点（さようてん）", "頂点（ちょうてん）"]
  },
  {
    id: "sci_g6_04",
    grade: 6,
    word: "炭酸水（たんさんすい）に溶けている気体は何？",
    reading: "二酸化炭素",
    choices: ["二酸化炭素", "酸素", "塩化水素", "アンモニア"]
  },
  {
    id: "sci_g6_05",
    grade: 6,
    word: "地層（ちそう）が重なってできるとき、一般に古い地層はどこにある？",
    reading: "一番下",
    choices: ["一番下", "一番上", "真ん中", "関係ない"]
  }
];

export function getRandomScienceQuestions(grades: number[], count: number = 5): ScienceQuestion[] {
  const filtered = SCIENCE_QUESTIONS.filter(q => grades.includes(q.grade));
  const pool = filtered.length > 0 ? filtered : SCIENCE_QUESTIONS;
  
  const shuffled = [...pool].sort(() => Math.random() - 0.5).map(q => ({...q, choices: [...q.choices].sort(() => Math.random() - 0.5)}));
  return shuffled.slice(0, count);
}

export function getRevengeScienceQuestions(mistakeIds: string[], count: number = 10): ScienceQuestion[] {
  const filtered = SCIENCE_QUESTIONS.filter(q => mistakeIds.includes(q.word) || mistakeIds.includes(q.id));
  const pool = filtered.length > 0 ? filtered : SCIENCE_QUESTIONS;
  const shuffled = [...pool].sort(() => Math.random() - 0.5).map(q => ({...q, choices: [...q.choices].sort(() => Math.random() - 0.5)}));
  return shuffled.slice(0, count);
}
