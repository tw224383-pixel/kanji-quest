"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useUser } from "../../hooks/useUser";
import { Button } from "../../components/ui/Button";
import { RankPlate } from "../../components/ui/RankPlate";
import { calculateLevel } from "../../lib/gameLogic";
import { useRouter } from "next/navigation";

type RankingUser = {
  id: string;
  name: string;
  xp: number;
  grade: number;
  equippedTitle?: string;
  equippedAvatar?: string;
};

export default function RankingPage() {
  const { userData, isGuest } = useUser();
  const router = useRouter();
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [gradeFilter, setGradeFilter] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      try {
        const usersRef = collection(db, "users");
        // Firebase composite index (grade + xp) is likely missing. 
        // We will fetch users by grade and sort them client-side.
        const q = query(
          usersRef, 
          where("grade", "==", gradeFilter)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RankingUser));
        
        // Client-side sort and limit
        const sortedData = data.sort((a, b) => b.xp - a.xp).slice(0, 10);
        
        setRanking(sortedData);
      } catch (err) {
        console.error("Failed to fetch ranking", err);
      }
      setLoading(false);
    };

    fetchRanking();
  }, [gradeFilter]);

  return (
    <main className={`min-h-screen p-6 relative bg-cover bg-center bg-fixed ${(!userData?.theme || userData.theme === 'default') ? "bg-[url('/kanji-quest/images/ui/fantasy_bg.jpg')]" : ""}`}>
      {/* Dark overlay */}
      {(!userData?.theme || userData.theme === 'default') && (
        <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
      )}

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-amber-400 drop-shadow-md text-outline-dark">今週のヒーロー</h1>
          <Button variant="outline" onClick={() => router.push("/home")}>もどる</Button>
        </div>

        <div className="game-panel-light p-4 mb-6 text-center">
          <div className="text-xl font-bold text-slate-800 drop-shadow-sm">👑 ランキングは <span className="text-amber-600 text-2xl font-black border-b-4 border-amber-300">獲得XP（けいけんち）</span> で決まるよ！</div>
          <div className="text-sm mt-1 font-bold text-slate-600">クエストをたくさんクリアしてXPを稼ぎ、トップを目指そう！</div>
        </div>

        {isGuest && (
          <div className="game-panel-light border-red-400 text-red-700 p-4 mb-8 text-center shadow-sm">
            ゲストモードではランキングに さんかできません。<br/>
            ランキングにのるには、アカウントとうろくをしてね！
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {[1, 2, 3, 4, 5, 6].map(grade => (
            <Button
              key={grade}
              variant={gradeFilter === grade ? "primary" : "outline"}
              onClick={() => setGradeFilter(grade)}
              className="whitespace-nowrap"
            >
              {grade}年生
            </Button>
          ))}
        </div>

        <div className="game-panel p-6">
          <h2 className="text-xl font-black text-amber-300 mb-6 text-center border-b-2 border-amber-500/50 pb-4">
            {gradeFilter}年生の ヒーローたち (トップ10)
          </h2>

          {loading ? (
            <div className="text-center py-12 text-gray-500 font-bold">よみこみちゅう...</div>
          ) : ranking.length === 0 ? (
            <div className="text-center py-12 text-gray-500 font-bold">まだ だれもいないよ！チャンス！</div>
          ) : (
            <div className="flex flex-col gap-4">
              {ranking.map((user, index) => {
                const { level } = calculateLevel(user.xp);
                return (
                  <div key={user.id} className="flex items-center gap-4 bg-slate-800/80 border-2 border-slate-600 p-4 rounded-2xl shadow-inner">
                    <div className="text-3xl font-black w-8 text-center text-amber-400 drop-shadow-md">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-lg text-slate-200">{user.name}</div>
                      <div className="text-sm font-bold text-amber-300">Lv. {level} (XP: {user.xp})</div>
                    </div>
                    <div className="scale-75 origin-right">
                      <RankPlate level={level} name="" title={user.equippedTitle} avatar={user.equippedAvatar} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
