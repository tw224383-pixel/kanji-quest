"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";
import { getAvatarInfo } from "../../lib/itemData";

interface GachaResultModalProps {
  isOpen: boolean;
  result: {
    id: string;
    name: string;
    type: "avatar" | "title" | "effect" | "theme" | "equipment";
    rarity: string;
    icon: string;
    gachaName?: string;
    duplicated?: boolean;
    refund?: string;
    description?: string;
  } | null;
  onClose: () => void;
  onEquip?: (type: string, id: string) => void;
  onPullAgain?: () => void;
  canPullAgain?: boolean;
  pullAgainLabel?: string;
}

export function GachaResultModal({
  isOpen,
  result,
  onClose,
  onEquip,
  onPullAgain,
  canPullAgain,
  pullAgainLabel
}: GachaResultModalProps) {
  if (!isOpen || !result) return null;

  const info = result.type === 'avatar' ? getAvatarInfo(result.id) || getAvatarInfo(result.icon) : null;
  const description = result.description || info?.description || (
    result.type === 'avatar' ? "冒険を彩る魅力的なアバター。" :
    result.type === 'equipment' ? "装備すると能力や見た目が変化する特別な武具。" :
    result.type === 'title' ? "プレイヤー名の上に誇らしく輝く称号。" :
    result.type === 'theme' ? "ホーム画面やゲーム画面を鮮やかに彩る背景テーマ。" :
    "回答時やアタック時に華やかな光を放つ特別なエフェクト。"
  );

  const cleanName = result.name.replace(/称号「|アバター「|エフェクト「|テーマ「|装備「|」/g, '');

  const rarityColor = 
    result.rarity === '神レア' ? 'from-purple-500 via-fuchsia-400 to-indigo-500 shadow-[0_0_40px_rgba(168,85,247,0.8)] border-purple-300' :
    result.rarity === '超激レア' ? 'from-red-500 via-rose-400 to-amber-500 shadow-[0_0_30px_rgba(239,68,68,0.8)] border-red-300' :
    result.rarity === '激レア' ? 'from-amber-500 via-yellow-400 to-amber-600 shadow-[0_0_25px_rgba(245,158,11,0.7)] border-amber-300' :
    result.rarity === 'レア' ? 'from-blue-500 via-cyan-400 to-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.6)] border-blue-300' :
    'from-slate-600 to-slate-800 shadow-md border-slate-400';

  const typeLabel = 
    result.type === 'avatar' ? '👤 アバター' :
    result.type === 'equipment' ? '🛡️ 装備品' :
    result.type === 'title' ? '🏷️ 称号' :
    result.type === 'theme' ? '🎨 背景テーマ' : '✨ エフェクト';

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto"
        onClick={onClose}
      >
        {/* Confetti & Light Beams Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-purple-900/20 to-black pointer-events-none" />

        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.7, opacity: 0, y: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={e => e.stopPropagation()}
          className="bg-slate-900 border-4 border-amber-400 rounded-3xl p-5 sm:p-8 max-w-lg w-full text-center shadow-[0_0_70px_rgba(251,191,36,0.5)] relative overflow-hidden my-auto"
        >
          {/* Top Celebration Banner */}
          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-2xl sm:text-3xl font-black text-amber-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] tracking-wider mb-2 flex items-center gap-2"
            >
              <span>🎉</span>
              <span>{result.duplicated ? "アイテム再獲得！" : "NEW アイテム獲得！"}</span>
              <span>🎉</span>
            </motion.div>

            {/* Badges: Rarity, Type, Source Gacha */}
            <div className="flex items-center gap-2 mb-3 flex-wrap justify-center">
              <span className={`text-xs sm:text-sm font-black px-3.5 py-1 rounded-full text-white bg-gradient-to-r ${rarityColor} border`}>
                {result.rarity}
              </span>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-600 shadow-sm">
                {typeLabel}
              </span>
              {result.gachaName && (
                <span className="text-xs font-black px-3 py-1 rounded-full bg-pink-900/90 text-pink-200 border border-pink-400/50 shadow-sm">
                  {result.gachaName}
                </span>
              )}
            </div>

            {/* Item Name */}
            <motion.h2 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] mt-1 mb-4"
            >
              {cleanName}
            </motion.h2>
          </div>

          {/* Large Front-and-Center Artwork Display */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.25, type: "spring", stiffness: 200 }}
            className="relative z-10 my-4 flex items-center justify-center"
          >
            {result.icon.startsWith('/') ? (
              <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-3xl overflow-hidden relative shadow-[0_0_40px_rgba(0,0,0,0.8)] flex items-center justify-center bg-black border-4 border-amber-400/90 group">
                <img
                  src={result.icon}
                  alt={cleanName}
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
                {/* Subtle sheen reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
              </div>
            ) : (
              <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-3xl flex items-center justify-center bg-slate-950 border-4 border-amber-400/80 shadow-2xl">
                <span className="text-8xl drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">{result.icon}</span>
              </div>
            )}
          </motion.div>

          {/* Duplication refund notification */}
          {result.duplicated && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative z-10 text-amber-300 font-black text-xs sm:text-sm bg-amber-950/80 border-2 border-amber-500/60 p-3 rounded-2xl mb-3 shadow-md"
            >
              ⚠️ すでに所持しているため、代わりに <span className="text-yellow-200 text-base">{result.refund}</span> を獲得しました！
            </motion.div>
          )}

          {/* Description / Story box */}
          <div className="relative z-10 text-slate-200 text-xs sm:text-sm bg-slate-950/80 p-3.5 rounded-2xl border border-slate-700 mb-5 leading-relaxed font-sans text-left shadow-inner">
            {description}
          </div>

          {/* Action Buttons */}
          <div className="relative z-10 flex flex-col sm:flex-row gap-2.5">
            {!result.duplicated && onEquip && (
              <Button
                variant="primary"
                onClick={() => {
                  onEquip(result.type, result.id);
                  onClose();
                }}
                className="flex-1 py-3 text-base font-black bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 border-2 border-emerald-300 shadow-lg"
              >
                ✅ 今すぐそうびする
              </Button>
            )}

            {onPullAgain && (
              <Button
                variant="fun"
                disabled={!canPullAgain}
                onClick={() => {
                  onClose();
                  onPullAgain();
                }}
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
