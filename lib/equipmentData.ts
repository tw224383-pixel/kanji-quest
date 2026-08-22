export type EquipmentRarity = "ノーマル" | "レア" | "激レア" | "超激レア" | "神レア";

export interface EquipmentItem {
  id: string;
  name: string;
  icon: string; // Emoji or image URL
  category: "weapon" | "shield" | "head" | "wings" | "accessory";
  price: number | null; // SP price; null for gacha-only items
  rarity: EquipmentRarity;
  isGachaOnly: boolean;
  description: string;
  gachaName?: string;
}

export const equipmentList: EquipmentItem[] = [
  // --- ショップ購入可能（SP） ---
  { id: "eq_beginner_sword", name: "初心者用の剣", icon: "🗡️", category: "weapon", price: 300, rarity: "ノーマル", isGachaOnly: false, description: "冒険を始めたばかりの剣士が持つ基本的な短剣。", gachaName: "🛍️ ショップ" },
  { id: "eq_iron_shield", name: "鉄の丸盾", icon: "🛡️", category: "shield", price: 500, rarity: "ノーマル", isGachaOnly: false, description: "しっかりした鉄で作られた頼もしい防御用の盾。", gachaName: "🛍️ ショップ" },
  { id: "eq_magic_cap", name: "とんがり帽子", icon: "🎩", category: "head", price: 800, rarity: "レア", isGachaOnly: false, description: "かぶると少し頭が冴える魔法使いの帽子。", gachaName: "🛍️ ショップ" },
  { id: "eq_steel_sword", name: "鋼鉄の大剣", icon: "⚔️", category: "weapon", price: 1500, rarity: "レア", isGachaOnly: false, description: "重厚で強力なダメージを与える大剣。", gachaName: "🛍️ ショップ" },
  { id: "eq_ranger_bow", name: "精霊の弓", icon: "🏹", category: "weapon", price: 2500, rarity: "激レア", isGachaOnly: false, description: "風の精霊の加護を受けた美しい弓。", gachaName: "🛍️ ショップ" },
  { id: "eq_silver_crown", name: "銀の王冠", icon: "👑", category: "head", price: 5000, rarity: "激レア", isGachaOnly: false, description: "高貴な冒険者が身につける美しい王冠。", gachaName: "🛍️ ショップ" },
  { id: "eq_crystal_orb", name: "予言の水晶玉", icon: "🔮", category: "accessory", price: 8000, rarity: "超激レア", isGachaOnly: false, description: "未来の知識を引き寄せる秘宝の水晶。", gachaName: "🛍️ ショップ" },

  // --- ガチャ限定品（SPガチャ） ---
  { id: "eq_fire_axe", name: "火炎の戦斧", icon: "🪓", category: "weapon", price: null, rarity: "激レア", isGachaOnly: true, description: "燃え盛る炎をまとったドワーフ秘伝の斧。", gachaName: "🛡️ SP装備ガチャ" },
  { id: "eq_poseidon_trident", name: "深海の三叉槍", icon: "🔱", category: "weapon", price: null, rarity: "超激レア", isGachaOnly: true, description: "海の神ポセイドンの威光が宿る三叉の槍。", gachaName: "🛡️ SP装備ガチャ" },
  { id: "eq_angel_wings", name: "大天使の聖翼", icon: "🪽", category: "wings", price: null, rarity: "超激レア", isGachaOnly: true, description: "背中に漆黒と純白の光を放つ翼が授けられる。", gachaName: "🛡️ SP装備ガチャ" },
  { id: "eq_demon_wings", name: "宵闇の魔翼", icon: "🦇", category: "wings", price: null, rarity: "超激レア", isGachaOnly: true, description: "闇の魔王が授ける気高き翼。", gachaName: "🛡️ SP装備ガチャ" },
  { id: "eq_holy_sword", name: "聖剣エクスカリバー", icon: "✨", category: "weapon", price: null, rarity: "神レア", isGachaOnly: true, description: "選ばれし勇者のみが扱える光の至高の剣。", gachaName: "🛡️ SP装備ガチャ" },
  { id: "eq_god_crown", name: "全知全能の神冠", icon: "🌌", category: "head", price: null, rarity: "神レア", isGachaOnly: true, description: "全知全能の力を秘めた神の象徴たる冠。", gachaName: "🛡️ SP装備ガチャ" },
  { id: "eq_star_aura", name: "銀河のリング", icon: "💎", category: "accessory", price: null, rarity: "神レア", isGachaOnly: true, description: "輝く銀河の星々をはめ込んだ究極の指輪。", gachaName: "🛡️ SP装備ガチャ" },

  // --- ガチャ限定品（装備品リッチガチャ 3000PT） ---
  { id: "eq_rich_longinus", name: "竜槍ロンギヌス", icon: "/images/gacha_equipment/ノーマル_竜槍ロンギヌス.webp", category: "weapon", price: null, rarity: "ノーマル", isGachaOnly: true, description: "龍の力を秘めた伝説の槍。", gachaName: "🛡️ 装備品リッチガチャ" },
  { id: "eq_rich_dragon_scale", name: "神龍の鱗鎧", icon: "/images/gacha_equipment/レア_神龍の鱗鎧.webp", category: "shield", price: null, rarity: "レア", isGachaOnly: true, description: "神龍の強固な鱗で編まれた防具。", gachaName: "🛡️ 装備品リッチガチャ" },
  { id: "eq_rich_overlord_axe", name: "覇王の戦斧", icon: "/images/gacha_equipment/レア_覇王の戦斧.webp", category: "weapon", price: null, rarity: "レア", isGachaOnly: true, description: "戦場を支配する覇王の巨大な斧。", gachaName: "🛡️ 装備品リッチガチャ" },
  { id: "eq_rich_dark_blades", name: "闇夜の双刃", icon: "/images/gacha_equipment/レア_闇夜の双刃.webp", category: "weapon", price: null, rarity: "レア", isGachaOnly: true, description: "静寂の夜に潜む二つの漆黒の刃。", gachaName: "🛡️ 装備品リッチガチャ" },
  { id: "eq_rich_aegis_shield", name: "守護神のイージス盾", icon: "/images/gacha_equipment/激レア_守護神のイージス盾.webp", category: "shield", price: null, rarity: "激レア", isGachaOnly: true, description: "あらゆる攻撃を跳ね返す神々の盾。", gachaName: "🛡️ 装備品リッチガチャ" },
  { id: "eq_rich_sage_staff", name: "賢者の星杖", icon: "/images/gacha_equipment/激レア_賢者の星杖.webp", category: "weapon", price: null, rarity: "激レア", isGachaOnly: true, description: "星々の叡智と魔力を宿した賢者の杖。", gachaName: "🛡️ 装備品リッチガチャ" },
  { id: "eq_rich_wind_bow", name: "風神の戦弓", icon: "/images/gacha_equipment/激レア_風神の戦弓.webp", category: "weapon", price: null, rarity: "激レア", isGachaOnly: true, description: "風を切り裂く矢を放つ風神の弓。", gachaName: "🛡️ 装備品リッチガチャ" },
  { id: "eq_rich_angel_robe", name: "天使の翼衣", icon: "/images/gacha_equipment/超激レア_天使の翼衣.webp", category: "wings", price: null, rarity: "超激レア", isGachaOnly: true, description: "天使の羽毛で織られた聖なる羽衣。", gachaName: "🛡️ 装備品リッチガチャ" },
  { id: "eq_rich_flame_grimoire", name: "炎帝の魔導書", icon: "/images/gacha_equipment/超激レア_炎帝の魔導書.webp", category: "accessory", price: null, rarity: "超激レア", isGachaOnly: true, description: "獄炎の禁術が記された魔導書。", gachaName: "🛡️ 装備品リッチガチャ" },
  { id: "eq_rich_flame_gauntlet", name: "爆炎の籠手", icon: "/images/gacha_equipment/超激レア_爆炎の籠手.webp", category: "accessory", price: null, rarity: "超激レア", isGachaOnly: true, description: "一撃で爆炎を放つ深紅の手甲。", gachaName: "🛡️ 装備品リッチガチャ" },
  { id: "eq_rich_dark_helm", name: "闇夜の漆黒兜", icon: "/images/gacha_equipment/超激レア_闇夜の漆黒兜.webp", category: "head", price: null, rarity: "超激レア", isGachaOnly: true, description: "闇の王が着用した畏怖を与える兜。", gachaName: "🛡️ 装備品リッチガチャ" },
  { id: "eq_rich_gram_sword", name: "魔剣グラム", icon: "/images/gacha_equipment/超激レア_魔剣グラム.webp", category: "weapon", price: null, rarity: "超激レア", isGachaOnly: true, description: "竜をも一刀両断する魔剣。", gachaName: "🛡️ 装備品リッチガチャ" },
  { id: "eq_rich_excalibur", name: "聖剣エクスカリバー（極）", icon: "/images/gacha_equipment/神レア_聖剣エクスカリバー.webp", category: "weapon", price: null, rarity: "神レア", isGachaOnly: true, description: "黄金の光を放つ伝説の至高の聖剣。", gachaName: "🛡️ 装備品リッチガチャ" },

  // --- ふわふわ装備リッチガチャ (3000PT) ---
  { id: "eq_ladies_strawberry_cap", name: "いちごのショートケーキキャップ", icon: "/images/gacha_equipment_ladies_webp/いちごのショートケーキキャップ.webp", category: "head", price: null, rarity: "ノーマル", isGachaOnly: true, description: "いちごのショートケーキをモチーフにしたキュートな帽子。", gachaName: "🎀 ふわふわ装備リッチガチャ♡" },
  { id: "eq_ladies_bunny_bag", name: "うさ耳の夢かわリュック", icon: "/images/gacha_equipment_ladies_webp/うさ耳の夢かわリュック.webp", category: "accessory", price: null, rarity: "ノーマル", isGachaOnly: true, description: "うさ耳の飾りがついた夢かわいいリュックサック。", gachaName: "🎀 ふわふわ装備リッチガチャ♡" },
  { id: "eq_ladies_sunflower_flute", name: "ひまわりのビースト笛", icon: "/images/gacha_equipment_ladies_webp/ひまわりのビースト笛.webp", category: "accessory", price: null, rarity: "レア", isGachaOnly: true, description: "ひまわりの形の笛。吹くと魔法の獣を呼び寄せる。", gachaName: "🎀 ふわふわ装備リッチガチャ♡" },
  { id: "eq_ladies_candy_sword", name: "キャンディポップの大剣", icon: "/images/gacha_equipment_ladies_webp/キャンディポップの大剣.webp", category: "weapon", price: null, rarity: "レア", isGachaOnly: true, description: "見た目はお菓子そっくりだが実は強力な大剣。", gachaName: "🎀 ふわふわ装備リッチガチャ♡" },
  { id: "eq_ladies_cat_gloves", name: "モフモフ猫パンチグローブ", icon: "/images/gacha_equipment_ladies_webp/モフモフ猫パンチグローブ.webp", category: "accessory", price: null, rarity: "レア", isGachaOnly: true, description: "モフモフの猫耳グローブ。かわいいが一撃は重い。", gachaName: "🎀 ふわふわ装備リッチガチャ♡" },
  { id: "eq_ladies_bear_grimoire", name: "クマさんの抱き枕魔導書", icon: "/images/gacha_equipment_ladies_webp/クマさんの抱き枕魔導書.webp", category: "accessory", price: null, rarity: "激レア", isGachaOnly: true, description: "クマのぬいぐるみ型の魔導書。眠りながら魔法が使える。", gachaName: "🎀 ふわふわ装備リッチガチャ♡" },
  { id: "eq_ladies_pastel_gauntlet", name: "スイーツデコのパステルガントレット", icon: "/images/gacha_equipment_ladies_webp/スイーツデコのパステルガントレット.webp", category: "accessory", price: null, rarity: "激レア", isGachaOnly: true, description: "スイーツデコレーションが施されたパステルカラーの手甲。", gachaName: "🎀 ふわふわ装備リッチガチャ♡" },
  { id: "eq_ladies_heart_shield", name: "ハートのフリルシールド", icon: "/images/gacha_equipment_ladies_webp/ハートのフリルシールド.webp", category: "shield", price: null, rarity: "激レア", isGachaOnly: true, description: "ハート型のフリル付き盾。愛の力で攻撃を跳ね返す。", gachaName: "🎀 ふわふわ装備リッチガチャ♡" },
  { id: "eq_ladies_rose_rapier", name: "バラの舞踏レイピア", icon: "/images/gacha_equipment_ladies_webp/バラの舞踏レイピア.webp", category: "weapon", price: null, rarity: "超激レア", isGachaOnly: true, description: "薔薇の棘のように鋭い超激レアの細剣。舞踏のように軽やかに敵を貫く。", gachaName: "🎀 ふわふわ装備リッチガチャ♡" },
  { id: "eq_ladies_mermaid_earring", name: "マーメイドの真珠イヤリング", icon: "/images/gacha_equipment_ladies_webp/マーメイドの真珠イヤリング.webp", category: "accessory", price: null, rarity: "超激レア", isGachaOnly: true, description: "深海の人魚姫が愛用する神秘の真珠イヤリング。", gachaName: "🎀 ふわふわ装備リッチガチャ♡" },
  { id: "eq_ladies_ribbon_tact", name: "リボンと花のタクト", icon: "/images/gacha_equipment_ladies_webp/リボンと花のタクト.webp", category: "weapon", price: null, rarity: "超激レア", isGachaOnly: true, description: "リボンと花で飾られた魔法少女の指揮棒。振るうと花吹雪が舞う。", gachaName: "🎀 ふわふわ装備リッチガチャ♡" },
  { id: "eq_ladies_fallen_lace", name: "堕天使のレース", icon: "/images/gacha_equipment_ladies_webp/堕天使のレース.webp", category: "wings", price: null, rarity: "超激レア", isGachaOnly: true, description: "闇に染まった天使が纏う漆黒のレース。禁忌の魔力を秘める。", gachaName: "🎀 ふわふわ装備リッチガチャ♡" },
  { id: "eq_ladies_moon_necklace", name: "月と星のネックレス", icon: "/images/gacha_equipment_ladies_webp/月と星のネックレス.webp", category: "accessory", price: null, rarity: "超激レア", isGachaOnly: true, description: "月と星をかたどった神秘的なネックレス。星の加護を授ける。", gachaName: "🎀 ふわふわ装備リッチガチャ♡" },
  { id: "eq_ladies_angel_tiara", name: "天使の羽根のティアラ", icon: "/images/gacha_equipment_ladies_webp/天使の羽根のティアラ.webp", category: "head", price: null, rarity: "神レア", isGachaOnly: true, description: "天界から舞い降りた本物の羽根で作られた神レアのティアラ。聖なる加護が宿る。", gachaName: "🎀 ふわふわ装備リッチガチャ♡" },
  { id: "eq_ladies_stardust_staff", name: "星屑のキラキラスタッフ", icon: "/images/gacha_equipment_ladies_webp/星屑のキラキラスタッフ.webp", category: "weapon", price: null, rarity: "神レア", isGachaOnly: true, description: "無数の星屑が宿るきら星のような神レアスタッフ。宇宙の魔力を解き放つ。", gachaName: "🎀 ふわふわ装備リッチガチャ♡" }
];


export function getAllEquipment(): EquipmentItem[] {
  return equipmentList;
}

export function getEquipmentById(id?: string): EquipmentItem | undefined {
  if (!id) return undefined;
  return equipmentList.find(e => e.id === id);
}
