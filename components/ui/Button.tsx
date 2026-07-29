"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost" | "fun";
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
  
  const variants = {
    primary: "bg-gradient-to-b from-blue-400 to-blue-600 text-white hover:brightness-110 border-b-[8px] border-blue-800 active:border-b-0 active:translate-y-[8px] shadow-[0_10px_20px_rgba(37,99,235,0.4),inset_0_4px_0_rgba(255,255,255,0.4)] active:shadow-none text-outline-dark",
    secondary: "bg-gradient-to-b from-emerald-400 to-emerald-600 text-white hover:brightness-110 border-b-[8px] border-emerald-800 active:border-b-0 active:translate-y-[8px] shadow-[0_10px_20px_rgba(5,150,105,0.4),inset_0_4px_0_rgba(255,255,255,0.4)] active:shadow-none drop-shadow-game-text",
    danger: "bg-gradient-to-b from-red-400 to-red-600 text-white hover:brightness-110 border-b-[8px] border-red-800 active:border-b-0 active:translate-y-[8px] shadow-[0_10px_20px_rgba(220,38,38,0.4),inset_0_4px_0_rgba(255,255,255,0.4)] active:shadow-none drop-shadow-game-text",
    fun: "bg-gradient-to-b from-amber-300 to-orange-500 text-white hover:brightness-110 border-b-[8px] border-orange-800 active:border-b-0 active:translate-y-[8px] shadow-[0_10px_20px_rgba(234,88,12,0.4),inset_0_4px_0_rgba(255,255,255,0.5)] active:shadow-none drop-shadow-game-text",
    outline: "bg-gradient-to-b from-white to-gray-100 text-gray-800 border-b-[6px] border-gray-300 hover:brightness-95 active:translate-y-[6px] shadow-[0_8px_15px_rgba(0,0,0,0.1),inset_0_4px_0_rgba(255,255,255,1)] active:shadow-none active:border-b-0",
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
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-t-[1.8rem]"></div>
      {/* Moving Shimmer */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent hover:animate-[shimmer_1.5s_infinite] z-0 rounded-[2rem]"></div>
    </motion.button>
  );
}
