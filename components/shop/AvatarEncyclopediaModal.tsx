"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";
import { getAvatarImageProps, getAvatarThumbUrl } from "../../lib/itemData";
import { 
  avatarEncyclopediaList, 
  AvatarEncyclopediaEntry 
} from "../../lib/avatarEncyclopediaData";

interface AvatarEncyclopediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownedAvatarIds: string[];
  equippedAvatarId?: string;
  ownedEquipmentIds?: string[];
  equippedEquipmentId?: string;
  onEquipAvatar?: (avatarId: string) => void;
  onEquipEquipment?: (equipmentId: string, category?: string) => void;
  onGoToGacha?: (gachaTab: string) => void;
}

export function AvatarEncyclopediaModal({
  isOpen,
  onClose,
  ownedAvatarIds = [],
  equippedAvatarId,
  ownedEquipmentIds = [],
  equippedEquipmentId,
  onEquipAvatar,
  onEquipEquipment,
  onGoToGacha
}: AvatarEncyclopediaModalProps) {
  const [selectedType, setSelectedType] = useState<"all" | "avatar" | "equipment">("all");
  const [selectedSeries, setSelectedSeries] = useState<string>("all");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");
  const [selectedOwnership, setSelectedOwnership] = useState<"all" | "owned" | "unowned">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<AvatarEncyclopediaEntry | null>(null);
  const [isFullscreenImage, setIsFullscreenImage] = useState(false);

  // Check ownership
  // 以前は id/名前の部分文字列一致もフォールバックにしていたが、gachaItemId が
  // 常に一意なプレフィックス付きID（例: "avatar_ladies_〇〇"）で確実に一致するため、
  // 短い表示名（例:「神竜」）が無関係な別アイテムのIDに含まれて誤って「所持」判定
  // されるリスクの方が大きく、フォールバックは削除した。
  const isEntryOwned = (entry: AvatarEncyclopediaEntry) => {
    if (entry.type === "equipment") {
      return (
        ownedEquipmentIds.includes(entry.gachaItemId) ||
        ownedEquipmentIds.includes(entry.id)
      );
    }
    return (
      ownedAvatarIds.includes(entry.gachaItemId) ||
      ownedAvatarIds.includes(entry.icon) ||
      ownedAvatarIds.includes(entry.id)
    );
  };

  // Check equipped status
  const isEntryEquipped = (entry: AvatarEncyclopediaEntry) => {
    if (entry.type === "equipment") {
      if (!equippedEquipmentId) return false;
      return (
        equippedEquipmentId === entry.gachaItemId ||
        equippedEquipmentId === entry.id
      );
    }
    if (!equippedAvatarId) return false;
    return (
      equippedAvatarId === entry.gachaItemId ||
      equippedAvatarId === entry.icon ||
      equippedAvatarId === entry.id
    );
  };

  // Calculate stats
  const totalCount = avatarEncyclopediaList.length;
  const avatarCount = avatarEncyclopediaList.filter(e => e.type !== "equipment").length;
  const eqCount = avatarEncyclopediaList.filter(e => e.type === "equipment").length;

  const ownedCount = useMemo(() => {
    return avatarEncyclopediaList.filter(entry => isEntryOwned(entry)).length;
  }, [ownedAvatarIds, ownedEquipmentIds]);

  const collectionPercent = Math.round((ownedCount / totalCount) * 100);

  // Filter list
  const filteredList = useMemo(() => {
    return avatarEncyclopediaList.filter(entry => {
      // Type filter
      if (selectedType === "avatar" && entry.type === "equipment") return false;
      if (selectedType === "equipment" && entry.type !== "equipment") return false;

      // Series filter
      if (selectedSeries !== "all" && entry.seriesId !== selectedSeries) return false;

      // Rarity filter
      if (selectedRarity !== "all" && entry.rarity !== selectedRarity) return false;

      // Ownership filter
      const isOwned = isEntryOwned(entry);
      if (selectedOwnership === "owned" && !isOwned) return false;
      if (selectedOwnership === "unowned" && isOwned) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = entry.name.toLowerCase().includes(query);
        const matchTitle = entry.title.toLowerCase().includes(query);
        const matchStory = entry.story.toLowerCase().includes(query);
        const matchGacha = entry.gachaName.toLowerCase().includes(query);
        if (!matchName && !matchTitle && !matchStory && !matchGacha) return false;
      }

      return true;
    });
  }, [selectedType, selectedSeries, selectedRarity, selectedOwnership, searchQuery, ownedAvatarIds, ownedEquipmentIds]);

  if (!isOpen) return null;

  return (
    <>
      {/* Main Encyclopedia List Modal */}
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      >
        <div
          className="bg-slate-900 border-4 border-amber-400 rounded-3xl w-full max-w-5xl h-[94vh] flex flex-col shadow-[0_0_50px_rgba(251,191,36,0.3)] overflow-hidden relative"
          onClick={e => e.stopPropagation()}
        >
          {/* Background Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/90 via-slate-900 to-purple-950/90 pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 p-4 sm:p-6 border-b border-amber-500/30 bg-slate-950/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📖</span>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent drop-shadow-md">
                    リッチ大図鑑（アバター＆そうび）
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 font-bold mt-0.5">
                    全{totalCount}種のアバター・装備品のイラスト＆設定ストーリー大集結！
                  </p>
                </div>
              </div>

              {/* Collection Progress Bar */}
              <div className="mt-3 flex items-center gap-3 max-w-md">
                <div className="flex-1 bg-slate-800 rounded-full h-3.5 border border-slate-700 overflow-hidden relative shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-500"
                    style={{ width: `${collectionPercent}%` }}
                  />
                </div>
                <div className="text-xs font-black text-amber-300 whitespace-nowrap bg-amber-950/90 px-2.5 py-1 rounded-full border border-amber-500/50 shadow-sm">
                  🌟 {ownedCount} / {totalCount} 種類 ({collectionPercent}%)
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-black text-xl border border-slate-600 transition-all shadow-md hover:scale-105"
            >
              ✕
            </button>
          </div>

          {/* Filter & Controls Area */}
          <div className="relative z-10 p-3 sm:p-4 bg-slate-950/60 border-b border-slate-800 space-y-2.5">
            {/* Category Type Tabs (All / Avatar / Equipment) */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 flex-wrap">
              <span className="text-xs font-black text-amber-300 mr-1">種別:</span>
              <button
                onClick={() => { setSelectedType("all"); setSelectedSeries("all"); }}
                className={`px-3 py-1 rounded-xl text-xs sm:text-sm font-black transition-all ${
                  selectedType === "all"
                    ? "bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300 scale-105"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                すべて ({totalCount})
              </button>
              <button
                onClick={() => { setSelectedType("avatar"); setSelectedSeries("all"); }}
                className={`px-3 py-1 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1 ${
                  selectedType === "avatar"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md ring-2 ring-blue-300 scale-105"
                    : "bg-slate-800 text-blue-300 hover:bg-slate-700"
                }`}
              >
                👤 アバター ({avatarCount})
              </button>
              <button
                onClick={() => { setSelectedType("equipment"); setSelectedSeries("all"); }}
                className={`px-3 py-1 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1 ${
                  selectedType === "equipment"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md ring-2 ring-emerald-300 scale-105"
                    : "bg-slate-800 text-emerald-300 hover:bg-slate-700"
                }`}
              >
                ⚔️ そうび ({eqCount})
              </button>
            </div>

            {/* Series Tabs */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <button
                onClick={() => setSelectedSeries("all")}
                className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
                  selectedSeries === "all"
                    ? "bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300 scale-105"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
                }`}
              >
                全シリーズ
              </button>

              {(selectedType === "all" || selectedType === "avatar") && (
                <>
                  <button
                    onClick={() => setSelectedSeries("ladies")}
                    className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                      selectedSeries === "ladies"
                        ? "bg-pink-500 text-white shadow-md ring-2 ring-pink-300 scale-105"
                        : "bg-slate-800/80 text-pink-300 hover:bg-slate-700"
                    }`}
                  >
                    🌸 ふわふわアバター (17)
                  </button>
                  <button
                    onClick={() => setSelectedSeries("rich1")}
                    className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                      selectedSeries === "rich1"
                        ? "bg-blue-500 text-white shadow-md ring-2 ring-blue-300 scale-105"
                        : "bg-slate-800/80 text-blue-300 hover:bg-slate-700"
                    }`}
                  >
                    💎 リッチアバター1 (10)
                  </button>
                  <button
                    onClick={() => setSelectedSeries("rich2")}
                    className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                      selectedSeries === "rich2"
                        ? "bg-purple-500 text-white shadow-md ring-2 ring-purple-300 scale-105"
                        : "bg-slate-800/80 text-purple-300 hover:bg-slate-700"
                    }`}
                  >
                    ✨ リッチアバター2 (24)
                  </button>
                </>
              )}

              {(selectedType === "all" || selectedType === "equipment") && (
                <>
                  <button
                    onClick={() => setSelectedSeries("ladies_eq")}
                    className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                      selectedSeries === "ladies_eq"
                        ? "bg-fuchsia-500 text-white shadow-md ring-2 ring-fuchsia-300 scale-105"
                        : "bg-slate-800/80 text-fuchsia-300 hover:bg-slate-700"
                    }`}
                  >
                    🎀 ふわふわ装備 (15)
                  </button>
                  <button
                    onClick={() => setSelectedSeries("rich_eq")}
                    className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                      selectedSeries === "rich_eq"
                        ? "bg-amber-600 text-white shadow-md ring-2 ring-amber-300 scale-105"
                        : "bg-slate-800/80 text-amber-300 hover:bg-slate-700"
                    }`}
                  >
                    🛡️ リッチ装備 (13)
                  </button>
                </>
              )}
            </div>

            {/* Rarity & Ownership Filter + Search */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
              {/* Rarity Filter */}
              <div className="flex flex-wrap gap-1 items-center">
                <span className="text-[11px] font-black text-slate-400 mr-1">レア度:</span>
                {(["all", "神レア", "超激レア", "激レア", "レア", "ノーマル"] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setSelectedRarity(r)}
                    className={`px-2 py-1 rounded-lg text-xs font-black transition-all ${
                      selectedRarity === r
                        ? r === "神レア" ? "bg-purple-500 text-white ring-2 ring-purple-300" :
                          r === "超激レア" ? "bg-red-500 text-white ring-2 ring-red-300" :
                          r === "激レア" ? "bg-amber-500 text-white ring-2 ring-amber-300" :
                          r === "レア" ? "bg-blue-500 text-white ring-2 ring-blue-300" :
                          r === "ノーマル" ? "bg-slate-400 text-slate-900 ring-2 ring-slate-200" :
                          "bg-amber-400 text-slate-950 ring-2 ring-amber-300"
                        : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                    }`}
                  >
                    {r === "all" ? "すべて" : r}
                  </button>
                ))}
              </div>

              {/* Ownership & Search */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setSelectedOwnership("all")}
                    className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${
                      selectedOwnership === "all" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    全表示
                  </button>
                  <button
                    onClick={() => setSelectedOwnership("owned")}
                    className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${
                      selectedOwnership === "owned" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    ✅ 所持
                  </button>
                  <button
                    onClick={() => setSelectedOwnership("unowned")}
                    className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${
                      selectedOwnership === "unowned" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    🔒 未所持
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="名前・キーワード検索..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 w-36 sm:w-48"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid View */}
          <div className="relative z-10 flex-1 overflow-y-auto p-3 sm:p-6">
            {filteredList.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">🔍</div>
                <div className="text-lg font-bold text-slate-300">該当するアイテムが見つかりませんでした</div>
                <button
                  onClick={() => {
                    setSelectedType("all");
                    setSelectedSeries("all");
                    setSelectedRarity("all");
                    setSelectedOwnership("all");
                    setSearchQuery("");
                  }}
                  className="mt-4 text-xs font-bold text-amber-400 underline"
                >
                  フィルターをリセット
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {filteredList.map(entry => {
                  const owned = isEntryOwned(entry);
                  const equipped = isEntryEquipped(entry);
                  const isImage = entry.icon.startsWith('/');
                  const imgProps = isImage ? getAvatarImageProps(entry.icon) : null;

                  return (
                    <div
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className={`relative rounded-2xl p-3 sm:p-3.5 flex flex-col items-center justify-between cursor-pointer transition-all duration-200 shadow-md border-2 hover:scale-105 ${
                        equipped
                          ? "bg-gradient-to-b from-blue-900/90 to-indigo-950 border-cyan-400 ring-2 ring-cyan-300/80 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                          : owned
                          ? "bg-slate-800/90 hover:bg-slate-750 border-amber-400/70 hover:border-amber-300"
                          : "bg-slate-900/80 hover:bg-slate-850 border-slate-700/80 hover:border-indigo-400 opacity-80"
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="w-full flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm ${
                          entry.rarity === '神レア' ? 'bg-purple-500 text-white' :
                          entry.rarity === '超激レア' ? 'bg-red-500 text-white' :
                          entry.rarity === '激レア' ? 'bg-amber-500 text-white' :
                          entry.rarity === 'レア' ? 'bg-blue-500 text-white' : 'bg-slate-600 text-slate-200'
                        }`}>
                          {entry.rarity}
                        </span>

                        {equipped ? (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-cyan-400 text-slate-950 shadow-sm animate-pulse">
                            そうび中
                          </span>
                        ) : owned ? (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500/90 text-white shadow-sm">
                            所持
                          </span>
                        ) : (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">
                            🔒 未所持
                          </span>
                        )}
                      </div>

                      {/* Icon Display */}
                      <div className="my-1 relative">
                        <div className={`w-14 h-14 ${entry.type === 'equipment' ? 'rounded-2xl' : 'rounded-full'} overflow-hidden relative border-2 border-white shadow-md mx-auto bg-slate-950 flex items-center justify-center`}>
                          {isImage ? (
                            <img
                              src={getAvatarThumbUrl(entry.icon)}
                              alt={entry.name}
                              loading="lazy"
                              decoding="async"
                              className={`w-full h-full object-cover ${imgProps?.className} ${
                                !owned ? "brightness-[0.25] contrast-125 grayscale" : ""
                              }`}
                              style={imgProps?.style}
                            />
                          ) : (
                            <span className={`text-3xl ${!owned ? "opacity-30 grayscale" : ""}`}>
                              {entry.icon}
                            </span>
                          )}
                          {!owned && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <span className="text-xl drop-shadow-md">🔒</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Item Name & Series */}
                      <div className="text-center w-full mt-2">
                        <div className={`font-black text-xs sm:text-sm line-clamp-1 ${
                          owned ? "text-slate-100" : "text-slate-400"
                        }`}>
                          {entry.name}
                        </div>
                        <div className="text-[10px] font-bold text-pink-300/80 truncate mt-0.5">
                          {entry.gachaName}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer stats */}
          <div className="relative z-10 p-3 bg-slate-950/80 border-t border-slate-800 text-center text-xs text-slate-400 font-bold flex justify-between items-center px-6">
            <span>表示中: {filteredList.length} / {totalCount} アイテム</span>
            <span>カードをタップすると【全体イラスト】と詳細ストーリーを閲覧できます</span>
          </div>
        </div>
      </div>

      {/* Independent Character / Equipment Detail Modal (z-[110]) */}
      <AnimatePresence>
        {selectedEntry && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-lg"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 rounded-3xl p-5 sm:p-7 max-w-lg w-full text-center shadow-[0_0_60px_rgba(251,191,36,0.4)] border-4 border-amber-400 relative overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Close X button */}
              <button
                onClick={() => setSelectedEntry(null)}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-black text-lg border border-slate-600 transition-colors"
              >
                ✕
              </button>

              {/* Header info */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap justify-center">
                  <span className={`text-xs font-black px-3 py-1 rounded-full shadow-md ${
                    selectedEntry.rarity === '神レア' ? 'bg-purple-500 text-white animate-pulse' :
                    selectedEntry.rarity === '超激レア' ? 'bg-red-500 text-white' :
                    selectedEntry.rarity === '激レア' ? 'bg-amber-500 text-white' :
                    selectedEntry.rarity === 'レア' ? 'bg-blue-500 text-white' : 'bg-slate-600 text-slate-200'
                  }`}>
                    {selectedEntry.rarity}
                  </span>
                  <span className="text-xs font-black px-3 py-1 rounded-full bg-pink-900/90 text-pink-200 border border-pink-400/50 shadow-md">
                    排出: {selectedEntry.gachaName}
                  </span>
                  {selectedEntry.category && (
                    <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-900/90 text-emerald-200 border border-emerald-400/50 shadow-md">
                      部位: {selectedEntry.category === "weapon" ? "武器" : selectedEntry.category === "shield" ? "盾" : selectedEntry.category === "head" ? "頭" : selectedEntry.category === "wings" ? "羽・背中" : "アクセサリ"}
                    </span>
                  )}
                  {isEntryOwned(selectedEntry) ? (
                    <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-600 text-white shadow-md">
                      {isEntryEquipped(selectedEntry) ? "✓ そうび中" : "✅ 所持済み"}
                    </span>
                  ) : (
                    <span className="text-xs font-black px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      🔒 未所持
                    </span>
                  )}
                </div>

                <div className="text-xs font-bold text-amber-300/90 mt-1">
                  ― {selectedEntry.title} ―
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md mt-0.5">
                  {selectedEntry.name}
                </h2>
              </div>

              {/* Graphic Display */}
              <div className="relative z-10 my-3 flex flex-col items-center justify-center">
                <div
                  className="relative cursor-pointer group"
                  onClick={() => {
                    if (selectedEntry.icon.startsWith('/')) {
                      setIsFullscreenImage(true);
                    }
                  }}
                  title={selectedEntry.icon.startsWith('/') ? "タップして全画面プレビュー" : ""}
                >
                  <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-2xl overflow-hidden relative shadow-2xl flex items-center justify-center bg-black border-2 border-amber-400/90">
                    {selectedEntry.icon.startsWith('/') ? (
                      <img
                        src={selectedEntry.icon}
                        alt={selectedEntry.name}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-8xl drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]">{selectedEntry.icon}</span>
                    )}
                  </div>
                  {selectedEntry.icon.startsWith('/') && (
                    <div className="absolute -bottom-2.5 right-2 bg-slate-900/95 text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-400 shadow-md pointer-events-none">
                      🔍 タップで全画面表示
                    </div>
                  )}
                </div>
              </div>

              {/* Flavor Text / Background Story */}
              <div className="relative z-10 overflow-y-auto flex-1 my-1 p-3.5 rounded-2xl bg-gradient-to-b from-amber-950/50 via-slate-950/80 to-purple-950/50 border border-amber-500/40 text-left shadow-inner">
                <div className="flex items-center gap-2 mb-1.5 text-xs font-black text-amber-300 border-b border-amber-500/30 pb-1">
                  <span>📜</span>
                  <span>{selectedEntry.type === "equipment" ? "装備詳細・由来エピソード" : "背景ストーリー（キャラクター秘話）"}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans font-medium text-justify">
                  {selectedEntry.story}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="relative z-10 mt-3 flex gap-2 sm:gap-3">
                {isEntryOwned(selectedEntry) ? (
                  <Button
                    variant={isEntryEquipped(selectedEntry) ? "ghost" : "primary"}
                    disabled={isEntryEquipped(selectedEntry)}
                    onClick={() => {
                      if (selectedEntry.type === "equipment") {
                        if (onEquipEquipment && selectedEntry.category) {
                          onEquipEquipment(selectedEntry.gachaItemId, selectedEntry.category);
                          setSelectedEntry(null);
                        }
                      } else {
                        if (onEquipAvatar) {
                          onEquipAvatar(selectedEntry.gachaItemId);
                          setSelectedEntry(null);
                        }
                      }
                    }}
                    className="flex-1 py-2.5 text-base font-black"
                  >
                    {isEntryEquipped(selectedEntry) ? "現在そうび中" : "✅ そうびする"}
                  </Button>
                ) : (
                  <Button
                    variant="fun"
                    onClick={() => {
                      if (onGoToGacha) {
                        onGoToGacha(selectedEntry.gachaTabId);
                        setSelectedEntry(null);
                        onClose();
                      }
                    }}
                    className="flex-1 py-2.5 text-base font-black bg-gradient-to-r from-pink-500 to-purple-600 border-2 border-pink-300 text-white"
                  >
                    🎁 このガチャを引きに行く
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setSelectedEntry(null)}
                  className="px-5 py-2.5 text-base font-black text-slate-300 border-slate-600 hover:bg-slate-800"
                >
                  もどる
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Independent Fullscreen High-Res Image Modal (z-[120]) */}
      <AnimatePresence>
        {isFullscreenImage && selectedEntry && selectedEntry.icon.startsWith('/') && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 cursor-pointer backdrop-blur-xl"
            onClick={() => setIsFullscreenImage(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="max-w-2xl w-full flex flex-col items-center"
            >
              <img
                src={selectedEntry.icon}
                alt={selectedEntry.name}
                className="max-h-[78vh] w-auto object-contain rounded-2xl shadow-[0_0_50px_rgba(251,191,36,0.6)] border-4 border-amber-400"
              />
              <div className="mt-3 text-center">
                <h3 className="text-2xl font-black text-amber-300">{selectedEntry.name}</h3>
                <p className="text-sm font-bold text-slate-300 mt-0.5">{selectedEntry.title} / {selectedEntry.gachaName}</p>
                <p className="text-xs text-slate-400 mt-1">（タップすると閉じます）</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
