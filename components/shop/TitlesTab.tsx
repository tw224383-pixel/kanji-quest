"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { getAllTitles } from "../../lib/itemData";
import type { UserData } from "../../contexts/UserContext";

const titles = getAllTitles();

export function TitlesTab({
  userData,
  selectedRarity,
  previewTitle,
  setPreviewTitle,
  handleBuy,
}: {
  userData: UserData;
  selectedRarity: string;
  previewTitle: string | null;
  setPreviewTitle: (v: string | null) => void;
  handleBuy: (category: string, id: string, price: number) => void;
}) {
  const router = useRouter();

  const allTitles = [...titles];
  userData.titles.forEach(t => {
    if (!allTitles.find(x => x.id === t)) {
      allTitles.push({ id: t, name: t, price: 0, isGachaOnly: false });
    }
  });
  const list = allTitles.filter(title => selectedRarity === "all" || (title.rarity || "ノーマル") === selectedRarity);

  if (list.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="game-panel-light p-8 text-center col-span-full">
          <div className="text-4xl mb-2">🔍</div>
          <div className="font-black text-slate-700 text-lg">「{selectedRarity}」のしょうごうはありません</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {list.map(title => {
        const isOwned = userData.titles.includes(title.id);
        const isEquipped = userData.equippedTitle === title.id;
        const canAfford = userData.pt >= (title.price || 0);
        const isPreviewing = previewTitle === title.id;
        return (
          <div key={title.id} className={`game-panel-light p-4 flex flex-col gap-3 ${isEquipped ? 'border-primary bg-blue-50/90' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-black text-xl text-indigo-900">【{title.id}】</div>
                  {title.rarity && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      title.rarity === '神レア' ? 'bg-purple-500 text-white' :
                      title.rarity === '超激レア' ? 'bg-red-500 text-white' :
                      title.rarity === '激レア' ? 'bg-amber-500 text-white' :
                      title.rarity === 'レア' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>{title.rarity}</span>
                  )}
                  {title.gachaName && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      title.gachaName.includes("実績")
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-pink-100 text-pink-800 border border-pink-300'
                    }`}>
                      {title.gachaName}
                    </span>
                  )}
                </div>
                {title.description && (
                  <div className="text-xs font-bold text-slate-500 mt-1">{title.description}</div>
                )}
                {!isOwned && title.price !== null && (
                  <div className="text-amber-600 font-black mt-1">{title.price} PT</div>
                )}
              </div>
              {isEquipped ? (
                <div className="text-primary font-black px-4">そうび中</div>
              ) : isOwned ? (
                <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">所持済み</div>
              ) : title.gachaName && title.gachaName.includes("実績") ? (
                <button
                  onClick={() => router.push("/achievements")}
                  className="text-xs font-black text-amber-800 bg-amber-200/80 hover:bg-amber-300 px-3 py-1.5 rounded-xl border border-amber-400 shadow-sm transition-all hover:scale-105"
                >
                  実績へ ➔
                </button>
              ) : title.isGachaOnly ? (
                <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">ガチャ限定 🎁</div>
              ) : (
                <Button variant={canAfford ? "primary" : "ghost"} disabled={!canAfford} onClick={() => handleBuy("title", title.id, title.price || 0)}>
                  {canAfford ? "かう" : "PT不足"}
                </Button>
              )}
            </div>
            <div className="flex justify-end border-t border-slate-200/50 pt-2">
              <button
                onClick={() => setPreviewTitle(isPreviewing ? null : title.id)}
                className={`px-4 py-2 rounded-lg text-sm font-black shadow-sm border transition-all flex items-center gap-2 ${isPreviewing ? 'bg-indigo-500 text-white border-indigo-700' : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 hover:scale-105'}`}
              >
                👀 しちゃく{isPreviewing ? '中' : ''}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
