"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getRandomQuestions, getRevengeQuestions, KanjiQuestion } from "../../lib/kanjiData";
import { getRandomMathQuestions, getRevengeMathQuestions, MathQuestion } from "../../lib/mathData";
import { getRandomScienceQuestions, getRevengeScienceQuestions, ScienceQuestion } from "../../lib/scienceData";
import { getRandomSocialQuestions, getRevengeSocialQuestions, SocialQuestion } from "../../lib/socialData";
import { getRaidBossImagePath, getCurrentJSTMonth, getCurrentJSTWeekString, getSeasonalBossPresentation } from "../../lib/raidLogic";
import { getCurrentJSTDateString, getNextReviewDate, GRADUATION_STAGE, isDueForReview } from "../../lib/reviewSchedule";
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
import { useToast } from "../../components/ui/Toast";
import { GameResultScreen } from "../../components/game/GameResultScreen";

export default function GamePage() {
  const router = useRouter();
  const { userData, updateUserDataAtomic, loading } = useUser();
  const { showToast } = useToast();
  const [questions, setQuestions] = useState<(KanjiQuestion | MathQuestion | ScienceQuestion | SocialQuestion)[]>([]);
  const [isMath, setIsMath] = useState(false);
  const [subjectType, setSubjectType] = useState<"kanji" | "math" | "science" | "social">("kanji");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<"4choice" | "keyboard">("4choice");
  const [isFinished, setIsFinished] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
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
        // 分散学習: 今日が復習日になっている苦手問題だけを出題する（覚えたてを何度も出さない）
        const todayStr = getCurrentJSTDateString();
        const nextReviewMap = userData.mistakeNextReview || {};
        const dueMistakeIds = (userData.mistakeIds || []).filter(id => isDueForReview(nextReviewMap[id], todayStr));
        const hasAnyMistakes = (userData.mistakeIds || []).length > 0;
        const notDueMessage = "今日ふくしゅうする もんだいは まだ ないよ！また あとで きてね";

        if (subjectParam === "math") {
          const revQ = getRevengeMathQuestions(dueMistakeIds, 10);
          if (revQ.length === 0) {
            alert(hasAnyMistakes ? notDueMessage : "にがてな算数の問題は まだ ありません！");
            router.push("/home");
            return;
          }
          setQuestions(revQ);
        } else if (subjectParam === "science") {
          const revQ = getRevengeScienceQuestions(dueMistakeIds, 10);
          if (revQ.length === 0) {
            alert(hasAnyMistakes ? notDueMessage : "にがてな理科の問題は まだ ありません！");
            router.push("/home");
            return;
          }
          setQuestions(revQ);
        } else if (subjectParam === "social") {
          const revQ = getRevengeSocialQuestions(dueMistakeIds, 10);
          if (revQ.length === 0) {
            alert(hasAnyMistakes ? notDueMessage : "にがてな社会の問題は まだ ありません！");
            router.push("/home");
            return;
          }
          setQuestions(revQ);
        } else {
          const revQ = getRevengeQuestions(dueMistakeIds, 10); // リベンジは最大10問
          if (revQ.length === 0) {
            alert(hasAnyMistakes ? notDueMessage : "にがてな漢字は まだ ありません！");
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
      // masteredIds は漢字図鑑の「マスター済み判定」専用（k.kanji と直接比較される）。
      // 算数・理科・社会は currentQ.word が問題文そのもの（ほぼ一意）なので、
      // ここに含めるとドキュメントが無制限に肥大化してしまう。漢字のみ追加する。
      if (subjectType === "kanji") {
        newMastered.current.add(currentQ.word);
      }
      
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
        // Check for Mastery Unlocks
        const { getAllKanji } = await import("../../lib/kanjiData");
        const allKanji = getAllKanji();
        const validKanjiWords = new Set(allKanji.map(k => k.kanji));

        const isSpSubject = subjectType === "science" || subjectType === "social";
        const params = new URLSearchParams(window.location.search);
        const catParam = params.get("category");
        const correctQuestionsCount = Math.max(1, questions.length - totalMistakes);

        let newlyMastered = false;

        // 複数タブ・複数端末での同時プレイでXP/PT/苦手リスト等が上書き消失しないよう、
        // Firestoreトランザクション内で常に最新のサーバー側データ（current）を起点に計算する。
        const ok = await updateUserDataAtomic(current => {
          const updatedMastered = Array.from(new Set([...current.masteredIds, ...Array.from(newMastered.current)]));

          // 分散学習（間隔反復）: 正解しても即座に苦手リストから消すのではなく、
          // 「1日後→3日後→7日後→14日後→30日後」と段階的に間隔を空けて再出題し、
          // 5回連続でリベンジモードに正解した問題だけを苦手リストから卒業させる。
          const stages = { ...(current.mistakeStages || {}) };
          const nextReview = { ...(current.mistakeNextReview || {}) };
          const todayStr = getCurrentJSTDateString();
          const graduated = new Set<string>();

          newMistakes.current.forEach(id => {
            stages[id] = 0;
            nextReview[id] = todayStr;
          });

          if (isRevenge) {
            newMastered.current.forEach(id => {
              if (newMistakes.current.has(id)) return; // 同一セッション内でまちがえ直したものは対象外
              if (!(current.mistakeIds || []).includes(id)) return;
              // 今回の成功「前」の段階を間隔テーブルのインデックスに使うことで、
              // 1回目の成功が REVIEW_INTERVALS_DAYS[0]（1日後）に正しく対応するようにする。
              // （nextStage をインデックスに使うと1日後の段階に永遠に到達しないバグがあった）
              const currentStage = stages[id] ?? 0;
              const nextStage = currentStage + 1;
              if (nextStage >= GRADUATION_STAGE) {
                graduated.add(id);
                delete stages[id];
                delete nextReview[id];
              } else {
                stages[id] = nextStage;
                nextReview[id] = getNextReviewDate(currentStage, todayStr);
              }
            });
          }

          // 苦手リストから存在しない問題・卒業した問題を除外
          let updatedMistakes = Array.from(new Set([...(current.mistakeIds || []), ...Array.from(newMistakes.current)]));
          updatedMistakes = updatedMistakes.filter(id => {
            if (!id || typeof id !== "string" || id.trim() === "") return false;
            if (graduated.has(id)) return false;
            // 算数、理科、社会のプレフィックス
            if (id.startsWith("math_") || id.startsWith("sci_") || id.startsWith("soc_")) {
              return true;
            }
            // 漢字
            return validKanjiWords.has(id);
          });

          const newTitles = new Set(current.titles || []);
          const newAvatars = new Set(current.avatars || []);
          newlyMastered = false;

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

          const currentWeekString = getCurrentJSTWeekString();
          const newWeeklyXp = (current.lastWeekString === currentWeekString ? (current.weeklyXp || 0) : 0) + finalXP;

          const currentMonthString = getCurrentJSTMonth();
          const newMonthlyDamage = (current.lastMonthString === currentMonthString ? (current.monthlyDamage || 0) : 0) + finalXP;

          // カテゴリ別の正解数を集計する。算数は1セッションに複数カテゴリ（計算・論理・図形）の
          // 問題が混在しうるため、多数派カテゴリへまとめて計上する「推定」ではなく、
          // 問題ごとの実際の正誤とカテゴリを個別に判定して積み上げる。
          const categoryDelta: Record<string, number> = {};
          if (isSpSubject) {
            categoryDelta[subjectType === "science" ? "science" : "social"] = correctQuestionsCount;
          } else if (subjectType === "kanji") {
            categoryDelta["kanji"] = correctQuestionsCount;
          } else if (subjectType === "math") {
            if (catParam) {
              categoryDelta[catParam] = correctQuestionsCount;
            } else {
              questions.forEach(q => {
                if (!('category' in q) || !q.category) return;
                const qid = ('id' in q && q.id) ? q.id : q.word;
                if (!newMistakes.current.has(qid)) {
                  categoryDelta[q.category] = (categoryDelta[q.category] || 0) + 1;
                }
              });
            }
          }

          const updatedCategorySolved = { ...(current.categorySolved || {}) };
          Object.entries(categoryDelta).forEach(([cat, cnt]) => {
            updatedCategorySolved[cat] = (updatedCategorySolved[cat] || 0) + cnt;
          });

          // 苦手リストに残っていない問題の復習スケジュール情報は破棄してマップを肥大化させない
          const mistakeSet = new Set(updatedMistakes);
          Object.keys(stages).forEach(id => { if (!mistakeSet.has(id)) delete stages[id]; });
          Object.keys(nextReview).forEach(id => { if (!mistakeSet.has(id)) delete nextReview[id]; });

          return {
            xp: current.xp + finalXP,
            pt: isSpSubject ? current.pt : current.pt + finalPT,
            sp: isSpSubject ? (current.sp || 0) + finalPT : (current.sp || 0),
            masteredIds: updatedMastered,
            mistakeIds: updatedMistakes,
            mistakeStages: stages,
            mistakeNextReview: nextReview,
            categorySolved: updatedCategorySolved,
            totalDamage: (current.totalDamage || 0) + finalXP,
            monthlyDamage: newMonthlyDamage,
            lastMonthString: currentMonthString,
            weeklyXp: newWeeklyXp,
            lastWeekString: currentWeekString,
            titles: Array.from(newTitles),
            avatars: Array.from(newAvatars),
          };
        });

        if (!ok) {
          setSaveFailed(true);
          showToast("けっかを保存できませんでした。通信状態を確認してもう一度お試しください");
        }

        if (ok && newlyMastered) {
          setUnlockedMastery(true);
        }

        // レイドボスにダメージを与える。トドメを刺したら「LvN討伐隊」称号を付与する
        // （以前はこの称号を付与する処理が存在せず、raid_1〜raid_10実績が解除不可能だった）。
        if (ok && finalXP > 0) {
          const { dealDamageToRaidBoss } = await import("../../lib/raidLogic");
          const { defeatedLevels } = await dealDamageToRaidBoss(finalXP, userData?.grade || 1);
          if (defeatedLevels.length > 0) {
            await updateUserDataAtomic(current => {
              const newTitles = new Set(current.titles || []);
              let changed = false;
              defeatedLevels.forEach(lv => {
                const title = `Lv${lv}討伐隊`;
                if (!newTitles.has(title)) {
                  newTitles.add(title);
                  changed = true;
                }
              });
              return changed ? { titles: Array.from(newTitles) } : null;
            });
          }
        }
      }
    } catch (err) {
      console.error("Failed to finish game and update data:", err);
      setSaveFailed(true);
      showToast("けっかを保存できませんでした。通信状態を確認してもう一度お試しください");
    } finally {
      // 失敗時に「もういちど保存する」ボタンから再実行できるよう、二重送信ガードを解除する
      isSubmittingRef.current = false;
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
      <GameResultScreen
        saveFailed={saveFailed}
        unlockedMastery={unlockedMastery}
        isRevenge={isRevenge}
        mode={mode}
        maxCombo={maxCombo}
        totalMistakes={totalMistakes}
        hasPenalty={hasPenalty}
        finalXP={finalXP}
        finalPT={finalPT}
        isSpSubject={isSpSubject}
        onRetry={() => { setIsFinished(false); setSaveFailed(false); finishGame(); }}
        onGoHome={() => router.push("/home")}
      />
    );
  }

  const bossIcon = getSeasonalBossPresentation("🐲", "").icon;

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
