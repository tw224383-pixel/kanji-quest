"use client";

import { Button } from "../ui/Button";
import { getAllThemes } from "../../lib/itemData";
import type { UserData } from "../../contexts/UserContext";

const themes = getAllThemes();

export function ThemesTab({
  userData,
  selectedRarity,
  previewTheme,
  setPreviewTheme,
  handleBuy,
}: {
  userData: UserData;
  selectedRarity: string;
  previewTheme: string | null;
  setPreviewTheme: (v: string | null) => void;
  handleBuy: (category: string, id: string, price: number) => void;
}) {
  const list = themes.filter(theme => selectedRarity === "all" || (theme.rarity || "ノーマル") === selectedRarity);

  if (list.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="game-panel-light p-8 text-center col-span-full">
          <div className="text-4xl mb-2">🔍</div>
          <div className="font-black text-slate-700 text-lg">「{selectedRarity}」のテーマはありません</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {list.map(theme => {
        const isOwned = theme.price === 0 || userData.effects.includes(`theme_${theme.id}`);
        const isEquipped = userData.theme === theme.id || (!userData.theme && theme.id === 'default');
        const canAfford = userData.pt >= (theme.price || 0);
        const isPreviewing = previewTheme === theme.id;
        return (
          <div key={theme.id} className={`game-panel-light p-4 flex flex-col justify-between gap-3 ${isEquipped ? 'border-primary bg-blue-50/90' : ''}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-4 flex-1">
                <div className="text-4xl w-12 h-12 flex items-center justify-center bg-slate-900/80 rounded-xl border border-slate-700 shadow-md flex-shrink-0">{theme.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-bold text-lg text-slate-800">{theme.name}</div>
                    {theme.rarity && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        theme.rarity === '神レア' ? 'bg-purple-500 text-white' :
                        theme.rarity === '超激レア' ? 'bg-red-500 text-white' :
                        theme.rarity === '激レア' ? 'bg-amber-500 text-white' :
                        theme.rarity === 'レア' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>{theme.rarity}</span>
                    )}
                    {theme.gachaName && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 border border-pink-300">
                        {theme.gachaName}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 font-bold mt-1">{theme.description || "冒険画面を彩るテーマ。"}</div>
                  {!isOwned && <div className="text-amber-600 font-black text-sm mt-1">{theme.price} PT</div>}
                </div>
              </div>
              {isEquipped ? (
                <div className="text-primary font-black px-4 flex-shrink-0">そうび中</div>
              ) : isOwned ? (
                <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 flex-shrink-0">所持済み</div>
              ) : theme.isGachaOnly ? (
                <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 flex-shrink-0">ガチャ限定 🎁</div>
              ) : (
                <Button variant={canAfford ? "primary" : "ghost"} disabled={!canAfford} onClick={() => handleBuy("theme", theme.id, theme.price || 0)} className="flex-shrink-0">かう</Button>
              )}
            </div>
            <div className="flex justify-end border-t border-slate-200/50 pt-2">
              <button
                onClick={() => setPreviewTheme(isPreviewing ? null : theme.id)}
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
