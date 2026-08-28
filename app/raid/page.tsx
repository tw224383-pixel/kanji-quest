"use client";

import { useUser } from "../../hooks/useUser";
import { RaidBoss } from "../../components/game/RaidBoss";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/Button";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getRaidBossIcon, getRaidBossName, getRaidBossMaxHp, getRaidBossImagePath, getCurrentJSTMonth, getSeasonalBossPresentation, getCachedRaidBossStatus, TRANSCENDENT_LEVEL, HIDDEN_BOSS_NAME, isTranscendentRevealed } from "../../lib/raidLogic";
import { collection, query, limit, orderBy, getDocs, where } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { LoadingScreen } from "../../components/ui/LoadingScreen";
import { safeLocalStorage } from "../../lib/safeLocalStorage";

type GradeData = {
  grade: number;
  hp: number;
  level: number;
  maxHp: number;
};

export default function RaidPage() {
  const { userData, isGuest } = useUser();
  const router = useRouter();
  const [otherGrades, setOtherGrades] = useState<GradeData[]>([]);
  const [topRanking, setTopRanking] = useState<{name: string, damage: number, isUser: boolean}[]>([]);
  // 自分の学年が裏ボスに到達しているか（未到達なら図鑑では伏せ字にする）
  const [transcendentRevealed, setTranscendentRevealed] = useState(false);

  useEffect(() => {
    // 他学年のボス状況：常時購読(onSnapshot)ではなく、短いTTLキャッシュ付きの単発取得に
    // することでFirestoreの無料枠(読み取り5万回/日)を圧迫しないようにしている。
    let cancelled = false;
    const currentMonth = getCurrentJSTMonth();

    // Initialize default array
    setOtherGrades(Array.from({length: 6}, (_, i) => ({
      grade: i + 1,
      hp: getRaidBossMaxHp(1),
      level: 1,
      maxHp: getRaidBossMaxHp(1)
    })).filter(x => x.grade !== userData?.grade));

    for (let i = 1; i <= 6; i++) {
      if (i === userData?.grade) continue;
      getCachedRaidBossStatus(i).then(status => {
        if (cancelled) return;
        if (status.month !== currentMonth) return;
        setOtherGrades(prev => {
          const next = [...prev];
          const idx = next.findIndex(x => x.grade === i);
          if (idx !== -1) {
            next[idx] = { grade: i, hp: status.hp, level: status.level, maxHp: getRaidBossMaxHp(status.level) };
          }
          return next.sort((a, b) => a.grade - b.grade);
        });
      }).catch(() => {});
    }
    // 自分の学年が裏ボスに到達しているかを確認する（図鑑の伏せ字の出し分けに使う）。
    // ゲストはボスの進行状況をローカルに持っているので、そちらを見る必要がある
    // （Firestore を見ると常に未到達扱いになり、到達しても伏せ字のままになってしまう）。
    if (userData?.grade) {
      if (isGuest) {
        const lv = parseInt(safeLocalStorage.getItem("kq_raid_level_" + userData.grade) || "1", 10);
        const month = safeLocalStorage.getItem("kq_raid_month_" + userData.grade) || currentMonth;
        const cleared = (safeLocalStorage.getItem("kq_raid_transcendent_" + userData.grade) || "").split(",").filter(Boolean);
        setTranscendentRevealed((month === currentMonth && isTranscendentRevealed(lv)) || cleared.length > 0);
      } else {
        // 認証ユーザーは上のループと同じキャッシュを共有するので読み取りは増えない
        getCachedRaidBossStatus(userData.grade).then(status => {
          if (cancelled) return;
          const reached = status.month === currentMonth && isTranscendentRevealed(status.level);
          // 過去に一度でも討伐していれば、月が変わっても正体は見せたままにする
          setTranscendentRevealed(reached || status.transcendentClearedMonths.length > 0);
        }).catch(() => {});
      }
    }

    return () => { cancelled = true; };
  }, [userData?.grade, isGuest]);

  // 全学年ダメージ TOP5。
  // orderBy をサーバー側で必ず付けること。付けないとFirestoreはドキュメントID順の
  // 「たまたま先頭N件」を返すため、その中から上位5件を選んでも本当の上位者にならない
  // （利用者が増えてから顕在化した不具合。app/ranking/page.tsx も同じ理由で修正済み）。
  useEffect(() => {
    const fetchTopRanking = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("lastMonthString", "==", getCurrentJSTMonth()),
          orderBy("monthlyDamage", "desc"),
          limit(5)
        );
        const snap = await getDocs(q);
        const ranking = snap.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            name: data.name || "名無し",
            damage: data.monthlyDamage || 0,
            isUser: docSnap.id === auth.currentUser?.uid
          };
        }).filter(r => r.damage > 0);
        setTopRanking(ranking);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTopRanking();
  }, []);

  const isScary = userData?.scaryMode || false;

  if (!userData) return <LoadingScreen />;

  return (
    <div className="min-h-screen p-4 flex flex-col relative">

      <div className="max-w-2xl mx-auto space-y-6 relative z-10 w-full">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-black text-amber-400 drop-shadow-md text-outline-dark flex items-center gap-2">
          <span>⚔️</span> 学年対抗レイド戦況
        </h1>
        <Button variant="outline" onClick={() => router.push("/home")}>もどる</Button>
      </div>

      {/* Top 5 Damage Ranking */}
      <section className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 shadow-xl text-white">
        <h2 className="text-xl font-black mb-4 text-center flex items-center justify-center gap-2">
          <span>👑</span> ぜん学年 ダメージランキング TOP5
        </h2>
        <div className="space-y-3">
          {topRanking.map((player, idx) => (
            <div key={idx} className={`flex items-center justify-between p-3 rounded-xl font-bold ${player.isUser ? 'bg-white text-orange-600 shadow-md transform scale-105' : 'bg-white/20'}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx === 3 ? '🏅' : '🎖️'}</span>
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
          <RaidBoss showButtons={false} />
        </div>
      </section>

      {/* Other Grades */}
      <section className="game-panel p-6">
        <h2 className="text-lg font-bold text-amber-200 mb-4 border-b-2 border-amber-500/50 pb-2">📊 他の学年の戦況</h2>
        
        <div className="space-y-6">
          {otherGrades.map((d, index) => {
            const seasonal = getSeasonalBossPresentation(getRaidBossIcon(d.level), getRaidBossName(d.level));
            const currentBossIcon = seasonal.icon;
            const currentBossName = seasonal.name;


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
          {[1,2,3,4,5,6,7,8,9,10,TRANSCENDENT_LEVEL].map(level => {
            // 裏ボスは、自分の学年がそこへ到達するまで正体を伏せる。
            // 図鑑には枠だけ「？？？？？？」で見えていて、
            // 「Lv10の先にまだ何かいる」と気づけるようにする。
            const isHidden = level >= TRANSCENDENT_LEVEL && !transcendentRevealed;
            const icon = getRaidBossIcon(level);
            const name = isHidden ? HIDDEN_BOSS_NAME : getRaidBossName(level);
            const maxHp = getRaidBossMaxHp(level);
            const imagePath = getRaidBossImagePath(level, isScary);

            if (isHidden) {
              return (
                <div key={level} className="rounded-2xl p-3 shadow-sm border-2 border-dashed border-fuchsia-500/50 bg-slate-900/80 relative overflow-hidden flex items-center gap-4">
                  <div className="relative z-10 w-12 h-12 flex items-center justify-center rounded-xl font-black text-sm shrink-0 bg-black/60 text-fuchsia-400 border border-fuchsia-700">
                    Lv.??
                  </div>
                  <div className="relative z-10 w-12 h-12 rounded-full shrink-0 border-2 border-fuchsia-500/40 bg-black flex items-center justify-center text-2xl text-fuchsia-400 animate-pulse">
                    ?
                  </div>
                  <div className="relative z-10 flex-1">
                    <div className="font-black text-lg leading-tight text-fuchsia-300 tracking-widest animate-pulse">{HIDDEN_BOSS_NAME}</div>
                    <div className="text-sm font-bold mt-1 text-fuchsia-400/80">
                      最大HP: ???????
                      <span className="block text-xs text-slate-400 font-bold mt-0.5">
                        Lv.10 を討伐した学年だけが、その先を見ることができる…
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

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
