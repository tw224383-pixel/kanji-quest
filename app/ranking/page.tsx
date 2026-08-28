"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, where, query, limit, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useUser } from "../../hooks/useUser";
import { Button } from "../../components/ui/Button";
import { RankPlate } from "../../components/ui/RankPlate";
import { calculateLevel } from "../../lib/gameLogic";
import { LoadingScreen } from "../../components/ui/LoadingScreen";
import { AvatarPreviewModal } from "../../components/ui/AvatarPreviewModal";
import { EquipmentPreviewModal } from "../../components/ui/EquipmentPreviewModal";
import { useRouter } from "next/navigation";
import { getCurrentJSTWeekString, getCurrentJSTMonth, getPreviousJSTWeekString, getPreviousJSTMonth } from "../../lib/raidLogic";

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
  // 確定済みの前期間の成績（先週のヒーロー・先月のダメージ用）
  prevWeeklyXp?: number;
  prevWeekString?: string;
  prevMonthlyDamage?: number;
  prevMonthString?: string;
  theme?: string;
};

export default function RankingPage() {
  const { userData, user, isGuest, updateUserDataAtomic, loading: authLoading } = useUser();
  const router = useRouter();
  const [tab, setTab] = useState<"hero" | "damage">("hero");
  const [gradeFilter, setGradeFilter] = useState<number>(userData?.grade || 1);
  const [heroRanking, setHeroRanking] = useState<RankingUser[]>([]);
  const [damageRanking, setDamageRanking] = useState<RankingUser[]>([]);
  const [lastWeekHeroRanking, setLastWeekHeroRanking] = useState<RankingUser[]>([]);
  const [lastMonthDamageRanking, setLastMonthDamageRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewingAvatar, setPreviewingAvatar] = useState<{url?: string, id?: string, name?: string} | null>(null);
  const [previewingEquipmentModal, setPreviewingEquipmentModal] = useState<string | null>(null);

  const currentWeekString = getCurrentJSTWeekString();
  const currentMonth = getCurrentJSTMonth();
  const previousWeekString = getPreviousJSTWeekString();
  const previousMonth = getPreviousJSTMonth();

  // ランキング実績用：自分が過去の期間（先週・先月）の最終順位に何位で載っていたかを検出し、
  // これまでの自己ベストより良ければ記録する。
  //
  // 以前は「週や月の途中でたまたまランキングを覗いた瞬間」の順位をそのまま確定させていたため、
  //   (a) 数人しかプレイしていないうちに覗くとTOP10〜1位まで簡単に確定してしまう
  //   (b) 「期間の終わり間際だけ確定させる」対策も試したが、今度は土日・月末にログインできない
  //       子が実績を取り損ねてしまう
  // という問題があった。そこで「期間が終わった後、今の期間中にランキングを開いたタイミングで
  // “先週・先月の確定済みデータ” を参照する」方式に変更した。自分のドキュメントは今期に入って
  // まだプレイしていない間は前期の値を保持しているため、いつ開いても先週・先月の最終順位を
  // 正しく参照できる（土日・月末に限定する必要がなくなる）。
  const recordBestRank = (field: "bestWeeklyHeroRank" | "bestDamageRank", rank: number, poolSize: number, minPool: number) => {
    if (poolSize < minPool) return;
    updateUserDataAtomic(current => {
      const existing = current[field];
      if (existing !== undefined && existing <= rank) return null;
      return { [field]: rank };
    });
  };

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
        // 【重要】必ずサーバー側で並べ替える。
        // 以前は orderBy を付けずに limit だけで取得していたため、Firestoreは
        // ドキュメントID順の「たまたま先頭N件」を返し、その中だけを並べ替えていた。
        // 利用者が数十人のうちは全員取れていて正しく見えたが、234人規模になった
        // 時点で本当の上位者が取得対象から漏れ、ランキングがほぼ無意味になっていた。
        // 今週プレイした人だけを weeklyXp の高い順に10件だけ取れば、正確なうえに
        // 読み取り回数も大幅に減る（複合インデックスは firestore.indexes.json）。
        const q = query(
          collection(db, "users"),
          where("grade", "==", gradeFilter),
          where("lastWeekString", "==", currentWeekString),
          orderBy("weeklyXp", "desc"),
          limit(10)
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

        // Add guest user if guest（ゲストはFirestoreに存在しないのでクエリ結果に入らない）。
        // 先週以前のweeklyXpが残っている場合は今週の記録ではないので加えない。
        if (isGuest && userData && userData.grade === gradeFilter && userData.lastWeekString === currentWeekString) {
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
              // theme を渡さないと、ゲストは自分のカードだけ背景が既定のままになる
              theme: userData.theme,
              weeklyXp: userData.weeklyXp,
              lastWeekString: userData.lastWeekString,
            });
          }
        }

        // サーバー側で並べ替え済み。ゲストは Firestore に存在しないためここで差し込み、
        // まだ今週のWPが0の人は「今週のヒーロー」には出さない。
        const sorted = data
          .filter(u => (u.weeklyXp || 0) > 0)
          .sort((a, b) => {
            const diff = (b.weeklyXp || 0) - (a.weeklyXp || 0);
            return diff !== 0 ? diff : (b.xp || 0) - (a.xp || 0);
          })
          .slice(0, 10);

        setHeroRanking(sorted);
      } catch (err) {
        console.error("Failed to fetch hero ranking", err);
      }
      setLoading(false);
    };

    // Firebase Authの初期化が完了する前にクエリを投げると permission-denied になるため待つ
    if (tab === "hero" && !authLoading) fetchHero();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gradeFilter, tab, userData, authLoading]);

  // 先週のヒーロー（学年別・確定済み）フェッチ ＋ 実績判定
  // 今週まだプレイしていないユーザーは lastWeekString が先週のままなので、
  // このクエリで「先週の最終順位」を確定値として参照できる（土日限定にしない）。
  useEffect(() => {
    const fetchLastWeekHero = async () => {
      try {
        // 【重要】lastWeekString / weeklyXp ではなく、確定済みスナップショットの
        // prevWeekString / prevWeeklyXp を参照する。lastWeekString は「最後にプレイした週」を
        // 指す上書き式の値なので、今週プレイした時点で先週の成績が消えてしまい、
        // 週が進むほどランキングから人が消えて実績もほぼ付与されなくなっていた。
        const q = query(
          collection(db, "users"),
          where("grade", "==", gradeFilter),
          where("prevWeekString", "==", previousWeekString),
          orderBy("prevWeeklyXp", "desc"),
          limit(10)
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

        if (isGuest && userData && userData.grade === gradeFilter && userData.prevWeekString === previousWeekString) {
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
              // theme を渡さないと、ゲストは自分のカードだけ背景が既定のままになる
              theme: userData.theme,
              prevWeeklyXp: userData.prevWeeklyXp,
              prevWeekString: userData.prevWeekString,
            });
          }
        }

        const sorted = data
          .filter(u => (u.prevWeeklyXp || 0) > 0)
          .sort((a, b) => {
            const diff = (b.prevWeeklyXp || 0) - (a.prevWeeklyXp || 0);
            return diff !== 0 ? diff : (b.xp || 0) - (a.xp || 0);
          })
          .slice(0, 10);

        setLastWeekHeroRanking(sorted);

        if (gradeFilter === userData?.grade) {
          const selfId = isGuest ? "guest" : user?.uid;
          const selfIndex = selfId ? sorted.findIndex(u => u.id === selfId) : -1;
          // TOP10枠なので、実際に10人以上が競っていた週のみ確定させる。
          if (selfIndex !== -1) recordBestRank("bestWeeklyHeroRank", selfIndex + 1, sorted.length, 10);
        }
      } catch (err) {
        console.error("Failed to fetch last week hero ranking", err);
      }
    };

    if (tab === "hero" && !authLoading) fetchLastWeekHero();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gradeFilter, tab, userData, authLoading]);

  // 全学年ダメージ TOP5 フェッチ
  useEffect(() => {
    const fetchDamage = async () => {
      setLoading(true);
      try {
        // ヒーロー側と同様、必ずサーバー側で並べ替える（理由は fetchHero のコメント参照）。
        // 全学年が対象なので、orderBy なしだと234人中の「たまたま先頭30件」から
        // TOP5を選ぶことになり、本当の上位者がまず入らなかった。
        const q = query(
          collection(db, "users"),
          where("lastMonthString", "==", currentMonth),
          orderBy("monthlyDamage", "desc"),
          limit(5)
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

        // ゲストはFirestoreに存在しないのでここで差し込む（今月の記録がある場合のみ）。
        if (isGuest && userData && userData.lastMonthString === currentMonth) {
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
              // theme を渡さないと、ゲストは自分のカードだけ背景が既定のままになる
              theme: userData.theme,
              monthlyDamage: userData.monthlyDamage,
              lastMonthString: userData.lastMonthString,
            });
          }
        }

        // サーバー側で並べ替え済み。ダメージ0の人は「ダメージランキング」には出さない。
        const sorted = data
          .filter(u => (u.monthlyDamage || 0) > 0)
          .sort((a, b) => {
            const diff = (b.monthlyDamage || 0) - (a.monthlyDamage || 0);
            return diff !== 0 ? diff : (b.xp || 0) - (a.xp || 0);
          })
          .slice(0, 5);

        setDamageRanking(sorted);
      } catch (err) {
        console.error("Failed to fetch damage ranking", err);
      }
      setLoading(false);
    };

    if (tab === "damage" && !authLoading) fetchDamage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, userData, authLoading]);

  // 先月の全学年ダメージ TOP5（確定済み）フェッチ ＋ 実績判定
  useEffect(() => {
    const fetchLastMonthDamage = async () => {
      try {
        // 週間ヒーロー側と同じ理由で、確定済みスナップショット（prevMonthString /
        // prevMonthlyDamage）を参照する。lastMonthString で引くと、今月プレイした人の
        // 先月分が消えているため、実際に本番では該当者が0人になっていた。
        const q = query(
          collection(db, "users"),
          where("prevMonthString", "==", previousMonth),
          orderBy("prevMonthlyDamage", "desc"),
          limit(5)
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

        if (isGuest && userData && userData.prevMonthString === previousMonth) {
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
              // theme を渡さないと、ゲストは自分のカードだけ背景が既定のままになる
              theme: userData.theme,
              prevMonthlyDamage: userData.prevMonthlyDamage,
              prevMonthString: userData.prevMonthString,
            });
          }
        }

        const sorted = data
          .filter(u => (u.prevMonthlyDamage || 0) > 0)
          .sort((a, b) => {
            const diff = (b.prevMonthlyDamage || 0) - (a.prevMonthlyDamage || 0);
            return diff !== 0 ? diff : (b.xp || 0) - (a.xp || 0);
          })
          .slice(0, 5);

        setLastMonthDamageRanking(sorted);

        const selfId = isGuest ? "guest" : user?.uid;
        const selfIndex = selfId ? sorted.findIndex(u => u.id === selfId) : -1;
        // TOP5枠なので、実際に5人以上が競っていた月のみ確定させる。
        if (selfIndex !== -1) recordBestRank("bestDamageRank", selfIndex + 1, sorted.length, 5);
      } catch (err) {
        console.error("Failed to fetch last month damage ranking", err);
      }
    };

    if (tab === "damage" && !authLoading) fetchLastMonthDamage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, userData, authLoading]);

  const renderUserCard = (user: RankingUser, index: number, score: number, scoreLabel: string) => {
    const { level } = calculateLevel(user.xp || 0);
    // 背景画像は全て .webp に統一されている（過去に .jpg から一括変換した）。
    // ここだけ .jpg のままだったため画像が404になり、テーマを設定している子でも
    // 背景が出ずに真っ暗なカードになっていた。ThemeBackground.tsx と同じ組み立て方にそろえる。
    const isDefault = !user.theme || user.theme === "default";
    const themeName = user.theme === "time_space" ? "space" : user.theme;
    const bgUrl = isDefault ? "/images/ui/fantasy_bg.webp" : `/images/themes/bg_${themeName}.webp`;

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
                <div className="text-center py-12 text-gray-400 font-bold">
                  今週はまだ だれも バトルしていないよ！<br />さいしょのヒーローに なろう！
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* クエリで今週分に絞り込み済みなので weeklyXp をそのまま表示してよい */}
                  {heroRanking.map((user, index) => renderUserCard(user, index, user.weeklyXp || 0, "WP"))}
                </div>
              )}
            </div>

            {/* 先週のヒーロー（確定済み・実績の判定はこちらで行う） */}
            <div className="game-panel p-6 mt-5">
              <h2 className="text-lg font-black text-slate-300 mb-1 text-center">🕰 先週の{gradeFilter}年生ヒーロー（最終結果）</h2>
              <div className="text-xs font-bold text-slate-400 text-center mb-5">TOP10入りの実績は、ここに載っていれば確定するよ！</div>
              {lastWeekHeroRanking.length === 0 ? (
                <div className="text-center py-8 text-gray-500 font-bold text-sm">先週はまだ記録がなかったよ！</div>
              ) : (
                <div className="flex flex-col gap-3 opacity-90">
                  {lastWeekHeroRanking.slice(0, 5).map((u, index) => renderUserCard(u, index, u.prevWeeklyXp || 0, "WP"))}
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
                    // クエリで今月分に絞り込み済み
                    const score = user.monthlyDamage || 0;
                    return renderUserCard(user, index, score, "ダメージ");
                  })}
                </div>
              )}
            </div>

            {/* 先月の全学年ダメージ（確定済み・実績の判定はこちらで行う） */}
            <div className="game-panel p-6 mt-5">
              <h2 className="text-lg font-black text-slate-300 mb-1 text-center">🕰 先月の全学年ダメージ（最終結果）</h2>
              <div className="text-xs font-bold text-slate-400 text-center mb-5">TOP5入りの実績は、ここに載っていれば確定するよ！</div>
              {lastMonthDamageRanking.length === 0 ? (
                <div className="text-center py-8 text-gray-500 font-bold text-sm">先月はまだ記録がなかったよ！</div>
              ) : (
                <div className="flex flex-col gap-3 opacity-90">
                  {lastMonthDamageRanking.map((u, index) => renderUserCard(u, index, u.prevMonthlyDamage || 0, "ダメージ"))}
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
