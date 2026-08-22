"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getRandomQuestions, getRevengeQuestions, KanjiQuestion } from "../../lib/kanjiData";
import { getRandomMathQuestions, getRevengeMathQuestions, MathQuestion } from "../../lib/mathData";
import { getRandomScienceQuestions, getRevengeScienceQuestions, ScienceQuestion } from "../../lib/scienceData";
import { getRandomSocialQuestions, getRevengeSocialQuestions, SocialQuestion } from "../../lib/socialData";
import { getRaidBossImagePath, getCurrentJSTMonth, getCurrentJSTWeekString } from "../../lib/raidLogic";
import { storage } from "../../lib/storage";
import { db } from "../../lib/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import { useUser } from "../../hooks/useUser";
import { Button } from "../../components/ui/Button";
import { AnswerOptions } from "../../components/game/AnswerOptions";
import { KeyboardInput } from "../../components/game/KeyboardInput";
import { KanjiEffect } from "../../components/game/KanjiEffect";
import { motion, AnimatePresence } from "framer-motion";
import { soundManager } from "../../lib/soundManager";

export default function GamePage() {
  const router = useRouter();
  const { userData, updateUserData, loading } = useUser();
  const [questions, setQuestions] = useState<(KanjiQuestion | MathQuestion | ScienceQuestion | SocialQuestion)[]>([]);
  const [isMath, setIsMath] = useState(false);
  const [subjectType, setSubjectType] = useState<"kanji" | "math" | "science" | "social">("kanji");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<"4choice" | "keyboard">("4choice");
  const [isFinished, setIsFinished] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const isSubmittingRef = useRef(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  
  // Game states
  const [totalMistakes, setTotalMistakes] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const newMastered = useRef<Set<string>>(new Set());
  const newMistakes = useRef<Set<string>>(new Set());
  const [unlockedMastery, setUnlockedMastery] = useState(false);
  
  // Review Mode & Boss Mode
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isRevenge, setIsRevenge] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [bossLevel, setBossLevel] = useState(1);

  useEffect(() => {
    if (userData?.grade) {
      const fetchBossLevel = async () => {
        const currentMonth = getCurrentJSTMonth();
        if (storage.isGuest()) {
          let level = parseInt(localStorage.getItem("kq_raid_level_" + userData.grade) || "1", 10);
          const month = localStorage.getItem("kq_raid_month_" + userData.grade) || currentMonth;
          if (month !== currentMonth) level = 1;
          setBossLevel(level);
        } else {
          try {
            const { getDoc, doc } = await import("firebase/firestore");
            const { db } = await import("../../lib/firebase");
            const snap = await getDoc(doc(db, "globalStats", "raidBoss_" + userData.grade));
            if (snap.exists()) {
              const data = snap.data();
              if (data.month === currentMonth) {
                setBossLevel(data.level || 1);
              } else {
                setBossLevel(1);
              }
            }
          } catch(e) {}
        }
      };
      fetchBossLevel();
    }
  }, [userData?.grade]);

  useEffect(() => {
    if (userData && questions.length === 0) {
      const params = new URLSearchParams(window.location.search);
      const gradesParam = params.get("grades");
      const countParam = params.get("count");
      const revengeParam = params.get("revenge") === "true";
      
      setIsRevenge(revengeParam);

      const subjectParam = (params.get("subject") || "kanji") as "kanji" | "math" | "science" | "social";
      setSubjectType(subjectParam);
      const isMathMode = subjectParam === "math";
      setIsMath(isMathMode);

      const trainingParam = params.get("training") === "true";
      setIsTraining(trainingParam);

      const categoryParam = params.get("category") as "calc" | "logic" | "geometry" | null;

      if (revengeParam) {
        if (subjectParam === "math") {
          const revQ = getRevengeMathQuestions(userData.mistakeIds, 10);
          if (revQ.length === 0) {
            alert("にがてな算数の問題は まだ ありません！");
            router.push("/home");
            return;
          }
          setQuestions(revQ);
        } else if (subjectParam === "science") {
          const revQ = getRevengeScienceQuestions(userData.mistakeIds, 10);
          if (revQ.length === 0) {
            alert("にがてな理科の問題は まだ ありません！");
            router.push("/home");
            return;
          }
          setQuestions(revQ);
        } else if (subjectParam === "social") {
          const revQ = getRevengeSocialQuestions(userData.mistakeIds, 10);
          if (revQ.length === 0) {
            alert("にがてな社会の問題は まだ ありません！");
            router.push("/home");
            return;
          }
          setQuestions(revQ);
        } else {
          const revQ = getRevengeQuestions(userData.mistakeIds, 10); // リベンジは最大10問
          if (revQ.length === 0) {
            alert("にがてな漢字は まだ ありません！");
            router.push("/home");
            return;
          }
          setQuestions(revQ);
        }
      } else {
        const targetGrades = gradesParam ? gradesParam.split(",").map(Number) : [userData.grade];
        const targetCount = countParam ? parseInt(countParam, 10) : 5;
        if (subjectParam === "math") {
          const skillsParam = params.get("skills");
          const targetSkills = skillsParam ? decodeURIComponent(skillsParam).split(",") : [];
          setQuestions(getRandomMathQuestions(targetSkills, targetCount, targetGrades[0] || userData.grade, categoryParam || undefined));
        } else if (subjectParam === "science") {
          const categoriesParam = params.get("categories");
          if (categoriesParam) {
            const targetCategories = decodeURIComponent(categoriesParam).split(",");
            setQuestions(getRandomScienceQuestions(targetCategories, targetCount));
          } else {
            setQuestions(getRandomScienceQuestions(targetGrades, targetCount));
          }
        } else if (subjectParam === "social") {
          const categoriesParam = params.get("categories");
          if (categoriesParam) {
            const targetCategories = decodeURIComponent(categoriesParam).split(",");
            setQuestions(getRandomSocialQuestions(targetCategories, targetCount));
          } else {
            setQuestions(getRandomSocialQuestions(targetGrades, targetCount));
          }
        } else {
          setQuestions(getRandomQuestions(targetGrades, targetCount));
        }
      }
    }
    const savedMode = storage.getAnswerMode() as "4choice" | "keyboard";
    const params = new URLSearchParams(window.location.search);
    const sub = params.get("subject") || subjectType;
    if (sub === "science" || sub === "social") {
      setMode("4choice");
    } else {
      setMode(savedMode);
    }
  }, [userData, questions.length, subjectType]);

  const isBossBattle = questions.length >= 5 && currentIndex === questions.length - 1 && !isRevenge;

  useEffect(() => {
    if (isBossBattle && !isReviewMode && !feedback && !isFinished && questions.length > 0) {
      if (timeLeft <= 0) {
        handlePass(); // Time up counts as wrong/pass
        return;
      }
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [isBossBattle, isReviewMode, feedback, isFinished, timeLeft, questions.length]);

  const multiplier = 1 + (maxCombo * 0.1);
  const revengeBonus = isRevenge ? 2.0 : 1.0;
  const keyboardBonus = (mode === "keyboard" && subjectType !== "science" && subjectType !== "social") ? 3.0 : 1.0;

  const { finalXP, finalPT, hasPenalty } = useMemo(() => {
    let baseXP = 0;
    let basePT = 0;
    let penalty = false;

    const userGrade = userData?.grade || 1;
    const isLowerGradeMandatory = (subjectType === "science" || subjectType === "social") && userGrade < 3;

    questions.forEach(q => {
      const isExemptFromPenalty = isRevenge || isTraining || isLowerGradeMandatory;
      if (!isExemptFromPenalty && q.grade < userGrade) {
        if (subjectType === "science" || subjectType === "social") {
          baseXP += 5;
          basePT += 3;
        } else {
          baseXP += 1;
          basePT += 0;
          penalty = true;
        }
      } else {
        baseXP += 10;
        basePT += 5;
      }
    });

    const penaltyXP = totalMistakes * 5;
    const penaltyPT = totalMistakes * 2;
    
    return {
      finalXP: Math.max(0, Math.floor((baseXP - penaltyXP) * multiplier * revengeBonus * keyboardBonus)),
      finalPT: Math.max(0, Math.floor((basePT - penaltyPT) * multiplier * revengeBonus * keyboardBonus)),
      hasPenalty: penalty
    };
  }, [questions, isRevenge, isTraining, userData?.grade, totalMistakes, multiplier, revengeBonus, keyboardBonus, subjectType]);

  if (loading || questions.length === 0) return <div>ロード中...</div>;

  const currentQ = questions[currentIndex];

  const renderMathWord = (word: string) => {
    const parts = word.split(/([➕➖✖️➗＝＝])/);
    return (
      <span className="flex items-center justify-center flex-wrap gap-1 md:gap-2">
        {parts.map((part, idx) => {
          if (["➕", "➖", "✖️", "➗", "＝"].includes(part)) {
            return (
              <span key={idx} className="text-amber-500 font-extrabold mx-1 md:mx-2 scale-110 inline-block drop-shadow">
                {part}
              </span>
            );
          }
          return <span key={idx} className="mx-2">{part}</span>;
        })}
      </span>
    );
  };

  const nextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(curr => curr + 1);
      setIsReviewMode(false);
    } else {
      finishGame();
    }
  };

  const checkIsCorrect = (userAns: string, targetReading: string) => {
    if (userAns === targetReading) return true;
    const cleanUser = userAns.replace(/[０-９]/g, m => String.fromCharCode(m.charCodeAt(0) - 0xfee0)).trim().toLowerCase();
    const cleanTarget = targetReading.replace(/[０-９]/g, m => String.fromCharCode(m.charCodeAt(0) - 0xfee0)).trim().toLowerCase();
    if (cleanUser === cleanTarget) return true;

    if (subjectType === "math") {
      const strip = (s: string) => s.replace(/(km\/時|km\/h|km|m|cm|mm|kg|g|t|l|dl|ml|度|こ|個|本|人|まい|枚|円|日|班|倍|点|通り|km²|cm²|m²|ha|a|cm³|m³|時|分|秒|時速|分速|秒速)/g, '').trim();
      const s1 = strip(cleanUser);
      const s2 = strip(cleanTarget);
      if (s1 && s2 && s1 === s2) return true;
    }
    return false;
  };

  const handleAnswer = (ans: string) => {
    if (isSubmittingRef.current || isFinishing) return;
    const isCorrect = checkIsCorrect(ans, currentQ.reading);

    if (isReviewMode) {
      if (isCorrect) {
        soundManager.playCorrect();
        nextQuestion();
      } else {
        soundManager.playIncorrect();
        setFeedback("incorrect");
        setTimeout(() => setFeedback(null), 1000);
      }
      return;
    }

    const questionIdentifier = ('id' in currentQ && currentQ.id) ? currentQ.id : currentQ.word;

    if (isCorrect) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setMaxCombo(c => Math.max(c, nextCombo));
      newMastered.current.add(questionIdentifier);
      newMastered.current.add(currentQ.word);
      
      if (nextCombo >= 3) {
        soundManager.playCombo(nextCombo);
      } else {
        soundManager.playCorrect();
      }

      setFeedback("correct");
      setTimeout(() => {
        setFeedback(null);
        nextQuestion();
      }, 1000);
    } else {
      soundManager.playIncorrect();
      setCombo(0);
      setTotalMistakes(m => m + 1);
      newMistakes.current.add(questionIdentifier);
      setFeedback("incorrect");
      if (subjectType === "science" || subjectType === "social" || ('rationale' in currentQ && currentQ.rationale)) {
        setIsReviewMode(true);
      } else {
        setTimeout(() => setFeedback(null), 1000);
      }
    }
  };

  const handlePass = () => {
    if (isSubmittingRef.current || isFinishing) return;
    soundManager.playIncorrect();
    const questionIdentifier = ('id' in currentQ && currentQ.id) ? currentQ.id : currentQ.word;
    setCombo(0);
    setTotalMistakes(m => m + 1);
    newMistakes.current.add(questionIdentifier);
    setIsReviewMode(true);
  };

  const finishGame = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsFinishing(true);
    soundManager.playLevelUp();

    try {
      if (userData) {
        const updatedMastered = Array.from(new Set([...userData.masteredIds, ...Array.from(newMastered.current)]));
        
        // Check for Mastery Unlocks
        const { getAllKanji } = await import("../../lib/kanjiData");
        const allKanji = getAllKanji();
        const validKanjiWords = new Set(allKanji.map(k => k.kanji));
        
        // 苦手リストから存在しない問題や、今回マスターした問題を除外
        let updatedMistakes = Array.from(new Set([...(userData.mistakeIds || []), ...Array.from(newMistakes.current)]));
        updatedMistakes = updatedMistakes.filter(id => {
          if (!id || typeof id !== "string" || id.trim() === "") return false;
          if (newMastered.current.has(id)) return false;
          // 算数、理科、社会のプレフィックス
          if (id.startsWith("math_") || id.startsWith("sci_") || id.startsWith("soc_")) {
            return true;
          }
          // 漢字
          return validKanjiWords.has(id);
        });

        const newTitles = new Set(userData.titles || []);
        const newAvatars = new Set(userData.avatars || []);
        let newlyMastered = false;

        [1, 2, 3, 4, 5, 6].forEach(g => {
          const gradeKanji = allKanji.filter(k => k.grade === g);
          const masteredCount = gradeKanji.filter(k => updatedMastered.includes(k.kanji)).length;
          if (masteredCount === gradeKanji.length && gradeKanji.length > 0) {
             const title = `${g}年生マスター`;
             const avatar = g === 6 ? "🏆" : "🏅";
             if (!newTitles.has(title)) {
               newTitles.add(title);
               newlyMastered = true;
             }
             if (!newAvatars.has(avatar)) {
               newAvatars.add(avatar);
               newlyMastered = true;
             }
          }
        });

        if (newlyMastered) {
          setUnlockedMastery(true);
        }

        const currentWeekString = getCurrentJSTWeekString();
        const newWeeklyXp = (userData.lastWeekString === currentWeekString ? (userData.weeklyXp || 0) : 0) + finalXP;
        
        const currentMonthString = getCurrentJSTMonth();
        const newMonthlyDamage = (userData.lastMonthString === currentMonthString ? (userData.monthlyDamage || 0) : 0) + finalXP;

        const isSpSubject = subjectType === "science" || subjectType === "social";

        const params = new URLSearchParams(window.location.search);
        const catParam = params.get("category");
        let currentSolvedCategory = isSpSubject 
          ? (subjectType === "science" ? "science" : "social")
          : (subjectType === "kanji" ? "kanji" : (catParam || "calc"));
        
        if (subjectType === "math" && !catParam && questions.length > 0) {
          const mathCategoriesCount: Record<string, number> = { calc: 0, logic: 0, geometry: 0 };
          questions.forEach(q => {
            if ('category' in q && q.category && mathCategoriesCount[q.category] !== undefined) {
              mathCategoriesCount[q.category]++;
            }
          });
          let maxCat = "calc";
          let maxCount = -1;
          Object.entries(mathCategoriesCount).forEach(([cat, cnt]) => {
            if (cnt > maxCount) {
              maxCount = cnt;
              maxCat = cat;
            }
          });
          currentSolvedCategory = maxCat;
        }
        
        const prevCategorySolved = userData.categorySolved || {};
        const correctQuestionsCount = Math.max(1, questions.length - totalMistakes);
        const updatedCategorySolved = {
          ...prevCategorySolved,
          [currentSolvedCategory]: (prevCategorySolved[currentSolvedCategory] || 0) + correctQuestionsCount
        };

        await updateUserData({
          xp: userData.xp + finalXP,
          pt: isSpSubject ? userData.pt : userData.pt + finalPT,
          sp: isSpSubject ? (userData.sp || 0) + finalPT : (userData.sp || 0),
          masteredIds: updatedMastered,
          mistakeIds: updatedMistakes,
          categorySolved: updatedCategorySolved,
          totalDamage: (userData.totalDamage || 0) + finalXP,
          monthlyDamage: newMonthlyDamage,
          lastMonthString: currentMonthString,
          weeklyXp: newWeeklyXp,
          lastWeekString: currentWeekString,
          titles: Array.from(newTitles),
          avatars: Array.from(newAvatars),
        });

        // レイドボスにダメージを与える
        if (finalXP > 0) {
          const { dealDamageToRaidBoss } = await import("../../lib/raidLogic");
          await dealDamageToRaidBoss(finalXP, userData?.grade || 1);
        }
      }
    } catch (err) {
      console.error("Failed to finish game and update data:", err);
    } finally {
      setIsFinishing(false);
      setIsFinished(true);
    }
  };

  const isSpSubject = subjectType === "science" || subjectType === "social";

  if (isFinishing) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="game-panel p-8 max-w-sm w-full text-center flex flex-col items-center gap-4">
          <div className="text-5xl animate-spin">⏳</div>
          <div className="text-xl font-black text-amber-300">けっかを ほぞん中...</div>
        </div>
      </main>
    );
  }

  if (isFinished) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="game-panel p-12 max-w-md w-full text-center"
        >
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-amber-500 mb-6 drop-shadow-game text-outline">
            クリア！
          </h1>
          {unlockedMastery && (
            <div className="bg-yellow-100 border-4 border-yellow-400 text-yellow-800 p-4 rounded-2xl mb-6 font-black animate-pulse">
              🎉 すごい！学年マスター達成！<br/>
              かくし称号とアバターをゲットしたよ！
            </div>
          )}
          {isRevenge && (
            <div className="text-xl font-black text-orange-500 mb-2 animate-bounce">
              🔥リベンジボーナス x2🔥
            </div>
          )}
          {mode === "keyboard" && (
            <div className="text-xl font-black text-pink-500 mb-4 animate-bounce">
              ⌨️ キーボードボーナス x3! ⌨️
            </div>
          )}
          {maxCombo > 2 && (
            <div className="text-lg font-bold text-amber-500 mb-2">
              最大コンボ: {maxCombo} (倍率 x{(1 + maxCombo * 0.1).toFixed(1)})
            </div>
          )}
          {totalMistakes > 0 && (
            <div className="text-lg font-bold text-red-500 mb-4 bg-red-50 p-2 rounded-xl">
              まちがえた回数: {totalMistakes} 回
            </div>
          )}
          {hasPenalty && (
            <div className="text-sm font-bold text-blue-500 mb-4 bg-blue-50 p-2 rounded-xl border border-blue-200">
              ℹ️ 自分の学年より下の問題があったため、もらえる経験値が少なくなったよ！
            </div>
          )}
          <div className="text-4xl font-black mb-4 text-cyan-400 drop-shadow-md">+ {finalXP} XP</div>
          <div className={`text-3xl font-black mb-10 drop-shadow-sm ${isSpSubject ? 'text-emerald-400' : 'text-amber-500'}`}>
            + {finalPT} {isSpSubject ? 'SP' : 'PT'}
          </div>
          
          <Button size="lg" className="w-full text-2xl py-6" variant="fun" onClick={() => router.push("/home")}>
            ホームにもどる
          </Button>
        </motion.div>
      </main>
    );
  }

  const currentMonth = new Date().getMonth() + 1;
  const bossIcon = currentMonth === 10 ? "🎃" : currentMonth === 12 ? "⛄" : "🐲";

  return (
    <main className={`min-h-screen p-4 flex flex-col relative overflow-hidden transition-colors duration-1000 ${
      isBossBattle && !isFinished && userData?.scaryMode ? 'text-red-50' : ''
    }`}>
      {isBossBattle && !isFinished && !userData?.scaryMode && (
        <div className="absolute inset-0 bg-red-900/40 pointer-events-none z-0"></div>
      )}
      
      {/* Boss Fullscreen Background */}
      <AnimatePresence>
        {isBossBattle && !isFinished && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-0 pointer-events-none"
          >
            {/* Background Image with pulsing shake (only if scary mode) */}
            <motion.div 
              animate={userData?.scaryMode ? { 
                scale: [1, 1.02, 1],
                rotate: timeLeft <= 3 ? [-1, 1, -1, 1, 0] : [0, 0.5, -0.5, 0]
              } : { scale: 1, rotate: 0 }}
              transition={{ 
                scale: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                rotate: timeLeft <= 3 ? { repeat: Infinity, duration: 0.1 } : { repeat: Infinity, duration: 4, ease: "easeInOut" }
              }}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url('${getRaidBossImagePath(bossLevel, !!userData?.scaryMode)}')` }}
            />
            {/* Dark/Red Overlay to make text readable and add scary vibe */}
            {userData?.scaryMode ? (
              <motion.div 
                animate={{ opacity: [0.6, 0.8, 0.6] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-t from-black via-red-950/80 to-black/90 mix-blend-multiply"
              />
            ) : (
              <div className="absolute inset-0 bg-black/40" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col z-10 relative">
      
      {/* 上部ヘッダー（やめるボタン ＆ 進行状況） */}
      <div className="flex items-center justify-between w-full mb-4 z-20 relative">
        <button
          onClick={() => {
            if (window.confirm("ゲームをとちゅうで やめますか？\n（ホームにもどります）")) {
              router.push("/home");
            }
          }}
          className="bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-2 border-slate-600 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1 shadow-md hover:scale-105 transition-all"
        >
          <span>🏠</span> <span>やめる</span>
        </button>

        <div className={`font-black text-2xl sm:text-3xl tracking-widest px-6 sm:px-8 py-2 sm:py-3 rounded-full border-4 shadow-xl ${isBossBattle ? 'bg-red-900/80 text-red-100 border-red-500 text-outline' : 'bg-gradient-to-b from-blue-400 to-indigo-600 text-white border-blue-300 text-outline-dark'}`}>
          {currentIndex + 1} / {questions.length}
        </div>

        <div className="w-16 sm:w-20"></div>
      </div>

      {/* コンボ表示 */}
      <AnimatePresence>
        {combo >= 2 && !isBossBattle && (
          <motion.div 
            initial={{ scale: 0, opacity: 0, x: 50 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-24 right-4 md:right-12 text-3xl md:text-5xl font-black text-orange-500 drop-shadow-lg italic z-10"
          >
            {combo} <span className="text-xl md:text-3xl">COMBO🔥</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ.id}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          className="flex flex-col items-center w-full max-w-lg"
        >
          {/* 問題エリア */}
          <div className={`w-full rounded-[3rem] p-12 flex flex-col items-center mb-8 relative transition-all duration-500 ${
            isBossBattle 
              ? (userData?.scaryMode 
                  ? 'bg-black/80 border-4 border-red-500/80 shadow-[0_0_50px_rgba(220,38,38,0.5)] backdrop-blur-md' 
                  : 'game-panel-light border-red-400 shadow-[0_0_30px_rgba(220,38,38,0.3)]') 
              : 'game-panel-light'
          }`}>
            {isBossBattle && (
               <div className="absolute -top-14 text-red-600 font-black text-2xl md:text-3xl animate-pulse whitespace-nowrap drop-shadow-md">
                 ⚠️ ボスがあらわれた！ ⚠️
               </div>
            )}
            
            {isBossBattle && !userData?.scaryMode && (
               <div className="absolute top-12 opacity-30 pointer-events-none drop-shadow-md w-32 h-32 rounded-full overflow-hidden border-4 border-slate-300">
                 <img src={getRaidBossImagePath(bossLevel, false)} alt="boss" className="w-full h-full object-cover grayscale" />
               </div>
            )}
            
            {isBossBattle && (
              <div className="absolute top-4 w-full px-8">
                <div className="h-4 bg-gray-900 rounded-full overflow-hidden border-2 border-red-500/50">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeLeft / 10) * 100}%` }}
                    className="h-full bg-gradient-to-r from-red-600 to-orange-500"
                  />
                </div>
                <div className="text-center text-red-300 font-black text-sm mt-1">のこり {timeLeft} びょう</div>
              </div>
            )}

            {!isBossBattle && (
              <div className={`absolute -top-5 ${
                subjectType === "math" ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                subjectType === "science" ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-300' :
                subjectType === "social" ? 'bg-gradient-to-r from-orange-600 to-amber-600 border-orange-300' :
                'bg-gradient-to-r from-primary to-blue-500'
              } text-white font-black px-8 py-3 rounded-full shadow-lg text-lg border-2 border-white/50 z-20`}>
                {subjectType === "math" ? "さんすう もんだい" :
                 subjectType === "science" ? "りか もんだい" :
                 subjectType === "social" ? "しゃかい もんだい" :
                 ('type' in currentQ && currentQ.type === "onyomi" ? "音読み（カタカナ）" : "訓読み（ひらがな）")}
              </div>
            )}
            
            {/* Effect Layer */}
            {!isBossBattle && userData?.equippedEffect && (
              <KanjiEffect effect={userData.equippedEffect} />
            )}

            {(subjectType === "science" || subjectType === "social") ? (
              <div className="w-full my-4 px-2 sm:px-6 relative z-10">
                <div className="bg-slate-900/90 border-2 border-emerald-400/80 rounded-2xl p-4 sm:p-6 shadow-2xl text-left font-sans font-bold text-lg sm:text-2xl text-emerald-100 leading-relaxed tracking-wide">
                  {currentQ.word}
                </div>
              </div>
            ) : (
              <div className={`${isMath ? 'text-[70px] md:text-[90px] font-sans font-black' : 'text-[120px] font-serif'} leading-none drop-shadow-md my-4 relative z-10 ${isBossBattle ? (userData?.scaryMode ? 'text-red-100' : 'text-red-900') : 'text-slate-800'}`}>
                {isMath ? renderMathWord(currentQ.word) : currentQ.word}
                {'okurigana' in currentQ && currentQ.okurigana && (
                  <span className="text-[0.5em] opacity-80 font-sans ml-1 tracking-normal">{currentQ.okurigana}</span>
                )}
              </div>
            )}
          </div>

          {/* パス・不正解時の正解・解説表示 */}
          <AnimatePresence>
            {isReviewMode && (
              <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-6 bg-slate-900/95 border-4 border-amber-400 text-amber-100 p-6 rounded-3xl shadow-2xl text-left w-full relative z-30"
              >
                <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-3">
                  <span className="text-red-400 font-black text-xl flex items-center gap-1">❌ 不正解！</span>
                  <span className="text-xs text-slate-400 font-bold">解説を確認して次へ進もう</span>
                </div>

                <div className="text-lg font-bold text-slate-200 mb-3">
                  正解： <span className="text-2xl font-black text-amber-300">「{currentQ.reading}」</span>
                </div>

                {'rationale' in currentQ && currentQ.rationale && (
                  <div className="bg-slate-800/90 p-4 rounded-xl border border-amber-500/30 mb-4 text-sm sm:text-base text-slate-100 leading-relaxed font-sans">
                    <div className="font-bold text-amber-400 mb-1 flex items-center gap-1">
                      💡 <span>解説</span>
                    </div>
                    {currentQ.rationale}
                  </div>
                )}

                <Button 
                  variant="fun" 
                  size="lg" 
                  className="w-full text-xl py-3 border-2 border-amber-400 shadow-lg"
                  onClick={() => {
                    setFeedback(null);
                    nextQuestion();
                  }}
                >
                  つぎへ進む ➔
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 解答エリア */}
          <div className="w-full">
            {mode === "4choice" || subjectType === "science" || subjectType === "social" ? (
              <AnswerOptions 
                choices={currentQ.choices} 
                onAnswer={handleAnswer} 
                disabled={feedback !== null || isReviewMode}
              />
            ) : (
              <KeyboardInput 
                onAnswer={handleAnswer} 
                disabled={feedback !== null || isReviewMode}
                placeholder={subjectType === "math" ? "こたえをいれてね" : ('type' in currentQ && currentQ.type === "onyomi" ? "よみをカタカナでいれてね" : "よみをひらがなでいれてね")}
                isFraction={isMath && /^\d+\/\d+$/.test(currentQ.reading.trim())}
              />
            )}
          </div>

          {/* パスボタン */}
          {!isReviewMode && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 1 } }}
              className="mt-8"
            >
              <button 
                onClick={handlePass}
                disabled={feedback !== null}
                className={`font-bold underline transition-colors ${isBossBattle ? 'text-red-400 hover:text-red-300' : 'text-slate-400 hover:text-slate-600'}`}
              >
                わからない（パスする）
              </button>
            </motion.div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* フィードバック */}
      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`absolute inset-0 flex items-center justify-center pointer-events-none z-50`}
          >
            {feedback === "correct" ? (
              <div className="text-[150px] text-red-500 font-black drop-shadow-2xl">⭕️</div>
            ) : (
              <div className="text-[150px] text-blue-500 font-black drop-shadow-2xl">❌</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </main>
  );
}
