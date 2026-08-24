export function RarityBadge({ rarity }: { rarity?: string }) {
  if (!rarity) return null;
  const colorClass =
    rarity === "神レア" ? "bg-purple-500 text-white" :
    rarity === "超激レア" ? "bg-red-500 text-white" :
    rarity === "激レア" ? "bg-amber-500 text-white" :
    rarity === "レア" ? "bg-blue-500 text-white" :
    "bg-slate-200 text-slate-700";
  return (
    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${colorClass}`}>
      {rarity}
    </span>
  );
}

export function GachaNameBadge({ gachaName }: { gachaName?: string }) {
  if (!gachaName) return null;
  return (
    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 border border-pink-300">
      {gachaName}
    </span>
  );
}
