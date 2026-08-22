export type Rarity = "ノーマル" | "レア" | "激レア" | "超激レア" | "神レア";

export interface GachaItem {
  id: string;
  type: "title" | "avatar" | "effect" | "theme" | "xp" | "equipment";
  name: string;
  icon: string;
  rarity: Rarity;
  weight: number; // for lottery probability
  gachaName?: string;
}

// UR (0.1%) = 100 weight (divided by 5 items = 20 weight each)
// SSR (4.9%) = 4,900 weight (divided by 15 items = ~326 weight each)
// SR (10%) = 10,000 weight (divided by 25 items = 400 weight each)
// R (30%) = 30,000 weight (divided by 30 items = 1000 weight each)
// N (55%) = 55,000 weight (divided by 25 items = 2200 weight each)

export const allGachaItems: GachaItem[] = [
  // --- 神レア (UR) 0.1% ---
  { id: "全知全能の神", type: "title", name: "称号「全知全能の神」", icon: "🌌", rarity: "神レア", weight: 20 },
  { id: "マスターゴッド", type: "title", name: "称号「マスターゴッド」", icon: "👑", rarity: "神レア", weight: 20 },
  { id: "galaxy", type: "effect", name: "エフェクト「ギャラクシー」", icon: "🌌", rarity: "神レア", weight: 20 },
  { id: "time_space", type: "theme", name: "テーマ「時空の支配者」", icon: "🕰️", rarity: "神レア", weight: 20 },

  // --- 超激レア (SSR) 4.9% ---
  { id: "伝説の勇者", type: "title", name: "称号「伝説の勇者」", icon: "⚔️", rarity: "超激レア", weight: 326 },
  { id: "暗黒魔王", type: "title", name: "称号「暗黒魔王」", icon: "👿", rarity: "超激レア", weight: 326 },
  { id: "奇跡を起こす者", type: "title", name: "称号「奇跡を起こす者」", icon: "✨", rarity: "超激レア", weight: 326 },
  { id: "破壊神", type: "title", name: "称号「破壊神」", icon: "🌋", rarity: "超激レア", weight: 326 },
  { id: "天才ハッカー", type: "title", name: "称号「天才ハッカー」", icon: "💻", rarity: "超激レア", weight: 326 },
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
  { id: "rich_dragon", type: "avatar", name: "アバター「神竜」", icon: "/avatars/dragon.webp", rarity: "神レア", weight: 20 },
  { id: "rich_knight", type: "avatar", name: "アバター「暗黒騎士」", icon: "/avatars/knight.webp", rarity: "超激レア", weight: 200 },
  { id: "rich_cyborg", type: "avatar", name: "アバター「サイボーグ」", icon: "/avatars/cyborg.webp", rarity: "超激レア", weight: 200 },
  { id: "rich_cool_wolf", type: "avatar", name: "アバター「孤高の狼」", icon: "/avatars/cool_wolf.webp", rarity: "激レア", weight: 1000 },
  { id: "rich_cool_griffin", type: "avatar", name: "アバター「グリフォン」", icon: "/avatars/cool_griffin.webp", rarity: "激レア", weight: 1000 },

  // --- かわいい枠 (Cute) ---
  { id: "rich_princess", type: "avatar", name: "アバター「プリンセス」", icon: "/avatars/cute_princess_v4.webp", rarity: "神レア", weight: 20 },
  { id: "rich_angel", type: "avatar", name: "アバター「エンジェル」", icon: "/avatars/cute_angel_v4.webp", rarity: "超激レア", weight: 200 },
  { id: "rich_magical", type: "avatar", name: "アバター「魔法少女」", icon: "/avatars/cute_magical_v4.webp", rarity: "超激レア", weight: 200 },
  { id: "rich_fairy", type: "avatar", name: "アバター「フェアリー」", icon: "/avatars/cute_fairy_v4.webp", rarity: "激レア", weight: 1000 },
  { id: "rich_mermaid", type: "avatar", name: "アバター「マーメイド」", icon: "/avatars/cute_mermaid_v4.webp", rarity: "激レア", weight: 1000 },
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

export const allRichGacha2Items: GachaItem[] = [
  { id: "ノーマル_堅牢の山岳ドワーフ", type: "avatar", name: "アバター「堅牢の山岳ドワーフ」", icon: "/images/gacha2/ノーマル_堅牢の山岳ドワーフ.webp", rarity: "ノーマル", weight: 6875 },
  { id: "ノーマル_堕落した聖騎士", type: "avatar", name: "アバター「堕落した聖騎士」", icon: "/images/gacha2/ノーマル_堕落した聖騎士.webp", rarity: "ノーマル", weight: 6875 },
  { id: "ノーマル_嵐を呼ぶハーピー・リーダー", type: "avatar", name: "アバター「嵐を呼ぶハーピー・リーダー」", icon: "/images/gacha2/ノーマル_嵐を呼ぶハーピー・リーダー.webp", rarity: "ノーマル", weight: 6875 },
  { id: "ノーマル_災厄の双頭キマイラ", type: "avatar", name: "アバター「災厄の双頭キマイラ」", icon: "/images/gacha2/ノーマル_災厄の双頭キマイラ.webp", rarity: "ノーマル", weight: 6875 },
  { id: "ノーマル_炎獄の魔戦士", type: "avatar", name: "アバター「炎獄の魔戦士」", icon: "/images/gacha2/ノーマル_炎獄の魔戦士.webp", rarity: "ノーマル", weight: 6875 },
  { id: "ノーマル_猛火のサラマンダーマン", type: "avatar", name: "アバター「猛火のサラマンダーマン」", icon: "/images/gacha2/ノーマル_猛火のサラマンダーマン.webp", rarity: "ノーマル", weight: 6875 },
  { id: "ノーマル_荒野の大剣豪", type: "avatar", name: "アバター「荒野の大剣豪」", icon: "/images/gacha2/ノーマル_荒野の大剣豪.webp", rarity: "ノーマル", weight: 6875 },
  { id: "ノーマル_近衛兵リーダー槍使い", type: "avatar", name: "アバター「近衛兵リーダー槍使い」", icon: "/images/gacha2/ノーマル_近衛兵リーダー槍使い.webp", rarity: "ノーマル", weight: 6875 },
  { id: "レア_エルフの森の射手", type: "avatar", name: "アバター「エルフの森の射手」", icon: "/images/gacha2/レア_エルフの森の射手.webp", rarity: "レア", weight: 7500 },
  { id: "レア_呪われし死霊騎士", type: "avatar", name: "アバター「呪われし死霊騎士」", icon: "/images/gacha2/レア_呪われし死霊騎士.webp", rarity: "レア", weight: 7500 },
  { id: "レア_氷結の魔女", type: "avatar", name: "アバター「氷結の魔女」", icon: "/images/gacha2/レア_氷結の魔女.webp", rarity: "レア", weight: 7500 },
  { id: "レア_蜘蛛の女戦士", type: "avatar", name: "アバター「蜘蛛の女戦士」", icon: "/images/gacha2/レア_蜘蛛の女戦士.webp", rarity: "レア", weight: 7500 },
  { id: "激レア_天才魔導士", type: "avatar", name: "アバター「天才魔導士」", icon: "/images/gacha2/激レア_天才魔導士.webp", rarity: "激レア", weight: 2500 },
  { id: "激レア_狂気の道化師", type: "avatar", name: "アバター「狂気の道化師」", icon: "/images/gacha2/激レア_狂気の道化師.webp", rarity: "激レア", weight: 2500 },
  { id: "激レア_蒼き魔法剣士", type: "avatar", name: "アバター「蒼き魔法剣士」", icon: "/images/gacha2/激レア_蒼き魔法剣士.webp", rarity: "激レア", weight: 2500 },
  { id: "激レア_闇の精霊使い", type: "avatar", name: "アバター「闇の精霊使い」", icon: "/images/gacha2/激レア_闇の精霊使い.webp", rarity: "激レア", weight: 2500 },
  { id: "神レア_漆黒の魔王軍将軍", type: "avatar", name: "アバター「漆黒の魔王軍将軍」", icon: "/images/gacha2/神レア_漆黒の魔王軍将軍.webp", rarity: "神レア", weight: 20 },
  { id: "神レア_終焉の魔王", type: "avatar", name: "アバター「終焉の魔王」", icon: "/images/gacha2/神レア_終焉の魔王.webp", rarity: "神レア", weight: 20 },
  { id: "神レア_聖なるホワイトドラゴン", type: "avatar", name: "アバター「聖なるホワイトドラゴン」", icon: "/images/gacha2/神レア_聖なるホワイトドラゴン.webp", rarity: "神レア", weight: 20 },
  { id: "神レア_虚無の使者・カオスエージェント", type: "avatar", name: "アバター「虚無の使者・カオスエージェント」", icon: "/images/gacha2/神レア_虚無の使者・カオスエージェント.webp", rarity: "神レア", weight: 20 },
  { id: "神レア_虚空の堕天使", type: "avatar", name: "アバター「虚空の堕天使」", icon: "/images/gacha2/神レア_虚空の堕天使.webp", rarity: "神レア", weight: 20 },
  { id: "超激レア_大賢者", type: "avatar", name: "アバター「大賢者」", icon: "/images/gacha2/超激レア_大賢者.webp", rarity: "超激レア", weight: 1633 },
  { id: "超激レア_異次元の魔法使い", type: "avatar", name: "アバター「異次元の魔法使い」", icon: "/images/gacha2/超激レア_異次元の魔法使い.webp", rarity: "超激レア", weight: 1633 },
  { id: "超激レア_雷光の精霊・サンダービースト", type: "avatar", name: "アバター「雷光の精霊・サンダービースト」", icon: "/images/gacha2/超激レア_雷光の精霊・サンダービースト.webp", rarity: "超激レア", weight: 1634 },
];

export function pullRichGacha2Item(): GachaItem {
  const totalWeight = allRichGacha2Items.reduce((acc, item) => acc + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of allRichGacha2Items) {
    if (random < item.weight) return item;
    random -= item.weight;
  }
  return allRichGacha2Items[0];
}

export const richGacha2Rates = [
  { rarity: "神レア", rate: "0.1%", color: "text-purple-500", bg: "bg-purple-100", items: allRichGacha2Items.filter(i => i.rarity === "神レア") },
  { rarity: "超激レア", rate: "4.9%", color: "text-red-500", bg: "bg-red-100", items: allRichGacha2Items.filter(i => i.rarity === "超激レア") },
  { rarity: "激レア", rate: "10.0%", color: "text-amber-500", bg: "bg-amber-100", items: allRichGacha2Items.filter(i => i.rarity === "激レア") },
  { rarity: "レア", rate: "30.0%", color: "text-blue-500", bg: "bg-blue-100", items: allRichGacha2Items.filter(i => i.rarity === "レア") },
  { rarity: "ノーマル", rate: "55.0%", color: "text-slate-500", bg: "bg-slate-200", items: allRichGacha2Items.filter(i => i.rarity === "ノーマル") },
];

export const allSpEquipmentGachaItems: GachaItem[] = [
  { id: "eq_beginner_sword", type: "equipment", name: "装備「初心者用の剣」", icon: "🗡️", rarity: "ノーマル", weight: 5500 },
  { id: "eq_iron_shield", type: "equipment", name: "装備「鉄の丸盾」", icon: "🛡️", rarity: "ノーマル", weight: 5500 },
  { id: "eq_magic_cap", type: "equipment", name: "装備「とんがり帽子」", icon: "🎩", rarity: "レア", weight: 3000 },
  { id: "eq_steel_sword", type: "equipment", name: "装備「鋼鉄の大剣」", icon: "⚔️", rarity: "レア", weight: 3000 },
  { id: "eq_ranger_bow", type: "equipment", name: "装備「精霊の弓」", icon: "🏹", rarity: "激レア", weight: 1000 },
  { id: "eq_fire_axe", type: "equipment", name: "装備「火炎の戦斧」", icon: "🪓", rarity: "激レア", weight: 1000 },
  { id: "eq_silver_crown", type: "equipment", name: "装備「銀の王冠」", icon: "👑", rarity: "激レア", weight: 1000 },
  { id: "eq_crystal_orb", type: "equipment", name: "装備「予言の水晶玉」", icon: "🔮", rarity: "超激レア", weight: 490 },
  { id: "eq_poseidon_trident", type: "equipment", name: "装備「深海の三叉槍」", icon: "🔱", rarity: "超激レア", weight: 490 },
  { id: "eq_angel_wings", type: "equipment", name: "装備「大天使の聖翼」", icon: "🪽", rarity: "超激レア", weight: 490 },
  { id: "eq_demon_wings", type: "equipment", name: "装備「宵闇の魔翼」", icon: "🦇", rarity: "超激レア", weight: 490 },
  { id: "eq_holy_sword", type: "equipment", name: "装備「聖剣エクスカリバー」", icon: "✨", rarity: "神レア", weight: 10 },
  { id: "eq_god_crown", type: "equipment", name: "装備「全知全能の神冠」", icon: "🌌", rarity: "神レア", weight: 10 },
  { id: "eq_star_aura", type: "equipment", name: "装備「銀河のリング」", icon: "💎", rarity: "神レア", weight: 10 }
];

export function pullSpEquipmentGachaItem(): GachaItem {
  const totalWeight = allSpEquipmentGachaItems.reduce((acc, item) => acc + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of allSpEquipmentGachaItems) {
    if (random < item.weight) return item;
    random -= item.weight;
  }
  return allSpEquipmentGachaItems[0];
}

export const spEquipmentGachaRates = [
  { rarity: "神レア", rate: "0.1%", color: "text-purple-500", bg: "bg-purple-100", items: allSpEquipmentGachaItems.filter(i => i.rarity === "神レア") },
  { rarity: "超激レア", rate: "4.9%", color: "text-red-500", bg: "bg-red-100", items: allSpEquipmentGachaItems.filter(i => i.rarity === "超激レア") },
  { rarity: "激レア", rate: "10.0%", color: "text-amber-500", bg: "bg-amber-100", items: allSpEquipmentGachaItems.filter(i => i.rarity === "激レア") },
  { rarity: "レア", rate: "30.0%", color: "text-blue-500", bg: "bg-blue-100", items: allSpEquipmentGachaItems.filter(i => i.rarity === "レア") },
  { rarity: "ノーマル", rate: "55.0%", color: "text-slate-500", bg: "bg-slate-200", items: allSpEquipmentGachaItems.filter(i => i.rarity === "ノーマル") },
];

export const allRichEquipmentGachaItems: GachaItem[] = [
  { id: "eq_rich_longinus", type: "equipment", name: "装備「竜槍ロンギヌス」", icon: "/images/gacha_equipment/ノーマル_竜槍ロンギヌス.webp", rarity: "ノーマル", weight: 55000 },
  { id: "eq_rich_dragon_scale", type: "equipment", name: "装備「神龍の鱗鎧」", icon: "/images/gacha_equipment/レア_神龍の鱗鎧.webp", rarity: "レア", weight: 10000 },
  { id: "eq_rich_overlord_axe", type: "equipment", name: "装備「覇王の戦斧」", icon: "/images/gacha_equipment/レア_覇王の戦斧.webp", rarity: "レア", weight: 10000 },
  { id: "eq_rich_dark_blades", type: "equipment", name: "装備「闇夜の双刃」", icon: "/images/gacha_equipment/レア_闇夜の双刃.webp", rarity: "レア", weight: 10000 },
  { id: "eq_rich_aegis_shield", type: "equipment", name: "装備「守護神のイージス盾」", icon: "/images/gacha_equipment/激レア_守護神のイージス盾.webp", rarity: "激レア", weight: 3333 },
  { id: "eq_rich_sage_staff", type: "equipment", name: "装備「賢者の星杖」", icon: "/images/gacha_equipment/激レア_賢者の星杖.webp", rarity: "激レア", weight: 3333 },
  { id: "eq_rich_wind_bow", type: "equipment", name: "装備「風神の戦弓」", icon: "/images/gacha_equipment/激レア_風神の戦弓.webp", rarity: "激レア", weight: 3334 },
  { id: "eq_rich_angel_robe", type: "equipment", name: "装備「天使の翼衣」", icon: "/images/gacha_equipment/超激レア_天使の翼衣.webp", rarity: "超激レア", weight: 980 },
  { id: "eq_rich_flame_grimoire", type: "equipment", name: "装備「炎帝の魔導書」", icon: "/images/gacha_equipment/超激レア_炎帝の魔導書.webp", rarity: "超激レア", weight: 980 },
  { id: "eq_rich_flame_gauntlet", type: "equipment", name: "装備「爆炎の籠手」", icon: "/images/gacha_equipment/超激レア_爆炎の籠手.webp", rarity: "超激レア", weight: 980 },
  { id: "eq_rich_dark_helm", type: "equipment", name: "装備「闇夜の漆黒兜」", icon: "/images/gacha_equipment/超激レア_闇夜の漆黒兜.webp", rarity: "超激レア", weight: 980 },
  { id: "eq_rich_gram_sword", type: "equipment", name: "装備「魔剣グラム」", icon: "/images/gacha_equipment/超激レア_魔剣グラム.webp", rarity: "超激レア", weight: 980 },
  { id: "eq_rich_excalibur", type: "equipment", name: "装備「聖剣エクスカリバー（極）」", icon: "/images/gacha_equipment/神レア_聖剣エクスカリバー.webp", rarity: "神レア", weight: 100 }
];

export function pullRichEquipmentGachaItem(): GachaItem {
  const totalWeight = allRichEquipmentGachaItems.reduce((acc, item) => acc + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of allRichEquipmentGachaItems) {
    if (random < item.weight) return item;
    random -= item.weight;
  }
  return allRichEquipmentGachaItems[0];
}

export const richEquipmentGachaRates = [
  { rarity: "神レア", rate: "0.1%", color: "text-purple-500", bg: "bg-purple-100", items: allRichEquipmentGachaItems.filter(i => i.rarity === "神レア") },
  { rarity: "超激レア", rate: "4.9%", color: "text-red-500", bg: "bg-red-100", items: allRichEquipmentGachaItems.filter(i => i.rarity === "超激レア") },
  { rarity: "激レア", rate: "10.0%", color: "text-amber-500", bg: "bg-amber-100", items: allRichEquipmentGachaItems.filter(i => i.rarity === "激レア") },
  { rarity: "レア", rate: "30.0%", color: "text-blue-500", bg: "bg-blue-100", items: allRichEquipmentGachaItems.filter(i => i.rarity === "レア") },
  { rarity: "ノーマル", rate: "55.0%", color: "text-slate-500", bg: "bg-slate-200", items: allRichEquipmentGachaItems.filter(i => i.rarity === "ノーマル") },
];

export const allRichLadiesGachaItems: GachaItem[] = [
  // --- ノーマル (55.0%) ---
  { id: "avatar_ladies_ロップイヤー騎士", type: "avatar", name: "アバター「イチゴチョコのロップイヤー騎士」", icon: "/avatars/ladies/ノーマル_イチゴチョコのロップイヤー騎士.webp", rarity: "ノーマル", weight: 18333 },
  { id: "avatar_ladies_マーメイド", type: "avatar", name: "アバター「マーメイドの歌姫」", icon: "/avatars/ladies/ノーマル_マーメイドの歌姫.webp", rarity: "ノーマル", weight: 18333 },
  { id: "avatar_ladies_エルフ弓使い", type: "avatar", name: "アバター「星屑のエルフの弓使い」", icon: "/avatars/ladies/ノーマル_星屑のエルフの弓使い.webp", rarity: "ノーマル", weight: 18334 },

  // --- レア (30.0%) ---
  { id: "avatar_ladies_ビーストテイマー", type: "avatar", name: "アバター「ひまわりのビーストテイマー」", icon: "/avatars/ladies/レア_ひまわりのビーストテイマー.webp", rarity: "レア", weight: 7500 },
  { id: "avatar_ladies_ピンク魔法使い", type: "avatar", name: "アバター「ピンクの魔法使い見習い」", icon: "/avatars/ladies/レア_ピンクの魔法使い見習い.webp", rarity: "レア", weight: 7500 },
  { id: "avatar_ladies_マカロン重戦士", type: "avatar", name: "アバター「マカロン色の重戦士」", icon: "/avatars/ladies/レア_マカロン色の重戦士.webp", rarity: "レア", weight: 7500 },
  { id: "avatar_ladies_ミント風使い", type: "avatar", name: "アバター「ミントグリーンの風使い」", icon: "/avatars/ladies/レア_ミントグリーンの風使い.webp", rarity: "レア", weight: 7500 },

  // --- 激レア (10.0%) ---
  { id: "avatar_ladies_バラの舞踏騎士", type: "avatar", name: "アバター「バラの舞踏騎士」", icon: "/avatars/ladies/激レア_バラの舞踏騎士.webp", rarity: "激レア", weight: 3333 },
  { id: "avatar_ladies_ラベンダー召喚士", type: "avatar", name: "アバター「ラベンダーの召喚士」", icon: "/avatars/ladies/激レア_ラベンダーの召喚士.webp", rarity: "激レア", weight: 3333 },
  { id: "avatar_ladies_月星の暗殺者", type: "avatar", name: "アバター「月と星の暗殺者」", icon: "/avatars/ladies/激レア_月と星の暗殺者.webp", rarity: "激レア", weight: 3334 },

  // --- 超激レア (4.9%) ---
  { id: "avatar_ladies_キラキラ星踊り子", type: "avatar", name: "アバター「キラキラ星の踊り子」", icon: "/avatars/ladies/超激レア_キラキラ星の踊り子.webp", rarity: "超激レア", weight: 1225 },
  { id: "avatar_ladies_天使聖騎士", type: "avatar", name: "アバター「天使の羽根の聖騎士」", icon: "/avatars/ladies/超激レア_天使の羽根の聖騎士.webp", rarity: "超激レア", weight: 1225 },
  { id: "avatar_ladies_宝石精霊使い", type: "avatar", name: "アバター「宝石の精霊使い」", icon: "/avatars/ladies/超激レア_宝石の精霊使い.webp", rarity: "超激レア", weight: 1225 },
  { id: "avatar_ladies_白猫拳闘士", type: "avatar", name: "アバター「白猫のモフモフ拳闘士」", icon: "/avatars/ladies/超激レア_白猫のモフモフ拳闘士.webp", rarity: "超激レア", weight: 1225 },

  // --- 神レア (0.1%) ---
  { id: "avatar_ladies_スイーツガンナー", type: "avatar", name: "アバター「スイーツデコガンナー」", icon: "/avatars/ladies/神レア_スイーツデコガンナー.webp", rarity: "神レア", weight: 33 },
  { id: "avatar_ladies_ヒツジ魔導士", type: "avatar", name: "アバター「夢見るヒツジの魔導士」", icon: "/avatars/ladies/神レア_夢見るヒツジの魔導士.webp", rarity: "神レア", weight: 33 },
  { id: "avatar_ladies_花ヒーラー姫", type: "avatar", name: "アバター「花のヒーラー姫」", icon: "/avatars/ladies/神レア_花のヒーラー姫.webp", rarity: "神レア", weight: 34 }
];

export function pullRichLadiesGachaItem(): GachaItem {
  const totalWeight = allRichLadiesGachaItems.reduce((acc, item) => acc + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of allRichLadiesGachaItems) {
    if (random < item.weight) return item;
    random -= item.weight;
  }
  return allRichLadiesGachaItems[0];
}

export const richLadiesGachaRates = [
  { rarity: "神レア", rate: "0.1%", color: "text-purple-500", bg: "bg-purple-100", items: allRichLadiesGachaItems.filter(i => i.rarity === "神レア") },
  { rarity: "超激レア", rate: "4.9%", color: "text-red-500", bg: "bg-red-100", items: allRichLadiesGachaItems.filter(i => i.rarity === "超激レア") },
  { rarity: "激レア", rate: "10.0%", color: "text-amber-500", bg: "bg-amber-100", items: allRichLadiesGachaItems.filter(i => i.rarity === "激レア") },
  { rarity: "レア", rate: "30.0%", color: "text-blue-500", bg: "bg-blue-100", items: allRichLadiesGachaItems.filter(i => i.rarity === "レア") },
  { rarity: "ノーマル", rate: "55.0%", color: "text-slate-500", bg: "bg-slate-200", items: allRichLadiesGachaItems.filter(i => i.rarity === "ノーマル") },
];

const all3000CombinedItems: GachaItem[] = [
  ...allRichLadiesGachaItems.map(i => ({ ...i, gachaName: "🌸 ふわふわガチャ♡" })),
  ...allRichGachaItems.map(i => ({ ...i, gachaName: "💎 リッチガチャ1" })),
  ...allRichGacha2Items.map(i => ({ ...i, gachaName: "✨ リッチガチャ2" })),
];

export const all3000GachaRates = [
  { rarity: "神レア", rate: "神レア", color: "text-purple-500", bg: "bg-purple-100", items: all3000CombinedItems.filter(i => i.rarity === "神レア") },
  { rarity: "超激レア", rate: "超激レア", color: "text-red-500", bg: "bg-red-100", items: all3000CombinedItems.filter(i => i.rarity === "超激レア") },
  { rarity: "激レア", rate: "激レア", color: "text-amber-500", bg: "bg-amber-100", items: all3000CombinedItems.filter(i => i.rarity === "激レア") },
  { rarity: "レア", rate: "レア", color: "text-blue-500", bg: "bg-blue-100", items: all3000CombinedItems.filter(i => i.rarity === "レア") },
  { rarity: "ノーマル", rate: "ノーマル", color: "text-slate-500", bg: "bg-slate-200", items: all3000CombinedItems.filter(i => i.rarity === "ノーマル") }
];

// =======================================
// 🎀 ふわふわ装備リッチガチャ (Ladies Equipment)
// =======================================
export const allRichLadiesEquipmentGachaItems: GachaItem[] = [
  // --- ノーマル (55.0%) ---
  { id: "eq_ladies_strawberry_cap", type: "equipment", name: "装備「いちごのショートケーキキャップ」", icon: "/images/gacha_equipment_ladies_webp/いちごのショートケーキキャップ.webp", rarity: "ノーマル", weight: 27500 },
  { id: "eq_ladies_bunny_bag", type: "equipment", name: "装備「うさ耳の夢かわリュック」", icon: "/images/gacha_equipment_ladies_webp/うさ耳の夢かわリュック.webp", rarity: "ノーマル", weight: 27500 },

  // --- レア (30.0%) ---
  { id: "eq_ladies_sunflower_flute", type: "equipment", name: "装備「ひまわりのビースト笛」", icon: "/images/gacha_equipment_ladies_webp/ひまわりのビースト笛.webp", rarity: "レア", weight: 10000 },
  { id: "eq_ladies_candy_sword", type: "equipment", name: "装備「キャンディポップの大剣」", icon: "/images/gacha_equipment_ladies_webp/キャンディポップの大剣.webp", rarity: "レア", weight: 10000 },
  { id: "eq_ladies_cat_gloves", type: "equipment", name: "装備「モフモフ猫パンチグローブ」", icon: "/images/gacha_equipment_ladies_webp/モフモフ猫パンチグローブ.webp", rarity: "レア", weight: 10000 },

  // --- 激レア (10.0%) ---
  { id: "eq_ladies_bear_grimoire", type: "equipment", name: "装備「クマさんの抱き枕魔導書」", icon: "/images/gacha_equipment_ladies_webp/クマさんの抱き枕魔導書.webp", rarity: "激レア", weight: 3333 },
  { id: "eq_ladies_pastel_gauntlet", type: "equipment", name: "装備「スイーツデコのパステルガントレット」", icon: "/images/gacha_equipment_ladies_webp/スイーツデコのパステルガントレット.webp", rarity: "激レア", weight: 3333 },
  { id: "eq_ladies_heart_shield", type: "equipment", name: "装備「ハートのフリルシールド」", icon: "/images/gacha_equipment_ladies_webp/ハートのフリルシールド.webp", rarity: "激レア", weight: 3334 },

  // --- 超激レア (4.9%) ---
  { id: "eq_ladies_rose_rapier", type: "equipment", name: "装備「バラの舞踏レイピア」", icon: "/images/gacha_equipment_ladies_webp/バラの舞踏レイピア.webp", rarity: "超激レア", weight: 980 },
  { id: "eq_ladies_mermaid_earring", type: "equipment", name: "装備「マーメイドの真珠イヤリング」", icon: "/images/gacha_equipment_ladies_webp/マーメイドの真珠イヤリング.webp", rarity: "超激レア", weight: 980 },
  { id: "eq_ladies_ribbon_tact", type: "equipment", name: "装備「リボンと花のタクト」", icon: "/images/gacha_equipment_ladies_webp/リボンと花のタクト.webp", rarity: "超激レア", weight: 980 },
  { id: "eq_ladies_fallen_lace", type: "equipment", name: "装備「堕天使のレース」", icon: "/images/gacha_equipment_ladies_webp/堕天使のレース.webp", rarity: "超激レア", weight: 980 },
  { id: "eq_ladies_moon_necklace", type: "equipment", name: "装備「月と星のネックレス」", icon: "/images/gacha_equipment_ladies_webp/月と星のネックレス.webp", rarity: "超激レア", weight: 980 },

  // --- 神レア (0.1%) ---
  { id: "eq_ladies_angel_tiara", type: "equipment", name: "装備「天使の羽根のティアラ」", icon: "/images/gacha_equipment_ladies_webp/天使の羽根のティアラ.webp", rarity: "神レア", weight: 50 },
  { id: "eq_ladies_stardust_staff", type: "equipment", name: "装備「星屑のキラキラスタッフ」", icon: "/images/gacha_equipment_ladies_webp/星屑のキラキラスタッフ.webp", rarity: "神レア", weight: 50 },
];

export function pullRichLadiesEquipmentGachaItem(): GachaItem {
  const totalWeight = allRichLadiesEquipmentGachaItems.reduce((acc, item) => acc + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of allRichLadiesEquipmentGachaItems) {
    if (random < item.weight) return item;
    random -= item.weight;
  }
  return allRichLadiesEquipmentGachaItems[0];
}

export const richLadiesEquipmentGachaRates = [
  { rarity: "神レア", rate: "0.1%", color: "text-purple-500", bg: "bg-purple-100", items: allRichLadiesEquipmentGachaItems.filter(i => i.rarity === "神レア") },
  { rarity: "超激レア", rate: "4.9%", color: "text-red-500", bg: "bg-red-100", items: allRichLadiesEquipmentGachaItems.filter(i => i.rarity === "超激レア") },
  { rarity: "激レア", rate: "10.0%", color: "text-amber-500", bg: "bg-amber-100", items: allRichLadiesEquipmentGachaItems.filter(i => i.rarity === "激レア") },
  { rarity: "レア", rate: "30.0%", color: "text-blue-500", bg: "bg-blue-100", items: allRichLadiesEquipmentGachaItems.filter(i => i.rarity === "レア") },
  { rarity: "ノーマル", rate: "55.0%", color: "text-slate-500", bg: "bg-slate-200", items: allRichLadiesEquipmentGachaItems.filter(i => i.rarity === "ノーマル") },
];

const all3000SpCombinedEquipmentItems: GachaItem[] = [
  ...allRichLadiesEquipmentGachaItems.map(i => ({ ...i, gachaName: "🎀 ふわふわ装備リッチガチャ♡" })),
  ...allRichEquipmentGachaItems.map(i => ({ ...i, gachaName: "🛡️ 装備品リッチガチャ" })),
];

export const all3000SpCombinedEquipmentRates = [
  { rarity: "神レア", rate: "神レア", color: "text-purple-500", bg: "bg-purple-100", items: all3000SpCombinedEquipmentItems.filter(i => i.rarity === "神レア") },
  { rarity: "超激レア", rate: "超激レア", color: "text-red-500", bg: "bg-red-100", items: all3000SpCombinedEquipmentItems.filter(i => i.rarity === "超激レア") },
  { rarity: "激レア", rate: "激レア", color: "text-amber-500", bg: "bg-amber-100", items: all3000SpCombinedEquipmentItems.filter(i => i.rarity === "激レア") },
  { rarity: "レア", rate: "レア", color: "text-blue-500", bg: "bg-blue-100", items: all3000SpCombinedEquipmentItems.filter(i => i.rarity === "レア") },
  { rarity: "ノーマル", rate: "ノーマル", color: "text-slate-500", bg: "bg-slate-200", items: all3000SpCombinedEquipmentItems.filter(i => i.rarity === "ノーマル") }
];

