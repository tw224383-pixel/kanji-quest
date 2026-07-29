"use client";

import { useUser } from "../../hooks/useUser";
import { Button } from "../../components/ui/Button";
import { useRouter } from "next/navigation";

export default function DebugPage() {
  const { user, isGuest, userData, updateUserData, loading } = useUser();
  const router = useRouter();

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-2xl">ロード中...</div>;
  if (!userData) {
    router.push("/");
    return null;
  }

  const allTitles = ["見習い", "炎の", "伝説の", "漢字マスター", "神話の", "1年生マスター", "2年生マスター", "3年生マスター", "4年生マスター", "5年生マスター", "6年生マスター", "レイド討伐隊"];
  const allAvatars = ["👦", "👧", "⚔️", "🛡️", "🐶", "🐱", "🐲", "🦄", "👽", "👻", "🤖", "👾", "🧙‍♂️", "🧛", "🧚", "🦸", "🥷", "🦁", "🦅", "🦖", "🚀", "🛸", "🏅", "🏆"];
  const allThemes = ["theme_default", "theme_space", "theme_ninja", "theme_cyber"];
  const allEffects = ["fire", "water", "thunder", "star", "rainbow", "sparkle"];

  const handleMaxPT = async () => {
    await updateUserData({ pt: 9999999 });
    alert("お金（PT）を最大にしました！");
  };

  const handleMaxXP = async () => {
    await updateUserData({ xp: 9999999 });
    alert("経験値（XP）を最大にしました！");
  };

  const handleUnlockAll = async () => {
    await updateUserData({
      titles: Array.from(new Set([...userData.titles, ...allTitles])),
      avatars: Array.from(new Set([...userData.avatars, ...allAvatars])),
      effects: Array.from(new Set([...userData.effects, ...allThemes, ...allEffects]))
    });
    alert("全アイテム（称号・アバター・テーマ・エフェクト）を解放しました！");
  };

  const handleResetRaidBoss = () => {
    localStorage.setItem("kq_raid_hp", "1");
    alert("レイドボスのHPを「1」にしました。次のバトルで討伐できます！");
  };

  const handleClearData = async () => {
    if (window.confirm("本当にすべてのデータをリセットしますか？")) {
      if (!isGuest && user) {
        await updateUserData({
          xp: 0,
          pt: 0,
          effects: ["default"],
          mistakeIds: [],
          masteredIds: [],
          titles: ["見習い"],
          equippedTitle: "見習い",
          avatars: ["👦"],
          equippedAvatar: "👦",
          theme: "default",
          totalDamage: 0,
          equippedEffect: "",
          scaryMode: false
        });
      }
      localStorage.clear();
      window.location.href = "/";
    }
  };

  return (
    <main className="min-h-screen bg-black text-green-400 p-8 font-mono relative z-50">
      <div className="max-w-2xl mx-auto border-2 border-green-500 p-8 rounded-lg bg-black/80 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
        
        <div className="flex justify-between items-center mb-8 border-b-2 border-green-500 pb-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <span>🤫</span> 黒田先生の秘密の部屋（デバッグモード）
          </h1>
          <Button variant="outline" onClick={() => router.push("/home")} className="bg-transparent text-green-400 border-green-500 hover:bg-green-900">
            もどる
          </Button>
        </div>

        <div className="mb-8">
          <div className="text-sm opacity-80 mb-2">現在のステータス:</div>
          <div className="grid grid-cols-2 gap-4 text-lg">
            <div>ユーザー名: {userData.name}</div>
            <div>PT: {userData.pt}</div>
            <div>XP: {userData.xp}</div>
            <div>所持称号数: {userData.titles.length}</div>
            <div>所持アバター数: {userData.avatars.length}</div>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4 text-green-300">チートコマンド</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={handleMaxPT}
            className="p-4 border border-green-500 hover:bg-green-900 transition-colors text-left font-bold"
          >
            💰 お金（PT）をMAXにする
          </button>
          <button 
            onClick={handleMaxXP}
            className="p-4 border border-green-500 hover:bg-green-900 transition-colors text-left font-bold"
          >
            🌟 経験値（XP）をMAXにする
          </button>
          <button 
            onClick={handleUnlockAll}
            className="p-4 border border-green-500 hover:bg-green-900 transition-colors text-left font-bold"
          >
            🔓 全アイテムを解放する
          </button>
          <button 
            onClick={handleResetRaidBoss}
            className="p-4 border border-green-500 hover:bg-green-900 transition-colors text-left font-bold"
          >
            🐲 レイドボスHPを1にする
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-red-900/50">
          <h2 className="text-xl font-bold mb-4 text-red-500">危険な操作</h2>
          <button 
            onClick={handleClearData}
            className="p-4 border border-red-500 text-red-500 hover:bg-red-900 transition-colors w-full text-center font-bold"
          >
            🗑️ ユーザーデータを初期化する（すべて消去）
          </button>
        </div>

      </div>
    </main>
  );
}
