"use client";

import { useState } from "react";
import { useUser } from "../../hooks/useUser";
import { LoadingScreen } from "../../components/ui/LoadingScreen";
import { getAllKanji } from "../../lib/kanjiData";
import { Button } from "../../components/ui/Button";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function EncyclopediaPage() {
  const { userData, loading } = useUser();
  const router = useRouter();
  const [selectedGrade, setSelectedGrade] = useState(1);
  const [selectedKanji, setSelectedKanji] = useState<any | null>(null);

  if (loading) return <LoadingScreen />;
  if (!userData) {
    router.push("/");
    return null;
  }

  const allKanji = getAllKanji();
  const kanjiForGrade = allKanji.filter(k => k.grade === selectedGrade);
  const masteredCount = kanjiForGrade.filter(k => userData.masteredIds.includes(k.kanji)).length;
  const progress = Math.round((masteredCount / kanjiForGrade.length) * 100) || 0;

  return (
    <main className={`min-h-screen p-6 relative bg-cover bg-center bg-fixed ${(!userData.theme || userData.theme === 'default') ? "bg-[url('/images/ui/fantasy_bg.jpg')]" : ""}`}>
      {/* Dark overlay */}
      {(!userData.theme || userData.theme === 'default') && (
        <div className="absolute inset-0 bg-black/40 pointer-events-none z-0"></div>
      )}

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-amber-400 drop-shadow-md flex items-center gap-2 text-outline-dark">
            <span>📖</span> 漢字図鑑
          </h1>
          <Button variant="outline" onClick={() => router.push("/home")}>もどる</Button>
        </div>

        {/* Grade Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
          {[1, 2, 3, 4, 5, 6].map(g => (
            <button
              key={g}
              onClick={() => setSelectedGrade(g)}
              className={`flex-shrink-0 px-6 py-3 rounded-full font-black text-lg transition-all ${
                selectedGrade === g 
                  ? "bg-primary text-white shadow-md scale-105" 
                  : "bg-white text-slate-500 hover:bg-slate-100"
              }`}
            >
              小学{g}年生
            </button>
          ))}
        </div>

        {/* Progress */}
        <div className="game-panel p-6 mb-8">
          <div className="flex justify-between items-end mb-2">
            <div className="text-lg font-bold text-amber-200">
              {selectedGrade}年生のマスター達成度
            </div>
            <div className="text-3xl font-black text-emerald-400 drop-shadow-sm">
              {progress}%
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden border-2 border-white">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full"
            />
          </div>
          <div className="text-right text-sm font-bold text-slate-400 mt-2">
            {masteredCount} / {kanjiForGrade.length} 文字
          </div>
        </div>

        {/* Kanji Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
          {kanjiForGrade.map(k => {
            const isMastered = userData.masteredIds.includes(k.kanji);
            return (
              <motion.button
                whileHover={isMastered ? { scale: 1.1 } : {}}
                whileTap={isMastered ? { scale: 0.95 } : {}}
                key={k.kanji}
                onClick={() => isMastered && setSelectedKanji(k)}
                className={`aspect-square rounded-2xl flex items-center justify-center text-4xl font-serif transition-all ${
                  isMastered 
                    ? "game-panel-light font-black text-slate-800 hover:border-amber-400 hover:shadow-[0_0_15px_rgba(251,191,36,0.6)] cursor-pointer" 
                    : "bg-slate-800/60 border border-slate-600 text-slate-500 opacity-60 cursor-not-allowed"
                }`}
              >
                {k.kanji}
              </motion.button>
            );
          })}
        </div>

      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedKanji && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedKanji(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="game-panel-light p-8 max-w-sm w-full text-center relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-[100px] leading-none font-serif text-slate-800 mb-6 drop-shadow-md text-outline">
                {selectedKanji.kanji}
              </div>
              
              <div className="space-y-4">
                <div className="bg-orange-100/80 rounded-2xl p-4 border border-orange-300">
                  <div className="text-sm font-black text-orange-800 mb-1">音読み（カタカナ）</div>
                  <div className="text-xl font-bold text-slate-800">
                    {selectedKanji.on.length > 0 ? selectedKanji.on.join("、") : "なし"}
                  </div>
                </div>
                <div className="bg-blue-100/80 rounded-2xl p-4 border border-blue-300">
                  <div className="text-sm font-black text-blue-800 mb-1">訓読み（ひらがな）</div>
                  <div className="text-xl font-bold text-slate-800">
                    {selectedKanji.kun.length > 0 ? selectedKanji.kun.join("、") : "なし"}
                  </div>
                </div>
              </div>

              <Button variant="outline" className="mt-8 w-full" onClick={() => setSelectedKanji(null)}>
                とじる
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
