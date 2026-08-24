"use client";

import { Button } from "../ui/Button";
import { RarityBadge, GachaNameBadge } from "../ui/RarityBadge";
import { AvatarRarityEffect } from "../ui/AvatarRarityEffect";
import { getAllAvatars, getAvatarInfo, getAvatarImageProps, getAvatarThumbUrl } from "../../lib/itemData";
import type { UserData } from "../../contexts/UserContext";

const allAvatars = getAllAvatars();

interface AvatarsTabProps {
  userData: UserData;
  selectedRarity: string;
  previewAvatar: string | null;
  setPreviewAvatar: (id: string | null) => void;
  handleEquip: (category: "avatar", id: string) => void;
  setPreviewingAvatarModal: (v: { url?: string; id?: string; name?: string } | null) => void;
}

export function AvatarsTab({ userData, selectedRarity, previewAvatar, setPreviewAvatar, handleEquip, setPreviewingAvatarModal }: AvatarsTabProps) {
  const list = allAvatars
    .filter(a => userData.avatars.includes(a.id) || ["👦", "👧"].includes(a.id))
    .filter(a => {
      if (selectedRarity === "all") return true;
      const info = getAvatarInfo(a.id);
      return (info?.rarity || a.rarity || "ノーマル") === selectedRarity;
    });

  if (list.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="game-panel-light p-8 text-center col-span-full">
          <div className="text-4xl mb-2">🔍</div>
          <div className="font-black text-slate-700 text-lg">「{selectedRarity}」の所持アバターはありません</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {list.map(avatar => {
        const isEquipped = userData.equippedAvatar === avatar.id;
        const isPreviewing = previewAvatar === avatar.id;
        const info = getAvatarInfo(avatar.id);

        return (
          <div key={avatar.id} className={`game-panel-light p-4 flex flex-col justify-between gap-3 ${isEquipped ? 'border-primary bg-blue-50/90' : ''}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => setPreviewingAvatarModal({ url: avatar.icon, id: avatar.id, name: avatar.name })}>
                <AvatarRarityEffect rarity={info?.rarity || "ノーマル"} size="sm">
                  {avatar.icon?.startsWith('/') ? (() => {
                    const imgProps = getAvatarImageProps(avatar.icon);
                    return (
                      <img
                        src={getAvatarThumbUrl(avatar.icon)}
                        alt={avatar.name}
                        loading="lazy"
                        decoding="async"
                        className={`w-full h-full object-cover ${imgProps.className}`}
                        style={imgProps.style}
                      />
                    );
                  })() : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900">
                      <span className="text-3xl drop-shadow-md">{avatar.icon}</span>
                    </div>
                  )}
                </AvatarRarityEffect>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-lg text-slate-800 hover:text-indigo-600 transition-colors">{avatar.name}</span>
                    <RarityBadge rarity={info?.rarity} />
                    <GachaNameBadge gachaName={info?.gachaName || avatar.gachaName} />
                  </div>
                  <div className="text-xs text-slate-600 font-bold mt-1">{info?.description || avatar.description || "冒険を彩る魅力的なアバター。"}</div>
                </div>
              </div>
              {isEquipped ? (
                <div className="text-primary font-black px-4 flex-shrink-0">そうび中</div>
              ) : (
                <Button variant="secondary" onClick={() => handleEquip("avatar", avatar.id)} className="flex-shrink-0">そうび</Button>
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
