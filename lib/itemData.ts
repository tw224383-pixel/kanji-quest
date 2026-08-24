import { allGachaItems, allRichGachaItems, allRichGacha2Items, allRichLadiesGachaItems, Rarity } from './gachaData';

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
  { id: "漢字博士", price: 3000 },
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
  description?: string;
  rarity?: Rarity;
  gachaName?: string;
};

export const THEME_DESCRIPTIONS: Record<string, string> = {
  "default": "標準のベーシックな和風ファンタジーデザイン。",
  "space": "深遠なる宇宙と神秘の星々が広がる背景テーマ。",
  "ninja": "漆黒の夜と桜舞い散る静寂の忍びテーマ。",
  "cyber": "電脳都市の近未来的なネオンが輝くテーマ。",
  "time_space": "時空の歪みと次元の狭間を表現した神秘的なテーマ。",
  "skycastle": "雲の上に輝く天空の城がそびえ立つテーマ。",
  "magma": "煮え繰りかえるマグマと強烈な熱気を放つ火山テーマ。",
  "ruins": "古代の歴史が静かに眠る神秘的な遺跡テーマ。",
  "cybercity": "ネオンと高層ビルが立ち並ぶ電脳都市テーマ。",
  "ocean": "光と波が交差する美しい深海テーマ。",
  "forest": "生命の息吹と光が差し込む神秘の森テーマ。",
  "candy": "甘いお菓子とカラフルな夢が広がるテーマ。"
};

export function getThemeDescription(themeId: string): string {
  return THEME_DESCRIPTIONS[themeId] || "冒険画面を華やかに彩る背景テーマ。";
}

export function getAllThemes(): UnifiedItem[] {
  const gachaThemes = allGachaItems.filter(i => i.type === 'theme').map(i => ({
    id: i.id,
    name: i.name.replace('テーマ「', '').replace('」', ''),
    price: null,
    icon: i.icon,
    isGachaOnly: true,
    description: getThemeDescription(i.id),
    rarity: i.rarity,
    gachaName: "🎁 通常ガチャ"
  }));
  const richGachaThemes = [...allRichGachaItems, ...allRichGacha2Items].filter(i => i.type === 'theme').map(i => ({
    id: i.id,
    name: i.name.replace('テーマ「', '').replace('」', ''),
    price: null,
    icon: i.icon,
    isGachaOnly: true,
    description: getThemeDescription(i.id),
    rarity: i.rarity,
    gachaName: allRichGachaItems.some(x => x.id === i.id) ? "💎 リッチガチャ1" : "✨ リッチガチャ2"
  }));
  const shopThemeRarity: Record<string, Rarity> = {
    "default": "ノーマル",
    "space": "レア",
    "ninja": "激レア",
    "cyber": "超激レア"
  };
  return [
    ...shopThemes.map(i => ({...i, isGachaOnly: false, description: getThemeDescription(i.id), rarity: shopThemeRarity[i.id] || "ノーマル", gachaName: "🛍️ ショップ"})),
    ...gachaThemes,
    ...richGachaThemes
  ];
}

export function getAllEffects(): UnifiedItem[] {
  const gachaEffects = allGachaItems.filter(i => i.type === 'effect').map(i => ({
    id: i.id,
    name: i.name.replace('エフェクト「', '').replace('」', ''),
    price: null,
    icon: i.icon,
    isGachaOnly: true,
    rarity: i.rarity,
    gachaName: "🎁 通常ガチャ"
  }));
  const richGachaEffects = [...allRichGachaItems, ...allRichGacha2Items].filter(i => i.type === 'effect').map(i => ({
    id: i.id,
    name: i.name.replace('エフェクト「', '').replace('」', ''),
    price: null,
    icon: i.icon,
    isGachaOnly: true,
    rarity: i.rarity,
    gachaName: allRichGachaItems.some(x => x.id === i.id) ? "💎 リッチガチャ1" : "✨ リッチガチャ2"
  }));
  const shopEffectRarity: Record<string, Rarity> = {
    "fire": "ノーマル",
    "water": "ノーマル",
    "thunder": "レア",
    "star": "激レア",
    "rainbow": "超激レア"
  };
  return [...shopEffects.map(i => ({...i, isGachaOnly: false, rarity: shopEffectRarity[i.id] || "ノーマル", gachaName: "🛍️ ショップ"})), ...gachaEffects, ...richGachaEffects];
}

export const achievementTitles: { id: string; rarity: Rarity; desc: string }[] = [
  // 総合カルテ平均レベル
  { id: "ひよっこ冒険者", rarity: "レア", desc: "成長カルテの平均レベルLv.5達成" },
  { id: "熟練の探究者", rarity: "レア", desc: "成長カルテの平均レベルLv.10達成" },
  { id: "万能の知恵者", rarity: "激レア", desc: "成長カルテの平均レベルLv.20達成" },
  { id: "大賢者", rarity: "超激レア", desc: "成長カルテの平均レベルLv.35達成" },
  { id: "神域の賢王", rarity: "超激レア", desc: "成長カルテの平均レベルLv.50達成" },
  { id: "創世の神", rarity: "神レア", desc: "成長カルテの全分野Lv.99達成（神ランク極致）" },

  // 各分野特化
  { id: "語彙の達人", rarity: "激レア", desc: "漢字・語彙力レベルLv.30達成" },
  { id: "漢字マスター", rarity: "超激レア", desc: "漢字・語彙力レベルLv.50達成" },
  { id: "言霊の神", rarity: "神レア", desc: "漢字・語彙力レベルLv.99達成" },

  { id: "神速の計算機", rarity: "激レア", desc: "計算スピードレベルLv.30達成" },
  { id: "光速の数学者", rarity: "超激レア", desc: "計算スピードレベルLv.50達成" },
  { id: "数理の神童", rarity: "神レア", desc: "計算スピードレベルLv.99達成" },

  { id: "名探偵", rarity: "激レア", desc: "論理・思考力レベルLv.30達成" },
  { id: "論理の巨匠", rarity: "超激レア", desc: "論理・思考力レベルLv.50達成" },
  { id: "知略王", rarity: "神レア", desc: "論理・思考力レベルLv.99達成" },

  { id: "空間のマエストロ", rarity: "激レア", desc: "空間・図形・単位レベルLv.30達成" },
  { id: "次元の超越者", rarity: "超激レア", desc: "空間・図形・単位レベルLv.50達成" },
  { id: "時空の統治者", rarity: "神レア", desc: "空間・図形・単位レベルLv.99達成" },

  { id: "自然の探究者", rarity: "激レア", desc: "科学探究レベルLv.30達成" },
  { id: "大科学者", rarity: "超激レア", desc: "科学探究レベルLv.50達成" },
  { id: "万物の理を識る者", rarity: "神レア", desc: "科学探究レベルLv.99達成" },

  { id: "天下人", rarity: "激レア", desc: "社会理解レベルLv.30達成" },
  { id: "世界探検家", rarity: "超激レア", desc: "社会理解レベルLv.50達成" },
  { id: "歴史を創りし者", rarity: "神レア", desc: "社会理解レベルLv.99達成" },

  // SP実績
  { id: "知識の探求者", rarity: "レア", desc: "累計5,000 SP獲得達成" },
  { id: "叡智の巨星", rarity: "激レア", desc: "累計10,000 SP獲得達成" },
  { id: "森羅万象", rarity: "神レア", desc: "累計30,000 SP獲得達成" },

  // 累計鍛錬
  { id: "百錬成鋼", rarity: "激レア", desc: "カルテ累計500問正解達成" },
  { id: "千問ノ覇者", rarity: "神レア", desc: "カルテ累計1,000問正解達成" },

  // レイドボス討伐隊
  { id: "Lv1討伐隊", rarity: "レア", desc: "Lv1レイドボス討伐" },
  { id: "Lv3討伐隊", rarity: "レア", desc: "Lv3レイドボス討伐" },
  { id: "Lv5討伐隊", rarity: "レア", desc: "Lv5レイドボス討伐" },
  { id: "Lv7討伐隊", rarity: "激レア", desc: "Lv7レイドボス討伐" },
  { id: "Lv10討伐隊", rarity: "超激レア", desc: "Lv10レイドボス討伐" },

  // ランキング実績
  { id: "学年の実力者", rarity: "激レア", desc: "週間ヒーローランキングで学年TOP3入り" },
  { id: "学年の準王者", rarity: "超激レア", desc: "週間ヒーローランキングで学年2位を獲得" },
  { id: "週間チャンピオン", rarity: "神レア", desc: "週間ヒーローランキングで学年1位を獲得" },
  { id: "全国区の勇者", rarity: "超激レア", desc: "全学年ダメージランキング（全校5枠）にランクイン" },
  { id: "全学年の覇者", rarity: "神レア", desc: "全学年ダメージランキングで表彰台（TOP3）入り" },
  { id: "全学年の準王者", rarity: "神レア", desc: "全学年ダメージランキングで2位を獲得" },
  { id: "絶対王者", rarity: "神レア", desc: "全学年ダメージランキングで1位を獲得" },
  { id: "二冠の伝説", rarity: "神レア", desc: "週間ヒーロー1位と全学年ダメージTOP5、両方を達成" },
];

export function getAllTitles(): UnifiedItem[] {
  const gachaTitles = allGachaItems.filter(i => i.type === 'title').map(i => ({
    id: i.id,
    name: i.name.replace('称号「', '').replace('」', ''),
    price: null,
    icon: i.icon,
    isGachaOnly: true,
    rarity: i.rarity,
    gachaName: "🎁 通常ガチャ"
  }));
  const richGachaTitles = [...allRichGachaItems, ...allRichGacha2Items].filter(i => i.type === 'title').map(i => ({
    id: i.id,
    name: i.name.replace('称号「', '').replace('」', ''),
    price: null,
    icon: i.icon,
    isGachaOnly: true,
    rarity: i.rarity,
    gachaName: allRichGachaItems.some(x => x.id === i.id) ? "💎 リッチガチャ1" : "✨ リッチガチャ2"
  }));
  const shopTitleRarity: Record<string, Rarity> = {
    "見習い": "ノーマル",
    "新米勇者": "ノーマル",
    "炎の": "レア",
    "氷の": "レア",
    "雷の": "レア",
    "光の": "激レア",
    "闇の": "激レア",
    "伝説の": "激レア",
    "幻の": "激レア",
    "覚醒した": "激レア",
    "奇跡の": "激レア",
    "無敵の": "激レア",
    "最強の": "激レア",
    "漢字博士": "超激レア",
    "算数マスター": "超激レア",
    "天才": "超激レア",
    "神話の": "超激レア",
    "星を砕く": "超激レア",
    "時を超える": "超激レア",
    "次元の覇者": "超激レア",
    "破壊神": "神レア",
    "創造神": "神レア",
    "全知全能の": "神レア",
    "ゴッド": "神レア",
    "宇宙の創造主": "神レア",
  };

  const achTitles: UnifiedItem[] = achievementTitles.map(t => ({
    id: t.id,
    name: t.id,
    price: null,
    icon: undefined,
    isGachaOnly: true,
    description: t.desc,
    rarity: t.rarity,
    gachaName: "🏆 実績報酬"
  }));

  const baseShopTitles = shopTitles.map(i => ({
    ...i,
    name: i.id,
    icon: undefined,
    isGachaOnly: false,
    rarity: shopTitleRarity[i.id] || "ノーマル",
    gachaName: "🛍️ ショップ"
  }));

  const rawList = [...baseShopTitles, ...achTitles, ...gachaTitles, ...richGachaTitles];
  const seen = new Set<string>();
  return rawList.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function getAllAvatars(): UnifiedItem[] {
  // 1. Normal Gacha & Shop base avatars
  const normalAvatars = [
    ...shopAvatars.map(i => {
      const info = getAvatarInfo(i.id);
      return {
        ...i,
        icon: i.id,
        isGachaOnly: false,
        description: info?.description,
        rarity: info?.rarity || "ノーマル",
        gachaName: "🛍️ ショップ"
      };
    }),
    ...allGachaItems.filter(i => i.type === 'avatar').map(i => {
      const info = getAvatarInfo(i.id);
      return {
        id: i.id,
        name: i.name.replace('アバター「', '').replace('」', ''),
        price: null,
        icon: i.icon,
        isGachaOnly: true,
        description: info?.description,
        rarity: info?.rarity || i.rarity,
        gachaName: "🎁 通常ガチャ"
      };
    })
  ];

  // 2. All 3000 PT Gacha Avatars combined (ふわふわ, リッチ1, リッチ2)
  const rich3000Avatars = [
    ...allRichLadiesGachaItems.filter(i => i.type === 'avatar').map(i => {
      const info = getAvatarInfo(i.id);
      return {
        id: i.id,
        name: i.name.replace('アバター「', '').replace('」', ''),
        price: null,
        icon: i.icon,
        isGachaOnly: true,
        description: info?.description,
        rarity: info?.rarity || i.rarity,
        gachaName: "🌸 ふわふわガチャ♡"
      };
    }),
    ...allRichGachaItems.filter(i => i.type === 'avatar').map(i => {
      const info = getAvatarInfo(i.id);
      return {
        id: i.id,
        name: i.name.replace('アバター「', '').replace('」', ''),
        price: null,
        icon: i.icon,
        isGachaOnly: true,
        description: info?.description,
        rarity: info?.rarity || i.rarity,
        gachaName: "💎 リッチガチャ1"
      };
    }),
    ...allRichGacha2Items.filter(i => i.type === 'avatar').map(i => {
      const info = getAvatarInfo(i.id);
      return {
        id: i.id,
        name: i.name.replace('アバター「', '').replace('」', ''),
        price: null,
        icon: i.icon,
        isGachaOnly: true,
        description: info?.description,
        rarity: info?.rarity || i.rarity,
        gachaName: "✨ リッチガチャ2"
      };
    })
  ];

  // Sort 3000PT avatars by Rarity Rank: 神レア -> 超激レア -> 激レア -> レア -> ノーマル
  const rarityRank: Record<string, number> = {
    "神レア": 5,
    "超激レア": 4,
    "激レア": 3,
    "レア": 2,
    "ノーマル": 1
  };

  rich3000Avatars.sort((a, b) => {
    const rankA = rarityRank[a.rarity || "ノーマル"] || 1;
    const rankB = rarityRank[b.rarity || "ノーマル"] || 1;
    return rankB - rankA;
  });

  return [...normalAvatars, ...rich3000Avatars];
}

export interface AvatarInfo {
  id: string;
  name: string;
  rarity: Rarity;
  icon: string;
  description?: string;
  gachaName?: string;
}

export const AVATAR_DESCRIPTIONS: Record<string, string> = {
  // --- Rich Gacha 1 ---
  "rich_dragon": "聖なる光と漆黒の鱗を纏う伝説の神竜。",
  "rich_knight": "漆黒の大剣を振るい戦場を疾走する暗黒の騎士。",
  "rich_cyborg": "最新テクノロジーでボディを強化したサイバー戦士。",
  "rich_cool_wolf": "月夜の荒野を孤独に生き抜く気高き銀狼。",
  "rich_cool_griffin": "大空の暴風を統べる天空の覇者グリフォン。",
  "rich_princess": "光の王冠を戴き気品にあふれる王国のお姫様。",
  "rich_angel": "聖なる祝福の光で傷ついた心を包み込む天使。",
  "rich_magical": "きらめく星のステッキで奇跡を起こす魔法少女。",
  "rich_fairy": "神秘の粉を振りまいて宙を舞う森の妖精。",
  "rich_mermaid": "美しい歌声で深海の世界を彩る可憐な人魚姫。",

  // --- Rich Gacha 2 ---
  "漆黒の魔王軍将軍": "世界を闇に染める魔王軍を率いる冷徹な将軍。",
  "終焉の魔王": "あらゆる希望を打ち砕く絶望の支配者。",
  "聖なるホワイトドラゴン": "聖なる光を纏い空を翔ける伝説の白竜。",
  "虚無の使者・カオスエージェント": "次元の狭間より現れし混沌の使者。",
  "虚空の堕天使": "天界から落ち、闇の力を手に入れた黒き翼を持つ者。",
  "大賢者": "世界のすべての知識を極めた伝説の魔導士。",
  "異次元の魔法使い": "異世界から時空を超えてやってきた大魔法使い。",
  "雷光の精霊・サンダービースト": "閃光とともに駆け巡る雷の霊獣。",
  "天才魔導士": "幼くして禁忌の超魔法をマスターした天才少女。",
  "狂気の道化師": "トリッキーな奇術で敵を翻弄する危険な道化師。",
  "蒼き魔法剣士": "魔力を込めた青き刃で邪悪を切り裂く剣士。",
  "闇の精霊使い": "深淵の精霊たちと契約を交わした召喚士。",
  "エルフの森の射手": "百発百中の腕前を誇る森の静かな護り手。",
  "呪われし死霊騎士": "不死の呪いを受け戦い続ける亡霊の騎士。",
  "氷結の魔女": "絶対零度の吹雪を操る氷の女王。",
  "蜘蛛の女戦士": "鋼鉄の粘糸と鋭利な毒爪で獲物を狩る、深淵迷宮の蜘蛛女戦士。",
  "レア_蜘蛛の女戦士": "鋼鉄の粘糸と鋭利な毒爪で獲物を狩る、深淵迷宮の蜘蛛女戦士。",
  "雲の戦士": "鋼鉄の粘糸と鋭利な毒爪で獲物を狩る、深淵迷宮の蜘蛛女戦士。",
  "レア_雲の": "鋼鉄の粘糸と鋭利な毒爪で獲物を狩る、深淵迷宮の蜘蛛女戦士。",
  "堅牢の山岳ドワーフ": "山脈の鉱石で鍛えた頑丈な鎧を着る豪傑。",
  "堕落した聖騎士": "かつて正義を誓いながら闇に堕ちた元騎士。",
  "嵐を呼ぶハーピー・リーダー": "大空を舞い猛烈な竜巻を起こすハーピーの頭領。",
  "災厄の双頭キマイラ": "二つの頭を持つ凶暴な伝説の魔獣。",
  "炎獄の魔戦士": "地獄の業火を身体に宿した焔の戦士。",
  "猛火のサラマンダーマン": "火山のマグマから生まれた炎の魔人。",
  "荒野の大剣豪": "流浪の旅を続ける孤高の大剣客。",
  "近衛兵リーダー槍使い": "王家を守る精鋭近衛兵の頼もしき隊長。",

  // --- ふわふわガチャ♡ ---
  "イチゴチョコのロップイヤー騎士": "いちごチョコの甘い香りを漂わせるキュートなうさぎの騎士。",
  "avatar_ladies_ロップイヤー騎士": "いちごチョコの甘い香りを漂わせるキュートなうさぎの騎士。",
  "マーメイドの歌姫": "美しい歌声で海の生き物たちを癒やす可憐な人魚姫。",
  "avatar_ladies_マーメイド": "美しい歌声で海の生き物たちを癒やす可憐な人魚姫。",
  "星屑のエルフの弓使い": "星明かりの弓で夜空の悪を射抜く神秘的なエルフの少女。",
  "avatar_ladies_エルフ弓使い": "星明かりの弓で夜空の悪を射抜く神秘的なエルフの少女。",
  "ひまわりのビーストテイマー": "ひまわりのような満開の笑顔で可愛い動物たちと心を通わせるテイマー。",
  "avatar_ladies_ビーストテイマー": "ひまわりのような満開の笑顔で可愛い動物たちと心を通わせるテイマー。",
  "ピンクの魔法使い見習い": "ピンクの魔法のステッキでトキメキを振りまく見習い魔女。",
  "avatar_ladies_ピンク魔法使い": "ピンクの魔法のステッキでトキメキを振りまく見習い魔女。",
  "マカロン色の重戦士": "パステルカラーの愛らしい重鎧に身を包んだ力持ちな乙女。",
  "avatar_ladies_マカロン重戦士": "パステルカラーの愛らしい重鎧に身を包んだ力持ちな乙女。",
  "ミントグリーンの風使い": "爽やかなミントの風に乗って大空を軽やかに舞う風の使者。",
  "avatar_ladies_ミント風使い": "爽やかなミントの風に乗って大空を軽やかに舞う風の使者。",
  "バラの舞踏騎士": "華麗な剣技と真紅のバラで戦場を舞踏会に変える気高き騎士。",
  "avatar_ladies_バラの舞踏騎士": "華麗な剣技と真紅のバラで戦場を舞踏会に変える気高き騎士。",
  "ラベンダーの召喚士": "ラベンダーの香りとともに神秘の聖獣を呼び出す可憐な召喚士。",
  "avatar_ladies_ラベンダー召喚士": "ラベンダーの香りとともに神秘の聖獣を呼び出す可憐な召喚士。",
  "月と星の暗殺者": "静寂な夜空の月明かりに紛れて密かに活躍する影の美女。",
  "avatar_ladies_月星の暗殺者": "静寂な夜空の月明かりに紛れて密かに活躍する影の美女。",
  "キラキラ星の踊り子": "夜空の星々を散りばめた衣装で光の舞を披露するダンサー。",
  "avatar_ladies_キラキラ星踊り子": "夜空の星々を散りばめた衣装で光の舞を披露するダンサー。",
  "天使の羽根の聖騎士": "純白の聖翼をはためかせ正義のために戦う高潔な天界の騎士。",
  "avatar_ladies_天使聖騎士": "純白の聖翼をはためかせ正義のために戦う高潔な天界の騎士。",
  "宝石の精霊使い": "輝く宝石たちの精霊と心をつなぐ神秘的な少女。",
  "avatar_ladies_宝石精霊使い": "輝く宝石たちの精霊と心をつなぐ神秘的な少女。",
  "白猫のモフモフ拳闘士": "モフモフの肉球グローブで肉弾戦をこなすキュートな白猫娘。",
  "avatar_ladies_白猫拳闘士": "モフモフの肉球グローブで肉弾戦をこなすキュートな白猫娘。",
  "スイーツデコガンナー": "お菓子とクリームの二丁拳銃でスイートに敵を打ち抜く最強ガンナー。",
  "avatar_ladies_スイーツガンナー": "お菓子とクリームの二丁拳銃でスイートに敵を打ち抜く最強ガンナー。",
  "夢見るヒツジの魔導士": "モフモフのヒツジとともに心地よい夢の魔法をかける大魔導士。",
  "avatar_ladies_ヒツジ魔導士": "モフモフのヒツジとともに心地よい夢の魔法をかける大魔導士。",
  "花のヒーラー姫": "咲き誇る花の奇跡の光で傷ついた仲間をすべて包み込む聖なる姫君。",
  "avatar_ladies_花ヒーラー姫": "咲き誇る花の奇跡の光で傷ついた仲間をすべて包み込む聖なる姫君。",

  // --- Legacy Rich Gacha 1 ---
  "cool_griffin": "天空の覇者たる誇り高きグリフィン。",
  "cool_wolf": "月夜に遠吠えをあげる神秘的な銀狼。",
  "cute_angel": "人々に愛と祝福を授ける愛らしい天使。",
  "cute_angel_v4": "聖なる光に包まれた天界の使者。",
  "cute_dragon": "小さな身体に大きなパワーを秘めた子竜。",
  "cute_fairy": "花々とともに舞い踊る森の妖精。",
  "cute_fairy_v4": "神秘的な輝きを放つ妖精王。",
  "cute_golem": "心優しい岩石の頼もしい守護兵。",
  "cute_griffin": "もふもふの羽を持つ風のグリフィン。",
  "cute_kraken": "海を愛する可愛い海の魔物クラーケン。",
  "cute_magical": "魔法のステッキを持った見習い魔女。",
  "cute_magical_v4": "星の魔法を自在に操る可憐な大魔女。",
  "cute_mermaid_v2": "美しい歌声で海を彩る人魚姫。",
  "cute_mermaid_v3": "深海に輝く美しい真珠をまとう人魚。",
  "cute_mermaid_v4": "大海原を自由気ままに旅する可憐な人魚。",
  "cute_princess_v2": "華やかなドレスを着た愛らしいお姫様。",
  "cute_princess_v3": "気品あふれる王国のお姫様。",
  "cute_princess_v4": "光の王冠を戴く可憐な姫君。",
  "cute_slime": "ぷにぷにして触り心地のいい愛されスライム。",
  "cyborg": "最新テクノロジーで強化されたサイバー兵士。",
  "dragon": "熱い炎を吐き世界を支配する伝説のドラゴン。",
  "knight": "王国への固い忠誠を誓う勇敢な騎士。",

  // --- Shop & Emojis ---
  "👦": "元気いっぱいの男の子。",
  "👧": "笑顔が素敵な女の子。",
  "⚔️": "果敢に強敵へと挑む勇敢な戦士。",
  "🛡️": "仲間を全力で守る強固な盾を持つ騎士。",
  "🐶": "いつも元気に走り回る忠実なイヌ。",
  "🐱": "きまぐれだけど愛くるしいネコ。",
  "🐲": "古代の神秘的な力を秘めた龍のアバター。",
  "🦄": "希望の光を放つ伝説の一角獣ユニコーン。",
  "👽": "遠い星からやってきた謎多き宇宙人。",
  "👻": "いたずら大好きなふわふわおばけ。",
  "🤖": "正確無比な計算で冒険をサポートするメカ。",
  "👾": "ドット絵の世界から飛び出したレトロモンスター。",
  "🧙‍♂️": "摩訶不思議な魔法を操る熟練の大魔導士。",
  "🧛": "宵闇の館に住まう気高き吸血鬼。",
  "🧚": "キラキラした粉をまき散らす可憐な妖精。",
  "🦸": "みんなの平和を守る正義のヒーロー。",
  "🥷": "影に潜み素早く身を隠す忍びの者。",
  "🦁": "百獣の王たるプライドを持つ勇猛なライオン。",
  "🦅": "大空を鋭い眼光で見下ろす孤高のタカ。",
  "🦖": "太古の地球を支配した巨大な恐竜。",
  "🚀": "銀河の果てを目指す超高速ロケット。",
  "🛸": "未知の技術を搭載した飛翔円盤UFO。",
  "💩": "なぜか大人気の愛されウンチ。",
  "🤡": "おどけたポーズでみんなを笑わせるピエロ。",
  "🥸": "誰も正体を見破れない変装の名人。",
  "🥔": "素朴だけど味わい深いジャガイモ。",
  "🍄": "森の奥深くに生える魔法のキノコ。",
  "🐌": "自分のペースで一歩ずつ進むカタツムリ。",
  "🐢": "急がず焦らず着実に進む知恵もののカメ。",
  "🪨": "びくともしない頑丈なただの石。",
  "🏅": "全学年の漢字を極めし者に授与されるマスターメダル。",
  "🏆": "全学年の漢字を完全制覇した最高峰の大マスターカップ。"
};

export function getAvatarDescription(nameOrId: string): string {
  if (!nameOrId) return "冒険を彩る魅力的なアバター。";
  if (AVATAR_DESCRIPTIONS[nameOrId]) return AVATAR_DESCRIPTIONS[nameOrId];
  
  let decoded = nameOrId;
  try { decoded = decodeURIComponent(nameOrId); } catch(e) {}

  const clean = decoded
    .replace(/^.*[\\/]/, '')
    .replace(/\.(png|jpg|jpeg|webp)$/i, '')
    .replace(/^(神レア|超激レア|激レア|レア|ノーマル)_/, '')
    .replace(/^アバター「|」$/g, '')
    .replace(/^avatar_ladies_/, '')
    .replace(/^avatar_/, '')
    .replace(/^rich_/, '');
    
  if (AVATAR_DESCRIPTIONS[clean]) return AVATAR_DESCRIPTIONS[clean];

  for (const [key, desc] of Object.entries(AVATAR_DESCRIPTIONS)) {
    if (nameOrId.includes(key) || clean.includes(key) || key.includes(clean)) return desc;
  }

  const allGacha = [...allRichLadiesGachaItems, ...allRichGacha2Items, ...allRichGachaItems, ...allGachaItems.filter(i => i.type === 'avatar')];
  const foundItem = allGacha.find(i => 
    i.id === nameOrId || i.name === nameOrId || i.icon === nameOrId ||
    i.id === decoded || i.icon === decoded
  );

  if (foundItem) {
    const itemNameClean = foundItem.name.replace(/^アバター「|」$/g, '');
    if (AVATAR_DESCRIPTIONS[foundItem.id]) return AVATAR_DESCRIPTIONS[foundItem.id];
    if (AVATAR_DESCRIPTIONS[itemNameClean]) return AVATAR_DESCRIPTIONS[itemNameClean];
    for (const [key, desc] of Object.entries(AVATAR_DESCRIPTIONS)) {
      if (itemNameClean.includes(key) || key.includes(itemNameClean) || foundItem.id.includes(key)) return desc;
    }
  }

  return "冒険を彩る魅力的なアバター。";
}

export function getAvatarInfo(avatarIdOrUrl?: string): AvatarInfo | null {
  if (!avatarIdOrUrl) return null;

  let decoded = avatarIdOrUrl;
  try {
    decoded = decodeURIComponent(avatarIdOrUrl);
  } catch(e) {}

  const clean = decoded
    .replace(/^.*[\\/]/, '') // filename only
    .replace(/\.(png|jpg|jpeg|webp)$/i, '')
    .replace(/^(神レア|超激レア|激レア|レア|ノーマル)_/, '')
    .replace(/^アバター「|」$/g, '');

  const allGacha = [...allRichLadiesGachaItems, ...allRichGacha2Items, ...allRichGachaItems, ...allGachaItems.filter(i => i.type === 'avatar')];

  // 1. Exact match on id or icon (decoded or original)
  let found = allGacha.find(i => 
    i.id === avatarIdOrUrl || i.icon === avatarIdOrUrl ||
    i.id === decoded || i.icon === decoded
  );

  // 2. Partial/Clean match on gacha items
  if (!found) {
    found = allGacha.find(i => {
      const iCleanId = i.id.replace(/^(神レア|超激レア|激レア|レア|ノーマル)_/, '').replace(/^アバター「|」$/g, '');
      const iCleanName = i.name.replace(/^アバター「|」$/g, '');
      const iCleanIcon = i.icon.replace(/^.*[\\/]/, '').replace(/\.(png|jpg|jpeg|webp)$/i, '').replace(/^(神レア|超激レア|激レア|レア|ノーマル)_/, '');
      
      return (
        iCleanId === clean ||
        iCleanName === clean ||
        iCleanIcon === clean ||
        (clean && (i.id.includes(clean) || decoded.includes(iCleanId) || decoded.includes(iCleanIcon)))
      );
    });
  }

  if (found) {
    const name = found.name.replace(/^アバター「|」$/g, '');
    return {
      id: found.id,
      name: name,
      rarity: found.rarity,
      icon: found.icon,
      description: getAvatarDescription(found.id) || getAvatarDescription(name) || getAvatarDescription(found.icon)
    };
  }

  // 3. Check Shop Avatars
  const shopAv = shopAvatars.find(i => i.id === avatarIdOrUrl || i.name === avatarIdOrUrl || i.id === clean || i.name === clean);
  if (shopAv) {
    let rarity: Rarity = "ノーマル";
    if (["🏅", "🏆"].includes(shopAv.id)) rarity = "神レア";
    else if (["🦁", "🦅", "🦖", "🚀", "🛸"].includes(shopAv.id)) rarity = "超激レア";
    else if (["🤖", "👾", "🧙‍♂️", "🧛", "🧚", "🦸", "🥷"].includes(shopAv.id)) rarity = "激レア";
    else if (["🐲", "🦄", "👽", "👻"].includes(shopAv.id)) rarity = "レア";

    return {
      id: shopAv.id,
      name: shopAv.name,
      rarity,
      icon: shopAv.id,
      description: getAvatarDescription(shopAv.id) || getAvatarDescription(shopAv.name)
    };
  }

  // Fallback: Check if filename contains rarity keywords
  let fallbackRarity: Rarity = "ノーマル";
  if (decoded.includes("神レア") || avatarIdOrUrl.includes("神レア")) fallbackRarity = "神レア";
  else if (decoded.includes("超激レア") || avatarIdOrUrl.includes("超激レア")) fallbackRarity = "超激レア";
  else if (decoded.includes("激レア") || avatarIdOrUrl.includes("激レア")) fallbackRarity = "激レア";
  else if (decoded.includes("レア") || avatarIdOrUrl.includes("レア")) fallbackRarity = "レア";

  const name = clean || avatarIdOrUrl;
  return {
    id: avatarIdOrUrl,
    name: name,
    rarity: fallbackRarity,
    icon: avatarIdOrUrl,
    description: getAvatarDescription(name)
  };
}

export function getAvatarImageProps(iconUrl?: string): { className: string; style: React.CSSProperties } {
  if (!iconUrl || typeof iconUrl !== 'string' || !iconUrl.startsWith('/')) {
    return { className: '', style: {} };
  }
  
  const decoded = decodeURIComponent(iconUrl);
  const isLadies = 
    decoded.includes('/avatars/ladies/') ||
    decoded.includes('ladies') ||
    decoded.includes('ロップイヤー') ||
    decoded.includes('マーメイド') ||
    decoded.includes('エルフの弓使い') ||
    decoded.includes('ビーストテイマー') ||
    decoded.includes('魔法使い見習い') ||
    decoded.includes('重戦士') ||
    decoded.includes('風使い') ||
    decoded.includes('舞踏騎士') ||
    decoded.includes('召喚士') ||
    decoded.includes('暗殺者') ||
    decoded.includes('デコガンナー') ||
    decoded.includes('ヒツジ') ||
    decoded.includes('ヒーラー姫') ||
    decoded.includes('踊り子') ||
    decoded.includes('聖騎士') ||
    decoded.includes('精霊使い') ||
    decoded.includes('モフモフ拳闘士');

  if (isLadies) {
    return {
      className: '',
      style: {
        transform: 'scale(1.48)',
        transformOrigin: 'center 12%',
        objectFit: 'cover',
        objectPosition: 'center 10%'
      }
    };
  }

  if (decoded.includes('slime') || decoded.includes('スライム')) {
    return {
      className: '',
      style: {
        transform: 'scale(1.05)',
        transformOrigin: 'center center',
        objectFit: 'cover',
        objectPosition: 'center center'
      }
    };
  }

  if (
    decoded.includes('cute_princess') || 
    decoded.includes('cute_angel') || 
    decoded.includes('cute_magical') || 
    decoded.includes('cute_fairy') || 
    decoded.includes('cute_mermaid')
  ) {
    return {
      className: '',
      style: {
        transform: 'scale(1.4)',
        transformOrigin: 'top center',
        objectFit: 'cover',
        objectPosition: 'center 15%'
      }
    };
  }

  return {
    className: '',
    style: {
      objectFit: 'cover',
      objectPosition: 'center'
    }
  };
}

/**
 * Returns the optimized 128x128 thumbnail URL for an avatar/equipment image if available
 */
export function getAvatarThumbUrl(iconUrl?: string): string {
  if (!iconUrl) return '';
  if (!iconUrl.startsWith('/') || iconUrl.includes('/thumbs/')) return iconUrl;
  
  const lastSlashIndex = iconUrl.lastIndexOf('/');
  if (lastSlashIndex === -1) return iconUrl;
  
  const dir = iconUrl.substring(0, lastSlashIndex);
  const file = iconUrl.substring(lastSlashIndex + 1);
  return `${dir}/thumbs/${file}`;
}

