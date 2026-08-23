"use client";

import { Button } from "../ui/Button";
import { getAllAvatars, getAvatarInfo, getAvatarImageProps, getAvatarThumbUrl } from "../../lib/itemData";
import type { UserData } from "../../contexts/UserContext";

const avatars = getAllAvatars();

export function AvatarsTab({
  userData,
  selectedRarity,
  previewAvatar,
  setPreviewAvatar,
  handleBuy,
  setPreviewingAvatar,
}: {
  userData: UserData;
  selectedRarity: string;
  previewAvatar: string | null;
  setPreviewAvatar: (v: string | null) => void;
  handleBuy: (category: string, id: string, price: number) => void;
  setPreviewingAvatar: (v: { url?: string; id?: string; name?: string } | null) => void;
}) {
  const list = avatars.filter(avatar => {
    if (selectedRarity === "all") return true;
    const info = getAvatarInfo(avatar.id);
    const r = info?.rarity || avatar.rarity || "ノーマル";
    return r === selectedRarity;
  });

  if (list.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="game-panel-light p-8 text-center col-span-full">
          <div className="text-4xl mb-2">🔍</div>
          <div className="font-black text-slate-700 text-lg">「{selectedRarity}」のアバターはありません</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {list.map(avatar => {
        const isOwned = userData.avatars.includes(avatar.id);
        const isEquipped = userData.equippedAvatar === avatar.id;
        const canAfford = userData.pt >= (avatar.price || 0);
        const isPreviewing = previewAvatar === avatar.id;
        const info = getAvatarInfo(avatar.id);

        return (
          <div key={avatar.id} className={`game-panel-light p-4 flex flex-col justify-between gap-3 ${isEquipped ? 'border-primary bg-blue-50/90' : ''}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-4 flex-1">
                <button
                  onClick={() => setPreviewingAvatar({ url: avatar.icon, id: avatar.id, name: avatar.name })}
                  className="flex justify-center w-14 h-14 flex-shrink-0 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                >
                  {avatar.icon && avatar.icon.startsWith('/') ? (() => {
                    const imgProps = getAvatarImageProps(avatar.icon);
                    return (
                      <div className="w-14 h-14 rounded-full overflow-hidden relative border-2 border-white shadow-md mx-auto">
                        <img
                          src={getAvatarThumbUrl(avatar.icon)}
                          alt={avatar.name}
                          loading="lazy"
                          decoding="async"
                          className={`w-full h-full object-cover ${imgProps.className}`}
                          style={imgProps.style}
                        />
                      </div>
                    );
                  })() : (
                    <div className="text-4xl w-14 h-14 flex items-center justify-center bg-slate-900/80 rounded-xl border border-slate-700 shadow-md">{avatar.icon}</div>
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-lg text-slate-800">{avatar.name}</span>
                    {info?.rarity && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        info.rarity === '神レア' ? 'bg-purple-500 text-white' :
                        info.rarity === '超激レア' ? 'bg-red-500 text-white' :
                        info.rarity === '激レア' ? 'bg-amber-500 text-white' :
                        info.rarity === 'レア' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>{info.rarity}</span>
                    )}
                    {(info?.gachaName || avatar.gachaName) && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 border border-pink-300">
                        {info?.gachaName || avatar.gachaName}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 font-bold mt-1">{info?.description || avatar.description || "冒険を彩る魅力的なアバター。"}</div>
                  {!isOwned && !avatar.isGachaOnly && (
                    <div className="text-amber-600 font-black text-sm mt-1">{avatar.price} PT</div>
                  )}
                </div>
              </div>
              {isEquipped ? (
                <div className="text-primary font-black px-4 flex-shrink-0">そうび中</div>
              ) : isOwned ? (
                <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 flex-shrink-0">所持済み</div>
              ) : avatar.isGachaOnly ? (
                <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 flex-shrink-0">ガチャ限定 🎁</div>
              ) : (
                <Button variant={canAfford ? "primary" : "ghost"} disabled={!canAfford} onClick={() => handleBuy("avatar", avatar.id, avatar.price || 0)} className="flex-shrink-0">
                  {canAfford ? "かう" : "PT不足"}
                </Button>
              )}
            </div>
            <div className="flex justify-end border-t border-slate-200/50 pt-2">
              <button
                onClick={() => setPreviewAvatar(isPreviewing ? null : avatar.id)}
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
