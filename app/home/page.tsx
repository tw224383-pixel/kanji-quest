"use client";

import { useUser } from "../../hooks/useUser";
import { calculateLevel } from "../../lib/gameLogic";
import { RankPlate } from "../../components/ui/RankPlate";
import { RaidBoss } from "../../components/game/RaidBoss";
import { Button } from "../../components/ui/Button";
import { useRouter } from "next/navigation";
import { storage } from "../../lib/storage";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const { userData, loading, isGuest } = useUser();
  const router = useRouter();
  const [mode, setMode] = useState<"4choice" | "keyboard">("4choice");
  const [targetGrades, setTargetGrades] = useState<number[]>([1]);
  const [questionCount, setQuestionCount] = useState<number>(5);

  useEffect(() => {
    if (userData && targetGrades.length === 1 && targetGrades[0] === 1) {
      setTargetGrades([userData.grade]);
    }
    setMode(storage.getAnswerMode() as "4choice" | "keyboard");
  }, [userData]);

  if (loading) return <div className="flex min-h-screen items-center justify-center font-black text-3xl text-primary animate-pulse">よみこみちゅう...</div>;
  if (!userData) {
    router.push("/");
    return null;
  }

  const { level, currentLevelXp, nextLevelRequiredXp } = calculateLevel(userData.xp);
  const xpPercent = nextLevelRequiredXp === 0 ? 100 : (currentLevelXp / nextLevelRequiredXp) * 100;

  const handleModeChange = (m: "4choice" | "keyboard") => {
    setMode(m);
    storage.setAnswerMode(m);
  };

  return (
    <main className="min-h-screen p-6 relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-8 relative z-10"
      >
        <RaidBoss />
        
        {/* Header Profile */}
        <div className="flex flex-col md:flex-row items-stretch gap-4">
          <div className="flex-shrink-0 min-w-[200px]">
            <RankPlate 
              level={level} 
              name={userData.name} 
              title={userData.equippedTitle} 
              avatar={userData.equippedAvatar}
              isMvp={userData.totalDamage > 0}
            />
          </div>
          
          <div className="glass rounded-3xl p-6 flex-1 flex flex-col justify-center gap-4 border-4 border-white/50 shadow-xl bg-white/40">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="flex gap-4 items-center">
                <div className="bg-primary text-white font-black px-4 py-1 rounded-full text-sm shadow-md">
                  小学 {userData.grade} 年生
                </div>
                <div className="text-2xl font-black text-amber-500 drop-shadow-sm flex items-center gap-2">
                  <span className="text-3xl">⭐</span> {userData.pt} <span className="text-sm text-amber-700">PT</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => router.push("/shop")} className="glass flex items-center gap-2 px-4 py-2 rounded-2xl shadow-sm hover:translate-y-1 transition-all bg-white/40">
                  <span className="text-xl">🛍️</span>
                  <span className="font-black text-slate-700">ショップ</span>
                </button>
                <button onClick={() => router.push("/achievements")} className="glass flex items-center gap-2 px-4 py-2 rounded-2xl shadow-sm hover:translate-y-1 transition-all bg-white/40">
                  <span className="text-xl">🏆</span>
                  <span className="font-black text-slate-700">じっせき</span>
                </button>
              </div>
            </div>

            <div>
              <div className="text-sm font-black text-blue-900 mb-2">けいけんち (XP)</div>
              <div className="w-full bg-gray-200/80 rounded-full h-6 overflow-hidden relative shadow-inner border-2 border-white/50">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-gradient-to-r from-blue-400 to-primary h-full"
                ></motion.div>
                <div className="absolute inset-0 flex items-center justify-center text-[12px] font-black text-white drop-shadow-md">
                  {currentLevelXp} / {nextLevelRequiredXp || "MAX"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answer Mode Selection */}
        <div className="glass rounded-3xl p-6 shadow-xl border-4 border-white/50 bg-white/40">
          <h2 className="text-2xl font-black text-indigo-900 mb-6 text-center">こたえかた をえらぼう</h2>
          <div className="flex gap-4">
            <Button 
              variant={mode === "4choice" ? "fun" : "outline"} 
              className="flex-1 text-xl py-6"
              onClick={() => handleModeChange("4choice")}
            >
              👆 4たく ボタン
            </Button>
            <Button 
              variant={mode === "keyboard" ? "fun" : "outline"} 
              className="flex-1 text-xl py-6"
              onClick={() => handleModeChange("keyboard")}
            >
              ⌨️ キーボード
            </Button>
          </div>
        </div>

        {/* Grade Selection */}
        <div className="glass rounded-3xl p-6 shadow-xl border-4 border-white/50 bg-white/40">
          <h2 className="text-2xl font-black text-indigo-900 mb-6 text-center">どの学年のクエストにいく？（複数えらべるよ）</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
            {[1, 2, 3, 4, 5, 6].map(g => {
              const isSelected = targetGrades.includes(g);
              return (
                <button
                  key={g}
                  onClick={() => {
                    if (isSelected && targetGrades.length > 1) {
                      setTargetGrades(targetGrades.filter(grade => grade !== g));
                    } else if (!isSelected) {
                      setTargetGrades([...targetGrades, g].sort());
                    }
                  }}
                  className={`py-3 rounded-xl font-black text-lg transition-all border-b-4 flex items-center justify-center gap-1 ${
                    isSelected 
                      ? "bg-amber-400 text-white border-amber-600 shadow-sm translate-y-1 border-b-0" 
                      : "bg-white text-gray-500 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {isSelected && <span className="text-sm">✔️</span>}
                  {g}年
                </button>
              );
            })}
          </div>

          <h2 className="text-2xl font-black text-indigo-900 mb-6 text-center">もんだい数 をえらぼう</h2>
          <div className="flex gap-4">
            {[5, 10, 20].map(count => (
              <Button 
                key={count}
                variant={questionCount === count ? "fun" : "outline"} 
                className="flex-1 text-xl py-4"
                onClick={() => setQuestionCount(count)}
              >
                {count}問
              </Button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <Button variant="fun" size="lg" onClick={() => router.push(`/game?grades=${targetGrades.join(",")}&count=${questionCount}`)} className="flex-1 text-3xl shadow-orange-500/30 group">
              クエストに<br/>しゅっぱつ！
              <motion.span 
                className="absolute right-4 text-5xl opacity-50 group-hover:opacity-100 transition-opacity"
                animate={{ x: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                ⚔️
              </motion.span>
            </Button>
            {userData.mistakeIds && userData.mistakeIds.length > 0 ? (
              <Button variant="danger" size="lg" onClick={() => router.push(`/game?revenge=true`)} className="h-20 text-xl animate-pulse shadow-red-500/30">
                🔥 にがて克服リベンジ！ ({userData.mistakeIds.length}文字)
              </Button>
            ) : (
              <Button variant="ghost" size="lg" disabled className="h-20 text-sm md:text-lg bg-slate-200/50 text-slate-500 border-2 border-slate-300/50 opacity-80 cursor-not-allowed">
                🔒 今は苦手文字がないようだ・・・（封印中）
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button variant="secondary" onClick={() => router.push("/shop")} className="h-full text-xl flex flex-col items-center justify-center gap-2">
              <span className="text-4xl">🛍️</span> ショップ
            </Button>
            <Button variant="primary" onClick={() => router.push("/encyclopedia")} className="h-full text-xl flex flex-col items-center justify-center gap-2">
              <span className="text-4xl">📖</span> 漢字図鑑
            </Button>
            <Button variant="primary" onClick={() => router.push("/ranking")} className="col-span-2 h-full text-xl flex items-center justify-center gap-2">
              <span className="text-3xl">👑</span> 今週のヒーロー
            </Button>
          </div>
        </div>

        {/* Footer / Secret Room */}
        <div className="text-center mt-12 mb-4 opacity-10 text-xs font-bold hover:opacity-100 transition-opacity">
          <button onClick={() => {
            const pass = window.prompt("ひみつのあいことばをいれてね");
            if (pass === "wada8817") {
              router.push("/debug");
            }
          }}>
            🤫 黒田先生の秘密の部屋
          </button>
        </div>
      </motion.div>
    </main>
  );
}
