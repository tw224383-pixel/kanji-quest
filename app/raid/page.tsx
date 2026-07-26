"use client";

import { useUser } from "../../hooks/useUser";
import { RaidBoss } from "../../components/game/RaidBoss";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getRaidBossIcon, getRaidBossName, getRaidBossMaxHp } from "../../lib/raidLogic";

type GradeData = {
  grade: number;
  bossLevel: number;
  hpPercent: number;
};

export default function RaidPage() {
  const { userData } = useUser();
  const [mockData, setMockData] = useState<GradeData[]>([]);

  useEffect(() => {
    // Generate static-looking mock data based on grade so it doesn't change randomly every render
    const data: GradeData[] = [];
    for (let i = 1; i <= 6; i++) {
      if (i === userData?.grade) continue; // Skip user's own grade
      
      data.push({
        grade: i,
        bossLevel: Math.min(10, i + 2), // 1st grade: ~3, 2nd: ~4, 3rd: ~5, etc.
        hpPercent: 10 + (i * 15) % 80, // Random but stable looking percentage
      });
    }
    setMockData(data.sort((a, b) => a.grade - b.grade)); // Sort by grade directly
  }, [userData?.grade]);

  // Generate Top 3 Mock Data, injecting the user if they have enough damage
  const getTopRanking = () => {
    let ranking = [
      { name: "伝説のゆうしゃ", damage: 15420, isUser: false },
      { name: "漢字マスターA", damage: 12050, isUser: false },
      { name: "炎のせんし", damage: 9800, isUser: false },
    ];
    if (userData && userData.totalDamage > 0) {
      ranking.push({ name: userData.name, damage: userData.totalDamage, isUser: true });
    }
    ranking = ranking.sort((a, b) => b.damage - a.damage).slice(0, 3);
    return ranking;
  };
  const topRanking = getTopRanking();

  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="min-h-screen p-4 flex flex-col max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-red-600 drop-shadow-md">⚔️ 学年対抗レイド戦況</h1>
        <Link href="/home" className="text-slate-500 font-bold hover:text-slate-700">
          もどる
        </Link>
      </div>

      {/* Top 3 Damage Ranking */}
      <section className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 shadow-xl text-white">
        <h2 className="text-xl font-black mb-4 text-center flex items-center justify-center gap-2">
          <span>👑</span> ぜん学年 ダメージランキング TOP3
        </h2>
        <div className="space-y-3">
          {topRanking.map((player, idx) => (
            <div key={idx} className={`flex items-center justify-between p-3 rounded-xl font-bold ${player.isUser ? 'bg-white text-orange-600 shadow-md transform scale-105' : 'bg-white/20'}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                <span className="text-lg">{player.name}</span>
              </div>
              <div>{player.damage.toLocaleString()} DMG</div>
            </div>
          ))}
        </div>
      </section>

      {/* User's Grade */}
      <section>
        <h2 className="text-lg font-bold text-slate-700 mb-2">🎯 わたしたちの学年（{userData?.grade || 1}年生）</h2>
        <div className="relative">
          <RaidBoss />
        </div>
      </section>

      {/* Other Grades */}
      <section className="glass rounded-3xl p-6 shadow-xl border-4 border-white/50">
        <h2 className="text-lg font-bold text-slate-700 mb-4 border-b-2 border-slate-200 pb-2">📊 他の学年の戦況</h2>
        
        <div className="space-y-6">
          {mockData.map((d, index) => {
            let currentBossIcon = getRaidBossIcon(d.bossLevel);
            let currentBossName = getRaidBossName(d.bossLevel);
            if (currentMonth === 10) {
              currentBossIcon = "🎃";
              currentBossName = "ハロウィン " + currentBossName;
            } else if (currentMonth === 12) {
              currentBossIcon = "⛄";
              currentBossName = "スノーマン " + currentBossName;
            }

            return (
            <motion.div 
              key={d.grade}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 rounded-2xl p-4 shadow-sm border border-slate-200"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="text-3xl drop-shadow-md">{currentBossIcon}</div>
                  <div className="font-black text-slate-800 text-lg">
                    <span className="text-sm text-slate-500 mr-2">{d.grade}年生</span>
                    {currentBossName}
                  </div>
                </div>
                <div className="font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full text-sm">
                  Lv.{d.bossLevel}
                </div>
              </div>
              
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                <span>ボスHP</span>
                <span>{d.hpPercent}%</span>
              </div>
              <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-red-500 to-rose-400"
                  initial={{ width: "100%" }}
                  animate={{ width: `${d.hpPercent}%` }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                />
              </div>
              
              {d.hpPercent < 20 && (
                <div className="mt-2 text-xs font-bold text-amber-600 animate-pulse text-right">
                  もうすぐ討伐！🔥
                </div>
              )}
            </motion.div>
          )})}
        </div>
      </section>

      {/* Raid Boss Encyclopedia */}
      <section className="glass rounded-3xl p-6 shadow-xl border-4 border-indigo-200/50 bg-indigo-50/30">
        <h2 className="text-lg font-bold text-indigo-900 mb-4 border-b-2 border-indigo-200 pb-2 flex items-center gap-2">
          <span>📖</span> レイドボス進化図鑑
        </h2>
        <div className="text-sm font-bold text-slate-600 mb-4">
          ボスはレベルがあがると、どんどん強力な姿に進化するぞ！<br/>
          みんなで力をあわせて、レベル10の完全討伐をめざそう！
        </div>
        <div className="space-y-3">
          {[1,2,3,4,5,6,7,8,9,10].map(level => {
            const icon = getRaidBossIcon(level);
            const name = getRaidBossName(level);
            const maxHp = getRaidBossMaxHp(level);
            return (
              <div key={level} className="bg-white/80 rounded-2xl p-3 shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="w-12 h-12 flex flex-col items-center justify-center bg-indigo-100 rounded-xl text-indigo-900 font-black text-sm shrink-0">
                  Lv.{level}
                </div>
                <div className="text-4xl drop-shadow-md w-12 text-center shrink-0">{icon}</div>
                <div className="flex-1">
                  <div className="font-black text-slate-800 text-lg leading-tight">{name}</div>
                  <div className="text-sm font-bold text-rose-600 mt-1">最大HP: {maxHp.toLocaleString()}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
