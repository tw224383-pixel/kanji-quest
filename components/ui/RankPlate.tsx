"use client";

import { twMerge } from "tailwind-merge";
import { getRankColor, getRankTitle } from "../../lib/gameLogic";
import clsx from "clsx";
import { getAllAvatars } from "../../lib/itemData";
import { getEquipmentById } from "../../lib/equipmentData";

export function RankPlate({ level, name, title, avatar, equipment, isMvp, onAvatarClick, onEquipmentClick, onSettingsClick }: { level: number; name: string, title?: string, avatar?: string, equipment?: string, isMvp?: boolean, onAvatarClick?: (url?: string, id?: string) => void, onEquipmentClick?: (equipmentId?: string) => void, onSettingsClick?: () => void }) {
  const colorClass = getRankColor(level);
  const rankTitle = getRankTitle(level); // System rank based on level
  
  const avatars = getAllAvatars();
  const avatarItem = avatars.find(a => a.id === avatar);
  const avatarIcon = avatarItem?.icon || avatar;
  const equipmentItem = getEquipmentById(equipment);
  const equipmentIcon = equipmentItem?.icon;

  return (
    <div className={twMerge(clsx("flex flex-col items-center justify-center p-6 rounded-[2rem] font-bold shadow-xl border-4 border-white/50 bg-white/40 glass relative", colorClass))}>
      {isMvp && (
        <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 border-4 border-white text-sm font-black px-3 py-1 rounded-full shadow-md animate-bounce transform rotate-12">
          🌟 MVP
        </div>
      )}
      {avatarIcon && (avatarIcon.startsWith('/') || avatarIcon.endsWith('.jpg') || avatarIcon.endsWith('.png')) ? (
        <div className="relative mx-auto mb-4 w-24 h-24">
          {avatarIcon.startsWith('/avatars/') && (
            <>
              {/* Rich effect back aura */}
              <div className="absolute inset-[-8px] bg-gradient-to-tr from-yellow-300 via-amber-400 to-yellow-200 rounded-full animate-spin opacity-50 blur-sm" style={{ animationDuration: '4s' }}></div>
              <div className="absolute inset-[-4px] bg-gradient-to-br from-yellow-100 via-white to-yellow-200 rounded-full animate-pulse shadow-[0_0_15px_rgba(250,204,21,0.8)]"></div>
              {/* Sparkles */}
              <div className="absolute -top-2 -right-2 text-xl animate-bounce drop-shadow-md z-20">✨</div>
              <div className="absolute -bottom-2 -left-2 text-lg animate-bounce drop-shadow-md z-20" style={{ animationDelay: '0.5s' }}>✨</div>
            </>
          )}
          <div className={`absolute inset-0 rounded-full overflow-hidden border-4 border-white shadow-lg z-10 ${onAvatarClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`} onClick={() => onAvatarClick && onAvatarClick(avatarIcon, avatar)}>
            <img 
              src={avatarIcon} 
              alt="avatar" 
              className={`w-full h-full object-cover ${avatarIcon.includes('cute_') ? 'scale-[1.3] origin-top' : ''}`} 
              style={{ objectPosition: avatarIcon.includes('cute_') ? 'center 15%' : 'center' }}
            />
          </div>

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
              equipmentIcon.startsWith('/') || equipmentIcon.endsWith('.png') || equipmentIcon.endsWith('.jpg') ? (
                <img src={equipmentIcon} alt="equipment" className="w-full h-full object-cover" />
              ) : (
                <span>{equipmentIcon}</span>
              )
            ) : (
              <span className="w-full h-full rounded-full border border-dashed border-slate-500/50 bg-slate-950/80"></span>
            )}
          </div>
        </div>
      ) : (
        <div className="relative mx-auto mb-4">
          <div className={`text-6xl drop-shadow-md flex justify-center ${onAvatarClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`} onClick={() => onAvatarClick && onAvatarClick(undefined, avatarIcon || "👦")}>{avatarIcon || "👦"}</div>

          {/* Equipment Badge (Bottom-Right) for Emoji avatars */}
          <div 
            className={`absolute -bottom-1 -right-2 z-30 w-7 h-7 rounded-full bg-slate-900 border-2 border-amber-300/80 shadow-md flex items-center justify-center text-xs font-black overflow-hidden ${equipment ? 'cursor-pointer' : ''}`}
            onClick={(e) => {
              if (equipment && onEquipmentClick) {
                e.stopPropagation();
                onEquipmentClick(equipment);
              }
            }}
          >
            {equipmentIcon ? (
              equipmentIcon.startsWith('/') || equipmentIcon.endsWith('.png') || equipmentIcon.endsWith('.jpg') ? (
                <img src={equipmentIcon} alt="equipment" className="w-full h-full object-cover" />
              ) : (
                <span>{equipmentIcon}</span>
              )
            ) : (
              <span className="w-full h-full rounded-full border border-dashed border-slate-500/50 bg-slate-950/80"></span>
            )}
          </div>
        </div>
      )}
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
      <div className="mt-3 text-lg font-black bg-black/10 px-4 py-1 rounded-full">
        {rankTitle} / Lv. {level}
      </div>
    </div>
  );
}
