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
import { MATH_SKILLS } from "../../lib/mathData";

export default function Home() {
  const { userData, updateUserData, loading, isGuest } = useUser();
  const router = useRouter();
  const [mode, setMode] = useState<"4choice" | "keyboard">("4choice");
  const [subject, setSubject] = useState<"kanji" | "math">("kanji");
  const [targetGrades, setTargetGrades] = useState<number[]>([1]);
  const [targetMathSkills, setTargetMathSkills] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(5);

  useEffect(() => {
    if (userData) {
      if (targetGrades.length === 1 && targetGrades[0] === 1) {
        setTargetGrades([userData.grade]);
      }
      if (targetMathSkills.length === 0) {
        const skills = MATH_SKILLS.filter(s => s.grade === userData.grade).map(s => s.id);
        setTargetMathSkills(skills.length > 0 ? skills : [MATH_SKILLS[0].id]);
      }
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

  const kanjiMistakes = (userData.mistakeIds || []).filter(id => !id.startsWith("math_")).length;
  const mathMistakes = (userData.mistakeIds || []).filter(id => id.startsWith("math_")).length;

  const handleModeChange = (m: "4choice" | "keyboard") => {
    setMode(m);
    storage.setAnswerMode(m);
  };

  return (
    <main className={`min-h-screen p-6 relative bg-cover bg-center bg-fixed ${(!userData.theme || userData.theme === 'default') ? "bg-[url('/kanji-quest/images/ui/fantasy_bg.jpg')]" : ""}`}>
      {/* Dark overlay for readability */}
      {(!userData.theme || userData.theme === 'default') && (
        <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
      )}
      
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
          
          <div className="game-panel p-6 flex-1 flex flex-col justify-center gap-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="flex gap-4 items-center">
                <div className="bg-primary text-white font-black px-4 py-1 rounded-full text-sm shadow-md border-2 border-blue-400">
                  小学 {userData.grade} 年生
                </div>
                <div className="text-3xl font-black text-amber-400 text-outline drop-shadow-sm flex items-center gap-2">
                  <span className="text-4xl animate-bounce-slight">⭐</span> {userData.pt} <span className="text-lg text-amber-200 text-outline">PT</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => router.push("/profile")} className="game-panel-light flex items-center gap-2 px-4 py-2 hover:scale-105 transition-all text-sm md:text-base border-2 bg-indigo-50 border-indigo-200">
                  <span className="text-xl">👑</span>
                  <span className="font-black text-indigo-900">プロフィール</span>
                </button>
                <button onClick={() => router.push("/shop")} className="game-panel-light flex items-center gap-2 px-4 py-2 hover:scale-105 transition-all text-sm md:text-base border-2">
                  <span className="text-xl">🛍️</span>
                  <span className="font-black text-slate-800">ショップ</span>
                </button>
                <button onClick={() => router.push("/achievements")} className="game-panel-light flex items-center gap-2 px-4 py-2 hover:scale-105 transition-all text-sm md:text-base border-2">
                  <span className="text-xl">🏆</span>
                  <span className="font-black text-slate-800">じっせき</span>
                </button>
              </div>
            </div>

            <div>
              <div className="text-sm font-black text-amber-200 mb-2 drop-shadow-md">けいけんち (XP)</div>
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

        {/* Scary Mode Toggle */}
        <div className="game-panel p-6 relative overflow-hidden border-red-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h2 className="text-2xl font-black text-red-400 mb-1 flex items-center gap-2 drop-shadow-md">
                👹 ダークモード <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full shadow-sm border border-red-400">リアルボス</span>
              </h2>
              <p className="text-red-200/90 font-bold text-sm">レイドボスがリアルで怖い姿に変わるよ！勇気がある人だけ挑戦しよう！</p>
            </div>
            <button 
              onClick={() => updateUserData({ scaryMode: !userData.scaryMode })}
              className={`w-16 h-8 flex items-center rounded-full p-1 transition-colors duration-300 shadow-inner border-2 border-black/50 ${userData.scaryMode ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]' : 'bg-slate-700'}`}
            >
              <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${userData.scaryMode ? 'translate-x-8' : 'translate-x-0'}`}>
                {userData.scaryMode && <span className="text-[10px]">🔥</span>}
              </div>
            </button>
          </div>
        </div>

        {/* Answer Mode Selection */}
        <div className="game-panel-light p-6">
          <h2 className="text-3xl font-black text-blue-700 text-outline-dark mb-6 text-center animate-bounce-slight drop-shadow-md">こたえかた をえらぼう</h2>
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
              className="flex-1 text-xl py-6 flex flex-col items-center justify-center gap-1"
              onClick={() => handleModeChange("keyboard")}
            >
              <div>⌨️ キーボード</div>
              <div className="text-xs text-red-500 font-black bg-white/80 px-2 py-1 rounded-full shadow-sm border border-red-200">
                XP＆PT 3倍ボーナス!
              </div>
            </Button>
          </div>
        </div>

        {/* Grade/Skill Selection */}
        <div className="game-panel p-6">
          <div className="flex justify-center gap-4 mb-8 border-b-2 border-slate-700 pb-6">
            <Button variant={subject === "kanji" ? "fun" : "outline"} onClick={() => setSubject("kanji")} className="text-xl px-6 md:px-8 shadow-md">
              ✏️ 漢字バトル
            </Button>
            <Button variant={subject === "math" ? "fun" : "outline"} onClick={() => setSubject("math")} className={`text-xl px-6 md:px-8 shadow-md ${subject === "math" ? "bg-blue-500 hover:bg-blue-600 border-blue-700" : ""}`}>
              🔢 算数バトル
            </Button>
          </div>

          <h2 className="text-3xl font-black text-amber-400 text-outline-dark mb-6 text-center animate-bounce-slight drop-shadow-md">
            {subject === "kanji" ? "どの学年の漢字をやる？" : "どの計算をやる？"}
          </h2>
          
          {subject === "kanji" && (
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
                    className={`py-3 rounded-xl font-black text-lg transition-all border-b-[4px] flex items-center justify-center gap-1 shadow-md ${
                      isSelected 
                        ? "bg-amber-400 text-white border-amber-700 translate-y-1 border-b-0 drop-shadow-game-text" 
                        : "bg-slate-700 text-slate-300 border-slate-900 hover:bg-slate-600"
                    }`}
                  >
                    {isSelected && <span className="text-sm">✔️</span>}
                    {g}年
                  </button>
                );
              })}
            </div>
          )}

          {subject === "math" && (
            <div className="space-y-4 mb-6">
              {[1, 2, 3, 4, 5, 6].map(g => {
                const gradeSkills = MATH_SKILLS.filter(s => s.grade === g);
                if (gradeSkills.length === 0) return null;
                const allSelected = gradeSkills.every(s => targetMathSkills.includes(s.id));
                
                return (
                  <div key={g} className="bg-slate-800/80 rounded-xl p-4 border border-slate-600 shadow-inner">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-2">
                      <h3 className="text-xl font-black text-amber-200 drop-shadow-md">{g}年生</h3>
                      <Button size="sm" variant={allSelected ? "fun" : "outline"} className={allSelected ? "bg-amber-500 text-white text-xs border-amber-700" : "text-xs border-slate-500"} onClick={() => {
                        if (allSelected) {
                          if (targetMathSkills.length > gradeSkills.length) {
                            setTargetMathSkills(prev => prev.filter(id => !gradeSkills.find(s => s.id === id)));
                          }
                        } else {
                          const newSkills = new Set([...targetMathSkills, ...gradeSkills.map(s => s.id)]);
                          setTargetMathSkills(Array.from(newSkills));
                        }
                      }}>
                        {allSelected ? "すべて外す" : "すべて選ぶ"}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {gradeSkills.map(skill => {
                        const isSelected = targetMathSkills.includes(skill.id);
                        return (
                          <button
                            key={skill.id}
                            onClick={() => {
                              if (isSelected && targetMathSkills.length > 1) {
                                setTargetMathSkills(targetMathSkills.filter(id => id !== skill.id));
                              } else if (!isSelected) {
                                setTargetMathSkills([...targetMathSkills, skill.id]);
                              }
                            }}
                            className={`px-3 py-2 rounded-lg font-bold text-sm transition-all border-b-[3px] shadow-sm ${
                              isSelected
                                ? "bg-blue-500 text-white border-blue-800 translate-y-1 border-b-0"
                                : "bg-slate-700 text-slate-300 border-slate-900 hover:bg-slate-600"
                            }`}
                          >
                            {isSelected && <span className="mr-1">✔️</span>}{skill.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <h2 className="text-2xl font-black text-amber-200 drop-shadow-md mb-6 text-center">もんだい数 をえらぼう</h2>
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
            <Button 
              variant="fun" 
              size="lg" 
              onClick={() => {
                if (subject === "kanji") {
                  router.push(`/game?subject=kanji&grades=${targetGrades.join(",")}&count=${questionCount}`);
                } else {
                  router.push(`/game?subject=math&skills=${targetMathSkills.join(",")}&count=${questionCount}`);
                }
              }} 
              className={`w-full text-2xl md:text-3xl h-20 shadow-lg group relative overflow-hidden ${subject === 'math' ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30 border-blue-700' : 'shadow-orange-500/30'}`}
            >
              {subject === "kanji" ? "漢字バトルへ出発！" : "算数バトルへ出発！"}
              <motion.span 
                className="absolute right-4 text-4xl opacity-50 group-hover:opacity-100 transition-opacity"
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                {subject === "kanji" ? "⚔️" : "🔢"}
              </motion.span>
            </Button>
            
            {kanjiMistakes > 0 || mathMistakes > 0 ? (
              <div className="flex gap-4">
                {kanjiMistakes > 0 ? (
                  <Button variant="danger" size="lg" onClick={() => router.push(`/game?subject=kanji&revenge=true`)} className="flex-1 h-16 text-md animate-pulse shadow-red-500/30">
                    🔥 漢字 にがて克服 ({kanjiMistakes})
                  </Button>
                ) : <div className="flex-1"></div>}
                
                {mathMistakes > 0 ? (
                  <Button variant="danger" size="lg" onClick={() => router.push(`/game?subject=math&revenge=true`)} className="flex-1 h-16 text-md animate-pulse shadow-red-500/30">
                    🔥 算数 にがて克服 ({mathMistakes})
                  </Button>
                ) : <div className="flex-1"></div>}
              </div>
            ) : (
              <Button variant="ghost" size="lg" disabled className="h-16 text-sm md:text-lg bg-slate-200/50 text-slate-500 border-2 border-slate-300/50 opacity-80 cursor-not-allowed">
                🔒 今は苦手なもんだいがないようだ・・・（封印中）
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

        {/* Ad and Updates Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 mb-4">
          {/* Update News */}
          <div className="game-panel p-4 flex flex-col gap-2 shadow-lg">
             <h3 className="text-lg font-black text-amber-300 border-b border-slate-600 pb-2 flex items-center gap-2">
               <span>📣</span> アップデートのお知らせ
             </h3>
             <ul className="text-sm font-bold text-slate-200 space-y-3 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
               <li>
                 <div className="text-xs text-amber-400 mb-0.5">2026/07/30</div>
                 <div>「スタディ・モンスターズ」にタイトル変更！算数の問題もパワーアップ！</div>
               </li>
               <li>
                 <div className="text-xs text-amber-400 mb-0.5">2026/07/29</div>
                 <div>かっこいい・かわいいボス画像がたくさん追加されたよ！</div>
               </li>
               <li>
                 <div className="text-xs text-amber-400 mb-0.5">2026/07/28</div>
                 <div>ランキングで自分の称号とアバターが見えるようになったよ！</div>
               </li>
             </ul>
          </div>

          {/* Cross-promotion Ad */}
          <a 
            href="https://tw224383-pixel.github.io/hyakuninisshu/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="game-panel-light p-4 flex flex-col justify-center items-center gap-2 hover:scale-105 transition-transform border-4 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)] group relative overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl shadow-md z-10 flex items-center gap-1 animate-pulse">
              <span>🌟</span> おすすめ！
            </div>
            <div className="font-black text-blue-900 text-center leading-tight mt-3 relative z-10 text-sm md:text-base">
              黒田先生が作った<br/>ほかのアプリでも遊んでみよう！
            </div>
            <div className="text-5xl mt-2 relative z-10 group-hover:rotate-12 transition-transform duration-300 drop-shadow-md">🎴</div>
            <div className="text-xs font-bold text-slate-600 mt-2 relative z-10 bg-white/60 px-3 py-1 rounded-full border border-slate-300">
              百人一首（ひゃくにんいっしゅ）
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/30 to-orange-400/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          </a>
        </div>

        {/* Footer / Secret Room */}
        <div className="text-center mt-12 mb-4 opacity-30 text-xs font-bold text-white hover:opacity-100 transition-opacity">
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
