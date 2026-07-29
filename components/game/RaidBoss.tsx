"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useUser } from "../../hooks/useUser";
import { motion } from "framer-motion";
import { storage } from "../../lib/storage";
import Link from "next/link";
import { getRaidBossIcon, getRaidBossName, getRaidBossMaxHp, MAX_RAID_LEVEL, getRaidBossImagePath } from "../../lib/raidLogic";

export function RaidBoss() {
  const { user, isGuest, userData, updateUserData } = useUser();
  const [hp, setHp] = useState(getRaidBossMaxHp(1));
  const [maxHp, setMaxHp] = useState(getRaidBossMaxHp(1));
  const [level, setLevel] = useState(1);

  const currentMonth = new Date().toISOString().slice(0, 7);

  // Local sync
  useEffect(() => {
    if (isGuest) {
      const grade = userData?.grade || 1;
      const handleGuestUpdate = () => {
        let localLv = parseInt(localStorage.getItem("kq_raid_level_" + grade) || "1", 10);
        let localHp = parseInt(localStorage.getItem("kq_raid_hp_" + grade) || getRaidBossMaxHp(1).toString(), 10);
        const month = localStorage.getItem("kq_raid_month_" + grade) || currentMonth;
        
        if (month !== currentMonth) {
          localLv = 1;
          localHp = getRaidBossMaxHp(1);
          localStorage.setItem("kq_raid_level_" + grade, "1");
          localStorage.setItem("kq_raid_hp_" + grade, localHp.toString());
          localStorage.setItem("kq_raid_month_" + grade, currentMonth);
        }

        setLevel(localLv);
        setHp(localHp);
        setMaxHp(getRaidBossMaxHp(localLv));
      };
      
      handleGuestUpdate();
      window.addEventListener("kq_guest_update", handleGuestUpdate);
      // Fallback polling for cross-tab updates without events
      const interval = setInterval(handleGuestUpdate, 2000);
      return () => {
        window.removeEventListener("kq_guest_update", handleGuestUpdate);
        clearInterval(interval);
      };
    } else if (user) {
      const grade = userData?.grade || 1;
      const ref = doc(db, "globalStats", "raidBoss_" + grade);
      const unsub = onSnapshot(ref, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const dbMonth = data.month || currentMonth;
          
          if (dbMonth !== currentMonth) {
            setDoc(ref, { hp: getRaidBossMaxHp(1), level: 1, month: currentMonth });
          } else {
            setLevel(data.level || 1);
            setHp(data.hp !== undefined ? data.hp : getRaidBossMaxHp(data.level || 1));
            setMaxHp(getRaidBossMaxHp(data.level || 1));
          }
        } else {
          setDoc(ref, { hp: getRaidBossMaxHp(1), level: 1, month: currentMonth }).catch(() => {});
        }
      });
      return () => unsub();
    }
  }, [isGuest, user, currentMonth]);

  // Give titles based on current level
  useEffect(() => {
    if (userData && updateUserData && userData.totalDamage > 0) {
      const missingTitles: string[] = [];
      const effectiveLevel = hp <= 0 && level >= MAX_RAID_LEVEL ? MAX_RAID_LEVEL + 1 : level;
      
      for (let i = 1; i < effectiveLevel; i++) {
        const titleName = `Lv${i}討伐隊`;
        if (!userData.titles.includes(titleName)) {
          missingTitles.push(titleName);
        }
      }

      if (missingTitles.length > 0) {
        updateUserData({ titles: [...userData.titles, ...missingTitles] });
        if (missingTitles.includes("Lv10討伐隊")) {
           alert("🎉 驚異的！ついに最大レベルのレイドボスを討伐した！！「Lv10討伐隊」の称号をゲット！");
        } else {
           alert(`🎉 やったー！レイドボス討伐の恩恵として、新しい称号「${missingTitles[0]}」などをゲットしたよ！`);
        }
      }
    }
  }, [level, hp, userData, updateUserData]);

  const percent = maxHp > 0 ? Math.max(0, (hp / maxHp) * 100) : 0;
  
  // Christmas / Halloween overrides
  const monthNum = new Date().getMonth() + 1;
  let bossIcon = getRaidBossIcon(level);
  let bossName = getRaidBossName(level);
  const bossImagePath = getRaidBossImagePath(level);
  const isScary = userData?.scaryMode || false;

  if (monthNum === 10) {
    bossIcon = "🎃"; bossName = "ハロウィン " + bossName;
  } else if (monthNum === 12) {
    bossIcon = "⛄"; bossName = "スノーマン " + bossName;
  }

  return (
    <div className={`glass rounded-3xl p-6 shadow-xl border-4 mb-8 relative overflow-hidden transition-all duration-1000 ${isScary ? 'border-red-900/50 bg-black/90 shadow-[0_0_30px_rgba(220,38,38,0.3)]' : 'border-purple-500/50 bg-gradient-to-br from-purple-100 to-indigo-50'}`}>
      
      {/* Background decoration */}
      {isScary ? (
        <>
          <div className="absolute inset-0 z-0 opacity-40 pointer-events-none bg-cover bg-center mix-blend-lighten transition-all duration-1000" style={{ backgroundImage: `url('${bossImagePath}')` }}></div>
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>
        </>
      ) : (
        <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 blur-sm pointer-events-none">{bossIcon}</div>
      )}

      <div className="flex justify-between items-end mb-3 relative z-10">
         <div className={`text-xl md:text-2xl font-black flex items-center gap-2 drop-shadow-md ${isScary ? 'text-red-500' : 'text-purple-900'}`}>
           {!isScary && <span>{bossIcon}</span>} 
           <span className={isScary ? 'text-white drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] tracking-widest' : ''}>{bossName}</span> 
           {hp <= 0 && level >= MAX_RAID_LEVEL ? (
             <span className="text-amber-500 bg-white/80 px-2 rounded-lg text-lg animate-pulse">MAX 討伐済</span>
           ) : (
             <span className={`${isScary ? 'text-red-500 bg-black/60 border border-red-500/50 shadow-inner' : 'text-purple-600 bg-white/50'} px-2 rounded-lg text-lg`}>Lv.{level}</span>
           )}
         </div>
         <div className={`text-sm md:text-base font-bold px-3 py-1 rounded-full border ${isScary ? 'text-red-300 bg-black/60 border-red-500 shadow-inner' : 'text-purple-700 bg-white/60 border-purple-200'}`}>
           HP: {hp} / {maxHp}
         </div>
      </div>
      
      <div className={`w-full rounded-full h-8 border-2 overflow-hidden relative shadow-inner ${isScary ? 'bg-black/80 border-red-900/80 shadow-[inset_0_0_10px_rgba(0,0,0,1)]' : 'bg-purple-900/10 border-white/80'}`}>
         <motion.div 
           animate={{ width: `${percent}%` }}
           transition={{ duration: 0.5 }}
           className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-end pr-2"
         >
           {percent > 0 && <div className="text-white/50 text-xs font-black animate-pulse">🔥</div>}
         </motion.div>
      </div>
      
      <div className={`text-xs font-bold text-center mt-2 opacity-70 ${isScary ? 'text-red-400' : 'text-purple-600'}`}>
        ※クエストをクリアしてXPを稼ぐと、ボスにダメージを与えられるぞ！
      </div>

      <div className="mt-4 text-center relative z-10">
        <Link href="/raid" className={`inline-block font-bold px-6 py-2 rounded-full text-sm shadow transition-all border ${isScary ? 'bg-red-950/80 text-red-300 border-red-500/50 hover:bg-red-900 hover:text-white shadow-[0_0_10px_rgba(220,38,38,0.3)]' : 'bg-white/80 text-purple-700 hover:bg-white border-purple-200'}`}>
          ⚔️ 他の学年の戦況を見る
        </Link>
      </div>
    </div>
  );
}
