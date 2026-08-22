"use client";

import React from "react";
import { motion } from "framer-motion";

export function AvatarRarityEffect({
  rarity = "ノーマル",
  children,
  size = "md",
}: {
  rarity?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  // Size dimensions
  const containerSize = size === "sm" ? "w-14 h-14" : size === "lg" ? "w-36 h-36" : "w-24 h-24";

  if (rarity === "神レア") {
    return (
      <div className={`relative ${containerSize} flex items-center justify-center flex-shrink-0`}>
        {/* Outer Rotating Cosmic Nebula Aura */}
        <div 
          className="absolute inset-[-10px] rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-indigo-500 blur-md opacity-90 animate-spin"
          style={{ animationDuration: "5s" }}
        />

        {/* Inner Pulsing Light Core */}
        <div className="absolute inset-[-5px] rounded-full bg-gradient-to-tr from-purple-400 via-pink-300 to-indigo-200 animate-pulse opacity-85 shadow-[0_0_30px_rgba(217,70,239,0.9),0_0_50px_rgba(168,85,247,0.7)]" />

        {/* Orbiting Starlight Sparkles (SVG) */}
        <motion.div
          className="absolute -top-3 -right-2 text-yellow-300 z-20 pointer-events-none drop-shadow-[0_0_8px_rgba(253,224,71,0.9)]"
          animate={{ scale: [0.8, 1.3, 0.8], rotate: [0, 180, 360] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute -bottom-2 -left-3 text-cyan-300 z-20 pointer-events-none drop-shadow-[0_0_8px_rgba(103,232,249,0.9)]"
          animate={{ scale: [1.2, 0.7, 1.2], rotate: [360, 180, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute -top-2 -left-2 text-fuchsia-300 z-20 pointer-events-none drop-shadow-[0_0_8px_rgba(240,171,252,0.9)]"
          animate={{ scale: [0.7, 1.1, 0.7], opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </motion.div>

        {/* Main Avatar Border Container */}
        <div className="absolute inset-0 rounded-full border-4 border-fuchsia-300 shadow-[0_0_15px_rgba(232,121,249,0.9)] overflow-hidden z-10">
          {children}
        </div>
      </div>
    );
  }

  if (rarity === "超激レア") {
    return (
      <div className={`relative ${containerSize} flex items-center justify-center flex-shrink-0`}>
        {/* Blazing Flame Solar Ring */}
        <div 
          className="absolute inset-[-9px] rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-orange-500 blur-md opacity-85 animate-spin"
          style={{ animationDuration: "4s" }}
        />

        {/* Fiery Pulsing Core */}
        <div className="absolute inset-[-4px] rounded-full bg-gradient-to-tr from-red-500 via-orange-400 to-yellow-300 animate-pulse opacity-80 shadow-[0_0_25px_rgba(239,68,68,0.95),0_0_40px_rgba(245,158,11,0.7)]" />

        {/* Flame Sparkles */}
        <motion.div
          className="absolute -top-3 -right-2 text-amber-300 z-20 pointer-events-none drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]"
          animate={{ y: [-2, 2, -2], scale: [1, 1.25, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute -bottom-2 -left-2 text-orange-400 z-20 pointer-events-none drop-shadow-[0_0_8px_rgba(251,146,60,0.9)]"
          animate={{ y: [2, -2, 2], scale: [0.8, 1.15, 0.8] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </motion.div>

        {/* Main Avatar Border Container */}
        <div className="absolute inset-0 rounded-full border-4 border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.9)] overflow-hidden z-10">
          {children}
        </div>
      </div>
    );
  }

  if (rarity === "激レア") {
    return (
      <div className={`relative ${containerSize} flex items-center justify-center flex-shrink-0`}>
        {/* Golden Halo Ring */}
        <div 
          className="absolute inset-[-8px] rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-100 blur-sm opacity-80 animate-spin"
          style={{ animationDuration: "6s" }}
        />

        {/* Gold Core Glow */}
        <div className="absolute inset-[-4px] rounded-full bg-gradient-to-tr from-yellow-200 via-amber-300 to-yellow-100 opacity-75 shadow-[0_0_20px_rgba(250,204,21,0.9),0_0_35px_rgba(245,158,11,0.5)]" />

        {/* Gold Star Sparkles */}
        <motion.div
          className="absolute -top-2.5 -right-2 text-yellow-200 z-20 pointer-events-none drop-shadow-[0_0_6px_rgba(253,224,71,0.9)]"
          animate={{ scale: [0.9, 1.2, 0.9], rotate: [0, 90, 180] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute -bottom-2 -left-2 text-amber-300 z-20 pointer-events-none drop-shadow-[0_0_6px_rgba(245,158,11,0.9)]"
          animate={{ scale: [1.1, 0.8, 1.1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </motion.div>

        {/* Main Avatar Border Container */}
        <div className="absolute inset-0 rounded-full border-4 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.8)] overflow-hidden z-10">
          {children}
        </div>
      </div>
    );
  }

  if (rarity === "レア") {
    return (
      <div className={`relative ${containerSize} flex items-center justify-center flex-shrink-0`}>
        {/* Ocean Aqua Prism Ring */}
        <div 
          className="absolute inset-[-7px] rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-sky-300 blur-xs opacity-75 animate-spin"
          style={{ animationDuration: "7s" }}
        />

        {/* Aqua Glow */}
        <div className="absolute inset-[-3px] rounded-full bg-gradient-to-tr from-cyan-300 via-blue-300 to-sky-100 opacity-70 shadow-[0_0_15px_rgba(59,130,246,0.85),0_0_25px_rgba(6,182,212,0.5)]" />

        {/* Aqua Diamond Sparkles */}
        <motion.div
          className="absolute -top-2 -right-1.5 text-cyan-200 z-20 pointer-events-none drop-shadow-[0_0_6px_rgba(165,243,252,0.9)]"
          animate={{ scale: [0.8, 1.1, 0.8] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </motion.div>

        {/* Main Avatar Border Container */}
        <div className="absolute inset-0 rounded-full border-4 border-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.7)] overflow-hidden z-10">
          {children}
        </div>
      </div>
    );
  }

  // Normal / Default Rarity
  return (
    <div className={`relative ${containerSize} flex items-center justify-center flex-shrink-0`}>
      {/* Gentle Ambient Ring */}
      <div className="absolute inset-[-4px] rounded-full bg-gradient-to-tr from-emerald-400 via-teal-300 to-slate-200 opacity-50 blur-xs" />
      <div className="absolute inset-[-2px] rounded-full bg-white/40 shadow-[0_0_8px_rgba(148,163,184,0.5)]" />

      {/* Main Avatar Border Container */}
      <div className="absolute inset-0 rounded-full border-4 border-white shadow-md overflow-hidden z-10">
        {children}
      </div>
    </div>
  );
}
