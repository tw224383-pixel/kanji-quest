"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Button";

export function AvatarPreviewModal({
  isOpen,
  onClose,
  avatarUrl,
  avatarId,
  name
}: {
  isOpen: boolean;
  onClose: () => void;
  avatarUrl?: string;
  avatarId?: string;
  name?: string;
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
        <motion.div 
          className="bg-slate-800 rounded-3xl p-6 max-w-sm w-full text-center shadow-[0_0_40px_rgba(0,0,0,0.5)] border-4 border-slate-600 relative overflow-hidden"
          onClick={e => e.stopPropagation()}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          {/* Sparkles background */}
          <div className="absolute inset-0 bg-[url('/kanji-quest/images/ui/fantasy_bg.jpg')] bg-cover opacity-20 pointer-events-none mix-blend-screen" />
          
          <h2 className="text-2xl font-black text-white mb-6 drop-shadow-md relative z-10">{name || "アバター"}</h2>
          
          <div className="bg-slate-900/80 p-6 rounded-2xl border-2 border-slate-700 flex justify-center mb-6 relative z-10 shadow-inner">
            {avatarUrl && avatarUrl.startsWith('/') ? (
              <img 
                src={avatarUrl} 
                alt={name || avatarId} 
                className="w-48 h-48 object-cover rounded-full border-4 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-[pulse_2s_ease-in-out_infinite]" 
                style={{ objectPosition: avatarUrl.includes('cute_') ? 'center 20%' : 'center' }}
              />
            ) : (
              <div className="text-9xl my-4 drop-shadow-lg">{avatarUrl || avatarId}</div>
            )}
          </div>
          
          <Button variant="primary" onClick={onClose} className="w-full relative z-10 text-xl py-3 shadow-lg border-2 border-blue-400">
            とじる
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
