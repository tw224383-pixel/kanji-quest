"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";
import { getAvatarThumbUrl } from "../../lib/itemData";

interface GachaMultiResultItem {
  id: string;
  name: string;
  type: "avatar" | "title" | "effect" | "theme" | "equipment";
  rarity: string;
  icon: string;
  duplicated?: boolean;
  refund?: string;
}

interface GachaMultiResultModalProps {
  isOpen: boolean;
  results: GachaMultiResultItem[] | null;
  onClose: () => void;
  onPullAgain?: () => void;
  canPullAgain?: boolean;
  pullAgainLabel?: string;
}

const rarityColor: Record<string, string> = {
  "神レア": "from-purple-500 via-fuchsia-400 to-indigo-500 shadow-[0_0_20px_rgba(168,85,247,0.7)] border-purple-300",
  "超激レア": "from-red-500 via-rose-400 to-amber-500 shadow-[0_0_15px_rgba(239,68,68,0.6)] border-red-300",
  "激レア": "from-amber-500 via-yellow-400 to-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.5)] border-amber-300",
  "レア": "from-blue-500 via-cyan-400 to-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.5)] border-blue-300",
};
const defaultRarityColor = "from-slate-600 to-slate-800 border-slate-400";

export function GachaMultiResultModal({
  isOpen,
  results,
  onClose,
  onPullAgain,
  canPullAgain,
  pullAgainLabel,
}: GachaMultiResultModalProps) {
  if (!isOpen || !results) return null;

  const totalRefundXp = results.reduce((acc, r) => acc + (r.duplicated ? 50 : 0), 0);
  const newCount = results.filter(r => !r.duplicated).length;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-purple-900/20 to-black pointer-events-none" />

        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.7, opacity: 0, y: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={e => e.stopPropagation()}
          className="bg-slate-900 border-4 border-amber-400 rounded-3xl p-5 sm:p-7 max-w-2xl w-full text-center shadow-[0_0_70px_rgba(251,191,36,0.5)] relative my-auto"
        >
          <div className="relative z-10 flex flex-col items-center mb-4">
            <div className="text-2xl sm:text-3xl font-black text-amber-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] tracking-wider mb-1 flex items-center gap-2">
              <span>🎉</span><span>10連ガチャ結果！</span><span>🎉</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-300">
              NEW {newCount}件{totalRefundXp > 0 && ` ・ かぶり分で +${totalRefundXp} XP`}
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-5">
            {results.map((item, idx) => {
              const cleanName = item.name.replace(/称号「|アバター「|エフェクト「|テーマ「|装備「|」/g, '');
              const grad = rarityColor[item.rarity] || defaultRarityColor;
              return (
                <motion.div
                  key={idx}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.06, type: "spring", stiffness: 260 }}
                  className={`relative rounded-xl p-1.5 sm:p-2 bg-gradient-to-br ${grad} border flex flex-col items-center gap-1`}
                >
                  <div className="w-full aspect-square rounded-lg bg-slate-950 flex items-center justify-center overflow-hidden border border-white/20 relative">
                    {/* 称号は絵文字だけだとアバターと勘違いされるため、小さく「しょうごう」ラベルを添える */}
                    {item.type === 'title' && (
                      <span className="absolute top-0.5 left-0.5 text-[7px] font-black px-1 py-0.5 rounded bg-black/70 text-amber-300 border border-amber-400/50">
                        しょうごう
                      </span>
                    )}
                    {item.icon.startsWith('/') ? (
                      // 10連は小さいタイルが10枚並ぶだけなので、原寸ではなくサムネイルを使う
                      <img
                        src={getAvatarThumbUrl(item.icon)}
                        alt={cleanName}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = item.icon; }}
                      />
                    ) : (
                      <span className="text-2xl sm:text-3xl">{item.icon}</span>
                    )}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-black text-white leading-tight line-clamp-2 min-h-[2.2em] flex items-center">
                    {item.type === 'title' ? `【${cleanName}】` : cleanName}
                  </div>
                  {item.duplicated && (
                    <div className="absolute top-0.5 right-0.5 text-[8px] font-black px-1 py-0.5 rounded bg-black/70 text-amber-300 border border-amber-400/50">
                      +50XP
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-2.5">
            {onPullAgain && (
              <Button
                variant="fun"
                disabled={!canPullAgain}
                onClick={() => { onClose(); onPullAgain(); }}
                className={`flex-1 py-3 text-base font-black ${
                  canPullAgain
                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 border-2 border-white shadow-lg text-slate-950"
                    : "opacity-60 cursor-not-allowed"
                }`}
              >
                🎁 {pullAgainLabel || "もう1回まわす"}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6 py-3 text-base font-black text-slate-300 border-slate-600 hover:bg-slate-800"
            >
              とじる
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
