const fs = require('fs');

const items = [
  {f:'ノーマル_堅牢の山岳ドワーフ.png', r:'ノーマル', n:'アバター「堅牢の山岳ドワーフ」', w:250},
  {f:'ノーマル_堕落した聖騎士.png', r:'ノーマル', n:'アバター「堕落した聖騎士」', w:250},
  {f:'ノーマル_嵐を呼ぶハーピー・リーダー.png', r:'ノーマル', n:'アバター「嵐を呼ぶハーピー・リーダー」', w:250},
  {f:'ノーマル_災厄の双頭キマイラ.png', r:'ノーマル', n:'アバター「災厄の双頭キマイラ」', w:250},
  {f:'ノーマル_炎獄の魔戦士.png', r:'ノーマル', n:'アバター「炎獄の魔戦士」', w:250},
  {f:'ノーマル_猛火のサラマンダーマン.png', r:'ノーマル', n:'アバター「猛火のサラマンダーマン」', w:250},
  {f:'ノーマル_荒野の大剣豪.png', r:'ノーマル', n:'アバター「荒野の大剣豪」', w:250},
  {f:'ノーマル_近衛兵リーダー槍使い.png', r:'ノーマル', n:'アバター「近衛兵リーダー槍使い」', w:250},
  {f:'レア_エルフの森の射手.png', r:'レア', n:'アバター「エルフの森の射手」', w:625},
  {f:'レア_呪われし死霊騎士.png', r:'レア', n:'アバター「呪われし死霊騎士」', w:625},
  {f:'レア_氷結の魔女.png', r:'レア', n:'アバター「氷結の魔女」', w:625},
  {f:'レア_雲の.png', r:'レア', n:'アバター「雲の戦士」', w:625},
  {f:'激レア_天才魔導士.png', r:'激レア', n:'アバター「天才魔導士」', w:875},
  {f:'激レア_狂気の道化師.png', r:'激レア', n:'アバター「狂気の道化師」', w:875},
  {f:'激レア_蒼き魔法剣士.png', r:'激レア', n:'アバター「蒼き魔法剣士」', w:875},
  {f:'激レア_闇の精霊使い.png', r:'激レア', n:'アバター「闇の精霊使い」', w:875},
  {f:'神レア_漆黒の魔王軍将軍.png', r:'神レア', n:'アバター「漆黒の魔王軍将軍」', w:100},
  {f:'神レア_終焉の魔王.png', r:'神レア', n:'アバター「終焉の魔王」', w:100},
  {f:'神レア_聖なるホワイトドラゴン.png', r:'神レア', n:'アバター「聖なるホワイトドラゴン」', w:100},
  {f:'神レア_虚無の使者・カオスエージェント.png', r:'神レア', n:'アバター「虚無の使者・カオスエージェント」', w:100},
  {f:'神レア_虚空の堕天使.png', r:'神レア', n:'アバター「虚空の堕天使」', w:100},
  {f:'超激レア_大賢者.png', r:'超激レア', n:'アバター「大賢者」', w:500},
  {f:'超激レア_異次元の魔法使い.png', r:'超激レア', n:'アバター「異次元の魔法使い」', w:500},
  {f:'超激レア_雷光の精霊・サンダービースト.png', r:'超激レア', n:'アバター「雷光の精霊・サンダービースト」', w:500}
];

let out = '\nexport const allRichGacha2Items: GachaItem[] = [\n';
for (let i of items) {
  out += `  { id: "${i.f.replace('.png', '')}", type: "avatar", name: "${i.n}", icon: "/kanji-quest/images/gacha2/${i.f}", rarity: "${i.r}", weight: ${i.w} },\n`;
}
out += '];\n';
out += `
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
  { rarity: "神レア", rate: "5.0%", color: "text-purple-500", bg: "bg-purple-100", items: allRichGacha2Items.filter(i => i.rarity === "神レア") },
  { rarity: "超激レア", rate: "15.0%", color: "text-red-500", bg: "bg-red-100", items: allRichGacha2Items.filter(i => i.rarity === "超激レア") },
  { rarity: "激レア", rate: "35.0%", color: "text-amber-500", bg: "bg-amber-100", items: allRichGacha2Items.filter(i => i.rarity === "激レア") },
  { rarity: "レア", rate: "25.0%", color: "text-blue-500", bg: "bg-blue-100", items: allRichGacha2Items.filter(i => i.rarity === "レア") },
  { rarity: "ノーマル", rate: "20.0%", color: "text-slate-500", bg: "bg-slate-200", items: allRichGacha2Items.filter(i => i.rarity === "ノーマル") },
];
`;

fs.appendFileSync('lib/gachaData.ts', out);
