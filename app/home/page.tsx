"use client";

import { useUser } from "../../hooks/useUser";
import { calculateLevel } from "../../lib/gameLogic";
import { RankPlate } from "../../components/ui/RankPlate";
import { Button } from "../../components/ui/Button";
import { LoadingScreen } from "../../components/ui/LoadingScreen";
import { RaidBoss } from "../../components/game/RaidBoss";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { storage } from "../../lib/storage";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const AvatarPreviewModal = dynamic(() => import("../../components/ui/AvatarPreviewModal").then(mod => mod.AvatarPreviewModal), { ssr: false });
const EquipmentPreviewModal = dynamic(() => import("../../components/ui/EquipmentPreviewModal").then(mod => mod.EquipmentPreviewModal), { ssr: false });
import { MATH_SKILLS } from "../../lib/mathData";
import { getScienceCategories } from "../../lib/scienceData";
import { getSocialCategories } from "../../lib/socialData";
import { ThemeBackground } from "../../components/ui/ThemeBackground";
import { KanjiEffect } from "../../components/game/KanjiEffect";
import { hasUnclaimedAchievements } from "../../lib/achievementLogic";
import { getCurrentJSTDateString, isDueForReview } from "../../lib/reviewSchedule";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { CategoryGradePicker } from "../../components/home/CategoryGradePicker";
import { UpdateNews } from "../../components/home/UpdateNews";

export default function Home() {
  const { userData, updateUserData, loading, isGuest } = useUser();
  const router = useRouter();
  const [mode, setMode] = useState<"4choice" | "keyboard">("4choice");
  const [subject, setSubject] = useState<"kanji" | "math" | "science" | "social">("kanji");
  const [isAnimating, setIsAnimating] = useState(false);
  const [targetGrades, setTargetGrades] = useState<number[]>([1]);
  const [targetMathSkills, setTargetMathSkills] = useState<string[]>([]);
  const [targetScienceCategories, setTargetScienceCategories] = useState<string[]>([]);
  const [targetSocialCategories, setTargetSocialCategories] = useState<string[]>([]);
  const [previewingAvatar, setPreviewingAvatar] = useState<{url?: string, id?: string, name?: string} | null>(null);
  const [previewingEquipmentModal, setPreviewingEquipmentModal] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [gradeBossLevel, setGradeBossLevel] = useState<number>(1);
  // targetGrades の自動初期化は最初の1回だけ行う。userData 参照は裏の書き込み
  // （ログインストリーク更新など）のたびに変わるため、「初期値[1]のまま」を
  // 判定条件にすると、ユーザーが意図的に「1年のみ」を選んだ場合も毎回上書きされてしまう。
  const gradesInitialized = useRef(false);

  useEffect(() => {
    if (userData) {
      if (!gradesInitialized.current) {
        gradesInitialized.current = true;
        setTargetGrades([userData.grade]);
      }
      if (targetMathSkills.length === 0) {
        const savedMathSkills = storage.getMathSkills();
        if (savedMathSkills && savedMathSkills.length > 0) {
          setTargetMathSkills(savedMathSkills);
        } else {
          const skills = MATH_SKILLS.filter(s => s.grade === userData.grade).map(s => s.id);
          setTargetMathSkills(skills.length > 0 ? skills : [MATH_SKILLS[0].id]);
        }
      }
      if (targetScienceCategories.length === 0) {
        const savedScienceCats = storage.getScienceCategories();
        if (savedScienceCats && savedScienceCats.length > 0) {
          setTargetScienceCategories(savedScienceCats);
        } else {
          const allScienceCats = getScienceCategories();
          const userScienceCats = allScienceCats.filter(c => c.grade === userData.grade).map(c => c.id);
          setTargetScienceCategories(userScienceCats.length > 0 ? userScienceCats : allScienceCats.map(c => c.id));
        }
      }
      if (targetSocialCategories.length === 0) {
        const savedSocialCats = storage.getSocialCategories();
        if (savedSocialCats && savedSocialCats.length > 0) {
          setTargetSocialCategories(savedSocialCats);
        } else {
          const allSocialCats = getSocialCategories();
          const userSocialCats = allSocialCats.filter(c => c.grade === userData.grade).map(c => c.id);
          setTargetSocialCategories(userSocialCats.length > 0 ? userSocialCats : allSocialCats.map(c => c.id));
        }
      }
    }
    setMode(storage.getAnswerMode() as "4choice" | "keyboard");
  }, [userData]);

  useEffect(() => {
    if (targetMathSkills.length > 0) {
      storage.setMathSkills(targetMathSkills);
    }
  }, [targetMathSkills]);

  useEffect(() => {
    if (targetScienceCategories.length > 0) {
      storage.setScienceCategories(targetScienceCategories);
    }
  }, [targetScienceCategories]);

  useEffect(() => {
    if (targetSocialCategories.length > 0) {
      storage.setSocialCategories(targetSocialCategories);
    }
  }, [targetSocialCategories]);

  useEffect(() => {
    const fetchGradeStats = async () => {
      if (!userData) return;
      try {
        if (isGuest) {
          const localLv = parseInt(localStorage.getItem("kq_raid_level_" + userData.grade) || "1", 10);
          setGradeBossLevel(localLv);
        } else {
          const ref = doc(db, "globalStats", "raidBoss_" + userData.grade);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            setGradeBossLevel(snap.data().level || 1);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchGradeStats();
  }, [userData, isGuest]);

  if (loading) return <LoadingScreen />;
  if (!userData) {
    router.push("/");
    return null;
  }

  const { level, currentLevelXp, nextLevelRequiredXp } = calculateLevel(userData.xp);
  const xpPercent = nextLevelRequiredXp === 0 ? 100 : (currentLevelXp / nextLevelRequiredXp) * 100;

  // 分散学習: 苦手問題は「今日が復習日」のものだけを克服バトルの対象数として見せる
  const todayStr = getCurrentJSTDateString();
  const nextReviewMap = userData.mistakeNextReview || {};
  const isDue = (id: string) => isDueForReview(nextReviewMap[id], todayStr);

  const allMistakeIds = userData.mistakeIds || [];
  const kanjiMistakeIds = allMistakeIds.filter(id => !id.startsWith("math_") && !id.startsWith("sci_") && !id.startsWith("soc_"));
  const mathMistakeIds = allMistakeIds.filter(id => id.startsWith("math_"));
  const scienceMistakeIds = allMistakeIds.filter(id => id.startsWith("sci_"));
  const socialMistakeIds = allMistakeIds.filter(id => id.startsWith("soc_"));

  const kanjiMistakes = kanjiMistakeIds.filter(isDue).length;
  const mathMistakes = mathMistakeIds.filter(isDue).length;
  const scienceMistakes = scienceMistakeIds.filter(isDue).length;
  const socialMistakes = socialMistakeIds.filter(isDue).length;
  const hasAnyMistakesNotDue = allMistakeIds.length > 0 && kanjiMistakes + mathMistakes + scienceMistakes + socialMistakes === 0;

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
                <div className="text-xs text-amber-300 font-bold">★漢字・算数はXP・PT3倍！★</div>
              </Button>
            </div>
            {(subject === "science" || subject === "social") && (
              <div className="text-xs text-slate-400 font-bold text-center mt-2">
                ※ 理科・社会は4択ボタン専用です（キーボードボーナス対象外）
              </div>
            )}
          </div>

          {/* Subject Selection */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-600 shadow-inner">
             <h3 className="text-xl font-black text-amber-200 drop-shadow-md mb-4 text-center border-b border-slate-700 pb-2 whitespace-nowrap">かもく</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
               <Button 
                 variant={subject === "kanji" ? "primary" : "outline"} 
                 className="text-base md:text-lg py-3 whitespace-nowrap"
                 onClick={() => setSubject("kanji")}
               >
                 📝 漢字
               </Button>
               <Button 
                 variant={subject === "math" ? "primary" : "outline"} 
                 className="text-base md:text-lg py-3 whitespace-nowrap"
                 onClick={() => setSubject("math")}
               >
                 🔢 算数
               </Button>
               <Button 
                 variant={subject === "science" ? "primary" : "outline"} 
                 className="text-base md:text-lg py-3 whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 border-emerald-500"
                 onClick={() => setSubject("science")}
               >
                 🔬 理科・生活 (SP)
               </Button>
               <Button 
                 variant={subject === "social" ? "primary" : "outline"} 
                 className="text-base md:text-lg py-3 whitespace-nowrap bg-orange-600 hover:bg-orange-700 border-orange-500"
                 onClick={() => setSubject("social")}
               >
                 🗺️ 社会・生活 (SP)
               </Button>
             </div>

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

             {subject === "science" && (
                <CategoryGradePicker
                  categories={getScienceCategories()}
                  selected={targetScienceCategories}
                  setSelected={setTargetScienceCategories}
                  gradeLabel={g => g <= 2 ? `${g}年生（生活科・自然）` : `${g}年生`}
                  headingColorClass="text-emerald-300"
                  chipSelectedClass="bg-emerald-600 text-white border-emerald-800"
                />
             )}

             {subject === "social" && (
                <CategoryGradePicker
                  categories={getSocialCategories()}
                  selected={targetSocialCategories}
                  setSelected={setTargetSocialCategories}
                  gradeLabel={g => g <= 2 ? `${g}年生（生活科・まち）` : `${g}年生`}
                  headingColorClass="text-orange-300"
                  chipSelectedClass="bg-orange-600 text-white border-orange-800"
                />
             )}

             {subject === "math" && (
                <CategoryGradePicker
                  categories={MATH_SKILLS}
                  selected={targetMathSkills}
                  setSelected={setTargetMathSkills}
                  gradeLabel={g => `${g}年生`}
                  headingColorClass="text-blue-200"
                  chipSelectedClass="bg-blue-500 text-white border-blue-800"
                />
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
                } else if (subject === "math") {
                  router.push(`/game?subject=math&skills=${targetMathSkills.join(",")}&count=${questionCount}`);
                } else if (subject === "science") {
                  router.push(`/game?subject=science&categories=${encodeURIComponent(targetScienceCategories.join(","))}&count=${questionCount}`);
                } else if (subject === "social") {
                  router.push(`/game?subject=social&categories=${encodeURIComponent(targetSocialCategories.join(","))}&count=${questionCount}`);
                }
              }} 
              className={`w-full text-xl md:text-3xl h-20 shadow-lg group relative overflow-hidden whitespace-nowrap ${
                subject === 'math' ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30 border-blue-700' :
                subject === 'science' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30 border-emerald-700' :
                subject === 'social' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30 border-orange-700' :
                'shadow-orange-500/30'
              }`}
            >
              {subject === "kanji" ? "漢字バトルへ出発！" :
               subject === "math" ? "算数バトルへ出発！" :
               subject === "science" ? "理科バトルへ出発！（SP GET）" :
               "社会バトルへ出発！（SP GET）"}
              <motion.span 
                className="absolute right-4 text-4xl opacity-50 group-hover:opacity-100 transition-opacity"
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                {subject === "kanji" ? "⚔️" : subject === "math" ? "🔢" : subject === "science" ? "🔬" : "🗺️"}
              </motion.span>
            </Button>
            
                {kanjiMistakes > 0 || mathMistakes > 0 || scienceMistakes > 0 || socialMistakes > 0 ? (
              <div className="flex flex-col md:flex-row gap-4">
                {kanjiMistakes > 0 ? (
                  <Button variant="danger" size="lg" onClick={() => router.push(`/game?subject=kanji&revenge=true`)} className="flex-1 h-16 text-md animate-pulse shadow-red-500/30 whitespace-nowrap">
                    🔥 漢字 きょうのふくしゅう ({kanjiMistakes})
                  </Button>
                ) : <div className="flex-1 hidden md:block"></div>}

                {mathMistakes > 0 ? (
                  <Button variant="danger" size="lg" onClick={() => router.push(`/game?subject=math&revenge=true`)} className="flex-1 h-16 text-md animate-pulse shadow-red-500/30 whitespace-nowrap">
                    🔥 算数 きょうのふくしゅう ({mathMistakes})
                  </Button>
                ) : <div className="flex-1 hidden md:block"></div>}
              </div>
            ) : hasAnyMistakesNotDue ? (
              <Button variant="ghost" size="lg" disabled className="h-16 text-sm md:text-lg bg-slate-200/50 text-slate-500 border-2 border-slate-300/50 opacity-80 cursor-not-allowed whitespace-nowrap">
                📅 きょうの ふくしゅうは ないよ・またあとで きてね
              </Button>
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
              equipment={userData.equippedEquipment}
              onAvatarClick={(url, id) => setPreviewingAvatar({url, id, name: userData.name})}
              onEquipmentClick={(eqId) => eqId && setPreviewingEquipmentModal(eqId)}
              isMvp={userData.totalDamage > 0}
              onSettingsClick={() => router.push("/profile")}
            />
          </div>
          
          <div className="game-panel p-5 flex-1 flex flex-col justify-between gap-4 min-w-0">
            <div className="flex items-center justify-between gap-2.5 flex-wrap border-b border-slate-700/40 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="bg-primary text-white font-black px-3 py-1.5 rounded-full text-xs sm:text-sm shadow-md border-2 border-blue-400 flex items-center whitespace-nowrap">
                  しょうがく {userData.grade} ねんせい
                </div>
                <div className="bg-slate-900/90 text-amber-300 font-black px-3 py-1.5 rounded-full text-xs sm:text-sm shadow-sm border border-amber-400/50 flex items-center gap-1 whitespace-nowrap">
                  <span>🔥</span> {userData.loginStreak || 1}日れんぞく
                </div>
              </div>
              <div className="flex items-center gap-1.5 ml-auto flex-wrap">
                <button onClick={() => router.push("/profile")} className="game-panel-light flex justify-center items-center gap-1 px-2.5 py-1.5 rounded-xl hover:scale-105 transition-all border-2 border-indigo-400/80 bg-indigo-50/90 whitespace-nowrap shadow-sm">
                  <span className="text-sm">📊</span>
                  <span className="font-black text-indigo-900 text-xs sm:text-sm">カルテ</span>
                </button>
                <button onClick={() => router.push("/shop")} className="game-panel-light flex justify-center items-center gap-1 px-2.5 py-1.5 rounded-xl hover:scale-105 transition-all border-2 whitespace-nowrap">
                  <span className="text-sm">🛍️</span>
                  <span className="font-black text-slate-800 text-xs sm:text-sm">ショップ</span>
                </button>
                <button onClick={() => router.push("/achievements")} className="game-panel-light flex justify-center items-center gap-1 px-2.5 py-1.5 rounded-xl hover:scale-105 transition-all border-2 whitespace-nowrap relative">
                  <span className="text-sm">🏆</span>
                  <span className="font-black text-slate-800 text-xs sm:text-sm">じっせき</span>
                  {hasUnclaimedAchievements(userData, gradeBossLevel) && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white shadow-sm"></span>
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-900/90 border border-amber-400/50 px-3 py-2 rounded-xl flex items-center justify-between shadow-inner min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-base flex-shrink-0">⭐</span>
                  <span className="text-xs sm:text-sm font-black text-amber-400 tracking-tight truncate">{userData.pt.toLocaleString()}</span>
                </div>
                <span className="text-[10px] sm:text-xs font-black text-amber-500 ml-1 flex-shrink-0">PT</span>
              </div>

              <div className="bg-slate-900/90 border border-emerald-400/50 px-3 py-2 rounded-xl flex items-center justify-between shadow-inner min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-base flex-shrink-0">🧪</span>
                  <span className="text-xs sm:text-sm font-black text-emerald-400 tracking-tight truncate">{(userData.sp || 0).toLocaleString()}</span>
                </div>
                <span className="text-[10px] sm:text-xs font-black text-emerald-500 ml-1 flex-shrink-0">SP</span>
              </div>
            </div>

            <div>
              <div className="text-xs font-black text-amber-200 mb-1.5 drop-shadow-md whitespace-nowrap">けいけんち (XP)</div>
              <div className="w-full bg-gray-200/80 rounded-full h-5 overflow-hidden relative shadow-inner border-2 border-white/50">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-gradient-to-r from-blue-400 to-primary h-full"
                ></motion.div>
                <div className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-white drop-shadow-md whitespace-nowrap">
                  {currentLevelXp} / {nextLevelRequiredXp || "MAX"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. その他のメニュー */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="primary" onClick={() => router.push("/encyclopedia")} className="h-full text-xl flex flex-col items-center justify-center gap-2 py-4 whitespace-nowrap">
            <span className="text-4xl">📖</span> かんじ図鑑
          </Button>
          <Button variant="primary" onClick={() => router.push("/ranking")} className="h-full text-xl flex items-center justify-center gap-2 py-4 whitespace-nowrap">
            <span className="text-3xl">👑</span> こんしゅうのヒーロー
          </Button>
        </div>


        {/* 4. お知らせと広告 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 mb-4">
          {/* Update News */}
          <UpdateNews />

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

        <div className="text-center mt-8 mb-4">
          <button
            onClick={() => router.push("/parent")}
            className="text-xs text-slate-400 hover:text-slate-200 font-bold underline underline-offset-2 transition-colors"
          >
            👨‍👩‍👧 保護者・先生の方はこちら
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

      <EquipmentPreviewModal
        isOpen={!!previewingEquipmentModal}
        onClose={() => setPreviewingEquipmentModal(null)}
        equipmentId={previewingEquipmentModal}
      />
    </main>
  );
}
