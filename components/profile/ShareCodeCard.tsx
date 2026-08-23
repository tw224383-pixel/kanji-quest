"use client";

import { useState } from "react";
import { useUser } from "../../hooks/useUser";
import { Button } from "../ui/Button";
import { generateShareCode } from "../../lib/shareCode";

export function ShareCodeCard() {
  const { userData, user, isGuest, updateUserData } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  if (isGuest || !user) {
    return (
      <div className="game-panel-light p-5 text-center">
        <div className="text-3xl mb-2">👨‍👩‍👧</div>
        <div className="font-black text-slate-700">保護者・先生に見せる</div>
        <div className="text-xs text-slate-500 font-bold mt-1">
          アカウント登録すると、共有コードを発行して保護者や先生にせいちょうカルテを見てもらえるようになります。
        </div>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const code = await generateShareCode(user.uid);
      await updateUserData({ shareCode: code });
    } catch (e) {
      setError("発行に失敗しました。もう一度お試しください。");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!userData?.shareCode) return;
    try {
      await navigator.clipboard.writeText(userData.shareCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // clipboard access denied等は静かに無視（コードは画面に表示済み）
    }
  };

  return (
    <div className="game-panel-light p-5 text-center">
      <div className="text-3xl mb-2">👨‍👩‍👧</div>
      <div className="font-black text-slate-700">保護者・先生に見せる</div>
      <div className="text-xs text-slate-500 font-bold mt-1 mb-3">
        コードを発行して伝えると、ログインなしでせいちょうカルテを見てもらえます。
      </div>

      {userData?.shareCode ? (
        <div className="flex flex-col items-center gap-2">
          <div className="text-2xl font-black tracking-[0.3em] bg-slate-900 text-amber-300 px-6 py-3 rounded-xl border-2 border-amber-400">
            {userData.shareCode}
          </div>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? "✓ コピーしました" : "📋 コードをコピー"}
          </Button>
        </div>
      ) : (
        <Button variant="primary" size="sm" disabled={loading} onClick={handleGenerate}>
          {loading ? "発行中..." : "🔑 共有コードを発行する"}
        </Button>
      )}
      {error && <div className="text-red-500 text-xs font-bold mt-2">{error}</div>}
    </div>
  );
}
