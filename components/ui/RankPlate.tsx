"use client";

import { getRankColor, getRankTitle } from "../../lib/gameLogic";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

export function RankPlate({ level, name, title, avatar, isMvp }: { level: number; name: string, title?: string, avatar?: string, isMvp?: boolean }) {
  const colorClass = getRankColor(level);
  const rankTitle = getRankTitle(level); // System rank based on level

  return (
    <div className={twMerge(clsx("flex flex-col items-center justify-center p-6 rounded-[2rem] font-bold shadow-xl border-4 border-white/50 bg-white/40 glass relative", colorClass))}>
      {isMvp && (
        <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 border-4 border-white text-sm font-black px-3 py-1 rounded-full shadow-md animate-bounce transform rotate-12">
          🌟 MVP
        </div>
      )}
      <div className="text-6xl mb-4 drop-shadow-md">{avatar || "👦"}</div>
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
