"use client";

import { motion } from "framer-motion";

export function ThemeBackground({ theme }: { theme: string }) {
  if (!theme || theme === "default") return null;

  return (
    <div className={`absolute inset-0 pointer-events-none transition-colors duration-1000 overflow-hidden ${
      theme === 'space' ? 'bg-slate-900' :
      theme === 'ninja' ? 'bg-zinc-800' :
      theme === 'cyber' ? 'bg-black' : 'bg-transparent'
    }`}>
      {theme === 'space' && (
        <div className="absolute inset-0 bg-black overflow-hidden perspective-[800px]">
          {/* Hyperspace Warp Stars */}
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
          
          {/* Moving Nebulas */}
          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-purple-600/30 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-1/2 h-1/2 bg-blue-600/30 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />

          <style>{`
            @keyframes warp {
              0% { transform: rotate(var(--angle, ${Math.random() * 360}deg)) translateY(0) scaleY(1); opacity: 0; }
              50% { opacity: 1; }
              100% { transform: rotate(var(--angle, ${Math.random() * 360}deg)) translateY(1000px) scaleY(4); opacity: 0; }
            }
          `}</style>
        </div>
      )}

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
          
          {/* Bamboo Silhouette overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-around px-10 opacity-60">
             {[...Array(10)].map((_, i) => (
               <div key={i} className={`w-4 bg-zinc-950 rounded-t-full transform ${Math.random() > 0.5 ? 'rotate-2' : '-rotate-2'}`} style={{ height: `${Math.random() * 100 + 50}%` }} />
             ))}
          </div>
        </div>
      )}

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
    </div>
  );
}
