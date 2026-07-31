"use client";

import { motion } from "framer-motion";

export function KanjiEffect({ effect }: { effect: string }) {
  if (!effect || effect === "default" || effect === "") return null;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-[3rem]">

      {/* ==== ほのお (fire) ==== */}
      {effect === "fire" && (
        <div className="absolute inset-0 bg-gradient-to-t from-orange-500/40 via-red-500/20 to-transparent mix-blend-overlay">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: "100%", x: `${Math.random() * 100}%`, scale: Math.random() * 0.5 + 0.5, opacity: 0 }}
              animate={{ y: "-20%", x: `${Math.random() * 100}%`, opacity: [0, 0.8, 0] }}
              transition={{ duration: Math.random() * 2 + 1, repeat: Infinity, delay: Math.random() * 2 }}
              className="absolute bottom-0 text-5xl blur-sm"
            >🔥</motion.div>
          ))}
        </div>
      )}

      {/* ==== みず (water) ==== */}
      {effect === "water" && (
        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/30 via-cyan-500/10 to-transparent mix-blend-overlay">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: "110%", x: `${Math.random() * 100}%`, scale: Math.random() * 0.5 + 0.2, opacity: 0 }}
              animate={{ y: "-10%", x: `${Math.random() * 100}%`, opacity: [0, 0.6, 0] }}
              transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 3, ease: "easeIn" }}
              className="absolute bottom-0 rounded-full border-2 border-white/50 bg-white/20 aspect-square w-8"
            />
          ))}
        </div>
      )}

      {/* ==== いかずち (thunder) ==== */}
      {effect === "thunder" && (
        <div className="absolute inset-0 flex items-center justify-center mix-blend-overlay">
          <motion.div
            animate={{ opacity: [0, 0.8, 0, 0.5, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: Math.random() * 3 + 1 }}
            className="absolute inset-0 bg-yellow-400"
          />
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5, rotate: Math.random() * 360 }}
              animate={{ opacity: [0, 1, 0], scale: [1, 2, 1] }}
              transition={{ duration: 0.2, repeat: Infinity, repeatDelay: Math.random() * 2 + 0.5, delay: Math.random() }}
              className="absolute text-8xl blur-sm drop-shadow-[0_0_15px_rgba(253,224,71,0.8)]"
            >⚡</motion.div>
          ))}
        </div>
      )}

      {/* ==== ほし (star) - ショップで購入 ==== */}
      {effect === "star" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(250,204,21,0.3)_360deg)]"
          />
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5], x: (Math.random() - 0.5) * 400, y: (Math.random() - 0.5) * 400 }}
              transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
              className="absolute text-5xl drop-shadow-md"
            >⭐</motion.div>
          ))}
        </div>
      )}

      {/* ==== にじ (rainbow) ==== */}
      {effect === "rainbow" && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden mix-blend-overlay opacity-50">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute w-[200%] h-[200%] bg-[conic-gradient(red,yellow,lime,aqua,blue,magenta,red)] rounded-full blur-3xl"
          />
        </div>
      )}

      {/* ==== キラキラ (sparkle) - ガチャレア。ほしとは別のエフェクト ==== */}
      {effect === "sparkle" && (
        <div className="absolute inset-0 mix-blend-overlay">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, x: `${Math.random() * 100}%`, y: `${Math.random() * 100}%` }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], rotate: [0, 180] }}
              transition={{ duration: Math.random() * 1 + 0.5, repeat: Infinity, delay: Math.random() * 2 }}
              className="absolute text-3xl text-yellow-300 drop-shadow-sm"
            >✨</motion.div>
          ))}
        </div>
      )}

      {/* ==== 桜吹雪 (sakura) - ガチャ激レア ==== */}
      {effect === "sakura" && (
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-3xl"
              style={{ left: `${Math.random() * 100}%`, top: `-5%` }}
              animate={{ y: '110%', x: `${(Math.random() - 0.5) * 200}px`, rotate: 360, opacity: [0.8, 0.8, 0] }}
              transition={{ duration: Math.random() * 4 + 2, repeat: Infinity, ease: "easeIn", delay: Math.random() * -4 }}
            >🌸</motion.div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-pink-500/10 to-transparent" />
        </div>
      )}

      {/* ==== 猛吹雪 (blizzard) - ガチャ激レア ==== */}
      {effect === "blizzard" && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-200/20 to-transparent" />
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-white font-bold"
              style={{ left: `${Math.random() * 120 - 10}%`, top: `-5%`, fontSize: `${Math.random() * 16 + 8}px` }}
              animate={{ y: '110%', x: `${(Math.random() - 0.5) * 100}px`, rotate: 360, opacity: [0, 0.9, 0] }}
              transition={{ duration: Math.random() * 2 + 0.5, repeat: Infinity, ease: "linear", delay: Math.random() * -3 }}
            >❄</motion.div>
          ))}
        </div>
      )}

      {/* ==== レーザー (laser) - ガチャ激レア ==== */}
      {effect === "laser" && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden mix-blend-overlay">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent w-full"
              style={{ top: `${10 + i * 15}%` }}
              animate={{ opacity: [0, 1, 0], scaleX: [0, 1, 0] }}
              transition={{ duration: 0.3, repeat: Infinity, repeatDelay: Math.random() * 1.5 + 0.5, delay: Math.random() * 2 }}
            />
          ))}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 bg-gradient-to-b from-transparent via-cyan-500 to-transparent h-full"
              style={{ left: `${10 + i * 15}%` }}
              animate={{ opacity: [0, 1, 0], scaleY: [0, 1, 0] }}
              transition={{ duration: 0.3, repeat: Infinity, repeatDelay: Math.random() * 1.5 + 0.5, delay: Math.random() * 2 }}
            />
          ))}
        </div>
      )}

      {/* ==== 黄金のオーラ (aura) - ガチャ激レア ==== */}
      {effect === "aura" && (
        <div className="absolute inset-0 flex items-center justify-center mix-blend-overlay">
          <motion.div
            className="absolute rounded-full"
            style={{ width: '80%', height: '80%', background: 'radial-gradient(circle, rgba(250,204,21,0.3) 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-yellow-400/60 text-4xl"
              style={{ rotate: `${i * 45}deg`, translateX: '80px' }}
              animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
            >✦</motion.div>
          ))}
        </div>
      )}

      {/* ==== オーロラ (rainbow - 超激レアと共有) + ブラックホール (blackhole) ==== */}
      {effect === "blackhole" && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <motion.div
            className="absolute rounded-full border-4 border-purple-500/50"
            style={{ width: '200px', height: '200px' }}
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute rounded-full border-2 border-violet-400/30"
            style={{ width: '280px', height: '280px' }}
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.9)_15%,rgba(109,40,217,0.3)_50%,transparent_70%)]" />
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-purple-300"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ x: [0, (Math.random() - 0.5) * 40], y: [0, Math.random() * 40], opacity: [0, 1, 0] }}
              transition={{ duration: Math.random() * 2 + 0.5, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </div>
      )}

      {/* ==== ギャラクシー (galaxy) - 神レア ==== */}
      {effect === "galaxy" && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden mix-blend-overlay">
          <motion.div
            className="absolute w-[200%] h-[200%] bg-[conic-gradient(from_0deg,#7c3aed40,#1d4ed840,#059669_40,#d9770640,#dc262640,#7c3aed40)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
              transition={{ duration: Math.random() * 2 + 1, repeat: Infinity, delay: Math.random() * 3 }}
            />
          ))}
        </div>
      )}

    </div>
  );
}
