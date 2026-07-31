import { allGachaItems } from './gachaData';

export const shopThemes = [
  { id: "default", name: "いつもの", price: 0, icon: "📄" },
  { id: "space", name: "うちゅう", price: 5000, icon: "🚀" },
  { id: "ninja", name: "にんじゃ", price: 7500, icon: "🥷" },
  { id: "cyber", name: "サイバー", price: 10000, icon: "⚡" },
];

export const shopEffects = [
  { id: "fire", name: "ほのお", price: 200, icon: "🔥" },
  { id: "water", name: "みず", price: 500, icon: "💧" },
  { id: "thunder", name: "いかずち", price: 1000, icon: "⚡" },
  { id: "star", name: "ほし", price: 2000, icon: "⭐" },
  { id: "rainbow", name: "にじ", price: 3000, icon: "🌈" },
];

export const shopTitles = [
  { id: "見習い", price: 0 },
  { id: "新米勇者", price: 100 },
  { id: "炎の", price: 300 },
  { id: "氷の", price: 300 },
  { id: "雷の", price: 300 },
  { id: "光の", price: 500 },
  { id: "闇の", price: 500 },
  { id: "伝説の", price: 1000 },
  { id: "幻の", price: 1000 },
  { id: "覚醒した", price: 1500 },
  { id: "奇跡の", price: 1500 },
  { id: "無敵の", price: 2000 },
  { id: "最強の", price: 2000 },
  { id: "漢字マスター", price: 3000 },
  { id: "算数マスター", price: 3000 },
  { id: "天才", price: 4000 },
  { id: "神話の", price: 5000 },
  { id: "星を砕く", price: 6000 },
  { id: "時を超える", price: 7000 },
  { id: "次元の覇者", price: 8000 },
  { id: "破壊神", price: 10000 },
  { id: "創造神", price: 10000 },
  { id: "全知全能の", price: 15000 },
  { id: "ゴッド", price: 50000 },
  { id: "宇宙の創造主", price: 99999 },
];

export const shopAvatars = [
  { id: "👦", name: "男の子", price: 0 },
  { id: "👧", name: "女の子", price: 0 },
  { id: "⚔️", name: "戦士", price: 100 },
  { id: "🛡️", name: "騎士", price: 200 },
  { id: "🐶", name: "イヌ", price: 300 },
  { id: "🐱", name: "ネコ", price: 300 },
  { id: "🐲", name: "ドラゴン", price: 800 },
  { id: "🦄", name: "ユニコーン", price: 1000 },
  { id: "👽", name: "宇宙人", price: 1200 },
  { id: "👻", name: "おばけ", price: 1200 },
  { id: "🤖", name: "ロボット", price: 1500 },
  { id: "👾", name: "エイリアン", price: 1500 },
  { id: "🧙‍♂️", name: "魔法使い", price: 1800 },
  { id: "🧛", name: "吸血鬼", price: 1800 },
  { id: "🧚", name: "妖精", price: 2000 },
  { id: "🦸", name: "ヒーロー", price: 2000 },
  { id: "🥷", name: "忍者", price: 2200 },
  { id: "🦁", name: "ライオン", price: 2500 },
  { id: "🦅", name: "タカ", price: 2500 },
  { id: "🦖", name: "恐竜", price: 2800 },
  { id: "🚀", name: "ロケット", price: 3000 },
  { id: "🛸", name: "UFO", price: 3000 },
  { id: "🏅", name: "マスターメダル", price: 99999 },
  { id: "🏆", name: "大マスターカップ", price: 99999 },
];

export type UnifiedItem = {
  id: string;
  name: string;
  price: number | null;
  icon?: string;
  isGachaOnly: boolean;
};

export function getAllThemes(): UnifiedItem[] {
  const gachaThemes = allGachaItems.filter(i => i.type === 'theme').map(i => ({
    id: i.id,
    name: i.name.replace('テーマ「', '').replace('」', ''),
    price: null,
    icon: i.icon,
    isGachaOnly: true
  }));
  return [...shopThemes.map(i => ({...i, isGachaOnly: false})), ...gachaThemes];
}

export function getAllEffects(): UnifiedItem[] {
  const gachaEffects = allGachaItems.filter(i => i.type === 'effect').map(i => ({
    id: i.id,
    name: i.name.replace('エフェクト「', '').replace('」', ''),
    price: null,
    icon: i.icon,
    isGachaOnly: true
  }));
  return [...shopEffects.map(i => ({...i, isGachaOnly: false})), ...gachaEffects];
}

export function getAllTitles(): UnifiedItem[] {
  const gachaTitles = allGachaItems.filter(i => i.type === 'title').map(i => ({
    id: i.id,
    name: i.name.replace('称号「', '').replace('」', ''),
    price: null,
    icon: i.icon,
    isGachaOnly: true
  }));
  return [...shopTitles.map(i => ({...i, name: i.id, icon: undefined, isGachaOnly: false})), ...gachaTitles];
}

export function getAllAvatars(): UnifiedItem[] {
  const gachaAvatars = allGachaItems.filter(i => i.type === 'avatar').map(i => ({
    id: i.id,
    name: i.name.replace('アバター「', '').replace('」', ''),
    price: null,
    icon: i.icon,
    isGachaOnly: true
  }));
  return [...shopAvatars.map(i => ({...i, icon: i.id, isGachaOnly: false})), ...gachaAvatars];
}
