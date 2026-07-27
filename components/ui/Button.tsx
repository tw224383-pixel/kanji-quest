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
  const baseStyle = "relative inline-flex items-center justify-center font-black rounded-2xl transition-all focus:outline-none focus:ring-4 focus:ring-primary/50 overflow-hidden";
  
  const variants = {
    primary: "bg-blue-500 text-white hover:bg-blue-400 border-b-8 border-blue-700 active:border-b-0 active:translate-y-2 shadow-[0_10px_0_0_rgba(29,78,216,0.5)] active:shadow-none",
    secondary: "bg-emerald-500 text-white hover:bg-emerald-400 border-b-8 border-emerald-700 active:border-b-0 active:translate-y-2 shadow-[0_10px_0_0_rgba(4,120,87,0.5)] active:shadow-none",
    danger: "bg-red-500 text-white hover:bg-red-400 border-b-8 border-red-700 active:border-b-0 active:translate-y-2 shadow-[0_10px_0_0_rgba(185,28,28,0.5)] active:shadow-none",
    fun: "bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-300 hover:to-orange-400 border-b-8 border-orange-700 active:border-b-0 active:translate-y-2 shadow-[0_10px_0_0_rgba(194,65,12,0.5)] active:shadow-none",
    outline: "bg-white text-gray-800 border-4 border-gray-300 hover:bg-gray-50 active:translate-y-1 shadow-[0_5px_0_0_rgba(209,213,219,1)] active:shadow-none active:border-b-0",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 shadow-none border-0 active:scale-95",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-lg",
    lg: "px-8 py-4 text-2xl",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className={twMerge(clsx(baseStyle, variants[variant], sizes[size], className))}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      {/* Shine effect */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent hover:animate-[shimmer_1.5s_infinite] z-0"></div>
    </motion.button>
  );
}
