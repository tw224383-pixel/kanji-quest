"use client";

import { Button } from "../ui/Button";
import { RarityBadge, GachaNameBadge } from "../ui/RarityBadge";
import { getAllThemes } from "../../lib/itemData";
import type { UserData } from "../../contexts/UserContext";

const allThemes = getAllThemes();

interface ThemesTabProps {
  userData: UserData;
  selectedRarity: string;
  previewTheme: string | null;
  setPreviewTheme: (id: string | null) => void;
  handleEquip: (category: "theme", id: string) => void;
}

export function ThemesTab({ userData, selectedRarity, previewTheme, setPreviewTheme, handleEquip }: ThemesTabProps) {
  const list = allThemes
    .filter(t => t.id === 'default' || userData.effects.includes(`theme_${t.id}`))
    .filter(t => selectedRarity === "all" || (t.rarity || "ノーマル") === selectedRarity);

  if (list.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="game-panel-light p-8 text-center col-span-full">
          <div className="text-4xl mb-2">🔍</div>
          <div className="font-black text-slate-700 text-lg">「{selectedRarity}」の所持テーマはありません</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {list.map(theme => {
        const isEquipped = (userData.theme || 'default') === theme.id;
        const isPreviewing = previewTheme === theme.id;
        return (
          <div key={theme.id} className={`game-panel-light p-4 flex flex-col justify-between gap-3 ${isEquipped ? 'border-primary bg-blue-50/90' : ''}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-4 flex-1">
                <div className="text-4xl w-12 h-12 flex items-center justify-center bg-slate-900/80 rounded-xl border border-slate-700 shadow-md flex-shrink-0">{theme.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-bold text-lg text-slate-800">{theme.name}</div>
                    <RarityBadge rarity={theme.rarity} />
                    <GachaNameBadge gachaName={theme.gachaName} />
                  </div>
                  <div className="text-xs text-slate-600 font-bold mt-1">{theme.description || "冒険画面を彩るテーマ。"}</div>
                </div>
              </div>
              {isEquipped ? (
                <div className="text-primary font-black px-4 flex-shrink-0">そうび中</div>
              ) : (
                <Button variant="secondary" onClick={() => handleEquip("theme", theme.id)} className="flex-shrink-0">そうび</Button>
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
