"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost" | "fun" | "premium";
  size?: "sm" | "md" | "lg";
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  const baseStyle = "relative inline-flex items-center justify-center font-black rounded-[2rem] transition-all focus:outline-none focus:ring-4 focus:ring-primary/50 overflow-hidden transform-gpu border-2 border-white/30";

  // 各色とも「上が明るく下が濃い3段グラデーション＋内側の上ハイライト・下シャドウ」で
  // 宝石のような奥行きを出す（従来は2段グラデーション＋上ハイライトのみで平坦だった）。
  // premium はリッチガチャ演出と同系統のゴールド配色を、通常ボタンでも使えるようにした新バリアント。
  const variants = {
    primary: "bg-[linear-gradient(180deg,#93c5fd_0%,#3b82f6_50%,#1d4ed8_100%)] text-white hover:brightness-110 border-b-[8px] border-blue-900 active:border-b-0 active:translate-y-[8px] shadow-[0_10px_18px_rgba(29,78,216,0.4),inset_0_4px_0_rgba(255,255,255,0.55),inset_0_-4px_7px_rgba(30,58,138,0.28)] active:shadow-none text-outline-dark",
    secondary: "bg-[linear-gradient(180deg,#6ee7b7_0%,#10b981_50%,#047857_100%)] text-white hover:brightness-110 border-b-[8px] border-emerald-900 active:border-b-0 active:translate-y-[8px] shadow-[0_10px_18px_rgba(5,150,105,0.35),inset_0_4px_0_rgba(255,255,255,0.55),inset_0_-4px_7px_rgba(6,78,59,0.28)] active:shadow-none drop-shadow-game-text",
    danger: "bg-[linear-gradient(180deg,#fca5a5_0%,#ef4444_50%,#b91c1c_100%)] text-white hover:brightness-110 border-b-[8px] border-red-900 active:border-b-0 active:translate-y-[8px] shadow-[0_10px_18px_rgba(220,38,38,0.35),inset_0_4px_0_rgba(255,255,255,0.55),inset_0_-4px_7px_rgba(69,10,10,0.28)] active:shadow-none drop-shadow-game-text",
    fun: "bg-[linear-gradient(180deg,#fef08a_0%,#f59e0b_50%,#b45309_100%)] text-white hover:brightness-110 border-b-[8px] border-orange-900 active:border-b-0 active:translate-y-[8px] shadow-[0_10px_18px_rgba(234,88,12,0.35),inset_0_4px_0_rgba(255,255,255,0.6),inset_0_-4px_7px_rgba(69,26,3,0.28)] active:shadow-none drop-shadow-game-text",
    premium: "bg-[linear-gradient(180deg,#fef3c7_0%,#fbbf24_30%,#d97706_70%,#78350f_100%)] border-yellow-100 text-white hover:brightness-110 border-b-[8px] border-yellow-950 active:border-b-0 active:translate-y-[8px] shadow-[0_12px_20px_rgba(0,0,0,0.35),inset_0_4px_10px_rgba(255,255,255,0.65),inset_0_-5px_8px_rgba(0,0,0,0.25)] active:shadow-none drop-shadow-game-text",
    outline: "bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_60%,#eef2f7_100%)] text-slate-800 border-b-[6px] border-slate-300 hover:brightness-95 active:translate-y-[6px] shadow-[0_8px_14px_rgba(15,23,42,0.08),inset_0_4px_0_rgba(255,255,255,1),inset_0_-3px_5px_rgba(148,163,184,0.2)] active:shadow-none active:border-b-0",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 shadow-none border-0 active:scale-95",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-lg",
    lg: "px-8 py-4 text-2xl",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95, y: 8 }}
      className={twMerge(clsx(baseStyle, variants[variant], sizes[size], className))}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center">{children}</span>
      {/* Shine effect (glossy highlight on top half) */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent pointer-events-none rounded-t-[1.8rem]"></div>
      {/* Moving Shimmer */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent hover:animate-[shimmer_1.5s_infinite] z-0 rounded-[2rem]"></div>
    </motion.button>
  );
}
