export type Rarity = "ノーマル" | "レア" | "激レア" | "超激レア" | "神レア";

export interface GachaItem {
  id: string;
  type: "title" | "avatar" | "effect" | "theme" | "xp";
  name: string;
  icon: string;
  rarity: Rarity;
  weight: number; // for lottery probability
}

// Probabilities: N: 55%, R: 30%, SR: 10%, SSR: 4.9%, UR: 0.1%
// Weights out of 100,000 total weight to easily support 0.1% (100 weight).
// Total weight = 100,000
// UR (0.1%) = 100 weight (divided by 5 items = 20 weight each)
// SSR (4.9%) = 4,900 weight (divided by 15 items = ~326 weight each)
// SR (10%) = 10,000 weight (divided by 25 items = 400 weight each)
// R (30%) = 30,000 weight (divided by 30 items = 1000 weight each)
// N (55%) = 55,000 weight (divided by 25 items = 2200 weight each)

export const allGachaItems: GachaItem[] = [
  // --- 神レア (UR) 0.1% ---
  { id: "全知全能の神", type: "title", name: "称号「全知全能の神」", icon: "🌌", rarity: "神レア", weight: 20 },
  { id: "マスターゴッド", type: "title", name: "称号「マスターゴッド」", icon: "👑", rarity: "神レア", weight: 20 },
  { id: "gacha_king", type: "avatar", name: "アバター「キング」", icon: "👑", rarity: "神レア", weight: 20 },
  { id: "galaxy", type: "effect", name: "エフェクト「ギャラクシー」", icon: "🌌", rarity: "神レア", weight: 20 },
  { id: "time_space", type: "theme", name: "テーマ「時空の支配者」", icon: "🕰️", rarity: "神レア", weight: 20 },

  // --- 超激レア (SSR) 4.9% ---
  { id: "伝説の勇者", type: "title", name: "称号「伝説の勇者」", icon: "⚔️", rarity: "超激レア", weight: 326 },
  { id: "暗黒魔王", type: "title", name: "称号「暗黒魔王」", icon: "👿", rarity: "超激レア", weight: 326 },
  { id: "奇跡を起こす者", type: "title", name: "称号「奇跡を起こす者」", icon: "✨", rarity: "超激レア", weight: 326 },
  { id: "破壊神", type: "title", name: "称号「破壊神」", icon: "🌋", rarity: "超激レア", weight: 326 },
  { id: "天才ハッカー", type: "title", name: "称号「天才ハッカー」", icon: "💻", rarity: "超激レア", weight: 326 },
  { id: "gacha_ancient_dragon", type: "avatar", name: "アバター「エンシェントドラゴン」", icon: "🐉", rarity: "超激レア", weight: 326 },
  { id: "gacha_pegasus", type: "avatar", name: "アバター「ペガサス」", icon: "🦄", rarity: "超激レア", weight: 326 },
  { id: "gacha_light_fairy", type: "avatar", name: "アバター「光の妖精」", icon: "🧚", rarity: "超激レア", weight: 326 },
  { id: "gacha_super_robot", type: "avatar", name: "アバター「スーパーロボット」", icon: "🤖", rarity: "超激レア", weight: 326 },
  { id: "gacha_alien_boss", type: "avatar", name: "アバター「宇宙人ボス」", icon: "👽", rarity: "超激レア", weight: 326 },
  { id: "aurora", type: "effect", name: "エフェクト「オーロラ」", icon: "🌈", rarity: "超激レア", weight: 326 },
  { id: "blackhole", type: "effect", name: "エフェクト「ブラックホール」", icon: "🕳️", rarity: "超激レア", weight: 326 },
  { id: "divine_thunder", type: "effect", name: "エフェクト「神の雷」", icon: "⚡", rarity: "超激レア", weight: 326 },
  { id: "skycastle", type: "theme", name: "テーマ「天空の城」", icon: "🏰", rarity: "超激レア", weight: 330 },
  { id: "magma", type: "theme", name: "テーマ「マグマ地帯」", icon: "🌋", rarity: "超激レア", weight: 330 },

  // --- 激レア (SR) 10.0% ---
  { id: "炎の剣士", type: "title", name: "称号「炎の剣士」", icon: "🔥", rarity: "激レア", weight: 400 },
  { id: "氷の魔導士", type: "title", name: "称号「氷の魔導士」", icon: "❄️", rarity: "激レア", weight: 400 },
  { id: "雷の暗殺者", type: "title", name: "称号「雷の暗殺者」", icon: "⚡", rarity: "激レア", weight: 400 },
  { id: "光の騎士", type: "title", name: "称号「光の騎士」", icon: "✨", rarity: "激レア", weight: 400 },
  { id: "闇の狩人", type: "title", name: "称号「闇の狩人」", icon: "🌑", rarity: "激レア", weight: 400 },
  { id: "黄金の盾", type: "title", name: "称号「黄金の盾」", icon: "🛡️", rarity: "激レア", weight: 400 },
  { id: "竜騎士", type: "title", name: "称号「竜騎士」", icon: "🐉", rarity: "激レア", weight: 400 },
  { id: "精霊使い", type: "title", name: "称号「精霊使い」", icon: "🍃", rarity: "激レア", weight: 400 },
  { id: "黒幕", type: "title", name: "称号「黒幕」", icon: "🎭", rarity: "激レア", weight: 400 },
  { id: "選ばれし者", type: "title", name: "称号「選ばれし者」", icon: "🌟", rarity: "激レア", weight: 400 },
  { id: "gacha_trex", type: "avatar", name: "アバター「T-REX」", icon: "🦖", rarity: "激レア", weight: 400 },
  { id: "gacha_griffin", type: "avatar", name: "アバター「グリフォン」", icon: "🦅", rarity: "激レア", weight: 400 },
  { id: "gacha_megalodon", type: "avatar", name: "アバター「メガロドン」", icon: "🦈", rarity: "激レア", weight: 400 },
  { id: "gacha_vampire", type: "avatar", name: "アバター「吸血鬼」", icon: "🧛", rarity: "激レア", weight: 400 },
  { id: "gacha_great_wizard", type: "avatar", name: "アバター「大魔法使い」", icon: "🧙", rarity: "激レア", weight: 400 },
  { id: "gacha_master_ninja", type: "avatar", name: "アバター「マスター忍者」", icon: "🥷", rarity: "激レア", weight: 400 },
  { id: "gacha_white_tiger", type: "avatar", name: "アバター「ホワイトタイガー」", icon: "🐯", rarity: "激レア", weight: 400 },
  { id: "gacha_fenrir", type: "avatar", name: "アバター「フェンリル」", icon: "🐺", rarity: "激レア", weight: 400 },
  { id: "sakura", type: "effect", name: "エフェクト「桜吹雪」", icon: "🌸", rarity: "激レア", weight: 400 },
  { id: "blizzard", type: "effect", name: "エフェクト「猛吹雪」", icon: "❄️", rarity: "激レア", weight: 400 },
  { id: "laser", type: "effect", name: "エフェクト「レーザー」", icon: "💥", rarity: "激レア", weight: 400 },
  { id: "aura", type: "effect", name: "エフェクト「黄金のオーラ」", icon: "💫", rarity: "激レア", weight: 400 },
  { id: "ruins", type: "theme", name: "テーマ「古代遺跡」", icon: "🏛️", rarity: "激レア", weight: 400 },
  { id: "cybercity", type: "theme", name: "テーマ「サイバーシティ」", icon: "🏙️", rarity: "激レア", weight: 400 },
  { id: "ocean", type: "theme", name: "テーマ「深海」", icon: "🌊", rarity: "激レア", weight: 400 },

  // --- レア (R) 30.0% ---
  { id: "修行中", type: "title", name: "称号「修行中」", icon: "💦", rarity: "レア", weight: 1000 },
  { id: "さすらいの", type: "title", name: "称号「さすらいの」", icon: "🚶", rarity: "レア", weight: 1000 },
  { id: "燃える", type: "title", name: "称号「燃える」", icon: "🔥", rarity: "レア", weight: 1000 },
  { id: "冷たい", type: "title", name: "称号「冷たい」", icon: "🧊", rarity: "レア", weight: 1000 },
  { id: "ビリビリの", type: "title", name: "称号「ビリビリの」", icon: "⚡", rarity: "レア", weight: 1000 },
  { id: "毒舌な", type: "title", name: "称号「毒舌な」", icon: "👅", rarity: "レア", weight: 1000 },
  { id: "影の", type: "title", name: "称号「影の」", icon: "👤", rarity: "レア", weight: 1000 },
  { id: "謎の", type: "title", name: "称号「謎の」", icon: "❓", rarity: "レア", weight: 1000 },
  { id: "古代の", type: "title", name: "称号「古代の」", icon: "🏺", rarity: "レア", weight: 1000 },
  { id: "未来の", type: "title", name: "称号「未来の」", icon: "🛸", rarity: "レア", weight: 1000 },
  { id: "狂暴な", type: "title", name: "称号「狂暴な」", icon: "😡", rarity: "レア", weight: 1000 },
  { id: "眠れる", type: "title", name: "称号「眠れる」", icon: "💤", rarity: "レア", weight: 1000 },
  { id: "覚醒した", type: "title", name: "称号「覚醒した」", icon: "👁️", rarity: "レア", weight: 1000 },
  { id: "暴走する", type: "title", name: "称号「暴走する」", icon: "💨", rarity: "レア", weight: 1000 },
  { id: "愛されし", type: "title", name: "称号「愛されし」", icon: "❤️", rarity: "レア", weight: 1000 },
  { id: "gacha_dog", type: "avatar", name: "アバター「犬」", icon: "🐶", rarity: "レア", weight: 1000 },
  { id: "gacha_cat", type: "avatar", name: "アバター「猫」", icon: "🐱", rarity: "レア", weight: 1000 },
  { id: "gacha_fox", type: "avatar", name: "アバター「キツネ」", icon: "🦊", rarity: "レア", weight: 1000 },
  { id: "gacha_bear", type: "avatar", name: "アバター「クマ」", icon: "🐻", rarity: "レア", weight: 1000 },
  { id: "gacha_panda", type: "avatar", name: "アバター「パンダ」", icon: "🐼", rarity: "レア", weight: 1000 },
  { id: "gacha_lion", type: "avatar", name: "アバター「ライオン」", icon: "🦁", rarity: "レア", weight: 1000 },
  { id: "gacha_frog", type: "avatar", name: "アバター「カエル」", icon: "🐸", rarity: "レア", weight: 1000 },
  { id: "gacha_owl", type: "avatar", name: "アバター「フクロウ」", icon: "🦉", rarity: "レア", weight: 1000 },
  { id: "gacha_ghost", type: "avatar", name: "アバター「おばけ」", icon: "👻", rarity: "レア", weight: 1000 },
  { id: "gacha_skull", type: "avatar", name: "アバター「ドクロ」", icon: "💀", rarity: "レア", weight: 1000 },
  { id: "gacha_fire", type: "effect", name: "エフェクト「メラメラ」", icon: "🔥", rarity: "レア", weight: 1000 },
  { id: "gacha_water", type: "effect", name: "エフェクト「ポコポコ」", icon: "💧", rarity: "レア", weight: 1000 },
  { id: "sparkle", type: "effect", name: "エフェクト「キラキラ」", icon: "✨", rarity: "レア", weight: 1000 },
  { id: "forest", type: "theme", name: "テーマ「魔法の森」", icon: "🌲", rarity: "レア", weight: 1000 },
  { id: "candy", type: "theme", name: "テーマ「お菓子の国」", icon: "🍭", rarity: "レア", weight: 1000 },

  // --- ノーマル (N) 55.0% ---
  { id: "普通の", type: "title", name: "称号「普通の」", icon: "😐", rarity: "ノーマル", weight: 2200 },
  { id: "いつもの", type: "title", name: "称号「いつもの」", icon: "☕", rarity: "ノーマル", weight: 2200 },
  { id: "寝坊した", type: "title", name: "称号「寝坊した」", icon: "⏰", rarity: "ノーマル", weight: 2200 },
  { id: "腹ペコの", type: "title", name: "称号「腹ペコの」", icon: "🤤", rarity: "ノーマル", weight: 2200 },
  { id: "宿題を忘れた", type: "title", name: "称号「宿題を忘れた」", icon: "📝", rarity: "ノーマル", weight: 2200 },
  { id: "ピーマン嫌いの", type: "title", name: "称号「ピーマン嫌いの」", icon: "🫑", rarity: "ノーマル", weight: 2200 },
  { id: "ゲーム好きの", type: "title", name: "称号「ゲーム好きの」", icon: "🎮", rarity: "ノーマル", weight: 2200 },
  { id: "泥だらけの", type: "title", name: "称号「泥だらけの」", icon: "💩", rarity: "ノーマル", weight: 2200 },
  { id: "お調子者", type: "title", name: "称号「お調子者」", icon: "🤪", rarity: "ノーマル", weight: 2200 },
  { id: "迷子の", type: "title", name: "称号「迷子の」", icon: "🗺️", rarity: "ノーマル", weight: 2200 },
  { id: "あわてんぼう", type: "title", name: "称号「あわてんぼう」", icon: "🏃", rarity: "ノーマル", weight: 2200 },
  { id: "のんびり屋", type: "title", name: "称号「のんびり屋」", icon: "🐢", rarity: "ノーマル", weight: 2200 },
  { id: "気まぐれな", type: "title", name: "称号「気まぐれな」", icon: "🐈", rarity: "ノーマル", weight: 2200 },
  { id: "泣き虫", type: "title", name: "称号「泣き虫」", icon: "😭", rarity: "ノーマル", weight: 2200 },
  { id: "忘れん坊", type: "title", name: "称号「忘れん坊」", icon: "🤷", rarity: "ノーマル", weight: 2200 },
  { id: "💩", type: "avatar", name: "アバター「うんち」", icon: "💩", rarity: "ノーマル", weight: 2200 },
  { id: "👽", type: "avatar", name: "アバター「グレイ」", icon: "👽", rarity: "ノーマル", weight: 2200 },
  { id: "🤡", type: "avatar", name: "アバター「ピエロ」", icon: "🤡", rarity: "ノーマル", weight: 2200 },
  { id: "🥸", type: "avatar", name: "アバター「変装」", icon: "🥸", rarity: "ノーマル", weight: 2200 },
  { id: "🤓", type: "avatar", name: "アバター「オタク」", icon: "🤓", rarity: "ノーマル", weight: 2200 },
  { id: "🥔", type: "avatar", name: "アバター「じゃがいも」", icon: "🥔", rarity: "ノーマル", weight: 2200 },
  { id: "🍄", type: "avatar", name: "アバター「キノコ」", icon: "🍄", rarity: "ノーマル", weight: 2200 },
  { id: "🐌", type: "avatar", name: "アバター「カタツムリ」", icon: "🐌", rarity: "ノーマル", weight: 2200 },
  { id: "🐢", type: "avatar", name: "アバター「カメ」", icon: "🐢", rarity: "ノーマル", weight: 2200 },
  { id: "🪨", type: "avatar", name: "アバター「ただの石」", icon: "🪨", rarity: "ノーマル", weight: 2200 },
];

export function pullGachaItem(): GachaItem {
  const totalWeight = allGachaItems.reduce((acc, item) => acc + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of allGachaItems) {
    if (random < item.weight) {
      return item;
    }
    random -= item.weight;
  }
  
  return allGachaItems[0]; // fallback
}

export const allRichGachaItems: GachaItem[] = [
  // --- かっこいい枠 (Cool) ---
  { id: "rich_dragon", type: "avatar", name: "アバター「神竜」", icon: "/kanji-quest/avatars/dragon.jpg", rarity: "神レア", weight: 20 },
  { id: "rich_knight", type: "avatar", name: "アバター「暗黒騎士」", icon: "/kanji-quest/avatars/knight.jpg", rarity: "超激レア", weight: 200 },
  { id: "rich_cyborg", type: "avatar", name: "アバター「サイボーグ」", icon: "/kanji-quest/avatars/cyborg.jpg", rarity: "超激レア", weight: 200 },
  { id: "rich_cool_wolf", type: "avatar", name: "アバター「孤高の狼」", icon: "/kanji-quest/avatars/cool_wolf.jpg", rarity: "激レア", weight: 1000 },
  { id: "rich_cool_griffin", type: "avatar", name: "アバター「グリフォン」", icon: "/kanji-quest/avatars/cool_griffin.jpg", rarity: "激レア", weight: 1000 },

  // --- かわいい枠 (Cute) ---
  { id: "rich_princess", type: "avatar", name: "アバター「プリンセス」", icon: "/kanji-quest/avatars/cute_princess.jpg", rarity: "神レア", weight: 20 },
  { id: "rich_angel", type: "avatar", name: "アバター「エンジェル」", icon: "/kanji-quest/avatars/cute_angel.jpg", rarity: "超激レア", weight: 200 },
  { id: "rich_magical", type: "avatar", name: "アバター「魔法少女」", icon: "/kanji-quest/avatars/cute_magical.jpg", rarity: "超激レア", weight: 200 },
  { id: "rich_fairy", type: "avatar", name: "アバター「フェアリー」", icon: "/kanji-quest/avatars/cute_fairy.jpg", rarity: "激レア", weight: 1000 },
  { id: "rich_mermaid", type: "avatar", name: "アバター「マーメイド」", icon: "/kanji-quest/avatars/cute_mermaid.jpg", rarity: "激レア", weight: 1000 },
];

export function pullRichGachaItem(): GachaItem {
  const totalWeight = allRichGachaItems.reduce((acc, item) => acc + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of allRichGachaItems) {
    if (random < item.weight) {
      return item;
    }
    random -= item.weight;
  }
  
  return allRichGachaItems[0]; // fallback
}

// Compute display rates for UI
export const gachaRates = [
  { rarity: "神レア", rate: "0.1%", color: "text-purple-500", bg: "bg-purple-100", items: allGachaItems.filter(i => i.rarity === "神レア") },
  { rarity: "超激レア", rate: "4.9%", color: "text-red-500", bg: "bg-red-100", items: allGachaItems.filter(i => i.rarity === "超激レア") },
  { rarity: "激レア", rate: "10.0%", color: "text-amber-500", bg: "bg-amber-100", items: allGachaItems.filter(i => i.rarity === "激レア") },
  { rarity: "レア", rate: "30.0%", color: "text-blue-500", bg: "bg-blue-100", items: allGachaItems.filter(i => i.rarity === "レア") },
  { rarity: "ノーマル", rate: "55.0%", color: "text-slate-500", bg: "bg-slate-200", items: allGachaItems.filter(i => i.rarity === "ノーマル") },
];

const totalRichWeight = allRichGachaItems.reduce((acc, item) => acc + item.weight, 0);
export const richGachaRates = [
  { rarity: "神レア", rate: "0.8%", color: "text-purple-500", bg: "bg-purple-100", items: allRichGachaItems.filter(i => i.rarity === "神レア") },
  { rarity: "超激レア", rate: "16.5%", color: "text-red-500", bg: "bg-red-100", items: allRichGachaItems.filter(i => i.rarity === "超激レア") },
  { rarity: "激レア", rate: "82.6%", color: "text-amber-500", bg: "bg-amber-100", items: allRichGachaItems.filter(i => i.rarity === "激レア") },
];
