export type SocialQuestion = {
  id: string;
  grade: number;
  word: string;     // 問題文
  reading: string;  // 正解（表示・判定用）
  choices: string[]; // 4択の選択肢
};

export const SOCIAL_QUESTIONS: SocialQuestion[] = [
  // --- 3年生 ---
  {
    id: "soc_g3_01",
    grade: 3,
    word: "地図記号で、二重の丸「◎」は何を表している？",
    reading: "市役所（区役所）",
    choices: ["市役所（区役所）", "警察署", "消防署", "学校"]
  },
  {
    id: "soc_g3_02",
    grade: 3,
    word: "火事が起きたときに「119番」で通報する場所はどこ？",
    reading: "消防署（しょうぼうしょ）",
    choices: ["消防署（しょうぼうしょ）", "警察署", "病院", "郵便局"]
  },
  {
    id: "soc_g3_03",
    grade: 3,
    word: "事件や事故が起きたときに「110番」で通報する場所はどこ？",
    reading: "警察署（けいさつしょ）",
    choices: ["警察署（けいさつしょ）", "消防署", "市役所", "保健所"]
  },
  {
    id: "soc_g3_04",
    grade: 3,
    word: "方位磁針（ほういじしん）で「N」が指す方角はどこ？",
    reading: "北（きた）",
    choices: ["北（きた）", "南（みなみ）", "東（ひがし）", "西（にし）"]
  },
  {
    id: "soc_g3_05",
    grade: 3,
    word: "野菜や米を育てる農業を行う人を何とよぶ？",
    reading: "農家（のうか）",
    choices: ["農家（のうか）", "漁師（りょうし）", "職人（しょくにん）", "商人（しょうにん）"]
  },

  // --- 4年生 ---
  {
    id: "soc_g4_01",
    grade: 4,
    word: "日本にある都道府県（とどうふけん）は全部でいくつ？",
    reading: "47",
    choices: ["47", "43", "50", "45"]
  },
  {
    id: "soc_g4_02",
    grade: 4,
    word: "ごみを燃やして処分（しょぶん）する施設を何という？",
    reading: "清掃工場（ごみ処理場）",
    choices: ["清掃工場（ごみ処理場）", "浄水場", "発電所", "下水処理場"]
  },
  {
    id: "soc_g4_03",
    grade: 4,
    word: "川の水を引き込んで田んぼに水を送るための水路を何という？",
    reading: "用水路（ようすいろ）",
    choices: ["用水路（ようすいろ）", "下水道", "貯水池", "トンネル"]
  },
  {
    id: "soc_g4_04",
    grade: 4,
    word: "日本の首都（しゅと）はどこ？",
    reading: "東京都",
    choices: ["東京都", "大阪府", "京都府", "神奈川県"]
  },
  {
    id: "soc_g4_05",
    grade: 4,
    word: "地震や大雨のときに、安全な場所へ避難することを促す情報を何という？",
    reading: "防災情報（避難指示）",
    choices: ["防災情報（避難指示）", "交通情報", "天気予報", "観光案内"]
  },

  // --- 5年生 ---
  {
    id: "soc_g5_01",
    grade: 5,
    word: "日本の国土の約何パーセントが山地（森林）？",
    reading: "約70%",
    choices: ["約70%", "約30%", "約50%", "約90%"]
  },
  {
    id: "soc_g5_02",
    grade: 5,
    word: "日本で一番広い平野は何平野？",
    reading: "関東平野（かんとうへいや）",
    choices: ["関東平野（かんとうへいや）", "濃尾平野", "石狩平野", "越後平野"]
  },
  {
    id: "soc_g5_03",
    grade: 5,
    word: "米づくりがさかんな越後平野がある都道府県はどこ？",
    reading: "新潟県（にいがたけん）",
    choices: ["新潟県（にいがたけん）", "秋田県", "山形県", "北海道"]
  },
  {
    id: "soc_g5_04",
    grade: 5,
    word: "自動車や電気製品などを工場で作る産業を何という？",
    reading: "工業（製造業）",
    choices: ["工業（製造業）", "水産業", "林業", "サービス業"]
  },
  {
    id: "soc_g5_05",
    grade: 5,
    word: "海外から食料や製品を買い入れることを何という？",
    reading: "輸入（ゆにゅう）",
    choices: ["輸入（ゆにゅう）", "輸出（ゆしゅつ）", "貿易（ぼうえき）", "生産（せいさん）"]
  },

  // --- 6年生 ---
  {
    id: "soc_g6_01",
    grade: 6,
    word: "聖徳太子が定めた、役人の心構えを示した憲法は？",
    reading: "十七条の憲法",
    choices: ["十七条の憲法", "大日本帝国憲法", "日本国憲法", "御成敗式目"]
  },
  {
    id: "soc_g6_02",
    grade: 6,
    word: "江戸幕府（えどばくふ）を開いた武将は誰？",
    reading: "徳川家康（とくがわいえやす）",
    choices: ["徳川家康（とくがわいえやす）", "織田信長", "豊臣秀吉", "源頼朝"]
  },
  {
    id: "soc_g6_03",
    grade: 6,
    word: "日本の最高法規である現在の憲法は何？",
    reading: "日本国憲法",
    choices: ["日本国憲法", "十七条の憲法", "大日本帝国憲法", "明治憲法"]
  },
  {
    id: "soc_g6_04",
    grade: 6,
    word: "日本国憲法の三大原則は、国民主権、基本的人権の尊重、あと一つは何？",
    reading: "平和主義",
    choices: ["平和主義", "三権分立", "地方自治", "法の下の平等"]
  },
  {
    id: "soc_g6_05",
    grade: 6,
    word: "国会、内閣、裁判所が互いにチェックしあう仕組みを何という？",
    reading: "三権分立（さんけんぶんりつ）",
    choices: ["三権分立（さんけんぶんりつ）", "民主主義", "二院制", "国民投票"]
  }
];

export function getRandomSocialQuestions(grades: number[], count: number = 5): SocialQuestion[] {
  const filtered = SOCIAL_QUESTIONS.filter(q => grades.includes(q.grade));
  const pool = filtered.length > 0 ? filtered : SOCIAL_QUESTIONS;
  
  const shuffled = [...pool].sort(() => Math.random() - 0.5).map(q => ({...q, choices: [...q.choices].sort(() => Math.random() - 0.5)}));
  return shuffled.slice(0, count);
}

export function getRevengeSocialQuestions(mistakeIds: string[], count: number = 10): SocialQuestion[] {
  const filtered = SOCIAL_QUESTIONS.filter(q => mistakeIds.includes(q.word) || mistakeIds.includes(q.id));
  const pool = filtered.length > 0 ? filtered : SOCIAL_QUESTIONS;
  const shuffled = [...pool].sort(() => Math.random() - 0.5).map(q => ({...q, choices: [...q.choices].sort(() => Math.random() - 0.5)}));
  return shuffled.slice(0, count);
}
