"use client";

import { twMerge } from "tailwind-merge";
import { getRankColor, getRankTitle } from "../../lib/gameLogic";
import clsx from "clsx";
import { getAllAvatars, getAvatarImageProps, getAvatarThumbUrl } from "../../lib/itemData";
import { getEquipmentById } from "../../lib/equipmentData";

import { AvatarRarityEffect } from "./AvatarRarityEffect";

export function RankPlate({ level, growthLevel, name, title, avatar, equipment, isMvp, onAvatarClick, onEquipmentClick, onSettingsClick }: { level: number; growthLevel?: number; name: string, title?: string, avatar?: string, equipment?: string, isMvp?: boolean, onAvatarClick?: (url?: string, id?: string) => void, onEquipmentClick?: (equipmentId?: string) => void, onSettingsClick?: () => void }) {
  const colorClass = getRankColor(level);
  const rankTitle = getRankTitle(level); // System rank based on level
  
  const avatars = getAllAvatars();
  const avatarItem = avatars.find(a => a.id === avatar || a.icon === avatar);
  const avatarIcon = avatarItem?.icon || avatar;
  const equipmentItem = getEquipmentById(equipment);
  const equipmentIcon = equipmentItem?.icon;
  const avatarRarity = avatarItem?.rarity || "ノーマル";

  return (
    <div className={twMerge(clsx("flex flex-col items-center justify-center p-6 rounded-[2rem] font-bold shadow-xl border-4 border-white/50 bg-white/40 glass relative", colorClass))}>
      {isMvp && (
        <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 border-4 border-white text-sm font-black px-3 py-1 rounded-full shadow-md animate-bounce transform rotate-12">
          🌟 MVP
        </div>
      )}

      <div className="relative mx-auto mb-4">
        <AvatarRarityEffect rarity={avatarRarity} size="md">
          {avatarIcon && (avatarIcon.startsWith('/') || avatarIcon.endsWith('.jpg') || avatarIcon.endsWith('.png') || avatarIcon.endsWith('.webp')) ? (() => {
            const imgProps = getAvatarImageProps(avatarIcon);
            return (
              <img 
                src={getAvatarThumbUrl(avatarIcon)} 
                alt="avatar" 
                loading="lazy"
                decoding="async"
                className={`w-full h-full object-cover ${onAvatarClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''} ${imgProps.className}`} 
                style={imgProps.style}
                onClick={() => onAvatarClick && onAvatarClick(avatarIcon, avatar)}
              />
            );
          })() : (
            <div 
              className={`w-full h-full flex items-center justify-center bg-slate-900 ${onAvatarClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
              onClick={() => onAvatarClick && onAvatarClick(undefined, avatarIcon || "👦")}
            >
              <span className="text-5xl drop-shadow-md">{avatarIcon || "👦"}</span>
            </div>
          )}
        </AvatarRarityEffect>

        {/* Equipment Badge (Bottom-Right) */}
        <div 
          className={`absolute -bottom-1 -right-1 z-30 w-8 h-8 rounded-full bg-slate-900 border-2 border-amber-300/80 shadow-md flex items-center justify-center text-sm font-black overflow-hidden transform hover:scale-110 transition-transform ${equipment ? 'cursor-pointer' : ''}`}
          onClick={(e) => {
            if (equipment && onEquipmentClick) {
              e.stopPropagation();
              onEquipmentClick(equipment);
            }
          }}
        >
          {equipmentIcon ? (
            equipmentIcon.startsWith('/') || equipmentIcon.endsWith('.png') || equipmentIcon.endsWith('.jpg') || equipmentIcon.endsWith('.webp') ? (
              <img 
                src={getAvatarThumbUrl(equipmentIcon)} 
                alt="equipment" 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover" 
              />
            ) : (
              <span>{equipmentIcon}</span>
            )
          ) : (
            <span className="w-full h-full rounded-full border border-dashed border-slate-500/50 bg-slate-950/80"></span>
          )}
        </div>
      </div>
      <div className="text-sm font-black opacity-80 mb-1 text-indigo-900 bg-white/50 px-3 py-1 rounded-full">
        【 {title || "見習い"} 】
      </div>
      <div className="text-3xl font-black mt-2 drop-shadow-sm flex items-center justify-center gap-2">
        <span>{name}</span>
        {onSettingsClick && (
          <button 
            onClick={onSettingsClick}
            className="text-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 p-1 rounded-full transition-colors shadow-sm ml-1 border border-slate-300"
            title="設定 (プロフィール)"
          >
            ⚙️
          </button>
        )}
      </div>
      <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
        <div className="text-base sm:text-lg font-black bg-black/10 px-3.5 py-1 rounded-full">
          {rankTitle} / 冒険者 Lv.{level}
        </div>
        {growthLevel !== undefined && (
          <div className="text-xs sm:text-sm font-black bg-indigo-950/80 text-amber-300 border border-indigo-400/50 px-3 py-1 rounded-full shadow-sm">
            📊 カルテ平均: Lv.{growthLevel}
          </div>
        )}
      </div>
    </div>
  );
}
