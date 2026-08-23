"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { resolveShareCode } from "../../lib/shareCode";
import { calculateLevel } from "../../lib/gameLogic";
import { calculateAdventurerStats } from "../../lib/userStatsLogic";
import { AdventurerRadarChart } from "../../components/profile/AdventurerRadarChart";
import { Button } from "../../components/ui/Button";
import type { UserData } from "../../contexts/UserContext";

type LoadState = "idle" | "authing" | "loading" | "notFound" | "authDisabled" | "error" | "ready";

export default function ParentViewerPage() {
  const router = useRouter();
  const [codeInput, setCodeInput] = useState("");
  const [state, setState] = useState<LoadState>("idle");
  const [childData, setChildData] = useState<UserData | null>(null);

  const lookup = async (code: string) => {
    if (!code.trim()) return;
    setState("authing");
    setChildData(null);
    try {
      if (!auth.currentUser) {
        await new Promise<void>((resolve, reject) => {
          const unsub = onAuthStateChanged(auth, (u) => {
            unsub();
            if (u) { resolve(); return; }
            signInAnonymously(auth).then(() => resolve()).catch(reject);
          });
        });
      }

      setState("loading");
      const uid = await resolveShareCode(code);
      if (!uid) {
        setState("notFound");
        return;
      }
      const snap = await getDoc(doc(db, "users", uid));
      if (!snap.exists()) {
        setState("notFound");
        return;
      }
      setChildData(snap.data() as UserData);
      setState("ready");
    } catch (e: any) {
      console.error("parent viewer lookup failed", e);
      if (e?.code === "auth/admin-restricted-operation" || e?.code === "auth/operation-not-allowed") {
        setState("authDisabled");
      } else {
        setState("error");
      }
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("code");
    if (initial) {
      setCodeInput(initial.toUpperCase());
      lookup(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allMistakeIds = childData?.mistakeIds || [];
  const kanjiMistakes = allMistakeIds.filter(id => !id.startsWith("math_") && !id.startsWith("sci_") && !id.startsWith("soc_")).length;
  const mathMistakes = allMistakeIds.filter(id => id.startsWith("math_")).length;
  const scienceMistakes = allMistakeIds.filter(id => id.startsWith("sci_")).length;
  const socialMistakes = allMistakeIds.filter(id => id.startsWith("soc_")).length;

  const levelInfo = childData ? calculateLevel(childData.xp) : null;
  const { stats, archetype, averageLevel } = childData
    ? calculateAdventurerStats(childData)
    : { stats: [], archetype: null, averageLevel: 0 };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black flex items-center gap-2 text-amber-300">
            <span>👨‍👩‍👧</span> 保護者・先生向け 見まもりページ
          </h1>
          <Button variant="outline" size="sm" onClick={() => router.push("/")}>トップへ</Button>
        </div>

        <div className="game-panel p-6 mb-6">
          <p className="text-sm text-slate-300 font-bold mb-4">
            お子さん・生徒さんから教えてもらった6桁の共有コードを入力してください。ログインは不要です。
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); lookup(codeInput); }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="例: A7K3P9"
              maxLength={8}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border-2 border-slate-700 text-white font-mono text-center text-xl tracking-[0.3em] focus:border-amber-400 focus:outline-none"
            />
            <Button type="submit" variant="fun" disabled={state === "authing" || state === "loading"}>
              {state === "authing" || state === "loading" ? "読み込み中..." : "見る"}
            </Button>
          </form>

          {state === "notFound" && (
            <div className="mt-4 text-red-400 font-bold text-sm">コードが見つかりませんでした。もう一度確認してください。</div>
          )}
          {state === "authDisabled" && (
            <div className="mt-4 text-red-400 font-bold text-sm">
              このページの認証設定が未完了です（管理者にご連絡ください：Firebase Authentication で匿名認証を有効にする必要があります）。
            </div>
          )}
          {state === "error" && (
            <div className="mt-4 text-red-400 font-bold text-sm">読み込みに失敗しました。時間をおいて再度お試しください。</div>
          )}
        </div>

        {state === "ready" && childData && (
          <div className="space-y-6">
            <div className="game-panel p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="text-6xl">{childData.equippedAvatar || "👦"}</div>
              <div className="flex-1 text-center sm:text-left">
                <div className="text-xl font-black text-white">{childData.name || "名無し"}</div>
                <div className="text-sm text-amber-300 font-bold">【{childData.equippedTitle || "見習い"}】・小{childData.grade || 1}年生</div>
                <div className="text-sm text-slate-300 font-bold mt-1">
                  Lv.{levelInfo?.level ?? 1}　🔥 連続ログイン {childData.loginStreak || 1}日　🏆 獲得実績 {(childData.claimedAchievements || []).length}件
                </div>
              </div>
            </div>

            <div className="game-panel p-6">
              <h2 className="font-black text-amber-300 mb-4 text-center">📊 得意・苦手分析（平均 Lv.{Math.round(averageLevel)}）</h2>
              {stats.length > 0 && <AdventurerRadarChart stats={stats} />}
              {archetype && (
                <div className="text-center mt-2">
                  <div className="font-black text-white">{archetype.icon} {archetype.title}</div>
                  <div className="text-xs text-slate-400 font-bold">{archetype.subTitle}</div>
                </div>
              )}
            </div>

            <div className="game-panel p-6">
              <h2 className="font-black text-amber-300 mb-4 text-center">🎯 今のにがて問題数</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="game-panel-light p-3 rounded-xl">
                  <div className="text-xs text-slate-500 font-bold">漢字</div>
                  <div className="text-2xl font-black text-slate-800">{kanjiMistakes}</div>
                </div>
                <div className="game-panel-light p-3 rounded-xl">
                  <div className="text-xs text-slate-500 font-bold">算数</div>
                  <div className="text-2xl font-black text-slate-800">{mathMistakes}</div>
                </div>
                <div className="game-panel-light p-3 rounded-xl">
                  <div className="text-xs text-slate-500 font-bold">理科</div>
                  <div className="text-2xl font-black text-slate-800">{scienceMistakes}</div>
                </div>
                <div className="game-panel-light p-3 rounded-xl">
                  <div className="text-xs text-slate-500 font-bold">社会</div>
                  <div className="text-2xl font-black text-slate-800">{socialMistakes}</div>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-bold mt-4 text-center">
                苦手だった問題は、1日後→3日後→7日後...と間隔を空けて自動的に再出題される仕組みになっています。
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
