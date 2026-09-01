"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUser } from "../../hooks/useUser";
import { Button } from "../../components/ui/Button";
import { LoadingScreen } from "../../components/ui/LoadingScreen";
import { ThemeBackground } from "../../components/ui/ThemeBackground";
import {
  getDailyBonusCategories,
  dailyBonusGameUrl,
  DAILY_BONUS_MULTIPLIER,
  type DailyBonusCategory,
} from "../../lib/dailyBonus";
import { calculateAdventurerStats } from "../../lib/userStatsLogic";
import { getCurrentJSTDateString, isDueForReview } from "../../lib/reviewSchedule";

/**
 * クエストページ。
 *
 * ホームに小さく置いていた「今日限定！」を独立したページにした。理由は2つ:
 *   - 学年をえらべなかった（いつも自分の学年で固定）。下の学年で復習したい子や、
 *     上の学年に挑戦したい子が、クエストからは行けなかった。
 *   - もんだい数が ホームで選んだ数（初期値5問）に固定で、5問しかできなかった。
 * このページでは学年ともんだい数をその場でえらべる。
 */
const GRADES = [1, 2, 3, 4, 5, 6] as const;
const COUNTS = [5, 10, 20] as const;

export default function QuestPage() {
  const router = useRouter();
  const { userData, loading } = useUser();

  const [bonusCategories, setBonusCategories] = useState<DailyBonusCategory[]>([]);
  const [grade, setGrade] = useState<number | null>(null);
  const [count, setCount] = useState<number>(10);

  useEffect(() => {
    if (!userData) return;
    setBonusCategories(getDailyBonusCategories(userData));
    // 学年の初期値は自分の学年。えらび直せるようにしてある。
    setGrade(g => g ?? userData.grade);
  }, [userData]);

  if (loading) return <LoadingScreen />;
  if (!userData) {
    router.push("/");
    return null;
  }

  const selectedGrade = grade ?? userData.grade;
  const { stats } = calculateAdventurerStats(userData);
  const levelOf = (key: string) => stats.find(s => s.key === key)?.level ?? 1;

  // きょうが復習日の苦手問題（科目ごと）
  const todayStr = getCurrentJSTDateString();
  const nextReviewMap = userData.mistakeNextReview || {};
  const dueIds = (userData.mistakeIds || []).filter(id => isDueForReview(nextReviewMap[id], todayStr));
  const reviewSubjects = ([
    { key: "kanji", label: "漢字", icon: "📝", match: (id: string) => !/^(math_|sci_|soc_)/.test(id) },
    { key: "math", label: "算数", icon: "🔢", match: (id: string) => id.startsWith("math_") },
    { key: "science", label: "理科", icon: "🔬", match: (id: string) => id.startsWith("sci_") },
    { key: "social", label: "社会", icon: "🗺️", match: (id: string) => id.startsWith("soc_") },
  ] as const).map(s => ({ ...s, count: dueIds.filter(s.match).length })).filter(s => s.count > 0);

  return (
    <main className="min-h-screen p-4 relative">
      <ThemeBackground theme={userData.theme || "default"} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-6 relative z-10"
      >
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-black text-amber-300 drop-shadow-md text-outline-dark flex items-center gap-2">
            <span>🔥</span> クエスト
          </h1>
          <Button variant="outline" onClick={() => router.push("/home")}>ホームへ</Button>
        </div>

        {/* --- えらぶ：学年ともんだい数 --- */}
        <div className="game-panel p-5 space-y-4">
          <div>
            <div className="font-black text-amber-200 mb-2 text-sm">がくねん（かえられるよ）</div>
            <div className="flex flex-wrap gap-2">
              {GRADES.map(g => (
                <button
                  key={g}
                  onClick={() => setGrade(g)}
                  className={`px-4 py-2 rounded-xl font-black border-2 transition-all ${
                    selectedGrade === g
                      ? "bg-amber-400 text-amber-950 border-amber-200 scale-105 shadow-lg"
                      : "bg-slate-800/80 text-slate-300 border-slate-600 hover:border-amber-400/60"
                  }`}
                >
                  {g}年{g === userData.grade ? "（じぶん）" : ""}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="font-black text-amber-200 mb-2 text-sm">もんだい数</div>
            <div className="flex flex-wrap gap-2">
              {COUNTS.map(c => (
                <button
                  key={c}
                  onClick={() => setCount(c)}
                  className={`px-5 py-2 rounded-xl font-black border-2 transition-all ${
                    count === c
                      ? "bg-amber-400 text-amber-950 border-amber-200 scale-105 shadow-lg"
                      : "bg-slate-800/80 text-slate-300 border-slate-600 hover:border-amber-400/60"
                  }`}
                >
                  {c}問
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- 今日限定クエスト --- */}
        {bonusCategories.length > 0 && (
          <div className="game-panel p-5 border-2 border-lime-400/70 shadow-[0_0_25px_rgba(163,230,53,0.25)]">
            <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
              <h2 className="text-2xl font-black text-lime-300 drop-shadow-md whitespace-nowrap">今日限定クエスト</h2>
              <span className="text-sm font-black text-amber-300 whitespace-nowrap bg-amber-400/15 px-3 py-1 rounded-full border border-amber-400/40">
                XP・PT・SP が {DAILY_BONUS_MULTIPLIER}ばい
              </span>
            </div>
            <p className="text-sm text-slate-300 font-bold mb-4 leading-relaxed">
              いま きみが いちばん のばせる3つの分野だよ。
              きょう1日は <strong className="text-amber-300">なんど あそんでも {DAILY_BONUS_MULTIPLIER}ばい</strong>！
            </p>
            <div className="flex flex-col gap-3">
              {bonusCategories.map(b => (
                <button
                  key={b.category}
                  onClick={() => router.push(dailyBonusGameUrl(b, selectedGrade, count))}
                  className="w-full text-left p-4 rounded-2xl border-2 border-lime-400/60 bg-gradient-to-r from-lime-500/15 to-emerald-500/10 hover:scale-[1.02] active:scale-95 transition-transform shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{b.icon}</span>
                    <div className="flex-1">
                      <div className="font-black text-xl text-amber-200">{b.label}</div>
                      <div className="text-xs font-bold text-slate-300 mt-0.5">
                        いまのレベル Lv.{levelOf(b.category)} ／ {selectedGrade}年の もんだいを {count}問
                      </div>
                    </div>
                    <span className="text-lg font-black text-lime-300 whitespace-nowrap">×{DAILY_BONUS_MULTIPLIER}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- きょうのふくしゅう --- */}
        <div className="game-panel p-5">
          <h2 className="text-2xl font-black text-red-300 drop-shadow-md mb-1">きょうの ふくしゅう</h2>
          <p className="text-sm text-slate-300 font-bold mb-4 leading-relaxed">
            まちがえた もんだいは、1日後→3日後→7日後…と 間をあけて もういちど出てくるよ。
            5回 せいかいすると 苦手リストから そつぎょう！
          </p>
          {reviewSubjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reviewSubjects.map(s => (
                <Button
                  key={s.key}
                  variant="danger"
                  size="lg"
                  className="w-full min-h-16 h-auto py-3 px-2 text-sm sm:text-md leading-tight animate-pulse shadow-red-500/30"
                  onClick={() => router.push(`/game?subject=${s.key}&revenge=true`)}
                >
                  {s.icon} {s.label} きょうのふくしゅう ({s.count})
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center font-bold text-slate-400 bg-slate-800/60 rounded-xl py-5 border border-slate-700">
              {(userData.mistakeIds || []).length > 0
                ? "📅 きょうの ふくしゅうは ないよ・またあとで きてね"
                : "🔒 いまは 苦手なもんだいが ないよ"}
            </div>
          )}
        </div>

        <Button variant="outline" size="lg" className="w-full" onClick={() => router.push("/home")}>
          ← ホームにもどる
        </Button>
      </motion.div>
    </main>
  );
}
