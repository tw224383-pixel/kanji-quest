"use client";

import { motion, AnimatePresence } from "framer-motion";

export function KanjiEffect({ effect }: { effect: string }) {
  if (!effect || effect === "default" || effect === "") return null;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-[3rem]">
      {effect === "fire" && (
        <div className="absolute inset-0 bg-gradient-to-t from-orange-500/40 via-red-500/20 to-transparent mix-blend-overlay">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: "100%", x: `${Math.random() * 100}%`, scale: Math.random() * 0.5 + 0.5, opacity: 0 }}
              animate={{
                y: "-20%",
                x: `${Math.random() * 100}%`,
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: Math.random() * 2 + 1,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              className="absolute bottom-0 text-5xl blur-sm"
            >
              🔥
            </motion.div>
          ))}
        </div>
      )}

      {effect === "water" && (
        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/30 via-cyan-500/10 to-transparent mix-blend-overlay">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: "110%", x: `${Math.random() * 100}%`, scale: Math.random() * 0.5 + 0.2, opacity: 0 }}
              animate={{
                y: "-10%",
                x: `${Math.random() * 100}%`,
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeIn"
              }}
              className="absolute bottom-0 rounded-full border-2 border-white/50 bg-white/20 aspect-square w-8"
            />
          ))}
        </div>
      )}

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
            >
              ⚡
            </motion.div>
          ))}
        </div>
      )}

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
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0.5],
                x: (Math.random() - 0.5) * 400,
                y: (Math.random() - 0.5) * 400,
              }}
              transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
              className="absolute text-5xl drop-shadow-md"
            >
              ⭐
            </motion.div>
          ))}
        </div>
      )}

      {effect === "rainbow" && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden mix-blend-overlay opacity-50">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute w-[200%] h-[200%] bg-[conic-gradient(red,yellow,lime,aqua,blue,magenta,red)] rounded-full blur-3xl"
          />
        </div>
      )}

      {effect === "sparkle" && (
        <div className="absolute inset-0 mix-blend-overlay">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, x: `${Math.random() * 100}%`, y: `${Math.random() * 100}%` }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                rotate: [0, 180],
              }}
              transition={{ duration: Math.random() * 1 + 0.5, repeat: Infinity, delay: Math.random() * 2 }}
              className="absolute text-3xl text-yellow-300 drop-shadow-sm"
            >
              ✨
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
