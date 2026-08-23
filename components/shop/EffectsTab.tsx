"use client";

import { Button } from "../ui/Button";
import { getAllEffects } from "../../lib/itemData";
import type { UserData } from "../../contexts/UserContext";

const effects = getAllEffects();

export function EffectsTab({
  userData,
  selectedRarity,
  previewEffect,
  setPreviewEffect,
  handleBuy,
}: {
  userData: UserData;
  selectedRarity: string;
  previewEffect: string | null;
  setPreviewEffect: (v: string | null) => void;
  handleBuy: (category: string, id: string, price: number) => void;
}) {
  const list = effects.filter(effect => selectedRarity === "all" || (effect.rarity || "ノーマル") === selectedRarity);

  if (list.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="game-panel-light p-8 text-center col-span-full">
          <div className="text-4xl mb-2">🔍</div>
          <div className="font-black text-slate-700 text-lg">「{selectedRarity}」のエフェクトはありません</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {list.map(effect => {
        const isOwned = userData.effects.includes(effect.id);
        const isEquipped = userData.equippedEffect === effect.id;
        const canAfford = userData.pt >= (effect.price || 0);
        const isPreviewing = previewEffect === effect.id;
        return (
          <div key={effect.id} className={`game-panel-light p-4 flex flex-col gap-3 ${isEquipped ? 'border-primary bg-blue-50/90' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{effect.icon}</div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-bold text-lg text-slate-800">{effect.name}</div>
                    {effect.rarity && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        effect.rarity === '神レア' ? 'bg-purple-500 text-white' :
                        effect.rarity === '超激レア' ? 'bg-red-500 text-white' :
                        effect.rarity === '激レア' ? 'bg-amber-500 text-white' :
                        effect.rarity === 'レア' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>{effect.rarity}</span>
                    )}
                    {effect.gachaName && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 border border-pink-300">
                        {effect.gachaName}
                      </span>
                    )}
                  </div>
                  {!isOwned && <div className="text-amber-600 font-black">{effect.price} PT</div>}
                </div>
              </div>
              {isEquipped ? (
                <div className="text-primary font-black px-4">そうび中</div>
              ) : isOwned ? (
                <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">所持済み</div>
              ) : effect.isGachaOnly ? (
                <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">ガチャ限定 🎁</div>
              ) : (
                <Button variant={canAfford ? "primary" : "ghost"} disabled={!canAfford} onClick={() => handleBuy("effect", effect.id, effect.price || 0)}>
                  {canAfford ? "かう" : "PT不足"}
                </Button>
              )}
            </div>
            <div className="flex justify-end border-t border-slate-200/50 pt-2">
              <button
                onClick={() => setPreviewEffect(isPreviewing ? null : effect.id)}
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
