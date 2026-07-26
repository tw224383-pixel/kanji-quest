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
};

export default function RankingPage() {
  const { isGuest } = useUser();
  const router = useRouter();
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [gradeFilter, setGradeFilter] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      try {
        const usersRef = collection(db, "users");
        const q = query(
          usersRef, 
          where("grade", "==", gradeFilter),
          orderBy("xp", "desc"), 
          limit(10)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RankingUser));
        setRanking(data);
      } catch (err) {
        console.error("Failed to fetch ranking", err);
      }
      setLoading(false);
    };

    fetchRanking();
  }, [gradeFilter]);

  return (
    <main className="min-h-screen bg-indigo-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-indigo-800">今週のヒーロー</h1>
          <Button variant="outline" onClick={() => router.push("/home")}>もどる</Button>
        </div>

        <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white p-4 rounded-2xl font-bold mb-6 shadow-md text-center">
          <div className="text-xl drop-shadow-md">👑 ランキングは <span className="text-yellow-100 text-2xl font-black border-b-4 border-yellow-200">獲得XP（けいけんち）</span> で決まるよ！</div>
          <div className="text-sm mt-1 opacity-90">クエストをたくさんクリアしてXPを稼ぎ、トップを目指そう！</div>
        </div>

        {isGuest && (
          <div className="bg-white border-2 border-indigo-200 text-indigo-800 p-4 rounded-2xl font-bold mb-8 text-center shadow-sm">
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

        <div className="bg-white rounded-3xl p-6 shadow-md border-4 border-indigo-100">
          <h2 className="text-xl font-bold text-indigo-900 mb-6 text-center border-b-2 border-indigo-100 pb-4">
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
                  <div key={user.id} className="flex items-center gap-4 bg-indigo-50/50 p-4 rounded-2xl">
                    <div className="text-2xl font-black w-8 text-center text-indigo-400">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg text-gray-800">{user.name}</div>
                      <div className="text-sm text-gray-500">Lv. {level} (XP: {user.xp})</div>
                    </div>
                    <div className="scale-75 origin-right">
                      <RankPlate level={level} name="" />
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
