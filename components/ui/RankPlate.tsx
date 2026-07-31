"use client";

import { twMerge } from "tailwind-merge";
import { getRankColor, getRankTitle } from "../../lib/gameLogic";
import clsx from "clsx";
import { getAllAvatars } from "../../lib/itemData";

export function RankPlate({ level, name, title, avatar, isMvp, onAvatarClick }: { level: number; name: string, title?: string, avatar?: string, isMvp?: boolean, onAvatarClick?: (url?: string, id?: string) => void }) {
  const colorClass = getRankColor(level);
  const rankTitle = getRankTitle(level); // System rank based on level
  
  const avatars = getAllAvatars();
  const avatarItem = avatars.find(a => a.id === avatar);
  const avatarIcon = avatarItem?.icon || avatar;

  return (
    <div className={twMerge(clsx("flex flex-col items-center justify-center p-6 rounded-[2rem] font-bold shadow-xl border-4 border-white/50 bg-white/40 glass relative", colorClass))}>
      {isMvp && (
        <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 border-4 border-white text-sm font-black px-3 py-1 rounded-full shadow-md animate-bounce transform rotate-12">
          🌟 MVP
        </div>
      )}
      {avatarIcon && (avatarIcon.startsWith('/') || avatarIcon.endsWith('.jpg') || avatarIcon.endsWith('.png')) ? (
        <img src={avatarIcon} alt="avatar" className={`w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mx-auto mb-4 ${onAvatarClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`} onClick={() => onAvatarClick && onAvatarClick(avatarIcon, avatar)} />
      ) : (
        <div className={`text-6xl mb-4 drop-shadow-md flex justify-center ${onAvatarClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`} onClick={() => onAvatarClick && onAvatarClick(undefined, avatarIcon || "👦")}>{avatarIcon || "👦"}</div>
      )}
      <div className="text-sm font-black opacity-80 mb-1 text-indigo-900 bg-white/50 px-3 py-1 rounded-full">
        【 {title || "見習い"} 】
      </div>
      <div className="text-3xl font-black mt-2 drop-shadow-sm">{name}</div>
      <div className="mt-3 text-lg font-black bg-black/10 px-4 py-1 rounded-full">
        {rankTitle} / Lv. {level}
      </div>
    </div>
  );
}
