"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Button";
import { getEquipmentById } from "../../lib/equipmentData";

export function EquipmentPreviewModal({
  isOpen,
  onClose,
  equipmentId,
}: {
  isOpen: boolean;
  onClose: () => void;
  equipmentId?: string | null;
}) {
  if (!isOpen || !equipmentId) return null;

  const eq = getEquipmentById(equipmentId);
  if (!eq) return null;

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
          
          <div className="relative z-10">
            <span className={`inline-block text-xs font-black px-3 py-1 rounded-full mb-2 ${
              eq.rarity === '神レア' ? 'bg-purple-500 text-white animate-pulse shadow-md' :
              eq.rarity === '超激レア' ? 'bg-red-500 text-white shadow-md' :
              eq.rarity === '激レア' ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-200'
            }`}>
              {eq.rarity}
            </span>
            <h2 className="text-2xl font-black text-amber-300 mb-4 drop-shadow-md">{eq.name}</h2>
          </div>
          
          <div className="bg-slate-950/80 p-6 rounded-2xl border-2 border-amber-500/50 flex items-center justify-center mb-4 relative z-10 shadow-inner">
            <div className="w-36 h-36 flex items-center justify-center text-8xl bg-slate-900 rounded-2xl border-4 border-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.5)] overflow-hidden">
              {eq.icon.startsWith('/') || eq.icon.endsWith('.png') || eq.icon.endsWith('.jpg') ? (
                <img src={eq.icon} alt={eq.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <span>{eq.icon}</span>
              )}
            </div>
          </div>

          <div className="text-slate-300 font-bold text-sm bg-slate-800/80 p-3 rounded-xl border border-slate-700 mb-6 relative z-10">
            {eq.description}
          </div>
          
          <Button variant="fun" onClick={onClose} className="w-full relative z-10 text-xl py-3 shadow-lg border-2 border-amber-400">
            とじる
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
