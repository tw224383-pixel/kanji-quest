"use client";

import { Button } from "../ui/Button";
import { RarityBadge, GachaNameBadge } from "../ui/RarityBadge";
import { getAllEquipment } from "../../lib/equipmentData";
import { getAvatarThumbUrl } from "../../lib/itemData";
import type { UserData } from "../../contexts/UserContext";

const allEquipments = getAllEquipment();

interface EquipmentsTabProps {
  userData: UserData;
  selectedRarity: string;
  previewEquipment: string | null;
  setPreviewEquipment: (id: string | null) => void;
  handleEquip: (category: "equipment", id: string) => void;
  setPreviewingEquipmentModal: (id: string | null) => void;
}

export function EquipmentsTab({ userData, selectedRarity, previewEquipment, setPreviewEquipment, handleEquip, setPreviewingEquipmentModal }: EquipmentsTabProps) {
  const list = allEquipments.filter(eq => selectedRarity === "all" || (eq.rarity || "ノーマル") === selectedRarity);

  return (
    <div className="space-y-4">
      {userData.equippedEquipment && (
        <div className="flex justify-end mb-2">
          <Button variant="outline" size="sm" onClick={() => handleEquip("equipment", "")} className="text-red-500 border-red-300">
            ❌ そうびをはずす
          </Button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.length === 0 ? (
          <div className="game-panel-light p-8 text-center col-span-full">
            <div className="text-4xl mb-2">🔍</div>
            <div className="font-black text-slate-700 text-lg">「{selectedRarity}」のそうびはありません</div>
          </div>
        ) : list.map(eq => {
          const isOwned = (userData.equipments || []).includes(eq.id);
          const isEquipped = userData.equippedEquipment === eq.id;
          const isPreviewing = previewEquipment === eq.id;

          return (
            <div key={eq.id} className={`game-panel-light p-4 flex flex-col justify-between gap-3 ${isEquipped ? 'border-emerald-500 bg-emerald-50/90' : !isOwned ? 'opacity-85' : ''}`}>
              <div className="flex items-center gap-4">
                <div
                  className="text-5xl w-16 h-16 flex items-center justify-center bg-slate-900/80 rounded-2xl border-2 border-amber-300 shadow-md flex-shrink-0 cursor-pointer hover:scale-110 transition-transform overflow-hidden"
                  onClick={() => setPreviewingEquipmentModal(eq.id)}
                >
                  {eq.icon.startsWith('/') ? (
                    <img
                      src={getAvatarThumbUrl(eq.icon)}
                      alt="eq"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : eq.icon}
                </div>
                <div className="flex-1 cursor-pointer" onClick={() => setPreviewingEquipmentModal(eq.id)}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-lg text-slate-800 hover:text-indigo-600 transition-colors">{eq.name}</span>
                    <RarityBadge rarity={eq.rarity} />
                    <GachaNameBadge gachaName={eq.gachaName} />
                  </div>
                  <div className="text-xs text-slate-600 font-bold mt-1">{eq.description}</div>
                  {!isOwned && (
                    <div className="text-[11px] font-bold text-indigo-600 mt-1">🔒 未所持 (ショップ/ガチャでGET)</div>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200/50 pt-2">
                <button
                  onClick={() => setPreviewEquipment(isPreviewing ? null : eq.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-black shadow-sm border transition-all flex items-center gap-2 ${isPreviewing ? 'bg-emerald-500 text-white border-emerald-700' : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:scale-105'}`}
                >
                  👀 しちゃく{isPreviewing ? '中' : ''}
                </button>

                {isEquipped ? (
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-black text-sm">✓ そうび中</span>
                    <Button size="sm" variant="outline" className="text-xs text-red-500 border-red-300 py-1 px-2" onClick={() => handleEquip("equipment", "")}>はずす</Button>
                  </div>
                ) : isOwned ? (
                  <Button variant="fun" size="sm" className="bg-emerald-500 hover:bg-emerald-600 border-emerald-700 text-white font-bold" onClick={() => handleEquip("equipment", eq.id)}>
                    ✅ そうびする
                  </Button>
                ) : (
                  <div className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">未所持</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
