"use client";

import { useUser } from "../../hooks/useUser";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/Button";
import { useEffect, useState, useMemo } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { LoadingScreen } from "../../components/ui/LoadingScreen";
import { motion, AnimatePresence } from "framer-motion";
import { calculateAdventurerStats } from "../../lib/userStatsLogic";
import { 
  AchievementItem, 
  AchievementTabType, 
  ACHIEVEMENT_TABS, 
  getAchievements 
} from "../../lib/achievementLogic";

type TabType = AchievementTabType;
type FilterType = "all" | "claimable" | "claimed" | "locked";

export default function AchievementsPage() {
  const { userData, updateUserDataAtomic, loading } = useUser();
  const router = useRouter();
  const [gradeBossLevel, setGradeBossLevel] = useState(1);
  const [rewardModal, setRewardModal] = useState<{ pt: number; sp: number; title: string; unlockedTitle?: string } | null>(null);
  
  const [activeTab, setActiveTab] = useState<TabType>("growth");
  const [statusFilter, setStatusFilter] = useState<FilterType>("all");

  useEffect(() => {
    const fetchGradeStats = async () => {
      if (!userData) return;
      try {
        const ref = doc(db, "globalStats", "raidBoss_" + userData.grade);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setGradeBossLevel(snap.data().level || 1);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchGradeStats();
  }, [userData]);

  // userData がまだ無い（ロード中）場合も安全なデフォルト値で計算する。
  // これらの計算やuseMemoを早期return（loadingガード）の後に置くと、
  // 「ロード中は呼ばれず、ロード完了後だけ呼ばれるフック」ができてしまい、
  // レンダーごとにフック呼び出し回数が変わってReactがクラッシュする
  // （Rendered fewer hooks than expected エラー）。必ず早期returnより前に置く。
  const claimed = userData?.claimedAchievements || [];
  const allAchievements: AchievementItem[] = userData ? getAchievements(userData, gradeBossLevel) : [];
  const claimableList = allAchievements.filter(a => a.unlocked && !claimed.includes(a.id));
  const totalUnlocked = allAchievements.filter(a => a.unlocked).length;

  const tabs = ACHIEVEMENT_TABS;
  const activeTabConfig = tabs.find(t => t.id === activeTab) || tabs[0];

  // Filter items based on activeTab and statusFilter
  const filteredItems = useMemo(() => {
    let items = allAchievements.filter(a => activeTabConfig.matchCats.includes(a.category));

    if (statusFilter === "claimable") {
      items = items.filter(a => a.unlocked && !claimed.includes(a.id));
    } else if (statusFilter === "claimed") {
      items = items.filter(a => claimed.includes(a.id));
    } else if (statusFilter === "locked") {
      items = items.filter(a => !a.unlocked);
    }

    return items;
  }, [allAchievements, activeTabConfig, statusFilter, claimed]);

  if (loading || !userData) return <LoadingScreen />;

  const loginStreak = userData.loginStreak || 1;
  const { averageLevel } = calculateAdventurerStats(userData);

  const handleClaim = async (ach: AchievementItem) => {
    if (!ach.unlocked || claimed.includes(ach.id)) return;

    type ClaimReward = { pt: number; sp: number; unlockedTitle?: string };
    let reward: ClaimReward | null = null;
    // 受け取り済みリスト・報酬とも、Firestoreトランザクション内で最新のサーバー側データを
    // 起点に再計算する（複数タブでの同時受け取りによる報酬の二重付与・消失を防ぐ）。
    const ok = await updateUserDataAtomic(current => {
      const currentClaimed = current.claimedAchievements || [];
      if (currentClaimed.includes(ach.id)) { reward = null; return null; }
      const currentAchievements = getAchievements(current, gradeBossLevel);
      const freshAch = currentAchievements.find(a => a.id === ach.id);
      if (!freshAch || !freshAch.unlocked) { reward = null; return null; }

      const newTitles = new Set(current.titles || []);
      if (freshAch.rewardTitle) newTitles.add(freshAch.rewardTitle);
      reward = { pt: freshAch.rewardPt, sp: freshAch.rewardSp, unlockedTitle: freshAch.rewardTitle };

      return {
        pt: current.pt + freshAch.rewardPt,
        sp: (current.sp || 0) + freshAch.rewardSp,
        titles: Array.from(newTitles),
        claimedAchievements: [...currentClaimed, ach.id],
      };
    });

    if (ok) {
      const finalReward = reward as unknown as ClaimReward;
      setRewardModal({ pt: finalReward.pt, sp: finalReward.sp, title: ach.name, unlockedTitle: finalReward.unlockedTitle });
    }
  };

  const handleClaimAll = async () => {
    if (claimableList.length === 0) return;

    type ClaimAllReward = { pt: number; sp: number };
    let claimedCount = 0;
    let reward: ClaimAllReward | null = null;
    const ok = await updateUserDataAtomic(current => {
      const currentClaimed = current.claimedAchievements || [];
      const currentAchievements = getAchievements(current, gradeBossLevel);
      const nowClaimable = currentAchievements.filter(a => a.unlocked && !currentClaimed.includes(a.id));
      if (nowClaimable.length === 0) { reward = null; return null; }

      let totalAddedPt = 0;
      let totalAddedSp = 0;
      const newClaimed = [...currentClaimed];
      const newTitles = new Set(current.titles || []);

      nowClaimable.forEach(ach => {
        totalAddedPt += ach.rewardPt;
        totalAddedSp += ach.rewardSp;
        newClaimed.push(ach.id);
        if (ach.rewardTitle) newTitles.add(ach.rewardTitle);
      });

      claimedCount = nowClaimable.length;
      reward = { pt: totalAddedPt, sp: totalAddedSp };

      return {
        pt: current.pt + totalAddedPt,
        sp: (current.sp || 0) + totalAddedSp,
        titles: Array.from(newTitles),
        claimedAchievements: newClaimed
      };
    });

    if (ok) {
      const finalReward = reward as unknown as ClaimAllReward;
      setRewardModal({ pt: finalReward.pt, sp: finalReward.sp, title: `${claimedCount}個の実績` });
    }
  };

  return (
    <main className="min-h-screen p-4 sm:p-6 relative text-slate-100">
      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2 text-amber-300 drop-shadow-md">
            <span>🏆</span> じっせき
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="fun" size="sm" onClick={() => router.push("/profile")}>
              📊 カルテへ
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push("/home")}>
              もどる
            </Button>
          </div>
        </div>

        {/* Progress & Claim All Bar */}
        <div className="bg-slate-900 border-2 border-amber-400 p-5 rounded-3xl shadow-2xl flex flex-col md:flex-row gap-5 items-center justify-between">
          <div className="flex-1 w-full space-y-2">
            <div className="flex items-center justify-between text-amber-200 font-bold text-xs sm:text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-white text-base">そうごう達成度</span>
                <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full shadow-sm">
                  🔥 れんぞく {loginStreak}日目
                </span>
                <span className="bg-indigo-950 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-500/50">
                  📊 カルテへいきん Lv.{averageLevel}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-300 drop-shadow-md">
                {totalUnlocked} <span className="text-sm text-slate-400 font-bold">/ {allAchievements.length}</span>
              </div>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-4 overflow-hidden border border-slate-700 shadow-inner">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300"
                initial={{ width: 0 }}
                animate={{ width: `${(totalUnlocked / allAchievements.length) * 100}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>

          {claimableList.length > 0 && (
            <Button
              variant="fun"
              size="lg"
              onClick={handleClaimAll}
              className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 border-2 border-white text-slate-950 font-black text-sm sm:text-base py-3 px-5 shadow-2xl animate-pulse whitespace-nowrap flex items-center gap-2 flex-shrink-0"
            >
              <span>🎁</span> まとめて うけとる ({claimableList.length}個)
            </Button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {tabs.map(tab => {
            const isSelected = activeTab === tab.id;
            const tabItems = allAchievements.filter(a => tab.matchCats.includes(a.category));
            const tabUnlocked = tabItems.filter(a => a.unlocked).length;
            const tabClaimable = tabItems.filter(a => a.unlocked && !claimed.includes(a.id)).length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-3 rounded-2xl border-2 transition-all flex flex-col justify-between items-center text-center relative ${
                  isSelected
                    ? "bg-amber-400 border-white text-slate-950 font-black shadow-lg scale-105"
                    : "bg-slate-900 border-slate-700 hover:border-amber-400/60 text-slate-200"
                }`}
              >
                {tabClaimable > 0 && (
                  <span className="absolute -top-2 -right-1 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-md animate-bounce">
                    🎁 {tabClaimable}
                  </span>
                )}
                <div className="text-xl mb-0.5">{tab.icon}</div>
                <div className="text-xs font-black truncate w-full">{tab.label}</div>
                <div className={`text-[10px] mt-1 font-bold ${isSelected ? "text-slate-900" : "text-amber-300"}`}>
                  {tabUnlocked}/{tabItems.length}
                </div>
              </button>
            );
          })}
        </div>

        {/* Status Filter Selector */}
        <div className="flex items-center justify-between flex-wrap gap-2 bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl">
          <div className="text-xs font-black text-amber-300 flex items-center gap-1.5 px-2">
            <span>{activeTabConfig.icon}</span>
            <span>{activeTabConfig.label}の実績 ({filteredItems.length}件)</span>
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            {[
              { id: "all", label: "すべて" },
              { id: "claimable", label: "🎁 受取可能" },
              { id: "claimed", label: "✓ 受取済" },
              { id: "locked", label: "🔒 未達成" },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id as FilterType)}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                  statusFilter === f.id
                    ? "bg-slate-100 text-slate-950 shadow-sm"
                    : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Achievement Card Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${statusFilter}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4"
          >
            {filteredItems.length === 0 ? (
              <div className="col-span-1 md:col-span-2 text-center py-12 bg-slate-900/80 border border-slate-800 rounded-3xl text-slate-400 font-bold text-sm">
                該当する実績はありません
              </div>
            ) : (
              filteredItems.map(ach => {
                const isClaimed = claimed.includes(ach.id);
                const isClaimable = ach.unlocked && !isClaimed;

                return (
                  <div 
                    key={ach.id} 
                    className={`p-4 rounded-2xl border-2 flex flex-col justify-between gap-3 transition-all ${
                      isClaimable 
                        ? 'border-amber-400 bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-900 shadow-[0_0_20px_rgba(251,191,36,0.3)] animate-pulse-slight' 
                        : isClaimed 
                          ? 'border-emerald-500/40 bg-slate-900/90 text-slate-300' 
                          : 'border-slate-800 bg-slate-950/70 opacity-65'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`text-3xl w-12 h-12 flex items-center justify-center rounded-2xl border flex-shrink-0 shadow-md ${
                        isClaimable ? 'bg-amber-400 text-slate-950 border-white' : 'bg-slate-950 text-white border-slate-700'
                      }`}>
                        {ach.unlocked ? ach.icon : '🔒'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-black text-base ${ach.unlocked ? 'text-amber-300' : 'text-slate-400'}`}>
                            {ach.unlocked ? ach.name : '？？？'}
                          </span>
                          {ach.rewardTitle && (
                            <span className="text-[10px] font-black bg-indigo-950 text-indigo-300 border border-indigo-500/60 px-2 py-0.2 rounded-full">
                              📛 限定称号
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-slate-200 mt-1 leading-relaxed">{ach.desc}</div>
                        
                        {/* Reward badge */}
                        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                          <span className="text-[11px] font-black bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                            ⭐ +{ach.rewardPt.toLocaleString()} PT
                          </span>
                          <span className="text-[11px] font-black bg-cyan-950 text-cyan-300 border border-cyan-500/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            🧪 +{ach.rewardSp.toLocaleString()} SP
                          </span>
                          {ach.rewardTitle && (
                            <span className="text-[11px] font-black bg-purple-950 text-purple-300 border border-purple-500/60 px-2 py-0.5 rounded-full">
                              👑 「{ach.rewardTitle}」
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end items-center pt-2.5 border-t border-slate-800/80 mt-1">
                      {isClaimed ? (
                        <div className="text-xs font-black text-emerald-400 bg-emerald-950/80 border border-emerald-500/50 px-3 py-1 rounded-full">
                          ✓ うけとりずみ
                        </div>
                      ) : isClaimable ? (
                        <Button 
                          variant="fun" 
                          size="sm" 
                          onClick={() => handleClaim(ach)} 
                          className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs px-4 py-1.5 shadow-lg animate-bounce border border-white"
                        >
                          🎁 ほうしゅうを受け取る
                        </Button>
                      ) : (
                        <div className="text-xs font-bold text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                          未達成
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>

      </div>

      {/* Claim Reward Popup Modal */}
      <AnimatePresence>
        {rewardModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" onClick={() => setRewardModal(null)}>
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 20 }}
              className="bg-slate-900 border-4 border-amber-400 p-8 rounded-3xl max-w-sm w-full text-center shadow-[0_0_50px_rgba(251,191,36,0.5)] relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-6xl mb-4 animate-bounce">🎁</div>
              <h3 className="text-xl font-black text-amber-300 mb-2">実績達成おめでとう！</h3>
              <div className="text-sm font-bold text-slate-300 mb-6">{rewardModal.title} の報酬を獲得したよ！</div>

              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-700 flex flex-col gap-3 mb-6">
                <div className="flex items-center justify-between text-amber-400 font-black text-lg">
                  <span className="flex items-center gap-2">⭐ PT獲得</span>
                  <span>+{rewardModal.pt.toLocaleString()} PT</span>
                </div>
                <div className="flex items-center justify-between text-cyan-400 font-black text-lg">
                  <span className="flex items-center gap-2">🧪 SP獲得</span>
                  <span>+{rewardModal.sp.toLocaleString()} SP</span>
                </div>
                {rewardModal.unlockedTitle && (
                  <div className="flex items-center justify-between text-purple-300 font-black text-base border-t border-slate-800 pt-2 mt-1">
                    <span className="flex items-center gap-2">👑 称号獲得</span>
                    <span>「{rewardModal.unlockedTitle}」</span>
                  </div>
                )}
              </div>

              <Button variant="fun" className="w-full text-lg py-3 border-2 border-amber-400 text-slate-950" onClick={() => setRewardModal(null)}>
                やったね！
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
