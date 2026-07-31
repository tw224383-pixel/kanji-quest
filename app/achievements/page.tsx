"use client";

import { useUser } from "../../hooks/useUser";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/Button";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { ThemeBackground } from "../../components/ui/ThemeBackground";
import { KanjiEffect } from "../../components/game/KanjiEffect";
import { LoadingScreen } from "../../components/ui/LoadingScreen";

export default function AchievementsPage() {
  const { userData, loading } = useUser();
  const router = useRouter();
  const [gradeBossLevel, setGradeBossLevel] = useState(1);
  const [gradeDamage, setGradeDamage] = useState(0);

  useEffect(() => {
    const fetchGradeStats = async () => {
      if (!userData) return;
      try {
        const ref = doc(db, "globalStats", "raidBoss_" + userData.grade);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setGradeBossLevel(snap.data().level || 1);
          // 累計ダメージの記録はまだないので、とりあえず仮で0にしておく
          // もし追加する場合は、全体のキル数(level-1)から大まかなダメージを計算可能
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchGradeStats();
  }, [userData]);

  if (loading || !userData) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const titleCount = userData.titles?.length || 0;
  const avatarCount = userData.avatars?.length || 0;
  const bossesKilled = gradeBossLevel - 1;

  const personalAchievements = [
    // XP (Levels)
    { id: "xp_1", name: "はじめての冒険", desc: "XPを少しでも稼ぐ", icon: "🔰", unlocked: userData.xp > 0 },
    { id: "xp_2", name: "見習い卒業", desc: "レベル5到達 (XP 400)", icon: "🌱", unlocked: userData.xp >= 400 },
    { id: "xp_3", name: "一人前の勇者", desc: "レベル10到達 (XP 1,000)", icon: "⚔️", unlocked: userData.xp >= 1000 },
    { id: "xp_4", name: "ベテラン勇者", desc: "レベル30到達 (XP 9,000)", icon: "🛡️", unlocked: userData.xp >= 9000 },
    { id: "xp_5", name: "伝説の勇者", desc: "レベル100到達 (XP 100,000)", icon: "👑", unlocked: userData.xp >= 100000 },
    { id: "xp_6", name: "神話の勇者", desc: "レベル200到達 (XP 400,000)", icon: "✨", unlocked: userData.xp >= 400000 },

    // PT (Money)
    { id: "pt_1", name: "おこづかいゲット", desc: "100 PT以上稼ぐ", icon: "🪙", unlocked: userData.pt >= 100 },
    { id: "pt_2", name: "貯金箱がいっぱい", desc: "1,000 PT以上稼ぐ", icon: "👛", unlocked: userData.pt >= 1000 },
    { id: "pt_3", name: "お金持ち", desc: "5,000 PT以上稼ぐ", icon: "💴", unlocked: userData.pt >= 5000 },
    { id: "pt_4", name: "大富豪", desc: "10,000 PT以上稼ぐ", icon: "💰", unlocked: userData.pt >= 10000 },
    { id: "pt_5", name: "億万長者", desc: "50,000 PT以上稼ぐ", icon: "🏦", unlocked: userData.pt >= 50000 },

    // Damage & Raids
    { id: "dmg_1", name: "はじめての貢献", desc: "レイドボスにダメージを与える", icon: "💥", unlocked: (userData.totalDamage || 0) > 0 },
    { id: "raid_1", name: "スライムキラー", desc: "Lv1 レイドボス討伐", icon: "💧", unlocked: userData.titles.includes("Lv1討伐隊") },
    { id: "raid_3", name: "ウルフハンター", desc: "Lv3 レイドボス討伐", icon: "🐺", unlocked: userData.titles.includes("Lv3討伐隊") },
    { id: "raid_5", name: "猛禽の天敵", desc: "Lv5 レイドボス討伐", icon: "🦅", unlocked: userData.titles.includes("Lv5討伐隊") },
    { id: "raid_7", name: "海からの生還", desc: "Lv7 レイドボス討伐", icon: "🦑", unlocked: userData.titles.includes("Lv7討伐隊") },
    { id: "raid_10", name: "伝説の救世主", desc: "Lv10 レイドボス討伐", icon: "🐉", unlocked: userData.titles.includes("Lv10討伐隊") },
    { id: "dmg_3", name: "レイドの英雄", desc: "ボスに累計10,000ダメージ", icon: "🦸", unlocked: (userData.totalDamage || 0) >= 10000 },
    { id: "dmg_4", name: "伝説のドラゴンスレイヤー", desc: "ボスに累計50,000ダメージ", icon: "🗡️", unlocked: (userData.totalDamage || 0) >= 50000 },
    { id: "dmg_5", name: "救世主", desc: "ボスに累計100,000ダメージ", icon: "🌟", unlocked: (userData.totalDamage || 0) >= 100000 },

    // Titles
    { id: "title_1", name: "駆け出しの冒険者", desc: "称号を1つ集める", icon: "📛", unlocked: titleCount >= 1 },
    { id: "title_2", name: "名乗りを上げる者", desc: "称号を3つ集める", icon: "📜", unlocked: titleCount >= 3 },
    { id: "title_3", name: "称号コレクター", desc: "称号を5つ集める", icon: "🏆", unlocked: titleCount >= 5 },
    { id: "title_4", name: "言葉の魔術師", desc: "称号を10つ集める", icon: "🎩", unlocked: titleCount >= 10 },

    // Avatars
    { id: "avatar_1", name: "おしゃれ好き", desc: "アバターを1つ集める", icon: "👕", unlocked: avatarCount >= 1 },
    { id: "avatar_2", name: "変装マスター", desc: "アバターを5つ集める", icon: "🎭", unlocked: avatarCount >= 5 },
    { id: "avatar_3", name: "アバターコレクター", desc: "アバターを10つ集める", icon: "🧑‍🎤", unlocked: avatarCount >= 10 },
    { id: "avatar_4", name: "百面相", desc: "アバターを20つ集める", icon: "👽", unlocked: avatarCount >= 20 },
  ];

  const gradeAchievements = [
    {
      id: "g_first_kill",
      name: "はじめての勝利",
      desc: "学年全体でレイドボスを1体たおした！",
      icon: "🎉",
      unlocked: bossesKilled >= 1
    },
    {
      id: "g_ten_kills",
      name: "ボスキラー軍団",
      desc: "学年全体でレイドボスを10体たおした！",
      icon: "🔥",
      unlocked: bossesKilled >= 10
    }
  ];

  const totalUnlocked = personalAchievements.filter(a => a.unlocked).length;

  if (!userData) return <LoadingScreen />;

  return (
    <main className={`min-h-screen p-6 relative bg-cover bg-center bg-fixed ${(!userData.theme || userData.theme === 'default') ? "bg-[url('/kanji-quest/images/ui/fantasy_bg.jpg')]" : ""}`}>
      {(!userData.theme || userData.theme === 'default') && (
        <div className="absolute inset-0 bg-black/40 pointer-events-none z-0"></div>
      )}
      <ThemeBackground theme={userData.theme || 'default'} />
      <KanjiEffect effect={userData.equippedEffect || 'none'} />
      
      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black flex items-center gap-2 text-amber-400 drop-shadow-md text-outline-dark">
            <span>🏆</span> じっせき
          </h1>
          <Button variant="outline" onClick={() => router.push("/home")}>もどる</Button>
        </div>

        <div className="game-panel p-6 mb-6">
          <div className="flex items-center justify-between mb-4 text-amber-200 font-bold">
            <div>かいほうした実績</div>
            <div className="text-3xl font-black text-amber-400 drop-shadow-md">{totalUnlocked} <span className="text-xl">/ {personalAchievements.length}</span></div>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-6 overflow-hidden border-2 border-amber-600/50 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-300"
              style={{ width: `${(totalUnlocked / personalAchievements.length) * 100}%` }}
            />
          </div>
        </div>

        <h2 className="text-2xl font-black text-amber-300 mb-4 drop-shadow-md flex items-center gap-2">
          <span>👤</span> 個人のじっせき
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {personalAchievements.map(ach => (
            <div key={ach.id} className={`game-panel-light p-4 flex gap-4 items-center transition-all ${ach.unlocked ? '' : 'opacity-60 grayscale'}`}>
              <div className="text-5xl drop-shadow-md">{ach.unlocked ? ach.icon : '❓'}</div>
              <div>
                <div className={`font-black text-lg ${ach.unlocked ? 'text-amber-600' : 'text-slate-500'}`}>{ach.unlocked ? ach.name : '？？？'}</div>
                <div className="text-sm font-bold text-slate-600 mt-1">{ach.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-black text-emerald-300 mb-4 drop-shadow-md flex items-center gap-2">
          <span>🏫</span> {userData.grade}年生のじっせき
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {gradeAchievements.map(ach => (
            <div key={ach.id} className={`game-panel-light p-4 flex gap-4 items-center transition-all ${ach.unlocked ? '' : 'opacity-60 grayscale'}`}>
              <div className="text-5xl drop-shadow-md">{ach.unlocked ? ach.icon : '❓'}</div>
              <div>
                <div className={`font-black text-lg ${ach.unlocked ? 'text-emerald-600' : 'text-slate-500'}`}>{ach.unlocked ? ach.name : '？？？'}</div>
                <div className="text-sm font-bold text-slate-600 mt-1">{ach.desc}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
