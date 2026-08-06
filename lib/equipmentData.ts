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
}

export const equipmentList: EquipmentItem[] = [
  // --- ショップ購入可能（SP） ---
  { id: "eq_beginner_sword", name: "初心者用の剣", icon: "🗡️", category: "weapon", price: 300, rarity: "ノーマル", isGachaOnly: false, description: "冒険を始めたばかりの剣士が持つ基本的な短剣。" },
  { id: "eq_iron_shield", name: "鉄の丸盾", icon: "🛡️", category: "shield", price: 500, rarity: "ノーマル", isGachaOnly: false, description: "しっかりした鉄で作られた頼もしい防御用の盾。" },
  { id: "eq_magic_cap", name: "とんがり帽子", icon: "🎩", category: "head", price: 800, rarity: "レア", isGachaOnly: false, description: "かぶると少し頭が冴える魔法使いの帽子。" },
  { id: "eq_steel_sword", name: "鋼鉄の大剣", icon: "⚔️", category: "weapon", price: 1500, rarity: "レア", isGachaOnly: false, description: "重厚で強力なダメージを与える大剣。" },
  { id: "eq_ranger_bow", name: "精霊の弓", icon: "🏹", category: "weapon", price: 2500, rarity: "激レア", isGachaOnly: false, description: "風の精霊の加護を受けた美しい弓。" },
  { id: "eq_silver_crown", name: "銀の王冠", icon: "👑", category: "head", price: 5000, rarity: "激レア", isGachaOnly: false, description: "高貴な冒険者が身につける美しい王冠。" },
  { id: "eq_crystal_orb", name: "予言の水晶玉", icon: "🔮", category: "accessory", price: 8000, rarity: "超激レア", isGachaOnly: false, description: "未来の知識を引き寄せる秘宝の水晶。" },

  // --- ガチャ限定品（SPガチャ） ---
  { id: "eq_fire_axe", name: "火炎の戦斧", icon: "🪓", category: "weapon", price: null, rarity: "激レア", isGachaOnly: true, description: "燃え盛る炎をまとったドワーフ秘伝の斧。" },
  { id: "eq_poseidon_trident", name: "深海の三叉槍", icon: "🔱", category: "weapon", price: null, rarity: "超激レア", isGachaOnly: true, description: "海の神ポセイドンの威光が宿る三叉の槍。" },
  { id: "eq_angel_wings", name: "大天使の聖翼", icon: "🪽", category: "wings", price: null, rarity: "超激レア", isGachaOnly: true, description: "背中に漆黒と純白の光を放つ翼が授けられる。" },
  { id: "eq_demon_wings", name: "宵闇の魔翼", icon: "🦇", category: "wings", price: null, rarity: "超激レア", isGachaOnly: true, description: "闇の魔王が授ける気高き翼。" },
  { id: "eq_holy_sword", name: "聖剣エクスカリバー", icon: "✨", category: "weapon", price: null, rarity: "神レア", isGachaOnly: true, description: "選ばれし勇者のみが扱える光の至高の剣。" },
  { id: "eq_god_crown", name: "全知全能の神冠", icon: "🌌", category: "head", price: null, rarity: "神レア", isGachaOnly: true, description: "全知全能の力を秘めた神の象徴たる冠。" },
  { id: "eq_star_aura", name: "銀河のリング", icon: "💎", category: "accessory", price: null, rarity: "神レア", isGachaOnly: true, description: "輝く銀河の星々をはめ込んだ究極の指輪。" }
];

export function getAllEquipment(): EquipmentItem[] {
  return equipmentList;
}

export function getEquipmentById(id?: string): EquipmentItem | undefined {
  if (!id) return undefined;
  return equipmentList.find(e => e.id === id);
}
