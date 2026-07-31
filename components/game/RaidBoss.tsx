"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useUser } from "../../hooks/useUser";
import { motion } from "framer-motion";
import { storage } from "../../lib/storage";
import Link from "next/link";
import { getRaidBossIcon, getRaidBossName, getRaidBossMaxHp, MAX_RAID_LEVEL, getRaidBossImagePath, getRaidBossProfile } from "../../lib/raidLogic";

export function RaidBoss() {
  const { user, isGuest, userData, updateUserData } = useUser();
  const [hp, setHp] = useState(getRaidBossMaxHp(1));
  const [maxHp, setMaxHp] = useState(getRaidBossMaxHp(1));
  const [level, setLevel] = useState(1);
  const [showModal, setShowModal] = useState(false);

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
  const isScary = userData?.scaryMode || false;
  const bossImagePath = getRaidBossImagePath(level, isScary);

  if (monthNum === 10) {
    bossIcon = "🎃"; bossName = "ハロウィン " + bossName;
  } else if (monthNum === 12) {
    bossIcon = "⛄"; bossName = "スノーマン " + bossName;
  }

  const bossProfile = getRaidBossProfile(level, isScary);

  return (
    <>
    <div 
      onClick={() => setShowModal(true)}
      className={`glass rounded-3xl p-6 shadow-xl border-4 mb-8 relative overflow-hidden transition-all duration-500 cursor-pointer hover:scale-[1.02] hover:shadow-2xl group ${isScary ? 'border-red-900/50 bg-black/90 shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:border-red-500/80' : 'border-purple-500/50 bg-gradient-to-br from-purple-100 to-indigo-50 hover:border-purple-400'}`}
    >
      
      {/* Background decoration */}
      {isScary ? (
        <>
          <div className="absolute inset-0 z-0 opacity-40 pointer-events-none bg-cover bg-center mix-blend-lighten transition-all duration-1000" style={{ backgroundImage: `url('${bossImagePath}')` }}></div>
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>
        </>
      ) : (
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-cover bg-center transition-all duration-1000" style={{ backgroundImage: `url('${bossImagePath}')` }}></div>
      )}

      <div className="flex justify-between items-end mb-3 relative z-10 flex-wrap gap-2">
         <div className="flex flex-col gap-2">
           <div className={`text-xl md:text-2xl font-black flex items-center gap-2 drop-shadow-md ${isScary ? 'text-red-500' : 'text-purple-900'}`}>
             {!isScary && <img src={bossImagePath} alt="boss" className="w-8 h-8 rounded-full border-2 border-purple-300 shadow-sm object-cover" />} 
             <span className={isScary ? 'text-white drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] tracking-widest' : ''}>{bossName}</span> 
             {hp <= 0 && level >= MAX_RAID_LEVEL ? (
               <span className="text-amber-500 bg-white/80 px-2 rounded-lg text-lg animate-pulse whitespace-nowrap">MAX 討伐済</span>
             ) : (
               <span className={`${isScary ? 'text-red-500 bg-black/60 border border-red-500/50 shadow-inner' : 'text-purple-600 bg-white/50'} px-2 rounded-lg text-lg whitespace-nowrap`}>Lv.{level}</span>
             )}
           </div>
           
           {/* Scary Mode Toggle */}
           <div 
             className="flex items-center gap-2 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-700/50 w-max"
             onClick={(e) => {
               e.stopPropagation(); // prevent modal
               updateUserData({ scaryMode: !isScary });
             }}
           >
             <span className={`text-xs md:text-sm font-bold whitespace-nowrap ${isScary ? 'text-red-300' : 'text-slate-300'}`}>👹 リアルボス</span>
             <button 
               className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 shadow-inner border border-black/50 ${isScary ? 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]' : 'bg-slate-700'}`}
             >
               <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${isScary ? 'translate-x-6' : 'translate-x-0'}`}>
                 {isScary && <span className="text-[8px]">🔥</span>}
               </div>
             </button>
           </div>
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

      <div className="mt-4 text-center relative z-10 flex flex-col md:flex-row justify-center gap-3">
        <button className={`inline-block font-bold px-6 py-2 rounded-full text-sm shadow transition-all border ${isScary ? 'bg-black/80 text-red-400 border-red-900/50 group-hover:bg-red-900 group-hover:text-white group-hover:border-red-500' : 'bg-white/50 text-indigo-700 border-indigo-200 group-hover:bg-indigo-100'}`}>
          📖 ボスの詳細・討伐記録
        </button>
        <Link href="/raid" onClick={(e) => e.stopPropagation()} className={`inline-block font-bold px-6 py-2 rounded-full text-sm shadow transition-all border ${isScary ? 'bg-red-950/80 text-red-300 border-red-500/50 hover:bg-red-900 hover:text-white shadow-[0_0_10px_rgba(220,38,38,0.3)]' : 'bg-white/80 text-purple-700 hover:bg-white border-purple-200'}`}>
          ⚔️ 他の学年の戦況を見る
        </Link>
      </div>
    </div>

    {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className={`w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border-4 flex flex-col max-h-[90vh] ${isScary ? 'bg-zinc-950 border-red-900 text-red-50' : 'bg-slate-50 border-indigo-200 text-slate-800'}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="relative h-48 sm:h-56 w-full bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${bossImagePath}')` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              <button className="absolute top-3 right-3 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors z-10 font-bold" onClick={() => setShowModal(false)}>✕</button>
              <div className="absolute bottom-4 left-4 right-4">
                <div className={`text-sm font-bold mb-1 drop-shadow-md ${isScary ? 'text-red-400' : 'text-amber-400'}`}>{bossProfile.alias}</div>
                <div className="text-3xl sm:text-4xl font-black text-white flex items-center gap-2 drop-shadow-lg">
                  <span>{bossName}</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="mb-8">
                <h3 className={`font-black text-lg mb-3 flex items-center gap-2 ${isScary ? 'text-red-500 border-b border-red-900/50 pb-2' : 'text-indigo-800 border-b border-indigo-200 pb-2'}`}>
                  <span>📝</span> プロフィール
                </h3>
                <p className="text-sm leading-relaxed mb-4 font-bold opacity-90">{bossProfile.profile}</p>
                <p className="text-sm leading-relaxed opacity-80">{bossProfile.story}</p>
              </div>

              <div>
                <h3 className={`font-black text-lg mb-3 flex items-center gap-2 ${isScary ? 'text-red-500 border-b border-red-900/50 pb-2' : 'text-indigo-800 border-b border-indigo-200 pb-2'}`}>
                  <span>🏆</span> あなたの学年（{userData?.grade || 1}年生）の討伐記録
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({length: 10}).map((_, i) => {
                    const l = i + 1;
                    let count = 0;
                    if (level > l) count = 1;
                    else if (level === 10 && hp <= 0 && l === 10) count = 1;
                    
                    const isCurrent = l === level && hp > 0;
                    
                    return (
                      <div key={l} className={`p-2 rounded-xl text-center border-2 transition-colors ${
                        count > 0 ? (isScary ? 'bg-red-950 border-red-800 text-red-200' : 'bg-indigo-50 border-indigo-200 text-indigo-700') 
                        : isCurrent ? (isScary ? 'bg-black border-red-500 text-red-500 animate-pulse shadow-[0_0_10px_rgba(255,0,0,0.5)]' : 'bg-white border-amber-400 text-amber-600 font-bold shadow-md')
                        : (isScary ? 'bg-zinc-900/50 border-zinc-800 text-zinc-600' : 'bg-slate-100/50 border-slate-200 text-slate-400')
                      }`}>
                        <div className="text-[10px] sm:text-xs font-bold mb-1 opacity-80">Lv.{l}</div>
                        <div className="text-xs sm:text-sm font-black">{count > 0 ? "1回" : isCurrent ? "交戦中" : "-"}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
