"use client";

import { Button } from "../ui/Button";
import { RarityBadge, GachaNameBadge } from "../ui/RarityBadge";
import { getAllTitles } from "../../lib/itemData";
import type { UserData } from "../../contexts/UserContext";

const allTitles = getAllTitles();

interface TitlesTabProps {
  userData: UserData;
  selectedRarity: string;
  previewTitle: string | null;
  setPreviewTitle: (id: string | null) => void;
  handleEquip: (category: "title", id: string) => void;
}

export function TitlesTab({ userData, selectedRarity, previewTitle, setPreviewTitle, handleEquip }: TitlesTabProps) {
  const list = allTitles
    .filter(t => userData.titles.includes(t.id) || t.id === "見習い")
    .filter(t => selectedRarity === "all" || (t.rarity || "ノーマル") === selectedRarity);

  if (list.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="game-panel-light p-8 text-center col-span-full">
          <div className="text-4xl mb-2">🔍</div>
          <div className="font-black text-slate-700 text-lg">「{selectedRarity}」の所持しょうごうはありません</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {list.map(title => {
        const isEquipped = userData.equippedTitle === title.id;
        const isPreviewing = previewTitle === title.id;
        return (
          <div key={title.id} className={`game-panel-light p-4 flex flex-col gap-3 ${isEquipped ? 'border-primary bg-blue-50/90' : ''}`}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="font-black text-xl text-indigo-900">【{title.name}】</div>
                <RarityBadge rarity={title.rarity} />
                <GachaNameBadge gachaName={title.gachaName} />
              </div>
              {isEquipped ? (
                <div className="text-primary font-black px-4">そうび中</div>
              ) : (
                <Button variant="secondary" onClick={() => handleEquip("title", title.id)}>そうび</Button>
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
