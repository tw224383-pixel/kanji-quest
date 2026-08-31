import { equipmentList } from "./equipmentData";

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

// 装備ガチャの景品は id/name/icon/rarity を equipmentData.ts (単一の情報源) から取得し、
// ここではガチャ固有の抽選重みだけを指定する。以前はここに装備データを丸ごと複製していたため、
// equipmentData.ts 側だけを更新すると内容がズレるバグの原因になっていた。
function eqGachaItem(id: string, weight: number): GachaItem {
  const eq = equipmentList.find(e => e.id === id);
  if (!eq) throw new Error(`eqGachaItem: unknown equipment id "${id}" (add it to equipmentData.ts first)`);
  return { id: eq.id, type: "equipment", name: `装備「${eq.name}」`, icon: eq.icon, rarity: eq.rarity, weight };
}

// 通常ガチャ（100PT）の提供割合と重み。合計 168,000。
//   神レア   0.1%  =    168 (3体 × 56)
//   超激レア 4.9%  =  8,232 (8体 × 1,029)
//   激レア  10.0%  = 16,800 (14体 × 1,200)
//   レア    30.0%  = 50,400 (16体 × 3,150)
//   ノーマル 55.0% = 92,400 (24体 × 3,850)
//
// 【景品を足し引きするときは必ず重みも直すこと】
// 以前は景品数が変わっても重みを直していなかったため、表示している提供割合と
// 実際の確率がずれていた（激レアは表示10.0%に対し実際8.40%だった）。
// 段ごとの景品数で割り切れるように合計を168,000にしてある。
// 表示側 (computeRates) は重みから実際の％を計算するので、ここさえ正しければズレない。
//
// なおイラスト背景のテーマ8種は 2026/08/30 にテーマガチャへ移した
// （きれいな絵のテーマはテーマガチャ限定にする方針のため）。

export const allGachaItems: GachaItem[] = [
  // --- 神レア (UR) 0.1% ---
  { id: "全知全能の神", type: "title", name: "称号「全知全能の神」", icon: "🌌", rarity: "神レア", weight: 56 },
  { id: "マスターゴッド", type: "title", name: "称号「マスターゴッド」", icon: "👑", rarity: "神レア", weight: 56 },
  { id: "galaxy", type: "effect", name: "エフェクト「ギャラクシー」", icon: "🌌", rarity: "神レア", weight: 56 },

  // --- 超激レア (SSR) 4.9% ---
  { id: "伝説の勇者", type: "title", name: "称号「伝説の勇者」", icon: "⚔️", rarity: "超激レア", weight: 1029 },
  { id: "暗黒魔王", type: "title", name: "称号「暗黒魔王」", icon: "👿", rarity: "超激レア", weight: 1029 },
  { id: "奇跡を起こす者", type: "title", name: "称号「奇跡を起こす者」", icon: "✨", rarity: "超激レア", weight: 1029 },
  { id: "破壊神", type: "title", name: "称号「破壊神」", icon: "🌋", rarity: "超激レア", weight: 1029 },
  { id: "天才ハッカー", type: "title", name: "称号「天才ハッカー」", icon: "💻", rarity: "超激レア", weight: 1029 },
  { id: "aurora", type: "effect", name: "エフェクト「オーロラ」", icon: "🌈", rarity: "超激レア", weight: 1029 },
  { id: "blackhole", type: "effect", name: "エフェクト「ブラックホール」", icon: "🕳️", rarity: "超激レア", weight: 1029 },
  { id: "divine_thunder", type: "effect", name: "エフェクト「神の雷」", icon: "⚡", rarity: "超激レア", weight: 1029 },

  // --- 激レア (SR) 10.0% ---
  { id: "炎の剣士", type: "title", name: "称号「炎の剣士」", icon: "🔥", rarity: "激レア", weight: 1200 },
  { id: "氷の魔導士", type: "title", name: "称号「氷の魔導士」", icon: "❄️", rarity: "激レア", weight: 1200 },
  { id: "雷の暗殺者", type: "title", name: "称号「雷の暗殺者」", icon: "⚡", rarity: "激レア", weight: 1200 },
  { id: "光の騎士", type: "title", name: "称号「光の騎士」", icon: "✨", rarity: "激レア", weight: 1200 },
  { id: "闇の狩人", type: "title", name: "称号「闇の狩人」", icon: "🌑", rarity: "激レア", weight: 1200 },
  { id: "黄金の盾", type: "title", name: "称号「黄金の盾」", icon: "🛡️", rarity: "激レア", weight: 1200 },
  { id: "竜騎士", type: "title", name: "称号「竜騎士」", icon: "🐉", rarity: "激レア", weight: 1200 },
  { id: "精霊使い", type: "title", name: "称号「精霊使い」", icon: "🍃", rarity: "激レア", weight: 1200 },
  { id: "黒幕", type: "title", name: "称号「黒幕」", icon: "🎭", rarity: "激レア", weight: 1200 },
  { id: "選ばれし者", type: "title", name: "称号「選ばれし者」", icon: "🌟", rarity: "激レア", weight: 1200 },
  { id: "sakura", type: "effect", name: "エフェクト「桜吹雪」", icon: "🌸", rarity: "激レア", weight: 1200 },
  { id: "blizzard", type: "effect", name: "エフェクト「猛吹雪」", icon: "❄️", rarity: "激レア", weight: 1200 },
  { id: "laser", type: "effect", name: "エフェクト「レーザー」", icon: "💥", rarity: "激レア", weight: 1200 },
  { id: "aura", type: "effect", name: "エフェクト「黄金のオーラ」", icon: "💫", rarity: "激レア", weight: 1200 },

  // --- レア (R) 30.0% ---
  { id: "修行中", type: "title", name: "称号「修行中」", icon: "💦", rarity: "レア", weight: 3150 },
  { id: "さすらいの", type: "title", name: "称号「さすらいの」", icon: "🚶", rarity: "レア", weight: 3150 },
  { id: "燃える", type: "title", name: "称号「燃える」", icon: "🔥", rarity: "レア", weight: 3150 },
  { id: "冷たい", type: "title", name: "称号「冷たい」", icon: "🧊", rarity: "レア", weight: 3150 },
  { id: "ビリビリの", type: "title", name: "称号「ビリビリの」", icon: "⚡", rarity: "レア", weight: 3150 },
  { id: "毒舌な", type: "title", name: "称号「毒舌な」", icon: "👅", rarity: "レア", weight: 3150 },
  { id: "影の", type: "title", name: "称号「影の」", icon: "👤", rarity: "レア", weight: 3150 },
  { id: "謎の", type: "title", name: "称号「謎の」", icon: "❓", rarity: "レア", weight: 3150 },
  { id: "古代の", type: "title", name: "称号「古代の」", icon: "🏺", rarity: "レア", weight: 3150 },
  { id: "未来の", type: "title", name: "称号「未来の」", icon: "🛸", rarity: "レア", weight: 3150 },
  { id: "狂暴な", type: "title", name: "称号「狂暴な」", icon: "😡", rarity: "レア", weight: 3150 },
  { id: "眠れる", type: "title", name: "称号「眠れる」", icon: "💤", rarity: "レア", weight: 3150 },
  { id: "覚醒した", type: "title", name: "称号「覚醒した」", icon: "👁️", rarity: "レア", weight: 3150 },
  { id: "暴走する", type: "title", name: "称号「暴走する」", icon: "💨", rarity: "レア", weight: 3150 },
  { id: "愛されし", type: "title", name: "称号「愛されし」", icon: "❤️", rarity: "レア", weight: 3150 },
  { id: "sparkle", type: "effect", name: "エフェクト「キラキラ」", icon: "✨", rarity: "レア", weight: 3150 },

  // --- ノーマル (N) 55.0% ---
  { id: "普通の", type: "title", name: "称号「普通の」", icon: "😐", rarity: "ノーマル", weight: 3850 },
  { id: "いつもの", type: "title", name: "称号「いつもの」", icon: "☕", rarity: "ノーマル", weight: 3850 },
  { id: "寝坊した", type: "title", name: "称号「寝坊した」", icon: "⏰", rarity: "ノーマル", weight: 3850 },
  { id: "腹ペコの", type: "title", name: "称号「腹ペコの」", icon: "🤤", rarity: "ノーマル", weight: 3850 },
  { id: "宿題を忘れた", type: "title", name: "称号「宿題を忘れた」", icon: "📝", rarity: "ノーマル", weight: 3850 },
  { id: "ピーマン嫌いの", type: "title", name: "称号「ピーマン嫌いの」", icon: "🫑", rarity: "ノーマル", weight: 3850 },
  { id: "ゲーム好きの", type: "title", name: "称号「ゲーム好きの」", icon: "🎮", rarity: "ノーマル", weight: 3850 },
  { id: "泥だらけの", type: "title", name: "称号「泥だらけの」", icon: "💩", rarity: "ノーマル", weight: 3850 },
  { id: "お調子者", type: "title", name: "称号「お調子者」", icon: "🤪", rarity: "ノーマル", weight: 3850 },
  { id: "迷子の", type: "title", name: "称号「迷子の」", icon: "🗺️", rarity: "ノーマル", weight: 3850 },
  { id: "あわてんぼう", type: "title", name: "称号「あわてんぼう」", icon: "🏃", rarity: "ノーマル", weight: 3850 },
  { id: "のんびり屋", type: "title", name: "称号「のんびり屋」", icon: "🐢", rarity: "ノーマル", weight: 3850 },
  { id: "気まぐれな", type: "title", name: "称号「気まぐれな」", icon: "🐈", rarity: "ノーマル", weight: 3850 },
  { id: "泣き虫", type: "title", name: "称号「泣き虫」", icon: "😭", rarity: "ノーマル", weight: 3850 },
  { id: "忘れん坊", type: "title", name: "称号「忘れん坊」", icon: "🤷", rarity: "ノーマル", weight: 3850 },
  { id: "💩", type: "avatar", name: "アバター「うんち」", icon: "💩", rarity: "ノーマル", weight: 3850 },
  { id: "👽", type: "avatar", name: "アバター「グレイ」", icon: "👽", rarity: "ノーマル", weight: 3850 },
  { id: "🤡", type: "avatar", name: "アバター「ピエロ」", icon: "🤡", rarity: "ノーマル", weight: 3850 },
  { id: "🥸", type: "avatar", name: "アバター「変装」", icon: "🥸", rarity: "ノーマル", weight: 3850 },
  { id: "🥔", type: "avatar", name: "アバター「じゃがいも」", icon: "🥔", rarity: "ノーマル", weight: 3850 },
  { id: "🍄", type: "avatar", name: "アバター「キノコ」", icon: "🍄", rarity: "ノーマル", weight: 3850 },
  { id: "🐌", type: "avatar", name: "アバター「カタツムリ」", icon: "🐌", rarity: "ノーマル", weight: 3850 },
  { id: "🐢", type: "avatar", name: "アバター「カメ」", icon: "🐢", rarity: "ノーマル", weight: 3850 },
  { id: "🪨", type: "avatar", name: "アバター「ただの石」", icon: "🪨", rarity: "ノーマル", weight: 3850 },
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

/**
 * 提供割合をアイテムの weight から実際に計算する。
 *
 * 以前は表示する％を手書きしていたため、景品を足し引きすると
 * 「表示している確率」と「実際の確率」がずれていた
 * （テーマ8種をテーマガチャへ移す前の通常ガチャは、激レアの表示10.0%に対し実際は8.40%）。
 * 提供割合はおうちの人も見る数字なので、必ず実データから出すこと。
 */
const RARITY_STYLE: Record<string, { color: string; bg: string }> = {
  "神レア": { color: "text-purple-500", bg: "bg-purple-100" },
  "超激レア": { color: "text-red-500", bg: "bg-red-100" },
  "激レア": { color: "text-amber-500", bg: "bg-amber-100" },
  "レア": { color: "text-blue-500", bg: "bg-blue-100" },
  "ノーマル": { color: "text-slate-500", bg: "bg-slate-200" },
};
const RARITY_ORDER: Rarity[] = ["神レア", "超激レア", "激レア", "レア", "ノーマル"];

function computeRates(items: GachaItem[]) {
  const total = items.reduce((acc, i) => acc + i.weight, 0) || 1;
  return RARITY_ORDER
    .map(rarity => {
      const tier = items.filter(i => i.rarity === rarity);
      if (tier.length === 0) return null;
      const pct = (tier.reduce((acc, i) => acc + i.weight, 0) / total) * 100;
      return {
        rarity,
        // 0.05%未満を「0.0%」と出すと絶対に当たらないように見えるので言い換える
        rate: pct < 0.05 ? "0.1%未満" : `${pct.toFixed(1)}%`,
        ...RARITY_STYLE[rarity],
        items: tier,
      };
    })
    .filter((t): t is NonNullable<typeof t> => t !== null);
}

// Compute display rates for UI
export const gachaRates = computeRates(allGachaItems);

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
  eqGachaItem("eq_beginner_sword", 5500),
  eqGachaItem("eq_iron_shield", 5500),
  eqGachaItem("eq_magic_cap", 3000),
  eqGachaItem("eq_steel_sword", 3000),
  eqGachaItem("eq_ranger_bow", 1000),
  eqGachaItem("eq_fire_axe", 1000),
  eqGachaItem("eq_silver_crown", 1000),
  eqGachaItem("eq_crystal_orb", 490),
  eqGachaItem("eq_poseidon_trident", 490),
  eqGachaItem("eq_angel_wings", 490),
  eqGachaItem("eq_demon_wings", 490),
  eqGachaItem("eq_holy_sword", 10),
  eqGachaItem("eq_god_crown", 10),
  eqGachaItem("eq_star_aura", 10),
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
  eqGachaItem("eq_rich_longinus", 55000),
  eqGachaItem("eq_rich_dragon_scale", 10000),
  eqGachaItem("eq_rich_overlord_axe", 10000),
  eqGachaItem("eq_rich_dark_blades", 10000),
  eqGachaItem("eq_rich_aegis_shield", 3333),
  eqGachaItem("eq_rich_sage_staff", 3333),
  eqGachaItem("eq_rich_wind_bow", 3334),
  eqGachaItem("eq_rich_angel_robe", 980),
  eqGachaItem("eq_rich_flame_grimoire", 980),
  eqGachaItem("eq_rich_flame_gauntlet", 980),
  eqGachaItem("eq_rich_dark_helm", 980),
  eqGachaItem("eq_rich_gram_sword", 980),
  eqGachaItem("eq_rich_excalibur", 100),
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
  eqGachaItem("eq_ladies_strawberry_cap", 27500),
  eqGachaItem("eq_ladies_bunny_bag", 27500),

  // --- レア (30.0%) ---
  eqGachaItem("eq_ladies_sunflower_flute", 10000),
  eqGachaItem("eq_ladies_candy_sword", 10000),
  eqGachaItem("eq_ladies_cat_gloves", 10000),

  // --- 激レア (10.0%) ---
  eqGachaItem("eq_ladies_bear_grimoire", 3333),
  eqGachaItem("eq_ladies_pastel_gauntlet", 3333),
  eqGachaItem("eq_ladies_heart_shield", 3334),

  // --- 超激レア (4.9%) ---
  eqGachaItem("eq_ladies_rose_rapier", 980),
  eqGachaItem("eq_ladies_mermaid_earring", 980),
  eqGachaItem("eq_ladies_ribbon_tact", 980),
  eqGachaItem("eq_ladies_fallen_lace", 980),
  eqGachaItem("eq_ladies_moon_necklace", 980),

  // --- 神レア (0.1%) ---
  eqGachaItem("eq_ladies_angel_tiara", 50),
  eqGachaItem("eq_ladies_stardust_staff", 50),
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


// =======================================
// 🖼️ テーマガチャ (Theme Gacha) — 1回 10,000 PT
// =======================================
// 「背景テーマだけが出る」ガチャ。排出割合はリッチガチャ第1弾に準じる
//   神レア 0.8% / 超激レア 16.5% / 激レア 82.6%
// （重み: 20×2 + 200×4 + 667×6 = 4,842）
// レア度が上がるほど背景の層とエフェクトが豪華になる。
// 中身は画像ではなくコードで描く背景なので、追加してもHostingの転送量は増えない
// （設計は lib/themeVisuals.ts と components/ui/ThemeScenery.tsx を参照）。
export const allThemeGachaItems: GachaItem[] = [
  // --- 神レア (0.8%) ---
  { id: "celestial_dragon", type: "theme", name: "テーマ「星海の竜宮」", icon: "🐉", rarity: "神レア", weight: 134 },
  { id: "origin_of_all", type: "theme", name: "テーマ「万象の始まり」", icon: "🌠", rarity: "神レア", weight: 134 },
  { id: "time_space", type: "theme", name: "テーマ「時空の支配者」", icon: "🕰️", rarity: "神レア", weight: 134 },

  // --- 超激レア (16.5%) ---
  { id: "crystal_palace", type: "theme", name: "テーマ「氷晶の宮殿」", icon: "❄️", rarity: "超激レア", weight: 1143 },
  { id: "phoenix_sky", type: "theme", name: "テーマ「不死鳥の空」", icon: "🔥", rarity: "超激レア", weight: 1143 },
  { id: "dream_nebula", type: "theme", name: "テーマ「夢幻の星雲」", icon: "💫", rarity: "超激レア", weight: 1143 },
  { id: "golden_shrine", type: "theme", name: "テーマ「黄金の神殿」", icon: "⛩️", rarity: "超激レア", weight: 1143 },
  { id: "skycastle", type: "theme", name: "テーマ「天空の城」", icon: "🏰", rarity: "超激レア", weight: 1143 },
  { id: "magma", type: "theme", name: "テーマ「マグマ地帯」", icon: "🌋", rarity: "超激レア", weight: 1143 },
  { id: "cyber", type: "theme", name: "テーマ「サイバー」", icon: "⚡", rarity: "超激レア", weight: 1143 },

  // --- 激レア (82.6%) ---
  { id: "moonlight_bamboo", type: "theme", name: "テーマ「月夜の竹林」", icon: "🎋", rarity: "激レア", weight: 3078 },
  { id: "storm_sea", type: "theme", name: "テーマ「嵐の大海原」", icon: "⛈️", rarity: "激レア", weight: 3078 },
  { id: "desert_night", type: "theme", name: "テーマ「砂漠の星夜」", icon: "🏜️", rarity: "激レア", weight: 3078 },
  { id: "sky_railway", type: "theme", name: "テーマ「天空鉄道」", icon: "🚂", rarity: "激レア", weight: 3078 },
  { id: "neon_arcade", type: "theme", name: "テーマ「ネオンアーケード」", icon: "🕹️", rarity: "激レア", weight: 3078 },
  { id: "snow_village", type: "theme", name: "テーマ「雪あかりの里」", icon: "🏮", rarity: "激レア", weight: 3078 },
  { id: "ruins", type: "theme", name: "テーマ「古代遺跡」", icon: "🏛️", rarity: "激レア", weight: 3078 },
  { id: "cybercity", type: "theme", name: "テーマ「サイバーシティ」", icon: "🏙️", rarity: "激レア", weight: 3078 },
  { id: "ocean", type: "theme", name: "テーマ「深海」", icon: "🌊", rarity: "激レア", weight: 3078 },
  { id: "forest", type: "theme", name: "テーマ「魔法の森」", icon: "🌲", rarity: "激レア", weight: 3078 },
  { id: "candy", type: "theme", name: "テーマ「お菓子の国」", icon: "🍭", rarity: "激レア", weight: 3078 },
  { id: "space", type: "theme", name: "テーマ「うちゅう」", icon: "🚀", rarity: "激レア", weight: 3078 },
  { id: "ninja", type: "theme", name: "テーマ「にんじゃ」", icon: "🥷", rarity: "激レア", weight: 3078 },
];

export function pullThemeGachaItem(): GachaItem {
  const totalWeight = allThemeGachaItems.reduce((acc, item) => acc + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of allThemeGachaItems) {
    if (random < item.weight) return item;
    random -= item.weight;
  }
  return allThemeGachaItems[0];
}

export const themeGachaRates = computeRates(allThemeGachaItems);
