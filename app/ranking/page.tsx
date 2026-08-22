"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, where, query, limit } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useUser } from "../../hooks/useUser";
import { Button } from "../../components/ui/Button";
import { RankPlate } from "../../components/ui/RankPlate";
import { calculateLevel } from "../../lib/gameLogic";
import { LoadingScreen } from "../../components/ui/LoadingScreen";
import { AvatarPreviewModal } from "../../components/ui/AvatarPreviewModal";
import { EquipmentPreviewModal } from "../../components/ui/EquipmentPreviewModal";
import { useRouter } from "next/navigation";
import { getCurrentJSTWeekString, getCurrentJSTMonth } from "../../lib/raidLogic";

type RankingUser = {
  id: string;
  name: string;
  grade: number;
  xp: number;
  equippedTitle?: string;
  equippedAvatar?: string;
  equippedEquipment?: string;
  weeklyXp?: number;
  lastWeekString?: string;
  monthlyDamage?: number;
  lastMonthString?: string;
  theme?: string;
};

export default function RankingPage() {
  const { userData, isGuest } = useUser();
  const router = useRouter();
  const [tab, setTab] = useState<"hero" | "damage">("hero");
  const [gradeFilter, setGradeFilter] = useState<number>(userData?.grade || 1);
  const [heroRanking, setHeroRanking] = useState<RankingUser[]>([]);
  const [damageRanking, setDamageRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewingAvatar, setPreviewingAvatar] = useState<{url?: string, id?: string, name?: string} | null>(null);
  const [previewingEquipmentModal, setPreviewingEquipmentModal] = useState<string | null>(null);

  const currentWeekString = getCurrentJSTWeekString();
  const currentMonth = getCurrentJSTMonth();

  useEffect(() => {
    if (userData?.grade) {
      setGradeFilter(userData.grade);
    }
  }, [userData?.grade]);

  // 今週のヒーロー（学年別）フェッチ
  useEffect(() => {
    const fetchHero = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "users"),
          where("grade", "==", gradeFilter),
          limit(50)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => {
          const d = doc.data();
          const isCurrentUser = userData && (doc.id === userData.id || doc.id === "guest");
          return {
            id: doc.id,
            ...d,
            equippedEquipment: isCurrentUser ? userData.equippedEquipment : d.equippedEquipment
          } as RankingUser;
        });

        // Add guest user if guest
        if (isGuest && userData && userData.grade === gradeFilter) {
          const exists = data.find(u => u.id === "guest");
          if (!exists) {
            data.push({
              id: "guest",
              name: userData.name,
              grade: userData.grade,
              xp: userData.xp,
              equippedTitle: userData.equippedTitle,
              equippedAvatar: userData.equippedAvatar,
              equippedEquipment: userData.equippedEquipment,
              weeklyXp: userData.weeklyXp,
              lastWeekString: userData.lastWeekString,
            });
          }
        }

        const sorted = data
          .sort((a, b) => {
            const aXp = a.lastWeekString === currentWeekString ? (a.weeklyXp || 0) : 0;
            const bXp = b.lastWeekString === currentWeekString ? (b.weeklyXp || 0) : 0;
            if (bXp !== aXp) return bXp - aXp;
            return (b.xp || 0) - (a.xp || 0);
          })
          .slice(0, 10);

        setHeroRanking(sorted);
      } catch (err) {
        console.error("Failed to fetch hero ranking", err);
      }
      setLoading(false);
    };

    if (tab === "hero") fetchHero();
  }, [gradeFilter, tab, userData]);

  // 全学年ダメージ TOP5 フェッチ
  useEffect(() => {
    const fetchDamage = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "users"), limit(50));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => {
          const d = doc.data();
          const isCurrentUser = userData && (doc.id === userData.id || doc.id === "guest");
          return {
            id: doc.id,
            ...d,
            equippedEquipment: isCurrentUser ? userData.equippedEquipment : d.equippedEquipment
          } as RankingUser;
        });

        if (isGuest && userData) {
          const exists = data.find(u => u.id === "guest");
          if (!exists) {
            data.push({
              id: "guest",
              name: userData.name,
              grade: userData.grade,
              xp: userData.xp,
              equippedTitle: userData.equippedTitle,
              equippedAvatar: userData.equippedAvatar,
              equippedEquipment: userData.equippedEquipment,
              monthlyDamage: userData.monthlyDamage,
              lastMonthString: userData.lastMonthString,
            });
          }
        }

        const sorted = data
          .filter(u => (u.monthlyDamage || 0) > 0 || (u.xp || 0) > 0)
          .sort((a, b) => {
            const aDmg = a.lastMonthString === currentMonth ? (a.monthlyDamage || 0) : (a.monthlyDamage || 0);
            const bDmg = b.lastMonthString === currentMonth ? (b.monthlyDamage || 0) : (b.monthlyDamage || 0);
            if (bDmg !== aDmg) return bDmg - aDmg;
            return (b.xp || 0) - (a.xp || 0);
          })
          .slice(0, 5);

        setDamageRanking(sorted);
      } catch (err) {
        console.error("Failed to fetch damage ranking", err);
      }
      setLoading(false);
    };

    if (tab === "damage") fetchDamage();
  }, [tab, userData]);

  const renderUserCard = (user: RankingUser, index: number, score: number, scoreLabel: string) => {
    const { level } = calculateLevel(user.xp || 0);
    const isDefault = !user.theme || user.theme === "default";
    const themeName = user.theme === "time_space" ? "space" : user.theme;
    const bgUrl = isDefault ? "/images/ui/fantasy_bg.webp" : `/images/themes/bg_${themeName}.jpg`;

    return (
      <div key={user.id} className="relative flex items-center gap-4 bg-slate-800/80 border-2 border-slate-500/50 p-4 rounded-2xl shadow-inner overflow-hidden">
        <div
          className={`absolute inset-0 bg-cover bg-center pointer-events-none opacity-40 mix-blend-screen ${user.theme === "time_space" ? "hue-rotate-180" : ""}`}
          style={{ backgroundImage: `url('${bgUrl}')` }}
        />
        <div className="absolute inset-0 bg-black/50 pointer-events-none" />

        <div className="text-3xl font-black w-8 text-center text-amber-400 drop-shadow-md relative z-10">
          {index + 1}
        </div>
        <div className="flex-1 relative z-10">
          <div className="font-black text-lg text-slate-100 line-clamp-1 break-all flex items-center gap-2 drop-shadow-sm">
            {user.name || "名無し"}
            {user.id === userData?.id && <span className="text-xs bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full font-black">あなた</span>}
          </div>
          <div className="text-sm font-bold text-amber-300 drop-shadow-sm">
            {user.grade}年生 / Lv.{calculateLevel(user.xp).level}
          </div>
          <div className="text-sm font-black text-cyan-400">
            {scoreLabel}: {score.toLocaleString()}
          </div>
        </div>
        <div className="scale-75 origin-right relative z-10">
          <RankPlate
            level={level}
            name=""
            title={user.equippedTitle}
            avatar={user.equippedAvatar}
            equipment={user.equippedEquipment}
            onAvatarClick={(url, id) => setPreviewingAvatar({url, id, name: user.name})}
            onEquipmentClick={(eqId) => eqId && setPreviewingEquipmentModal(eqId)}
          />
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen p-6 relative z-10">

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black text-amber-400 drop-shadow-md text-outline-dark">ランキング</h1>
          <Button variant="outline" onClick={() => router.push("/home")}>もどる</Button>
        </div>

        {isGuest && (
          <div className="game-panel-light border-red-400 text-red-700 p-4 mb-6 text-center shadow-sm">
            ゲストモードではランキングに さんかできません。<br/>
            ランキングにのるには、アカウントとうろくをしてね！
          </div>
        )}

        {/* タブ切り替え */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setTab("hero")}
            className={`flex-1 py-3 rounded-2xl font-black text-lg transition-all ${tab === "hero" ? "bg-amber-400 text-amber-900 shadow-lg scale-105" : "bg-slate-700/80 text-slate-300 hover:bg-slate-600/80"}`}
          >
            👑 今週のヒーロー
          </button>
          <button
            onClick={() => setTab("damage")}
            className={`flex-1 py-3 rounded-2xl font-black text-lg transition-all ${tab === "damage" ? "bg-red-500 text-white shadow-lg scale-105" : "bg-slate-700/80 text-slate-300 hover:bg-slate-600/80"}`}
          >
            ⚔️ 全学年ダメージ TOP5
          </button>
        </div>

        {/* 今週のヒーロー */}
        {tab === "hero" && (
          <>
            <div className="game-panel-light p-5 mb-5 text-center relative overflow-hidden">
              <div className="text-lg font-bold text-slate-800">👑 ランキングは <span className="text-amber-600 text-xl font-black border-b-4 border-amber-300">週間WP（ウィークリーポイント）</span> で決まるよ！</div>
              <div className="text-sm mt-1 font-bold text-slate-600">毎週日曜日の深夜にリセットされるから、いつでも誰でもトップを狙えるよ！</div>

              {/* WPの貯め方ガイド */}
              <div className="mt-4 pt-3 border-t border-slate-200/80 bg-amber-50/90 rounded-2xl p-3.5 text-left shadow-sm">
                <div className="font-black text-amber-900 text-sm mb-2 flex items-center gap-1.5">
                  <span>💡</span> <span>WP（ウィークリーポイント）の貯め方：</span>
                </div>
                <ul className="text-xs font-bold text-slate-700 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li><span className="text-indigo-700 font-black">クイズに答えてクリア:</span> バトルで問題を解いてクリアするとXPを獲得＝WPにそのまま加算！</li>
                  <li><span className="text-orange-600 font-black">⌨️ キーボード入力で答える:</span> キーボード入力モードで挑戦すると獲得WPが <span className="text-red-600 font-black text-sm">3倍</span>！</li>
                  <li><span className="text-emerald-700 font-black">🔥 コンボをつなげる:</span> 連続正解するほどボーナスWPがアップ！</li>
                  <li><span className="text-purple-700 font-black">🔁 にがて克服モード:</span> にがて問題に挑戦すると獲得WPが <span className="text-purple-700 font-black text-sm">2倍</span>！</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-hide">
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
                {gradeFilter}年生の ヒーローたち（トップ10）
              </h2>
              {loading ? (
                <LoadingScreen fullScreen={false} />
              ) : heroRanking.length === 0 ? (
                <div className="text-center py-12 text-gray-400 font-bold">まだ だれもいないよ！チャンス！</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {heroRanking.map((user, index) => {
                    const score = user.lastWeekString === currentWeekString ? (user.weeklyXp || 0) : 0;
                    return renderUserCard(user, index, score, "WP");
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* 全学年ダメージ TOP5 */}
        {tab === "damage" && (
          <>
            <div className="game-panel-light p-4 mb-5 text-center">
              <div className="text-lg font-bold text-slate-800">⚔️ 今月 <span className="text-red-600 text-xl font-black border-b-4 border-red-300">全学年</span> で一番レイドボスにダメージを与えた 勇者たち！</div>
              <div className="text-sm mt-1 font-bold text-slate-600">毎月リセットされるよ！</div>
            </div>

            <div className="game-panel p-6">
              <h2 className="text-xl font-black text-red-300 mb-6 text-center border-b-2 border-red-500/50 pb-4">
                今月のダメージランキング TOP5
              </h2>
              {loading ? (
                <LoadingScreen fullScreen={false} />
              ) : damageRanking.length === 0 ? (
                <div className="text-center py-12 text-gray-400 font-bold">今月のデータがないよ！最初の勇者になろう！</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {damageRanking.map((user, index) => {
                    const score = user.monthlyDamage || 0;
                    return renderUserCard(user, index, score, "ダメージ");
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <AvatarPreviewModal
        isOpen={!!previewingAvatar}
        onClose={() => setPreviewingAvatar(null)}
        avatarUrl={previewingAvatar?.url}
        avatarId={previewingAvatar?.id}
        name={previewingAvatar?.name}
      />

      <EquipmentPreviewModal
        isOpen={!!previewingEquipmentModal}
        onClose={() => setPreviewingEquipmentModal(null)}
        equipmentId={previewingEquipmentModal}
      />
    </main>
  );
}
