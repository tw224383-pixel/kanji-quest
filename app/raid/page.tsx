"use client";

import { useUser } from "../../hooks/useUser";
import { RaidBoss } from "../../components/game/RaidBoss";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/Button";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getRaidBossIcon, getRaidBossName, getRaidBossMaxHp, getRaidBossImagePath } from "../../lib/raidLogic";
import { collection, query, orderBy, limit, getDocs, doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { ThemeBackground } from "../../components/ui/ThemeBackground";
import { KanjiEffect } from "../../components/game/KanjiEffect";
import { LoadingScreen } from "../../components/ui/LoadingScreen";

type GradeData = {
  grade: number;
  hp: number;
  level: number;
  maxHp: number;
};

export default function RaidPage() {
  const { userData } = useUser();
  const router = useRouter();
  const [otherGrades, setOtherGrades] = useState<GradeData[]>([]);
  const [topRanking, setTopRanking] = useState<{name: string, damage: number, isUser: boolean}[]>([]);

  useEffect(() => {
    // Listen to all raid bosses for other grades
    const unsubs: (() => void)[] = [];
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Initialize default array
    setOtherGrades(Array.from({length: 6}, (_, i) => ({
      grade: i + 1,
      hp: getRaidBossMaxHp(1),
      level: 1,
      maxHp: getRaidBossMaxHp(1)
    })).filter(x => x.grade !== userData?.grade));

    for (let i = 1; i <= 6; i++) {
      if (i === userData?.grade) continue;
      
      const ref = doc(db, "globalStats", "raidBoss_" + i);
      const unsub = onSnapshot(ref, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const dbMonth = data.month || currentMonth;
          if (dbMonth === currentMonth) {
            setOtherGrades(prev => {
              const next = [...prev];
              const idx = next.findIndex(x => x.grade === i);
              if (idx !== -1) {
                const level = data.level || 1;
                const hp = data.hp !== undefined ? data.hp : getRaidBossMaxHp(level);
                next[idx] = { grade: i, hp, level, maxHp: getRaidBossMaxHp(level) };
              }
              return next.sort((a, b) => a.grade - b.grade);
            });
          }
        }
      });
      unsubs.push(unsub);
    }
    return () => unsubs.forEach(fn => fn());
  }, [userData?.grade]);

  // Fetch Top 3 Damage Ranking from Firestore
  useEffect(() => {
    const fetchTopRanking = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("totalDamage", "desc"), limit(3));
        const snap = await getDocs(q);
        const ranking = snap.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            name: data.name || "名無し",
            damage: data.totalDamage || 0,
            isUser: docSnap.id === auth.currentUser?.uid
          };
        });
        setTopRanking(ranking);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTopRanking();
  }, []);

  const currentMonth = new Date().getMonth() + 1;
  const isScary = userData?.scaryMode || false;

  if (!userData) return <LoadingScreen />;

  return (
    <div className={`min-h-screen p-4 flex flex-col relative bg-cover bg-center bg-fixed ${(!userData.theme || userData.theme === 'default') ? "bg-[url('/kanji-quest/images/ui/fantasy_bg.jpg')]" : ""}`}>
      {(!userData.theme || userData.theme === 'default') && (
        <div className="absolute inset-0 bg-black/40 pointer-events-none z-0"></div>
      )}
      <ThemeBackground theme={userData.theme || 'default'} />
      <KanjiEffect effect={userData.equippedEffect || 'none'} />

      <div className="max-w-2xl mx-auto space-y-6 relative z-10 w-full">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-black text-amber-400 drop-shadow-md text-outline-dark flex items-center gap-2">
          <span>⚔️</span> 学年対抗レイド戦況
        </h1>
        <Button variant="outline" onClick={() => router.push("/home")}>もどる</Button>
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

      {/* Our Grade Boss */}
      <section className="game-panel p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>
        <h2 className="text-lg font-bold text-amber-300 mb-4 border-b-2 border-amber-500/50 pb-2 flex items-center gap-2 relative z-10">
          <span>🔥</span> わたしたちの学年（{userData?.grade || 1}年生）
        </h2>
        <div className="relative">
          <RaidBoss />
        </div>
      </section>

      {/* Other Grades */}
      <section className="game-panel p-6">
        <h2 className="text-lg font-bold text-amber-200 mb-4 border-b-2 border-amber-500/50 pb-2">📊 他の学年の戦況</h2>
        
        <div className="space-y-6">
          {otherGrades.map((d, index) => {
            let currentBossIcon = getRaidBossIcon(d.level);
            let currentBossName = getRaidBossName(d.level);
            if (currentMonth === 10) {
              currentBossIcon = "🎃";
              currentBossName = "ハロウィン " + currentBossName;
            } else if (currentMonth === 12) {
              currentBossIcon = "⛄";
              currentBossName = "スノーマン " + currentBossName;
            }
            
            const hpPercent = d.maxHp > 0 ? Math.max(0, (d.hp / d.maxHp) * 100) : 0;
            const bossImagePath = getRaidBossImagePath(d.level, isScary);

            return (
            <motion.div 
              key={d.grade}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-700 relative overflow-hidden ${isScary ? 'border-red-500 bg-black' : ''}`}
            >
              {isScary ? (
                <>
                  <div className="absolute inset-0 z-0 opacity-40 bg-cover bg-center pointer-events-none" style={{ backgroundImage: `url('${bossImagePath}')` }}></div>
                  <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent pointer-events-none"></div>
                </>
              ) : (
                <div className="absolute inset-0 z-0 opacity-20 bg-cover bg-center pointer-events-none transition-all duration-1000" style={{ backgroundImage: `url('${bossImagePath}')` }}></div>
              )}
              <div className="flex justify-between items-center mb-2 relative z-10">
                <div className="flex items-center gap-2">
                  {!isScary && <img src={bossImagePath} alt="boss" className="w-8 h-8 rounded-full border-2 border-slate-300 object-cover shadow-sm" />}
                  <div className={`font-black text-lg ${isScary ? 'text-white drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]' : 'text-slate-100'}`}>
                    <span className={`text-sm mr-2 ${isScary ? 'text-red-300' : 'text-slate-400'}`}>{d.grade}年生</span>
                    {currentBossName}
                  </div>
                </div>
                <div className={`font-bold px-3 py-1 rounded-full text-sm ${isScary ? 'text-red-400 bg-red-950/80 border border-red-900' : 'text-red-400 bg-red-950/50 border border-red-900'}`}>
                  Lv.{d.level}
                </div>
              </div>
              
              <div className={`flex justify-between text-xs font-bold mb-1 relative z-10 text-slate-400`}>
                <span>ボスHP</span>
                <span>{hpPercent.toFixed(1)}%</span>
              </div>
              <div className={`h-3 w-full rounded-full overflow-hidden relative z-10 bg-slate-900 border border-slate-700`}>
                <motion.div 
                  className={`h-full bg-gradient-to-r from-red-600 to-rose-500`}
                  initial={{ width: "100%" }}
                  animate={{ width: `${hpPercent}%` }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                />
              </div>
              
              {hpPercent < 20 && (
                <div className={`mt-2 text-xs font-bold animate-pulse text-right relative z-10 text-amber-400`}>
                  もうすぐ討伐！🔥
                </div>
              )}
            </motion.div>
          )})}
        </div>
      </section>

      {/* Raid Boss Encyclopedia */}
      <section className="game-panel p-6">
        <h2 className="text-lg font-bold text-amber-200 mb-4 border-b-2 border-amber-500/50 pb-2 flex items-center gap-2">
          <span>📖</span> レイドボス進化図鑑
        </h2>
        <div className="text-sm font-bold text-slate-400 mb-4">
          ボスはレベルがあがると、どんどん強力な姿に進化するぞ！<br/>
          みんなで力をあわせて、レベル10の完全討伐をめざそう！
        </div>
        <div className="space-y-3">
          {[1,2,3,4,5,6,7,8,9,10].map(level => {
            const icon = getRaidBossIcon(level);
            const name = getRaidBossName(level);
            const maxHp = getRaidBossMaxHp(level);
            const imagePath = getRaidBossImagePath(level, isScary);
            
            return (
              <div key={level} className={`bg-white/80 rounded-2xl p-3 shadow-sm border relative overflow-hidden flex items-center gap-4 ${isScary ? 'border-red-900/50 bg-black/95' : 'border-slate-200'}`}>
                {isScary ? (
                  <>
                    <div className="absolute inset-0 z-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: `url('${imagePath}')` }}></div>
                    <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
                  </>
                ) : (
                  <div className="absolute inset-0 z-0 opacity-10 bg-cover bg-center pointer-events-none" style={{ backgroundImage: `url('${imagePath}')` }}></div>
                )}
                <div className={`relative z-10 w-12 h-12 flex flex-col items-center justify-center rounded-xl font-black text-sm shrink-0 shadow-inner ${isScary ? 'bg-black/60 text-red-500 border border-red-900' : 'bg-indigo-100 text-indigo-900'}`}>
                  Lv.{level}
                </div>
                
                <div className={`relative z-10 w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 ${isScary ? 'border-red-500/50 shadow-[0_0_10px_rgba(220,38,38,0.3)]' : 'border-indigo-300 shadow-md'}`}>
                  <img src={imagePath} alt={name} className="w-full h-full object-cover" />
                </div>
                
                <div className="relative z-10 flex-1">
                  <div className={`font-black text-lg leading-tight ${isScary ? 'text-white drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]' : 'text-slate-800'}`}>{name}</div>
                  <div className={`text-sm font-bold mt-1 ${isScary ? 'text-red-400' : 'text-rose-600'}`}>最大HP: {maxHp.toLocaleString()}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      </div>
    </div>
  );
}
