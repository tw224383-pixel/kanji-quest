"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useUser } from "../../hooks/useUser";
import { motion } from "framer-motion";
import { storage } from "../../lib/storage";
import Link from "next/link";
import { getRaidBossIcon, getRaidBossName, getRaidBossMaxHp, MAX_RAID_LEVEL } from "../../lib/raidLogic";

export function RaidBoss() {
  const { user, isGuest, userData, updateUserData } = useUser();
  const [hp, setHp] = useState(getRaidBossMaxHp(1));
  const [maxHp, setMaxHp] = useState(getRaidBossMaxHp(1));
  const [level, setLevel] = useState(1);

  const currentMonth = new Date().toISOString().slice(0, 7);

  // Local sync
  useEffect(() => {
    if (isGuest) {
      const handleGuestUpdate = () => {
        let localLv = parseInt(localStorage.getItem("kq_raid_level") || "1", 10);
        let localHp = parseInt(localStorage.getItem("kq_raid_hp") || getRaidBossMaxHp(1).toString(), 10);
        const month = localStorage.getItem("kq_raid_month") || currentMonth;
        
        if (month !== currentMonth) {
          localLv = 1;
          localHp = getRaidBossMaxHp(1);
          localStorage.setItem("kq_raid_level", "1");
          localStorage.setItem("kq_raid_hp", localHp.toString());
          localStorage.setItem("kq_raid_month", currentMonth);
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
      const ref = doc(db, "globalStats", "raidBoss");
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

  if (monthNum === 10) {
    bossIcon = "🎃"; bossName = "ハロウィン " + bossName;
  } else if (monthNum === 12) {
    bossIcon = "⛄"; bossName = "スノーマン " + bossName;
  }

  return (
    <div className="glass rounded-3xl p-6 shadow-xl border-4 border-purple-500/50 bg-gradient-to-br from-purple-100 to-indigo-50 mb-8 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 blur-sm pointer-events-none">{bossIcon}</div>

      <div className="flex justify-between items-end mb-3 relative z-10">
         <div className="text-xl md:text-2xl font-black text-purple-900 drop-shadow-sm flex items-center gap-2">
           <span>{bossIcon}</span> {bossName} 
           {hp <= 0 && level >= MAX_RAID_LEVEL ? (
             <span className="text-amber-500 bg-white/80 px-2 rounded-lg text-lg animate-pulse">MAX 討伐済</span>
           ) : (
             <span className="text-purple-600 bg-white/50 px-2 rounded-lg text-lg">Lv.{level}</span>
           )}
         </div>
         <div className="text-sm md:text-base font-bold text-purple-700 bg-white/60 px-3 py-1 rounded-full border border-purple-200">
           HP: {hp} / {maxHp}
         </div>
      </div>
      
      <div className="w-full bg-purple-900/10 rounded-full h-8 border-2 border-white/80 overflow-hidden relative shadow-inner">
         <motion.div 
           animate={{ width: `${percent}%` }}
           transition={{ duration: 0.5 }}
           className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-end pr-2"
         >
           {percent > 0 && <div className="text-white/50 text-xs font-black animate-pulse">🔥</div>}
         </motion.div>
      </div>
      
      <div className="text-xs text-purple-600 font-bold text-center mt-2 opacity-70">
        ※クエストをクリアしてXPを稼ぐと、ボスにダメージを与えられるぞ！
      </div>

      <div className="mt-4 text-center">
        <Link href="/raid" className="inline-block bg-white/80 text-purple-700 font-bold px-6 py-2 rounded-full text-sm shadow hover:bg-white transition-colors border border-purple-200">
          ⚔️ 他の学年の戦況を見る
        </Link>
      </div>
    </div>
  );
}
