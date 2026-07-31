"use client";

import { motion } from "framer-motion";

export function ThemeBackground({ theme }: { theme: string }) {
  if (!theme || theme === "default") return null;

  return (
    <div className={`absolute inset-0 pointer-events-none transition-colors duration-1000 overflow-hidden ${
      theme === 'space' ? 'bg-slate-900' :
      theme === 'ninja' ? 'bg-zinc-800' :
      theme === 'cyber' ? 'bg-black' :
      theme === 'skycastle' ? 'bg-sky-900' :
      theme === 'cybercity' ? 'bg-slate-900' :
      theme === 'magma' ? 'bg-red-950' :
      theme === 'ruins' ? 'bg-stone-900' :
      theme === 'ocean' ? 'bg-blue-950' :
      theme === 'forest' ? 'bg-emerald-950' :
      theme === 'candy' ? 'bg-pink-950' : 'bg-transparent'
    }`}>

      {/* ==== うちゅう (space) ==== */}
      {theme === 'space' && (
        <div className="absolute inset-0 bg-black overflow-hidden perspective-[800px]">
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="absolute w-[2px] h-[30px] bg-white rounded-full drop-shadow-[0_0_8px_white]"
                style={{
                  animation: `warp ${Math.random() * 2 + 1}s linear infinite`,
                  animationDelay: `${Math.random() * -3}s`,
                  transform: `rotate(${Math.random() * 360}deg) translateY(100px)`,
                  opacity: 0
                }}
              />
            ))}
          </div>
          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-purple-600/30 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-1/2 h-1/2 bg-blue-600/30 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
          <style>{`
            @keyframes warp {
              0% { transform: rotate(var(--angle, 45deg)) translateY(0) scaleY(1); opacity: 0; }
              50% { opacity: 1; }
              100% { transform: rotate(var(--angle, 45deg)) translateY(1000px) scaleY(4); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      {/* ==== にんじゃ (ninja) ==== */}
      {theme === 'ninja' && (
        <div className="absolute inset-0 overflow-hidden bg-zinc-900">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `radial-gradient(circle at center, transparent 0%, #000 100%), repeating-linear-gradient(45deg, #222 0, #222 2px, transparent 2px, transparent 8px)`
          }} />
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-slate-700/30 font-black text-6xl"
              initial={{ y: -100, x: `${Math.random() * 100}vw`, rotate: 0 }}
              animate={{
                y: "110vh",
                x: `${Math.random() * 100}vw`,
                rotate: 360
              }}
              transition={{
                duration: Math.random() * 10 + 5,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * -10
              }}
            >
              {['忍', '影', '斬', '隠', '速'][Math.floor(Math.random() * 5)]}
            </motion.div>
          ))}
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-around px-10 opacity-60">
             {[...Array(10)].map((_, i) => (
               <div key={i} className={`w-4 bg-zinc-950 rounded-t-full transform ${Math.random() > 0.5 ? 'rotate-2' : '-rotate-2'}`} style={{ height: `${Math.random() * 100 + 50}%` }} />
             ))}
          </div>
        </div>
      )}

      {/* ==== サイバー (cyber) - ショップで購入できる ==== */}
      {theme === 'cyber' && (
        <div className="absolute inset-0 bg-black overflow-hidden perspective-[1000px]">
          {/* Cyber Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(transparent_95%,#0ff_95%),linear-gradient(90deg,transparent_95%,#0ff_95%)] bg-[length:40px_40px] opacity-20"
               style={{ transform: 'rotateX(60deg) translateY(-100px) scale(2)', transformOrigin: 'center top' }} />
          {/* Scanning lines */}
          <motion.div
            className="absolute left-0 right-0 h-1 bg-cyan-400/50 shadow-[0_0_10px_#0ff]"
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          {/* Floating Hexagons */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute border border-cyan-500/30 text-cyan-500/10 flex items-center justify-center text-xs font-mono"
              style={{
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                left: `${Math.random() * 100}vw`,
                top: `${Math.random() * 100}vh`,
              }}
              animate={{
                rotate: 360,
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: Math.random() * 10 + 5,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {(Math.random() * 1000).toFixed(0)}
            </motion.div>
          ))}
        </div>
      )}

      {/* ==== 天空の城 (skycastle) - ガチャ超激レア ==== */}
      {theme === 'skycastle' && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Sky gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-500 to-indigo-900" />
          {/* Floating clouds */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/60 blur-md"
              style={{
                width: `${Math.random() * 200 + 100}px`,
                height: `${Math.random() * 60 + 30}px`,
                top: `${Math.random() * 50}%`,
                left: `-200px`,
              }}
              animate={{ x: ['0vw', '120vw'] }}
              transition={{
                duration: Math.random() * 20 + 15,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * -20
              }}
            />
          ))}
          {/* Castle silhouette */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-48 opacity-40">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-slate-700" />
            <div className="absolute bottom-28 left-1/2 -translate-x-1/2 w-16 h-20 bg-slate-700" />
            <div className="absolute bottom-44 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] border-r-[20px] border-b-[30px] border-transparent border-b-red-700" />
            <div className="absolute bottom-28 left-0 w-12 h-16 bg-slate-700" />
            <div className="absolute bottom-40 left-0 w-0 h-0 border-l-[16px] border-r-[16px] border-b-[24px] border-transparent border-b-red-700" />
            <div className="absolute bottom-28 right-0 w-12 h-16 bg-slate-700" />
            <div className="absolute bottom-40 right-0 w-0 h-0 border-l-[16px] border-r-[16px] border-b-[24px] border-transparent border-b-red-700" />
          </div>
          {/* Sparkles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-yellow-300 text-xl"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
              transition={{ duration: Math.random() * 2 + 1, repeat: Infinity, delay: Math.random() * 3 }}
            >✨</motion.div>
          ))}
        </div>
      )}

      {/* ==== サイバーシティ (cybercity) - ガチャ激レア ==== */}
      {theme === 'cybercity' && (
        <div className="absolute inset-0 bg-slate-950 overflow-hidden">
          {/* City skyline */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 flex items-end justify-around gap-1 px-4">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="bg-slate-800 relative"
                style={{ width: `${Math.random() * 30 + 20}px`, height: `${Math.random() * 60 + 30}%` }}
              >
                {/* Windows */}
                {[...Array(5)].map((_, j) => (
                  <div
                    key={j}
                    className="absolute w-2 h-2 rounded-sm"
                    style={{
                      background: Math.random() > 0.4 ? '#fbbf24' : '#06b6d4',
                      top: `${Math.random() * 80}%`,
                      left: `${Math.random() * 60 + 10}%`,
                      opacity: Math.random() > 0.3 ? 1 : 0
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          {/* Neon glow lines */}
          <div className="absolute bottom-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-50 blur-sm" />
          <div className="absolute bottom-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-40 blur-sm" />
          {/* Flying cars (dots) */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-1 rounded-full bg-red-400/80 blur-sm"
              style={{ top: `${20 + Math.random() * 40}%`, left: 0 }}
              animate={{ x: ['0vw', '100vw'] }}
              transition={{ duration: Math.random() * 4 + 2, repeat: Infinity, ease: "linear", delay: Math.random() * -5 }}
            />
          ))}
          {/* Purple/pink top glow */}
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-purple-900/60 to-transparent" />
        </div>
      )}

      {/* ==== マグマ地帯 (magma) - ガチャ超激レア ==== */}
      {theme === 'magma' && (
        <div className="absolute inset-0 bg-red-950 overflow-hidden">
          {/* Lava glow */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-orange-600/60 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-red-950 to-transparent" />
          {/* Lava bubbles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-orange-500/50 blur-sm"
              style={{ width: `${Math.random() * 40 + 10}px`, height: `${Math.random() * 40 + 10}px`, left: `${Math.random() * 100}%`, bottom: 0 }}
              animate={{ y: [0, -(Math.random() * 200 + 100)], opacity: [0.6, 0] }}
              transition={{ duration: Math.random() * 3 + 1.5, repeat: Infinity, ease: "easeOut", delay: Math.random() * 3 }}
            />
          ))}
          {/* Ember sparks */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-yellow-400"
              style={{ left: `${Math.random() * 100}%`, bottom: `10%` }}
              animate={{ y: [0, -(Math.random() * 300 + 100)], x: [(Math.random() - 0.5) * 100], opacity: [1, 0] }}
              transition={{ duration: Math.random() * 2 + 1, repeat: Infinity, ease: "easeOut", delay: Math.random() * 2 }}
            />
          ))}
          {/* Volcano rocky overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-stone-900 to-transparent" />
        </div>
      )}

      {/* ==== 古代遺跡 (ruins) - ガチャ激レア ==== */}
      {theme === 'ruins' && (
        <div className="absolute inset-0 bg-stone-900 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-950/50 to-stone-950" />
          {/* Stone pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 30px, #6b5d3f 30px, #6b5d3f 32px), repeating-linear-gradient(90deg, transparent, transparent 30px, #6b5d3f 30px, #6b5d3f 32px)`
          }} />
          {/* Pillar silhouettes */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-around items-end opacity-30">
            {[0,1,2,3,4].map(i => (
              <div key={i} className="relative" style={{ width: '40px' }}>
                <div className="bg-stone-600 w-full" style={{ height: `${[120, 80, 150, 90, 110][i]}px` }} />
                <div className="absolute top-0 left-0 right-0 h-4 bg-stone-500" />
              </div>
            ))}
          </div>
          {/* Floating dust particles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-amber-300/50"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ y: [0, -30, 0], opacity: [0, 0.6, 0] }}
              transition={{ duration: Math.random() * 4 + 2, repeat: Infinity, delay: Math.random() * 4 }}
            />
          ))}
          {/* Top vignette */}
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-black/60 to-transparent" />
        </div>
      )}

      {/* ==== 深海 (ocean) - ガチャ激レア ==== */}
      {theme === 'ocean' && (
        <div className="absolute inset-0 bg-blue-950 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-800/40 via-blue-950 to-black" />
          {/* Bubbles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-cyan-400/30 bg-cyan-400/10"
              style={{ width: `${Math.random() * 20 + 5}px`, height: `${Math.random() * 20 + 5}px`, left: `${Math.random() * 100}%`, bottom: `${Math.random() * 20}%` }}
              animate={{ y: [0, -(Math.random() * 400 + 200)], opacity: [0.6, 0] }}
              transition={{ duration: Math.random() * 5 + 3, repeat: Infinity, ease: "easeOut", delay: Math.random() * 5 }}
            />
          ))}
          {/* Bioluminescent glow spots */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full blur-3xl"
              style={{
                width: `${Math.random() * 150 + 80}px`,
                height: `${Math.random() * 150 + 80}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: ['#06b6d4', '#22d3ee', '#0ea5e9', '#7c3aed'][Math.floor(Math.random() * 4)] + '40'
              }}
              animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
              transition={{ duration: Math.random() * 4 + 3, repeat: Infinity, delay: Math.random() * 3 }}
            />
          ))}
          {/* Light rays from above */}
          <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-cyan-300/20 to-transparent rotate-12 blur-md" />
          <div className="absolute top-0 left-1/2 w-1 h-full bg-gradient-to-b from-cyan-300/15 to-transparent -rotate-6 blur-md" />
        </div>
      )}

      {/* ==== 魔法の森 (forest) - ガチャレア ==== */}
      {theme === 'forest' && (
        <div className="absolute inset-0 bg-emerald-950 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/60 to-black/80" />
          {/* Fireflies */}
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-yellow-300 blur-sm"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{
                opacity: [0, 0.8, 0],
                x: [(Math.random() - 0.5) * 60],
                y: [(Math.random() - 0.5) * 60]
              }}
              transition={{ duration: Math.random() * 3 + 1, repeat: Infinity, delay: Math.random() * 4 }}
            />
          ))}
          {/* Tree silhouettes */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-around items-end opacity-40">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="relative flex flex-col items-center" style={{ width: '60px' }}>
                <div className="bg-emerald-900 rounded-full" style={{ width: `${Math.random() * 40 + 40}px`, height: `${Math.random() * 60 + 60}px` }} />
                <div className="bg-stone-800 w-3" style={{ height: `${Math.random() * 30 + 20}px` }} />
              </div>
            ))}
          </div>
          {/* Magic particles */}
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-green-300/50 text-2xl"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ opacity: [0, 0.5, 0], rotate: [0, 360] }}
              transition={{ duration: Math.random() * 4 + 2, repeat: Infinity, delay: Math.random() * 4 }}
            >✦</motion.div>
          ))}
        </div>
      )}

      {/* ==== お菓子の国 (candy) - ガチャレア ==== */}
      {theme === 'candy' && (
        <div className="absolute inset-0 bg-pink-950 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-900/50 via-pink-950 to-rose-950" />
          {/* Falling candy */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              style={{ left: `${Math.random() * 100}%`, top: `-5%` }}
              animate={{ y: '110vh', rotate: 360 }}
              transition={{ duration: Math.random() * 5 + 3, repeat: Infinity, ease: "linear", delay: Math.random() * -5 }}
            >
              {['🍬', '🍭', '🍩', '🍪', '🍡'][Math.floor(Math.random() * 5)]}
            </motion.div>
          ))}
          {/* Pastel glow spots */}
          <div className="absolute top-1/4 left-1/4 w-1/3 h-1/3 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-1/3 h-1/3 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
          {/* Star sprinkles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-xs"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, color: ['#f9a8d4', '#c4b5fd', '#fed7aa', '#a5f3fc'][Math.floor(Math.random() * 4)] }}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
              transition={{ duration: Math.random() * 2 + 1, repeat: Infinity, delay: Math.random() * 3 }}
            >★</motion.div>
          ))}
        </div>
      )}

    </div>
  );
}
