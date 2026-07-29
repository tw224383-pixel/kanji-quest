"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getRandomQuestions, getRevengeQuestions, KanjiQuestion } from "../../lib/kanjiData";
import { getRandomMathQuestions, getRevengeMathQuestions, MathQuestion } from "../../lib/mathData";
import { storage } from "../../lib/storage";
import { db } from "../../lib/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import { useUser } from "../../hooks/useUser";
import { Button } from "../../components/ui/Button";
import { AnswerOptions } from "../../components/game/AnswerOptions";
import { KeyboardInput } from "../../components/game/KeyboardInput";
import { KanjiEffect } from "../../components/game/KanjiEffect";
import { motion, AnimatePresence } from "framer-motion";

export default function GamePage() {
  const router = useRouter();
  const { userData, updateUserData, loading } = useUser();
  const [questions, setQuestions] = useState<(KanjiQuestion | MathQuestion)[]>([]);
  const [isMath, setIsMath] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<"4choice" | "keyboard">("4choice");
  const [isFinished, setIsFinished] = useState(false);
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
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    if (userData && questions.length === 0) {
      const params = new URLSearchParams(window.location.search);
      const gradesParam = params.get("grades");
      const countParam = params.get("count");
      const revengeParam = params.get("revenge") === "true";
      
      setIsRevenge(revengeParam);

      const subjectParam = params.get("subject");
      const isMathMode = subjectParam === "math";
      setIsMath(isMathMode);

      if (revengeParam) {
        if (isMathMode) {
          const revQ = getRevengeMathQuestions(userData.mistakeIds, 10);
          if (revQ.length === 0) {
            alert("にがてな算数の問題は まだ ありません！");
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
        if (isMathMode) {
          const skillsParam = params.get("skills");
          const targetSkills = skillsParam ? skillsParam.split(",") : [];
          setQuestions(getRandomMathQuestions(targetSkills, targetCount));
        } else {
          setQuestions(getRandomQuestions(targetGrades, targetCount));
        }
      }
    }
    setMode(storage.getAnswerMode() as "4choice" | "keyboard");
  }, [userData, questions.length]);

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

  if (loading || questions.length === 0) return <div>ロード中...</div>;

  const currentQ = questions[currentIndex];

  const nextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(curr => curr + 1);
      setIsReviewMode(false);
    } else {
      finishGame();
    }
  };

  const handleAnswer = (ans: string) => {
    if (isReviewMode) {
      if (ans === currentQ.reading) {
        // レビューモード（答え合わせ中）で正解してもマスターとはみなさない
        nextQuestion();
      } else {
        setFeedback("incorrect");
        setTimeout(() => setFeedback(null), 1000);
      }
      return;
    }

    if (ans === currentQ.reading) {
      setCombo(c => c + 1);
      setMaxCombo(c => Math.max(c, combo + 1));
      newMastered.current.add(currentQ.word);
      
      setFeedback("correct");
      setTimeout(() => {
        setFeedback(null);
        nextQuestion();
      }, 1000);
    } else {
      setCombo(0);
      setTotalMistakes(m => m + 1);
      newMistakes.current.add(currentQ.word);
      setFeedback("incorrect");
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const handlePass = () => {
    setCombo(0);
    setTotalMistakes(m => m + 1);
    newMistakes.current.add(currentQ.word);
    setIsReviewMode(true);
  };

  const finishGame = async () => {
    setIsFinished(true);
    const qCount = questions.length;
    
    const multiplier = 1 + (maxCombo * 0.1);
    const revengeBonus = isRevenge ? 2.0 : 1.0;
    const keyboardBonus = mode === "keyboard" ? 3.0 : 1.0;

    let baseXP = 0;
    let basePT = 0;
    let lowGradeCount = 0;

    questions.forEach(q => {
      if (isMath && !isRevenge && q.grade < (userData?.grade || 1)) {
        baseXP += 1;
        basePT += 0;
        lowGradeCount++;
      } else {
        baseXP += 10;
        basePT += 5;
      }
    });

    const penaltyXP = totalMistakes * 5;
    const penaltyPT = totalMistakes * 2;
    
    const finalXP = Math.max(0, Math.floor((baseXP - penaltyXP) * multiplier * revengeBonus * keyboardBonus));
    const finalPT = Math.max(0, Math.floor((basePT - penaltyPT) * multiplier * revengeBonus * keyboardBonus));
    
    if (userData) {
      const updatedMastered = Array.from(new Set([...userData.masteredIds, ...Array.from(newMastered.current)]));
      
      // Check for Mastery Unlocks
      const { getAllKanji } = await import("../../lib/kanjiData");
      const allKanji = getAllKanji();
      const validKanjiWords = new Set(allKanji.map(k => k.kanji));
      
      // 苦手リストから存在しない漢字や、今回マスターした漢字を除外する
      // また、意図しない空文字なども除去する
      let updatedMistakes = Array.from(new Set([...(userData.mistakeIds || []), ...Array.from(newMistakes.current)]));
      updatedMistakes = updatedMistakes.filter(id => id && id.trim() !== "" && validKanjiWords.has(id) && !newMastered.current.has(id));

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

      await updateUserData({
        xp: userData.xp + finalXP,
        pt: userData.pt + finalPT,
        masteredIds: updatedMastered,
        mistakeIds: updatedMistakes,
        totalDamage: (userData.totalDamage || 0) + finalXP,
        titles: Array.from(newTitles),
        avatars: Array.from(newAvatars),
      });

      // レイドボスにダメージを与える
      if (finalXP > 0) {
        const { dealDamageToRaidBoss } = await import("../../lib/raidLogic");
        await dealDamageToRaidBoss(finalXP, userData?.grade || 1);
      }
    }
  };

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
          {isMath && !isRevenge && questions.some(q => q.grade < (userData?.grade || 1)) && (
            <div className="text-sm font-bold text-blue-500 mb-4 bg-blue-50 p-2 rounded-xl border border-blue-200">
              ℹ️ 自分の学年より下の問題があったため、もらえる経験値が少なくなったよ！
            </div>
          )}
          <div className="text-4xl font-black mb-4 text-blue-900">+ {Math.max(0, Math.floor((questions.reduce((acc, q) => acc + (isMath && !isRevenge && q.grade < (userData?.grade || 1) ? 1 : 10), 0) - totalMistakes * 5) * (1 + maxCombo * 0.1) * (isRevenge ? 2 : 1) * (mode === "keyboard" ? 3 : 1)))} XP</div>
          <div className="text-3xl font-black text-amber-500 mb-10 drop-shadow-sm">+ {Math.max(0, Math.floor((questions.reduce((acc, q) => acc + (isMath && !isRevenge && q.grade < (userData?.grade || 1) ? 0 : 5), 0) - totalMistakes * 2) * (1 + maxCombo * 0.1) * (isRevenge ? 2 : 1) * (mode === "keyboard" ? 3 : 1)))} PT</div>
          
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
    <main className={`min-h-screen p-4 flex flex-col relative overflow-hidden transition-colors duration-1000 bg-cover bg-center bg-fixed ${
      (!userData?.theme || userData.theme === 'default') ? "bg-[url('/kanji-quest/images/ui/fantasy_bg.jpg')]" : ""
    } ${isBossBattle && !isFinished && userData?.scaryMode ? 'text-red-50' : ''}`}>
      {/* Background Overlay */}
      {!isBossBattle && !isFinished && (!userData?.theme || userData.theme === 'default') && (
        <div className="absolute inset-0 bg-black/40 pointer-events-none z-0"></div>
      )}
      {isBossBattle && !isFinished && !userData?.scaryMode && (
        <div className="absolute inset-0 bg-red-900/40 pointer-events-none z-0"></div>
      )}
      
      {/* Boss Fullscreen Background */}
      <AnimatePresence>
        {isBossBattle && !isFinished && userData?.scaryMode && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-0 pointer-events-none"
          >
            {/* Background Image with pulsing shake */}
            <motion.div 
              animate={{ 
                scale: [1, 1.02, 1],
                rotate: timeLeft <= 3 ? [-1, 1, -1, 1, 0] : [0, 0.5, -0.5, 0]
              }}
              transition={{ 
                scale: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                rotate: timeLeft <= 3 ? { repeat: Infinity, duration: 0.1 } : { repeat: Infinity, duration: 4, ease: "easeInOut" }
              }}
              className="absolute inset-0 bg-[url('/kanji-quest/images/boss_bg.jpg')] bg-cover bg-center bg-no-repeat"
            />
            {/* Dark/Red Overlay to make text readable and add scary vibe */}
            <motion.div 
              animate={{ opacity: [0.6, 0.8, 0.6] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-t from-black via-red-950/80 to-black/90 mix-blend-multiply"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col z-10 relative">
      
      {/* 進行状況 */}
      <div className={`relative mx-auto mb-6 mt-4 font-black text-3xl tracking-widest px-8 py-3 rounded-full border-4 shadow-xl z-20 w-max ${isBossBattle ? 'bg-red-900/80 text-red-100 border-red-500 text-outline' : 'bg-gradient-to-b from-blue-400 to-indigo-600 text-white border-blue-300 text-outline-dark'}`}>
        {currentIndex + 1} / {questions.length}
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
               <div className="absolute -top-12 text-red-600 font-black text-2xl md:text-3xl animate-pulse whitespace-nowrap drop-shadow-md">
                 ⚠️ ボスがあらわれた！ ⚠️
               </div>
            )}
            
            {isBossBattle && !userData?.scaryMode && (
               <div className="absolute top-12 text-[100px] opacity-20 pointer-events-none drop-shadow-md">
                 {bossIcon}
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
              <div className={`absolute -top-5 ${isMath ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-primary to-blue-500'} text-white font-black px-8 py-3 rounded-full shadow-lg text-lg border-2 border-white/50 z-20`}>
                {isMath ? "さんすう もんだい" : (currentQ.type === "onyomi" ? "音読み（カタカナ）" : "訓読み（ひらがな）")}
              </div>
            )}
            
            {/* Effect Layer */}
            {!isBossBattle && userData?.equippedEffect && (
              <KanjiEffect effect={userData.equippedEffect} />
            )}

            <div className={`${isMath ? 'text-[70px] md:text-[90px] font-sans font-black' : 'text-[120px] font-serif'} leading-none drop-shadow-md my-4 relative z-10 ${isBossBattle ? (userData?.scaryMode ? 'text-red-100' : 'text-red-900') : 'text-slate-800'}`}>
              {currentQ.word}
            </div>
          </div>

          {/* パス時の正解表示 */}
          <AnimatePresence>
            {isReviewMode && (
              <motion.div 
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                className="mb-6 bg-red-100 border-4 border-red-300 text-red-700 px-6 py-4 rounded-2xl shadow-sm text-center font-bold w-full"
              >
                <div className="text-sm text-red-600 mb-1">正解は...</div>
                <div className="text-3xl tracking-widest font-black">「{currentQ.reading}」</div>
                <div className="text-sm mt-2">入力して次へ進もう！</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 解答エリア */}
          <div className="w-full">
            {mode === "4choice" ? (
              <AnswerOptions 
                choices={currentQ.choices} 
                onAnswer={handleAnswer} 
                disabled={feedback !== null}
              />
            ) : (
              <KeyboardInput 
                onAnswer={handleAnswer} 
                disabled={feedback !== null}
                placeholder={isMath ? "こたえをいれてね" : "よみをひらがなでいれてね"}
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
