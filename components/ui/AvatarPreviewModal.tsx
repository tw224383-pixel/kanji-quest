"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Button";
import { getAvatarInfo, getAvatarImageProps } from "../../lib/itemData";
import { AvatarRarityEffect } from "./AvatarRarityEffect";

export function AvatarPreviewModal({
  isOpen,
  onClose,
  avatarUrl,
  avatarId,
}: {
  isOpen: boolean;
  onClose: () => void;
  avatarUrl?: string;
  avatarId?: string;
  name?: string;
}) {
  if (!isOpen) return null;

  const info = getAvatarInfo(avatarId) || getAvatarInfo(avatarUrl);
  const rarity = info?.rarity || "ノーマル";
  const avatarName = info?.name || (avatarId && !avatarId.startsWith('/') ? avatarId : "アバター");
  const displayIcon = avatarUrl || info?.icon || avatarId || "👦";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4" onClick={onClose}>
        <motion.div 
          className="bg-slate-900 rounded-3xl p-6 max-w-sm w-full text-center shadow-[0_0_50px_rgba(251,191,36,0.3)] border-4 border-amber-400 relative overflow-hidden"
          onClick={e => e.stopPropagation()}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          {/* Sparkles background */}
          <div className="absolute inset-0 bg-[url('/images/ui/fantasy_bg.webp')] bg-cover opacity-30 pointer-events-none mix-blend-screen" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-block text-xs font-black px-3 py-1 rounded-full ${
                rarity === '神レア' ? 'bg-purple-500 text-white animate-pulse shadow-md' :
                rarity === '超激レア' ? 'bg-red-500 text-white shadow-md' :
                rarity === '激レア' ? 'bg-amber-500 text-white' :
                rarity === 'レア' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-200'
              }`}>
                {rarity}
              </span>
              {info?.gachaName && (
                <span className="text-xs font-black px-3 py-1 rounded-full bg-pink-900/90 text-pink-200 border border-pink-400/50 shadow-md">
                  排出: {info.gachaName}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-amber-300 mb-4 drop-shadow-md">{avatarName}</h2>
          </div>
          
          <div className="p-3 rounded-2xl bg-slate-950/90 border-2 border-amber-500/50 flex items-center justify-center mb-4 relative z-10 shadow-inner">
            {displayIcon && (displayIcon.startsWith('/') || displayIcon.endsWith('.jpg') || displayIcon.endsWith('.png')) ? (
              <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden relative shadow-2xl flex items-center justify-center bg-black border-2 border-amber-400/80">
                <img 
                  src={displayIcon} 
                  alt={avatarName} 
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-40 h-40 flex items-center justify-center bg-slate-900 rounded-2xl">
                <span className="text-7xl drop-shadow-lg">{displayIcon}</span>
              </div>
            )}
          </div>

          <div className="text-slate-300 font-bold text-sm bg-slate-800/80 p-3 rounded-xl border border-slate-700 mb-6 relative z-10 leading-relaxed font-sans">
            {info?.description || "冒険を彩る魅力的なアバター。"}
          </div>
          
          <Button variant="fun" onClick={onClose} className="w-full relative z-10 text-xl py-3 shadow-lg border-2 border-amber-400">
            とじる
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
