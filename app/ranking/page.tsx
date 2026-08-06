"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useUser } from "../../hooks/useUser";
import { Button } from "../../components/ui/Button";
import { RankPlate } from "../../components/ui/RankPlate";
import { calculateLevel } from "../../lib/gameLogic";
import { LoadingScreen } from "../../components/ui/LoadingScreen";
import { AvatarPreviewModal } from "../../components/ui/AvatarPreviewModal";
import { useRouter } from "next/navigation";
import { getCurrentJSTWeekString } from "../../lib/raidLogic";

type RankingUser = {
  id: string;
  name: string;
  grade: number;
  xp: number;
  equippedTitle?: string;
  equippedAvatar?: string;
  weeklyXp?: number;
  lastWeekString?: string;
  theme?: string;
};

export default function RankingPage() {
  const { userData, isGuest } = useUser();
  const router = useRouter();
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [gradeFilter, setGradeFilter] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [previewingAvatar, setPreviewingAvatar] = useState<{url?: string, id?: string, name?: string} | null>(null);

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      try {
        const usersRef = collection(db, "users");
        const currentWeekString = getCurrentJSTWeekString();
        // We will fetch users by grade and active week, then sort them client-side.
        const q = query(
          usersRef, 
          where("grade", "==", gradeFilter),
          where("lastWeekString", "==", currentWeekString)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RankingUser));
        
        // Client-side sort and limit, safe against undefined weeklyXp
        const sortedData = data.sort((a, b) => {
          const aXp = a.lastWeekString === currentWeekString ? (a.weeklyXp || 0) : 0;
          const bXp = b.lastWeekString === currentWeekString ? (b.weeklyXp || 0) : 0;
          return bXp - aXp;
        }).slice(0, 10);
        
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
          <div className="text-xl font-bold text-slate-800 drop-shadow-sm">👑 ランキングは <span className="text-amber-600 text-2xl font-black border-b-4 border-amber-300">獲得WP（ウィークリーポイント）</span> で決まるよ！</div>
          <div className="text-sm mt-1 font-bold text-slate-600">クエストをクリアしてWPを稼ごう！ WPは毎週リセットされるから、いつ始めてもトップを狙えるよ！</div>
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
            <LoadingScreen fullScreen={false} />
          ) : ranking.length === 0 ? (
            <div className="text-center py-12 text-gray-500 font-bold">まだ だれもいないよ！チャンス！</div>
          ) : (
            <div className="flex flex-col gap-4">
              {ranking.map((user, index) => {
                const { level } = calculateLevel(user.xp || 0);
                
                const isDefault = !user.theme || user.theme === 'default';
                const themeName = user.theme === 'time_space' ? 'space' : user.theme;
                const bgUrl = isDefault ? "/kanji-quest/images/ui/fantasy_bg.jpg" : `/kanji-quest/images/themes/bg_${themeName}.jpg`;

                return (
                  <div key={user.id} className="relative flex items-center gap-4 bg-slate-800/80 border-2 border-slate-500/50 p-4 rounded-2xl shadow-inner overflow-hidden">
                    {/* テーマ背景レイヤー */}
                    <div 
                      className={`absolute inset-0 bg-cover bg-center pointer-events-none opacity-40 mix-blend-screen ${user.theme === 'time_space' ? 'hue-rotate-180' : ''}`}
                      style={{ backgroundImage: `url('${bgUrl}')` }}
                    />
                    <div className="absolute inset-0 bg-black/50 pointer-events-none" />

                    {/* コンテンツ */}
                    <div className="text-3xl font-black w-8 text-center text-amber-400 drop-shadow-md relative z-10">
                      {index + 1}
                    </div>
                    <div className="flex-1 relative z-10">
                      <div className="font-black text-lg text-slate-100 line-clamp-1 break-all flex items-center gap-2 drop-shadow-sm">
                        {user.name || "名無し"}
                        {user.id === userData?.id && <span className="text-xs bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full font-black">あなた</span>}
                      </div>
                      <div className="text-sm font-bold text-amber-300 drop-shadow-sm">
                        Lv.{calculateLevel(user.xp).level} (WP: {user.lastWeekString === getCurrentJSTWeekString() ? (user.weeklyXp || 0) : 0})
                      </div>
                    </div>
                    <div className="scale-75 origin-right relative z-10">
                      <RankPlate 
                        level={level} 
                        name="" 
                        title={user.equippedTitle} 
                        avatar={user.equippedAvatar} 
                        onAvatarClick={(url, id) => setPreviewingAvatar({url, id, name: user.name})}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AvatarPreviewModal 
        isOpen={!!previewingAvatar} 
        onClose={() => setPreviewingAvatar(null)}
        avatarUrl={previewingAvatar?.url}
        avatarId={previewingAvatar?.id}
        name={previewingAvatar?.name}
      />
    </main>
  );
}
