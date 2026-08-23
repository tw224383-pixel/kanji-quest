"use client";

import { Button } from "../ui/Button";
import { getAllEquipment } from "../../lib/equipmentData";
import { getAvatarThumbUrl } from "../../lib/itemData";
import type { UserData } from "../../contexts/UserContext";

const equipments = getAllEquipment();

export function EquipmentsTab({
  userData,
  selectedRarity,
  handleBuy,
}: {
  userData: UserData;
  selectedRarity: string;
  handleBuy: (category: string, id: string, price: number) => void;
}) {
  const list = equipments.filter(item => selectedRarity === "all" || (item.rarity || "ノーマル") === selectedRarity);

  if (list.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="game-panel-light p-8 text-center col-span-full">
          <div className="text-4xl mb-2">🔍</div>
          <div className="font-black text-slate-700 text-lg">「{selectedRarity}」のそうびはありません</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {list.map(item => {
        const isOwned = (userData.equipments || []).includes(item.id);
        const canAfford = (userData.sp || 0) >= (item.price || 0);

        return (
          <div key={item.id} className={`game-panel-light p-4 flex flex-col justify-between gap-3 ${isOwned ? 'border-emerald-500 bg-emerald-50/90' : ''}`}>
            <div className="flex items-center gap-4">
              <div className="text-5xl w-16 h-16 flex items-center justify-center bg-slate-900/80 rounded-2xl border-2 border-emerald-300 shadow-md overflow-hidden">
                {item.icon.startsWith('/') ? (
                  <img
                    src={getAvatarThumbUrl(item.icon)}
                    alt="eq"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : item.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-lg text-slate-800">{item.name}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    item.rarity === '神レア' ? 'bg-purple-500 text-white' :
                    item.rarity === '超激レア' ? 'bg-red-500 text-white' :
                    item.rarity === '激レア' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>{item.rarity}</span>
                  {item.gachaName && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 border border-pink-300">
                      {item.gachaName}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-600 font-bold mt-1">{item.description}</div>
                {!isOwned && !item.isGachaOnly && (
                  <div className="text-emerald-600 font-black text-sm mt-1">{item.price} SP</div>
                )}
              </div>
            </div>

            <div className="flex justify-end items-center gap-2 mt-2 pt-2 border-t border-slate-200">
              {isOwned ? (
                <div className="text-sm font-bold text-emerald-600 bg-emerald-100 px-4 py-1.5 rounded-full border border-emerald-300">
                  ✓ 所持中
                </div>
              ) : item.isGachaOnly ? (
                <div className="text-xs font-black text-purple-700 bg-purple-100 px-3 py-1.5 rounded-full border border-purple-300">
                  🎲 ガチャ限定
                </div>
              ) : (
                <Button
                  variant="fun"
                  size="sm"
                  className="bg-emerald-500 hover:bg-emerald-600 border-emerald-700 text-white text-sm"
                  disabled={!canAfford}
                  onClick={() => handleBuy("equipment", item.id, item.price || 0)}
                >
                  {canAfford ? `${item.price} SP でこうにゅう` : "SP 不足"}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
