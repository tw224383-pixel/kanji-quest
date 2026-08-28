"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  gachaRates, richGachaRates, richGacha2Rates, spEquipmentGachaRates,
  richEquipmentGachaRates, richLadiesGachaRates, richLadiesEquipmentGachaRates,
  all3000GachaRates, all3000SpCombinedEquipmentRates
} from "../../lib/gachaData";
import { getAvatarImageProps, getAvatarThumbUrl } from "../../lib/itemData";
import type { UserData } from "../../contexts/UserContext";
import { Button } from "../ui/Button";

type GachaType = "regular" | "regular10" | "rich" | "rich2" | "rich_equipment" | "sp_equipment" | "rich_ladies" | "rich_ladies_equipment";
type RatesKey = GachaType | "all_3000" | "all_sp" | null;

export function GachaTab({
  userData,
  pullingType,
  showGachaRates,
  setShowGachaRates,
  handleRequestGacha,
  setPreviewingAvatar,
  setPreviewingEquipmentModal,
}: {
  userData: UserData;
  pullingType: GachaType | null;
  showGachaRates: RatesKey;
  setShowGachaRates: (v: RatesKey | ((prev: RatesKey) => RatesKey)) => void;
  handleRequestGacha: (type: GachaType) => void;
  setPreviewingAvatar: (v: { url?: string; id?: string; name?: string } | null) => void;
  setPreviewingEquipmentModal: (v: string | null) => void;
}) {
  return (
    <div className="game-panel p-8 text-center max-w-2xl mx-auto relative overflow-hidden">
      <div className="text-6xl mb-6">🎁</div>
      <h2 className="text-2xl font-black text-amber-300 mb-2 drop-shadow-md">ランダム宝箱（ガチャ）</h2>
      <p className="text-slate-300 font-bold mb-4">通常ガチャは100PT（10連は1000PT）、リッチガチャは3000PT、豪華な装備ガチャは1000SPでまわせる！</p>

      <div className="flex flex-col gap-6 justify-center mb-6 items-stretch max-w-md mx-auto">
        {/* --- PT Gachas --- */}
        <div className="text-left font-black text-amber-300 text-sm flex items-center gap-1.5 border-b border-amber-500/40 pb-1">
          <span>⭐</span> <span>ポイントガチャ (PT)</span>
        </div>

        <div className="flex-1 game-panel-light p-4 bg-slate-800/80 border-2 border-amber-900/50 flex flex-col justify-between">
          <div>
            <div className="text-amber-200 font-black mb-2">通常ガチャ (100 PT)</div>
            <Button
              variant="outline"
              size="sm"
              className="mb-4"
              onClick={() => setShowGachaRates(showGachaRates === "regular" ? null : "regular")}
            >
              🔍 中身を見る
            </Button>
          </div>
          <button
            className={`w-full py-4 text-xl md:text-2xl tracking-wide whitespace-nowrap bg-amber-400 hover:bg-amber-300 text-amber-900 font-black rounded-xl shadow-[0_4px_0_0_#b45309] active:shadow-none active:translate-y-1 transition-all ${pullingType ? 'animate-pulse' : ''} ${pullingType !== null || userData.pt < 100 ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handleRequestGacha("regular")}
            disabled={pullingType !== null || userData.pt < 100}
          >
            {pullingType ? "..." : userData.pt < 100 ? "PT不足" : "100 PT でまわす！"}
          </button>
          <button
            className={`w-full mt-2 py-3 text-base md:text-lg tracking-wide whitespace-nowrap bg-orange-500 hover:bg-orange-400 text-white font-black rounded-xl shadow-[0_4px_0_0_#9a3412] active:shadow-none active:translate-y-1 transition-all ${pullingType ? 'animate-pulse' : ''} ${pullingType !== null || userData.pt < 1000 ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handleRequestGacha("regular10")}
            disabled={pullingType !== null || userData.pt < 1000}
          >
            {pullingType ? "..." : userData.pt < 1000 ? "PT不足" : "🎉 10連 1000 PT でまわす！"}
          </button>
        </div>

        <div className="flex-1 p-5 rounded-[2rem] bg-gradient-to-b from-white/90 to-blue-50/90 border-[3px] border-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0icmdiYSgyNTIsIDIxMSwgNzcsIDAuMykiLz48L3N2Zz4=')] opacity-50 pointer-events-none"></div>
          <div className="relative z-10 text-center">
            <div className="text-amber-500 font-black text-xl mb-3 drop-shadow-md flex items-center justify-center gap-2">
              <span className="text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,1)]">💎</span> リッチガチャ１ <span className="text-sm">(3000 PT)</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mb-6"
              onClick={() => setShowGachaRates(showGachaRates === "rich" ? null : "rich")}
            >
              🔍 中身を見る
            </Button>
          </div>
          <button
            className={`w-full py-4 text-xl md:text-2xl tracking-wide whitespace-nowrap ${pullingType ? 'animate-pulse' : 'btn-rich-gacha'} ${pullingType !== null || userData.pt < 3000 ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handleRequestGacha("rich")}
            disabled={pullingType !== null || userData.pt < 3000}
          >
            {pullingType ? "..." : userData.pt < 3000 ? "PT不足" : "3000 PT でまわす"}
          </button>
        </div>

        <div className="flex-1 p-5 rounded-[2rem] bg-gradient-to-b from-purple-50/90 to-purple-200/90 border-[3px] border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0icmdiYSgyNTIsIDIxMSwgNzcsIDAuMykiLz48L3N2Zz4=')] opacity-50 pointer-events-none"></div>
          <div className="relative z-10 text-center">
            <div className="text-purple-600 font-black text-xl mb-3 drop-shadow-md flex items-center justify-center gap-2">
              <span className="text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,1)]">✨</span> リッチガチャ２ <span className="text-sm">(3000 PT)</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mb-6"
              onClick={() => setShowGachaRates(showGachaRates === "rich2" ? null : "rich2")}
            >
              🔍 中身を見る
            </Button>
          </div>
          <button
            className={`w-full py-4 text-xl md:text-2xl tracking-wide whitespace-nowrap ${pullingType ? 'animate-pulse' : 'btn-rich-gacha'} ${pullingType !== null || userData.pt < 3000 ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handleRequestGacha("rich2")}
            disabled={pullingType !== null || userData.pt < 3000}
          >
            {pullingType ? "..." : userData.pt < 3000 ? "PT不足" : "3000 PT でまわす"}
          </button>
        </div>

        <div className="flex-1 p-5 rounded-[2rem] bg-gradient-to-b from-pink-50/90 to-rose-200/90 border-[3px] border-pink-400 shadow-[0_0_20px_rgba(244,63,94,0.3)] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0icmdiYSgyNTIsIDIxMSwgNzcsIDAuMykiLz48L3N2Zz4=')] opacity-50 pointer-events-none"></div>
          <div className="relative z-10 text-center">
            <div className="text-pink-600 font-black text-xl mb-3 drop-shadow-md flex items-center justify-center gap-2">
              <span className="text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,1)]">🌸</span> ふわふわガチャ♡ <span className="text-sm">(3000 PT)</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mb-6"
              onClick={() => setShowGachaRates(showGachaRates === "rich_ladies" ? null : "rich_ladies")}
            >
              🔍 中身を見る
            </Button>
          </div>
          <button
            className={`w-full py-4 text-xl md:text-2xl tracking-wide whitespace-nowrap ${pullingType ? 'animate-pulse' : 'btn-fluffy-gacha'} ${pullingType !== null || userData.pt < 3000 ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handleRequestGacha("rich_ladies")}
            disabled={pullingType !== null || userData.pt < 3000}
          >
            {pullingType ? "..." : userData.pt < 3000 ? "PT不足" : "3000 PT でまわす"}
          </button>
        </div>

        {/* --- SP Gachas --- */}
        <div className="text-left font-black text-emerald-300 text-sm flex items-center gap-1.5 border-b border-emerald-500/40 pb-1 mt-4">
          <span>🧪</span> <span>スキルポイント装備ガチャ (SP)</span>
        </div>

        <div className="flex-1 p-5 rounded-[2rem] bg-gradient-to-b from-fuchsia-50/90 to-pink-200/90 border-[3px] border-fuchsia-400 shadow-[0_0_20px_rgba(232,121,249,0.4)] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{background: 'radial-gradient(circle at 30% 70%, rgba(251,207,232,0.4) 0%, transparent 60%), radial-gradient(circle at 70% 30%, rgba(216,180,254,0.3) 0%, transparent 60%)'}}></div>
          <div className="relative z-10 text-center">
            <div className="text-fuchsia-700 font-black text-xl mb-3 drop-shadow-md flex items-center justify-center gap-2">
              <span className="text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,1)]">🎀</span> ふわふわ装備ガチャ♡ <span className="text-sm">(3000 SP)</span>
            </div>
            <div className="text-xs text-fuchsia-600 font-bold mb-2">💫 NEW！全15種のかわいい装備が登場</div>
            <Button
              variant="outline"
              size="sm"
              className="mb-6"
              onClick={() => setShowGachaRates(showGachaRates === "rich_ladies_equipment" ? null : "rich_ladies_equipment")}
            >
              🔍 中身を見る
            </Button>
          </div>
          <button
            className={`w-full py-4 text-xl md:text-2xl tracking-wide whitespace-nowrap font-black rounded-xl transition-all ${
              pullingType ? 'animate-pulse bg-fuchsia-300 text-white opacity-50 cursor-not-allowed' :
              (userData.sp || 0) < 3000 ? 'bg-fuchsia-200 text-fuchsia-400 opacity-50 cursor-not-allowed' :
              'bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-400 hover:to-pink-400 text-white shadow-[0_4px_0_0_#a21caf] active:shadow-none active:translate-y-1'
            }`}
            onClick={() => handleRequestGacha("rich_ladies_equipment")}
            disabled={pullingType !== null || (userData.sp || 0) < 3000}
          >
            {pullingType ? "..." : (userData.sp || 0) < 3000 ? "SP不足" : "3000 SP でまわす"}
          </button>
        </div>

        <div className="flex-1 p-5 rounded-[2rem] bg-gradient-to-b from-amber-100/90 to-amber-300/90 border-[3px] border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0icmdiYSgyNTIsIDIxMSwgNzcsIDAuMykiLz48L3N2Zz4=')] opacity-50 pointer-events-none"></div>
          <div className="relative z-10 text-center">
            <div className="text-amber-900 font-black text-xl mb-3 drop-shadow-md flex items-center justify-center gap-2">
              <span className="text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,1)]">🛡️</span> 装備品リッチガチャ <span className="text-sm">(3000 SP)</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mb-6"
              onClick={() => setShowGachaRates(showGachaRates === "rich_equipment" ? null : "rich_equipment")}
            >
              🔍 中身を見る
            </Button>
          </div>
          <button
            className={`w-full py-4 text-xl md:text-2xl tracking-wide whitespace-nowrap ${pullingType ? 'animate-pulse' : 'btn-rich-gacha'} ${pullingType !== null || (userData.sp || 0) < 3000 ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handleRequestGacha("rich_equipment")}
            disabled={pullingType !== null || (userData.sp || 0) < 3000}
          >
            {pullingType ? "..." : (userData.sp || 0) < 3000 ? "SP不足" : "3000 SP でまわす"}
          </button>
        </div>

        <div className="flex-1 p-5 rounded-[2rem] bg-gradient-to-b from-emerald-50/90 to-emerald-200/90 border-[3px] border-emerald-400 shadow-[0_0_20px_rgba(168,85,247,0.3)] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0icmdiYSgyNTIsIDIxMSwgNzcsIDAuMykiLz48L3N2Zz4=')] opacity-50 pointer-events-none"></div>
          <div className="relative z-10 text-center">
            <div className="text-emerald-700 font-black text-xl mb-3 drop-shadow-md flex items-center justify-center gap-2">
              <span className="text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,1)]">⚔️</span> SP装備ガチャ <span className="text-sm">(1000 SP)</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mb-6"
              onClick={() => setShowGachaRates(showGachaRates === "sp_equipment" ? null : "sp_equipment")}
            >
              🔍 中身を見る
            </Button>
          </div>
          <button
            className={`w-full py-4 text-xl md:text-2xl tracking-wide whitespace-nowrap bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-xl shadow-[0_4px_0_0_#047857] active:shadow-none active:translate-y-1 transition-all ${pullingType ? 'animate-pulse' : ''} ${pullingType !== null || (userData.sp || 0) < 1000 ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handleRequestGacha("sp_equipment")}
            disabled={pullingType !== null || (userData.sp || 0) < 1000}
          >
            {pullingType ? "..." : (userData.sp || 0) < 1000 ? "SP不足" : "1000 SP でまわす"}
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowGachaRates(showGachaRates === "all_3000" ? null : "all_3000")}
        >
          🌟 3000PTガチャ全中身をまとめて見る
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowGachaRates(showGachaRates === "all_sp" ? null : "all_sp")}
        >
          🛡️ 3000SP装備ガチャ全中身をまとめて見る
        </Button>
      </div>

      <AnimatePresence>
        {showGachaRates && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-6 text-left game-panel-light p-6 overflow-hidden"
          >
            <h3 className="font-black text-blue-900 mb-4 border-b-2 border-blue-200 pb-2">
              {showGachaRates === "all_3000" ? "🌟 3000PTガチャ 全排出内容（レアリティ順）" :
               showGachaRates === "all_sp" ? "🛡️ 3000SP装備ガチャ 全排出内容（レアリティ順）" :
               showGachaRates === "rich_ladies_equipment" ? "🎀 ふわふわ装備リッチガチャ♡ 提供割合 (3000 SP)" :
               showGachaRates === "rich_equipment" ? "🛡️ 装備品リッチガチャ 提供割合 (3000 SP)" :
               showGachaRates === "sp_equipment" ? "⚔️ SP装備ガチャ 提供割合 (1000 SP)" :
               "提供割合"}
            </h3>
            <div className="space-y-4">
              {(showGachaRates === "all_3000" ? all3000GachaRates :
                showGachaRates === "all_sp" ? all3000SpCombinedEquipmentRates :
                showGachaRates === "sp_equipment" ? spEquipmentGachaRates :
                showGachaRates === "rich_equipment" ? richEquipmentGachaRates :
                showGachaRates === "rich_ladies" ? richLadiesGachaRates :
                showGachaRates === "rich_ladies_equipment" ? richLadiesEquipmentGachaRates :
                showGachaRates === "rich" ? richGachaRates :
                showGachaRates === "rich2" ? richGacha2Rates :
                gachaRates).map((tier, idx) => (
                <div key={idx} className={`p-4 rounded-lg border ${tier.bg} shadow-inner`}>
                  <div className="flex justify-between items-center mb-3 border-b border-black/10 pb-2">
                    <span className={`font-black text-xl ${tier.color} drop-shadow-sm`}>{tier.rarity}</span>
                    <span className="font-mono font-black text-lg bg-white/60 px-3 py-1 rounded-full text-slate-700">{tier.rate}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tier.items.map(item => {
                      let typeLabel = "不明";
                      let typeColor = "bg-gray-100 text-gray-600";
                      if (item.type === "title") { typeLabel = "称号"; typeColor = "bg-blue-100 text-blue-700"; }
                      else if (item.type === "avatar") { typeLabel = "アバター"; typeColor = "bg-green-100 text-green-700"; }
                      else if (item.type === "effect") { typeLabel = "エフェクト"; typeColor = "bg-[#d8b4fe] text-[#581c87]"; }
                      else if (item.type === "theme") { typeLabel = "テーマ"; typeColor = "bg-pink-100 text-pink-700"; }
                      else if (item.type === "equipment") { typeLabel = "装備"; typeColor = "bg-amber-100 text-amber-800"; }

                      const isInteractive = item.type === 'avatar' || item.type === 'equipment';

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (item.type === 'avatar') {
                              setPreviewingAvatar({ url: item.icon, id: item.id, name: item.name });
                            } else if (item.type === 'equipment') {
                              setPreviewingEquipmentModal(item.id);
                            }
                          }}
                          className={`bg-white px-2.5 py-1.5 rounded-lg shadow-sm text-sm font-bold flex items-center gap-2 text-slate-700 border border-slate-200 transition-all ${isInteractive ? 'hover:scale-105 hover:border-amber-400 hover:shadow-md cursor-pointer' : ''}`}
                        >
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ${typeColor}`}>{typeLabel}</span>
                          {item.gachaName && (
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 border border-pink-200">
                              {item.gachaName}
                            </span>
                          )}
                          <span className="text-base flex items-center justify-center min-w-[20px]">
                            {item.icon.startsWith('/') ? (() => {
                              const imgProps = getAvatarImageProps(item.icon);
                              // 20x20pxでしか表示しないので、原寸(1024px/約270KB)ではなく
                              // サムネイル(128px/約6KB)を読む。この一覧は1回開くだけで
                              // 50枚以上並ぶため、原寸だと13MB超の通信が発生していた。
                              return (
                                <div className="w-5 h-5 rounded-full overflow-hidden inline-block relative align-middle">
                                  <img
                                    src={getAvatarThumbUrl(item.icon)}
                                    alt="icon"
                                    loading="lazy"
                                    decoding="async"
                                    className={`w-full h-full object-cover ${imgProps.className}`}
                                    style={imgProps.style}
                                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = item.icon; }}
                                  />
                                </div>
                              );
                            })() : (
                              item.icon
                            )}
                          </span>
                          <span>{item.name.replace(/称号「|アバター「|エフェクト「|テーマ「|装備「|」/g, '')}</span>
                          {isInteractive && <span className="text-xs text-amber-500 font-bold">🔍</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
