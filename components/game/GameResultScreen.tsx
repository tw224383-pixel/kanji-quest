"use client";

import { motion } from "framer-motion";
import { Button } from "../ui/Button";

interface GameResultScreenProps {
  saveFailed: boolean;
  unlockedMastery: boolean;
  isRevenge: boolean;
  mode: "4choice" | "keyboard";
  maxCombo: number;
  totalMistakes: number;
  hasPenalty: boolean;
  finalXP: number;
  finalPT: number;
  ptWasCapped?: boolean;
  /** 「今日限定！」の分野で遊んだか（XP・PT・SPが3倍） */
  dailyBonusApplied?: boolean;
  isSpSubject: boolean;
  /** 未受け取りの実績の数。結果画面で気づかせないと大半の子が取り逃がしてしまう */
  unclaimedAchievements?: number;
  onGoAchievements?: () => void;
  onRetry: () => void;
  onGoHome: () => void;
}

export function GameResultScreen({
  saveFailed,
  unlockedMastery,
  isRevenge,
  mode,
  maxCombo,
  totalMistakes,
  hasPenalty,
  finalXP,
  finalPT,
  ptWasCapped,
  dailyBonusApplied,
  isSpSubject,
  unclaimedAchievements = 0,
  onGoAchievements,
  onRetry,
  onGoHome,
}: GameResultScreenProps) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="game-panel p-12 max-w-md w-full text-center"
      >
        {saveFailed ? (
          <>
            <h1 className="text-4xl font-black text-red-500 mb-6 drop-shadow-md">
              ⚠️ 保存できませんでした
            </h1>
            <div className="bg-red-100 border-4 border-red-400 text-red-700 p-4 rounded-2xl mb-8 font-bold">
              通信状態が悪く、けっかを保存できませんでした。<br/>
              「もういちど保存する」を押してください。<br/>
              このままホームに戻ると今回の分の報酬は消えてしまいます。
            </div>
            <div className="flex flex-col gap-3">
              <Button size="lg" className="w-full text-xl py-5" variant="fun" onClick={onRetry}>
                🔄 もういちど保存する
              </Button>
              <Button size="md" className="w-full" variant="outline" onClick={onGoHome}>
                ホームにもどる（保存せず終了）
              </Button>
            </div>
          </>
        ) : (
          <>
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
            {dailyBonusApplied && (
              <div className="text-xl font-black text-lime-500 mb-4 animate-bounce">
                🔥 今日限定！ボーナス x3 🔥
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
            {ptWasCapped && (
              <div className="text-sm font-bold text-indigo-500 mb-4 bg-indigo-50 p-2 rounded-xl border border-indigo-200">
                🌙 同じ系統の問題で今日はもうたくさんPTを稼いだから、もらえるPTが少なめになっているよ。ちがう科目・分野にも挑戦してみよう！
              </div>
            )}
            <div className="text-4xl font-black mb-4 text-cyan-400 drop-shadow-md">+ {finalXP} XP</div>
            <div className={`text-3xl font-black mb-10 drop-shadow-sm ${isSpSubject ? 'text-emerald-400' : 'text-amber-500'}`}>
              + {finalPT} {isSpSubject ? 'SP' : 'PT'}
            </div>

            {/* 実績は解放されても「受け取り」に行かないと報酬が0のまま。
                実測では半数以上の子が1つも受け取れていなかったため、
                いちばん目にする結果画面から直接行けるようにしている。 */}
            {unclaimedAchievements > 0 && onGoAchievements && (
              <button
                onClick={onGoAchievements}
                className="w-full mb-3 p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 border-4 border-white text-slate-950 font-black shadow-[0_0_25px_rgba(251,191,36,0.6)] animate-pulse hover:scale-[1.02] active:scale-95 transition-transform"
              >
                <div className="text-2xl">🏆 じっせき {unclaimedAchievements}こ たっせい！</div>
                <div className="text-sm mt-1">タップして ごほうびを うけとろう</div>
              </button>
            )}

            <Button size="lg" className="w-full text-2xl py-6" variant="fun" onClick={onGoHome}>
              ホームにもどる
            </Button>
          </>
        )}
      </motion.div>
    </main>
  );
}
