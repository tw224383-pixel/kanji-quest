"use client";

import { useUser } from "../../hooks/useUser";
import { calculateLevel } from "../../lib/gameLogic";
import { RankPlate } from "../../components/ui/RankPlate";
import { AvatarPreviewModal } from "../../components/ui/AvatarPreviewModal";
import { RaidBoss } from "../../components/game/RaidBoss";
import { Button } from "../../components/ui/Button";
import { LoadingScreen } from "../../components/ui/LoadingScreen";
import { useRouter } from "next/navigation";
import { storage } from "../../lib/storage";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MATH_SKILLS } from "../../lib/mathData";
import { ThemeBackground } from "../../components/ui/ThemeBackground";
import { KanjiEffect } from "../../components/game/KanjiEffect";

export default function Home() {
  const { userData, updateUserData, loading, isGuest } = useUser();
  const router = useRouter();
  const [mode, setMode] = useState<"4choice" | "keyboard">("4choice");
  const [subject, setSubject] = useState<"kanji" | "math">("kanji");
  const [isAnimating, setIsAnimating] = useState(false);
  const [targetGrades, setTargetGrades] = useState<number[]>([1]);
  const [targetMathSkills, setTargetMathSkills] = useState<string[]>([]);
  const [previewingAvatar, setPreviewingAvatar] = useState<{url?: string, id?: string, name?: string} | null>(null);
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

  if (loading) return <LoadingScreen />;
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
    <main className="min-h-screen p-6 relative">
      {/* Dark overlay is now handled globally by ThemeBackground */}
      {/* ThemeBackground is handled globally by ThemeProvider */}
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-8 relative z-10"
      >
        <RaidBoss />

        {/* 1. 学習エリア (最優先) */}
        <div className="game-panel p-6 space-y-6">
          <h2 className="text-3xl font-black text-amber-400 drop-shadow-md text-outline-dark text-center animate-bounce-slight whitespace-nowrap">バトルへ出発</h2>
          
          {/* Answer Mode Selection */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-600 shadow-inner">
            <h3 className="text-xl font-black text-amber-200 drop-shadow-md mb-4 text-center border-b border-slate-700 pb-2 whitespace-nowrap">こたえかた</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <Button 
                variant={mode === "4choice" ? "fun" : "outline"} 
                className="flex-1 text-base md:text-xl py-4 whitespace-nowrap"
                onClick={() => handleModeChange("4choice")}
              >
                👆 4たく ボタン
              </Button>
              <Button 
                variant={mode === "keyboard" ? "fun" : "outline"} 
                className="flex-1 text-base md:text-xl py-4 flex flex-col items-center justify-center gap-1 px-1 whitespace-nowrap"
                onClick={() => handleModeChange("keyboard")}
              >
                <div>⌨️ キーボード</div>
                <div className="text-[10px] md:text-xs text-red-500 font-black bg-white/80 px-2 py-1 rounded-full shadow-sm border border-red-200">
                  XP＆PT 3倍ボーナス!
                </div>
              </Button>
            </div>
          </div>

          {/* Subject Selection */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-600 shadow-inner">
             <h3 className="text-xl font-black text-amber-200 drop-shadow-md mb-4 text-center border-b border-slate-700 pb-2 whitespace-nowrap">かもく</h3>
             <div className="flex gap-4 mb-6">
               <Button 
                 variant={subject === "kanji" ? "primary" : "outline"} 
                 className="flex-1 text-xl py-4 whitespace-nowrap"
                 onClick={() => setSubject("kanji")}
               >
                 📝 漢字
               </Button>
               <Button 
                 variant={subject === "math" ? "primary" : "outline"} 
                 className="flex-1 text-xl py-4 whitespace-nowrap"
                 onClick={() => setSubject("math")}
               >
                 🔢 算数
               </Button>
             </div>

             {/* Subject specifics */}
             {subject === "kanji" && (
                <div className="space-y-4 mb-6">
                  <div className="flex flex-wrap justify-center gap-2">
                    {[1, 2, 3, 4, 5, 6].map(g => (
                      <button
                        key={g}
                        onClick={() => {
                          if (targetGrades.includes(g) && targetGrades.length > 1) {
                            setTargetGrades(targetGrades.filter(tg => tg !== g));
                          } else if (!targetGrades.includes(g)) {
                            setTargetGrades([...targetGrades, g].sort((a,b)=>a-b));
                          }
                        }}
                        className={`px-4 py-2 rounded-full font-black text-lg transition-all border-b-4 whitespace-nowrap ${
                          targetGrades.includes(g) 
                            ? "bg-amber-400 text-amber-900 border-amber-600 translate-y-1 border-b-0 shadow-inner" 
                            : "bg-slate-700 text-slate-300 border-slate-900 shadow-md hover:bg-slate-600"
                        }`}
                      >
                        {g}年
                      </button>
                    ))}
                  </div>
                </div>
             )}

             {subject === "math" && (
                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {[1, 2, 3, 4, 5, 6].map(g => {
                    const gradeSkills = MATH_SKILLS.filter(s => s.grade === g);
                    if (gradeSkills.length === 0) return null;
                    const allSelected = gradeSkills.every(s => targetMathSkills.includes(s.id));
                    
                    return (
                      <div key={g} className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 shadow-inner">
                        <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-2">
                          <h3 className="text-xl font-black text-blue-200 drop-shadow-md whitespace-nowrap">{g}年生</h3>
                          <Button size="sm" variant={allSelected ? "fun" : "outline"} className={`whitespace-nowrap ${allSelected ? "bg-amber-500 text-white text-xs border-amber-700" : "text-xs border-slate-500"}`} onClick={() => {
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
                                className={`px-3 py-2 rounded-lg font-bold text-sm transition-all border-b-[3px] shadow-sm whitespace-nowrap ${
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

             <h3 className="text-xl font-black text-amber-200 drop-shadow-md mb-4 text-center border-b border-slate-700 pb-2 whitespace-nowrap">もんだい数</h3>
             <div className="flex gap-4">
               {[5, 10, 20].map(count => (
                 <Button 
                   key={count}
                   variant={questionCount === count ? "fun" : "outline"} 
                   className="flex-1 text-xl py-3 whitespace-nowrap"
                   onClick={() => setQuestionCount(count)}
                 >
                   {count}問
                 </Button>
               ))}
             </div>
          </div>

          <div className="flex flex-col gap-4 mt-4">
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
              className={`w-full text-xl md:text-3xl h-20 shadow-lg group relative overflow-hidden whitespace-nowrap ${subject === 'math' ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30 border-blue-700' : 'shadow-orange-500/30'}`}
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
              <div className="flex flex-col md:flex-row gap-4">
                {kanjiMistakes > 0 ? (
                  <Button variant="danger" size="lg" onClick={() => router.push(`/game?subject=kanji&revenge=true`)} className="flex-1 h-16 text-md animate-pulse shadow-red-500/30 whitespace-nowrap">
                    🔥 漢字 にがて克服 ({kanjiMistakes})
                  </Button>
                ) : <div className="flex-1 hidden md:block"></div>}
                
                {mathMistakes > 0 ? (
                  <Button variant="danger" size="lg" onClick={() => router.push(`/game?subject=math&revenge=true`)} className="flex-1 h-16 text-md animate-pulse shadow-red-500/30 whitespace-nowrap">
                    🔥 算数 にがて克服 ({mathMistakes})
                  </Button>
                ) : <div className="flex-1 hidden md:block"></div>}
              </div>
            ) : (
              <Button variant="ghost" size="lg" disabled className="h-16 text-sm md:text-lg bg-slate-200/50 text-slate-500 border-2 border-slate-300/50 opacity-80 cursor-not-allowed whitespace-nowrap">
                🔒 今は苦手なもんだいがないようだ・・・（封印中）
              </Button>
            )}
          </div>
        </div>

        {/* 2. プロフィールエリア */}
        <div className="flex flex-col md:flex-row gap-6 w-full relative z-10">
          <div className="w-full md:w-1/3 flex-shrink-0 relative">
            <RankPlate 
              level={level} 
              name={userData.name} 
              title={userData.equippedTitle} 
              avatar={userData.equippedAvatar}
              onAvatarClick={(url, id) => setPreviewingAvatar({url, id, name: userData.name})}
              isMvp={userData.totalDamage > 0}
              onSettingsClick={() => router.push("/profile")}
            />
          </div>
          
          <div className="game-panel p-6 flex-1 flex flex-col justify-center gap-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="flex gap-4 items-center">
                <div className="bg-primary text-white font-black px-4 py-1 rounded-full text-sm shadow-md border-2 border-blue-400 whitespace-nowrap">
                  小学 {userData.grade} 年生
                </div>
                <div className="text-3xl font-black text-amber-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] flex items-center gap-2 whitespace-nowrap">
                  <span className="text-4xl animate-bounce-slight">⭐</span> {userData.pt} <span className="text-lg text-amber-500">PT</span>
                </div>
              </div>
              <div className="flex w-full md:w-auto gap-2 mt-2 md:mt-0">
                <button onClick={() => router.push("/shop")} className="flex-1 game-panel-light flex justify-center items-center gap-1 px-2 md:px-4 py-2 hover:scale-105 transition-all text-sm md:text-base border-2 whitespace-nowrap">
                  <span className="text-lg md:text-xl">🛍️</span>
                  <span className="font-black text-slate-800 text-xs md:text-base">ショップ</span>
                </button>
                <button onClick={() => router.push("/achievements")} className="flex-1 game-panel-light flex justify-center items-center gap-1 px-2 md:px-4 py-2 hover:scale-105 transition-all text-sm md:text-base border-2 whitespace-nowrap">
                  <span className="text-lg md:text-xl">🏆</span>
                  <span className="font-black text-slate-800 text-xs md:text-base">じっせき</span>
                </button>
              </div>
            </div>

            <div>
              <div className="text-sm font-black text-amber-200 mb-2 drop-shadow-md whitespace-nowrap">けいけんち (XP)</div>
              <div className="w-full bg-gray-200/80 rounded-full h-6 overflow-hidden relative shadow-inner border-2 border-white/50">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-gradient-to-r from-blue-400 to-primary h-full"
                ></motion.div>
                <div className="absolute inset-0 flex items-center justify-center text-[12px] font-black text-white drop-shadow-md whitespace-nowrap">
                  {currentLevelXp} / {nextLevelRequiredXp || "MAX"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. その他のメニュー */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="primary" onClick={() => router.push("/encyclopedia")} className="h-full text-xl flex flex-col items-center justify-center gap-2 py-4 whitespace-nowrap">
            <span className="text-4xl">📖</span> 漢字図鑑
          </Button>
          <Button variant="primary" onClick={() => router.push("/ranking")} className="h-full text-xl flex items-center justify-center gap-2 py-4 whitespace-nowrap">
            <span className="text-3xl">👑</span> 今週のヒーロー
          </Button>
        </div>

        {/* 4. お知らせと広告 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 mb-4">
          {/* Update News */}
          <div className="game-panel p-4 flex flex-col gap-2 shadow-lg">
             <h3 className="text-lg font-black text-amber-300 border-b border-slate-600 pb-2 flex items-center gap-2 whitespace-nowrap">
               <span>📣</span> アップデートのお知らせ
             </h3>
             <ul className="text-sm font-bold text-slate-200 space-y-3 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
               <li>
                 <div className="text-xs text-amber-400 mb-0.5">2026/07/31</div>
                 <div>超豪華な「リッチガチャ」が登場！かっこいい・かわいいアバターが当たるよ！</div>
               </li>
               <li>
                 <div className="text-xs text-amber-400 mb-0.5">2026/07/31</div>
                 <div>プロフィール画像に対応！ゲットしたアバターを設定してみよう！</div>
               </li>
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
            <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl shadow-md z-10 flex items-center gap-1 animate-pulse whitespace-nowrap">
              <span>🌟</span> おすすめ！
            </div>
            <div className="font-black text-blue-900 text-center leading-tight mt-3 relative z-10 text-sm md:text-base whitespace-nowrap">
              黒田先生が作った<br/>ほかのアプリでも遊んでみよう！
            </div>
            <div className="text-5xl mt-2 relative z-10 group-hover:rotate-12 transition-transform duration-300 drop-shadow-md">🎴</div>
            <div className="text-xs font-bold text-slate-600 mt-2 relative z-10 bg-white/60 px-3 py-1 rounded-full border border-slate-300 whitespace-nowrap">
              百人一首（ひゃくにんいっしゅ）
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/30 to-orange-400/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          </a>
        </div>

        {/* Footer / Secret Room */}
        <div className="text-center mt-12 mb-4 opacity-30 text-xs font-bold text-white hover:opacity-100 transition-opacity whitespace-nowrap">
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

      <AvatarPreviewModal 
        isOpen={!!previewingAvatar} 
        onClose={() => setPreviewingAvatar(null)}
        avatarUrl={previewingAvatar?.url}
        avatarId={previewingAvatar?.id}
        name={previewingAvatar?.name}
      />
    </main>
  );
}
