"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUser } from "../../hooks/useUser";
import { calculateAdventurerStats, StatCategoryKey, SkillStat , MAX_STAR } from "../../lib/userStatsLogic";
import { hasUnclaimedAchievements } from "../../lib/achievementLogic";
import { AdventurerRadarChart } from "./AdventurerRadarChart";
import { Button } from "../ui/Button";

export function AdventurerGrowthReport() {
  const { userData } = useUser();
  const router = useRouter();
  const [selectedKey, setSelectedKey] = useState<StatCategoryKey | null>('calc');
  const [showHowToLevelUp, setShowHowToLevelUp] = useState(true);

  const { stats, archetype, totalPower, averageLevel } = calculateAdventurerStats(userData);

  const activeStat = stats.find(s => s.key === selectedKey) || stats[0];
  const hasUnclaimed = userData ? hasUnclaimedAchievements(userData) : false;

  const handleStartTraining = (stat: SkillStat) => {
    router.push(stat.trainingUrl);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* 1. Adventurer Archetype Banner */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-5 sm:p-6 rounded-3xl border-2 border-amber-400 relative overflow-hidden bg-slate-900 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12" />

        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative z-10">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 p-1 shadow-[0_0_25px_rgba(251,191,36,0.6)] flex items-center justify-center flex-shrink-0 animate-pulse">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-4xl sm:text-5xl">
              {archetype.icon}
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-1">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-sm">
                ぼうけんしゃ タイプしんだん
              </span>
              <span className="text-xs font-bold text-amber-300 bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-700">
                へいきん能力: Lv.{averageLevel}
              </span>
              <span className="text-xs font-bold text-cyan-300 bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-700">
                そうごう戦力: {totalPower}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-amber-300 drop-shadow-md">
                  {archetype.title}
                </h2>
                <div className="text-xs sm:text-sm font-bold text-amber-200 mt-0.5 mb-2">
                  〜 {archetype.subTitle} 〜
                </div>
              </div>
              <button
                onClick={() => router.push("/achievements")}
                className="self-center sm:self-start bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 px-3.5 py-2 rounded-2xl font-black text-xs shadow-md border border-white hover:scale-105 transition-all flex items-center gap-1.5 relative whitespace-nowrap"
              >
                <span>🏆</span>
                <span>じっせきほうしゅう</span>
                {hasUnclaimed && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white shadow-sm"></span>
                  </span>
                )}
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-sans bg-slate-950/80 p-3 rounded-2xl border border-slate-700/80">
              {archetype.description}
            </p>
          </div>
        </div>
      </motion.div>

      {/* 2. Level Up Explanation Guide (High Contrast Dedicated Card) */}
      <div className="p-5 rounded-3xl border-2 border-amber-400 bg-slate-900 text-white shadow-2xl">
        <div 
          onClick={() => setShowHowToLevelUp(!showHowToLevelUp)}
          className="flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2 font-black text-base sm:text-lg text-amber-300">
            <span className="text-xl">💡</span>
            <span>レベルのあげかた・せいちょうの しくみ（500問でLv.99到達！）</span>
          </div>
          <span className="text-xs font-black bg-amber-400 text-slate-950 px-3 py-1 rounded-full shadow-sm">
            {showHowToLevelUp ? "閉じる ▲" : "詳しく見る ▼"}
          </span>
        </div>

        {showHowToLevelUp && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 pt-4 border-t border-slate-700 text-xs sm:text-sm text-slate-100 space-y-3"
          >
            <div className="flex items-start gap-3 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
              <div className="text-slate-100 leading-relaxed">
                <strong className="text-amber-300 font-black">各ジャンル 500問正解で最高峰の【Lv.99（神ランク）】到達！</strong><br/>
                問題を解くごとに経験値がたまり、少しずつレベルが上がっていきます。
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
              <div className="text-slate-100 leading-relaxed">
                <strong className="text-amber-300 font-black">序盤はサクサクUP！</strong><br/>
                Lv.1〜10までは1〜2問正解するごとに即レベルアップ！レベルが高くなるにつれて必要な問題数が段階的に増えていきます。
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
              <div className="text-slate-100 leading-relaxed">
                <strong className="text-amber-300 font-black">「🔥 とっくん」ボタンで弱点を集中強化！</strong><br/>
                下のカードにある「とっくん」ボタンを押すと、学年に合わせたその分野専用の5問バトル（計算・文章題・図形・漢字・理科・社会）にすぐ挑戦できます！
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs flex-shrink-0 mt-0.5">4</span>
              <div className="text-slate-100 leading-relaxed">
                <strong className="text-amber-300 font-black">レベルが上がると「じっせき」で豪華ボーナス！</strong><br/>
                各能力や平均レベルが上がるごとに「じっせき」メニューから大量のPT・SPや限定称号を獲得できます！
              </div>
            </div>

            <Button
              variant="fun"
              size="sm"
              onClick={() => router.push("/achievements")}
              className="w-full mt-2 py-2.5 text-xs font-black bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 flex items-center justify-center gap-2 border border-white shadow-md hover:scale-[1.02] transition-transform"
            >
              <span>🏆</span>
              <span>カルテの実績ボーナスを受け取る（じっせき画面へ）</span>
              <span>➔</span>
            </Button>
          </motion.div>
        )}
      </div>

      {/* 3. Radar Chart & Focused Training Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Radar Chart Column (6 cols on lg) */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-6 p-4 sm:p-6 rounded-3xl flex flex-col items-center justify-center bg-slate-900 border-2 border-indigo-400/50 shadow-2xl relative min-h-[380px]"
        >
          <div className="w-full flex justify-between items-center mb-2 px-2">
            <h3 className="font-black text-amber-300 text-base sm:text-lg flex items-center gap-2">
              <span>📊</span> 6軸ステータスカルテ
            </h3>
            <span className="text-xs font-bold text-slate-200 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700 shadow-sm">
              項目タップで切替
            </span>
          </div>

          <AdventurerRadarChart
            stats={stats}
            selectedKey={selectedKey}
            onSelectStat={(key) => setSelectedKey(key)}
            size={360}
          />
        </motion.div>

        {/* Focused Ability Detail & Quick Training Column (6 cols on lg) */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-6 space-y-4"
        >
          {/* Active Highlighted Stat Box */}
          <div className={`p-5 rounded-3xl border-2 shadow-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden text-white`} style={{ borderColor: activeStat.color }}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md border" style={{ backgroundColor: `${activeStat.color}25`, borderColor: activeStat.color }}>
                  {activeStat.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xl text-white drop-shadow-sm">{activeStat.name}</span>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full text-white`} style={{ backgroundColor: activeStat.color }}>
                      Rank {activeStat.rank}
                    </span>
                  </div>
                  <div className="text-xs text-slate-200 font-bold mt-0.5">{activeStat.description}</div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-3xl font-black text-amber-400 leading-none">Lv.{activeStat.level}</div>
                {/* Lv.99（500問）の先は★で伸びていく。上位層の目標が尽きないようにするため */}
                {activeStat.level >= 99 && (
                  <div className="text-lg leading-none mt-1 tracking-tight" title={`★${activeStat.star} / ${MAX_STAR}`}>
                    {"★".repeat(activeStat.star)}<span className="text-slate-600">{"☆".repeat(MAX_STAR - activeStat.star)}</span>
                  </div>
                )}
                <div className="text-[11px] font-bold text-cyan-300 mt-1">
                  {activeStat.level >= 99 ? `${activeStat.totalSolved}問` : `${activeStat.totalSolved} / 500問`}
                </div>
              </div>
            </div>

            {/* Next Level Progression Info */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 mb-4">
              <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                <span className="text-amber-300 flex items-center gap-1 font-black">
                  <span>✨</span>
                  {activeStat.level >= 99
                    ? (activeStat.star >= MAX_STAR
                        ? "★5 かんぜんカンスト！"
                        : `Lv.99到達！ あと ${activeStat.toNextStar}問正解 で ★${activeStat.star + 1} に！`)
                    : `あと ${activeStat.questionsToNextLevel}問正解 で Lv.${activeStat.level + 1} にUP！`}
                </span>
                <span className="text-slate-200 font-bold">
                  {activeStat.currentExp} / {activeStat.nextExp} 問
                </span>
              </div>
              <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700 p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(activeStat.currentExp / activeStat.nextExp) * 100}%` }}
                  transition={{ duration: 0.6 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: activeStat.color }}
                />
              </div>

              {/* Total 500 Progress Bar */}
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-300 mt-2.5">
                <span>Lv.99マスターへの道:</span>
                <span className="text-amber-300 font-black">{activeStat.progressPercent}% 達成 ({activeStat.totalSolved}/500問)</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mt-1 border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full"
                  style={{ width: `${activeStat.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Quick Train Button */}
            <Button
              variant="fun"
              size="lg"
              onClick={() => handleStartTraining(activeStat)}
              className="w-full py-3.5 text-base font-black flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 border-2 border-white shadow-xl group"
            >
              <span>🔥</span>
              <span>{activeStat.trainingLabel}（5問バトル出撃！）</span>
              <span className="group-hover:translate-x-1 transition-transform">➔</span>
            </Button>
          </div>

          {/* Quick Stat Switcher Badges */}
          <div className="grid grid-cols-3 gap-2">
            {stats.map(s => {
              const isSelected = s.key === selectedKey;
              return (
                <button
                  key={s.key}
                  onClick={() => setSelectedKey(s.key)}
                  className={`p-2.5 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)] scale-105'
                      : 'bg-slate-900/90 border-slate-700 hover:bg-slate-800 opacity-85'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-base">{s.icon}</span>
                    <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-slate-950 text-amber-300 border border-slate-700">
                      Lv.{s.level}
                    </span>
                  </div>
                  <div className="text-xs font-black text-white truncate mt-1">{s.shortName}</div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* 4. All 6-Abilities Comprehensive List */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border-2 border-indigo-400/40 shadow-2xl text-white">
        <h3 className="font-black text-amber-300 text-lg mb-4 flex items-center gap-2">
          <span>📜</span> 全能力ステータス一覧 ＆ 特訓メニュー
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.map(stat => (
            <div 
              key={stat.key}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 ${
                stat.key === selectedKey 
                  ? 'border-amber-400 bg-slate-800/95 shadow-md' 
                  : 'border-slate-700 bg-slate-950/80 hover:border-indigo-400/60'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="text-3xl w-12 h-12 rounded-xl flex items-center justify-center bg-slate-900 text-white shadow-inner flex-shrink-0 border border-slate-700">
                    {stat.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-base text-white">{stat.name}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full text-white`} style={{ backgroundColor: stat.color }}>
                        Rank {stat.rank}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-medium mt-0.5">{stat.description}</div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="font-black text-xl text-amber-300">Lv.{stat.level}</div>
                  <div className="text-[11px] font-bold text-cyan-300">{stat.totalSolved} / 500問</div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-700/80">
                <div className="flex-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-1">
                    <span className="text-amber-200">あと {stat.questionsToNextLevel}問でUP</span>
                    <span>{stat.currentExp}/{stat.nextExp} 問</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(stat.currentExp / stat.nextExp) * 100}%`, backgroundColor: stat.color }}
                    />
                  </div>
                </div>
                <Button
                  variant="fun"
                  size="sm"
                  onClick={() => handleStartTraining(stat)}
                  className="py-1.5 px-3 text-xs font-black text-white shadow-sm flex-shrink-0"
                  style={{ backgroundColor: stat.color }}
                >
                  ⚡ とっくん
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
