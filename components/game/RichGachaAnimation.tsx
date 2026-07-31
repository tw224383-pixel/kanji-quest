"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type GachaAnimationProps = {
  targetStage: number; // 1 to 5
  onComplete: () => void;
};

export const RichGachaAnimation = ({ targetStage, onComplete }: GachaAnimationProps) => {
  const [currentStage, setCurrentStage] = useState(1);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    let stage = 1;
    const interval = setInterval(() => {
      if (stage < targetStage) {
        stage++;
        setCurrentStage(stage);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 300); // shake for 300ms
      } else {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 1500); // wait a bit after reaching max stage before showing result
      }
    }, 1000); // 1 second per stage

    return () => clearInterval(interval);
  }, [targetStage, onComplete]);

  // Planet color map
  const getPlanetColor = (s: number) => {
    switch (s) {
      case 1: return "radial-gradient(circle at 30% 30%, #ffffff, #888888, #222222)"; // White
      case 2: return "radial-gradient(circle at 30% 30%, #60a5fa, #1d4ed8, #0f172a)"; // Blue
      case 3: return "radial-gradient(circle at 30% 30%, #4ade80, #15803d, #064e3b)"; // Green
      case 4: return "radial-gradient(circle at 30% 30%, #f87171, #b91c1c, #450a0a)"; // Red
      case 5: return "radial-gradient(circle at 30% 30%, #facc15, #ef4444, #a855f7, #3b82f6)"; // Rainbow-ish
      default: return "radial-gradient(circle at 30% 30%, #ffffff, #888888, #222222)";
    }
  };

  const getPlanetShadow = (s: number) => {
    switch (s) {
      case 1: return "0 0 20px rgba(255,255,255,0.5)";
      case 2: return "0 0 40px rgba(59,130,246,0.8)";
      case 3: return "0 0 60px rgba(34,197,94,0.8)";
      case 4: return "0 0 80px rgba(239,68,68,0.9)";
      case 5: return "0 0 100px rgba(255,255,255,1), 0 0 150px rgba(239,68,68,0.8)";
      default: return "0 0 20px rgba(255,255,255,0.5)";
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 z-50 bg-black overflow-hidden font-mono"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="w-full h-full relative flex items-center justify-center"
        animate={isShaking ? { x: [-10, 10, -10, 10, -5, 5, 0], y: [-10, 10, -5, 5, -10, 10, 0] } : {}}
        transition={{ duration: 0.3 }}
      >
        {/* Speed lines background */}
        <div className="absolute inset-0 z-0">
          <style dangerouslySetInnerHTML={{__html: `
            .speed-line {
              position: absolute;
              width: 2px;
              height: 100px;
              background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1));
              animation: fly 0.3s linear infinite;
            }
            @keyframes fly {
              from { transform: translateY(-100vh); }
              to { transform: translateY(100vh); }
            }
          `}} />
          {[...Array(30)].map((_, i) => (
            <div 
              key={i} 
              className="speed-line" 
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${0.1 + Math.random() * 0.3}s`,
                animationDelay: `-${Math.random()}s`
              }}
            />
          ))}
        </div>

        {/* Planet */}
        <motion.div 
          className="relative z-10 rounded-full flex items-center justify-center overflow-hidden border border-white/20"
          style={{
            width: "300px",
            height: "300px",
            background: getPlanetColor(currentStage),
            boxShadow: getPlanetShadow(currentStage),
            transition: "all 0.5s ease"
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {/* Sparkles / Craters */}
          <div className="absolute inset-0 opacity-60 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCI+PGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMSIgZmlsbD0id2hpdGUiLz48Y2lyY2xlIGN4PSIxMCIgY3k9IjQwIiByPSIyIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuNSkiLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjEwIiByPSIxLjUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC44KSIvPjwvc3ZnPg==')] animate-[pulse_1.5s_ease-in-out_infinite]" />
          <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjIwIiByPSI1IiBmaWxsPSJyZ2JhKDAsMCwwLDAuMikiLz48Y2lyY2xlIGN4PSI4MCIgY3k9IjcwIiByPSI4IiBmaWxsPSJyZ2JhKDAsMCwwLDAuMSkiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjgwIiByPSI0IiBmaWxsPSJyZ2JhKDAsMCwwLDAuMjUpIi8+PC9zdmc+')] mix-blend-multiply" />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent w-[200%] h-[200%] mix-blend-overlay"
            style={{ left: '-50%', top: '-50%' }}
            animate={{ rotate: -720 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

        {/* Lasers & Explosion */}
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
          <style dangerouslySetInnerHTML={{__html: `
            .laser {
              position: absolute;
              bottom: 10%;
              width: 8px;
              height: 400px;
              background: #06b6d4;
              box-shadow: 0 0 20px #06b6d4, 0 0 40px #0ea5e9, 0 0 80px #38bdf8;
              transform-origin: bottom center;
              animation: shoot 0.3s ease-out;
            }
            .laser-left {
              left: 20%;
              transform: rotate(30deg);
            }
            .laser-right {
              right: 20%;
              transform: rotate(-30deg);
            }
            @keyframes shoot {
              0% { height: 0; opacity: 1; bottom: 10%; }
              50% { height: 400px; opacity: 1; }
              100% { height: 400px; opacity: 0; bottom: 50%; }
            }
          `}} />
          <AnimatePresence>
            {isShaking && (
              <>
                <motion.div className="laser laser-left" />
                <motion.div className="laser laser-right" />
                
                {/* Explosion ring on the planet */}
                <motion.div
                  className="absolute rounded-full border-4 border-white"
                  initial={{ width: 300, height: 300, opacity: 1 }}
                  animate={{ width: 600, height: 600, opacity: 0, borderWidth: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{ boxShadow: getPlanetShadow(currentStage) }}
                />
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Cockpit Overlay */}
        <div className="absolute inset-0 z-30 pointer-events-none border-[40px] border-black" style={{ clipPath: "polygon(10% 0, 90% 0, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0 90%, 0 10%)" }}>
           <div className="absolute top-0 left-0 right-0 h-16 bg-black flex justify-center items-end pb-2">
             <div className="text-red-500 font-bold text-xl tracking-widest bg-red-950/50 px-4 py-1 border border-red-500 animate-pulse">
               WARP SPEED
             </div>
           </div>
           <div className="absolute bottom-0 left-0 right-0 h-40 bg-black flex justify-center items-start pt-4 border-t-[8px] border-slate-800">
             <div className="w-64 h-32 bg-slate-900 border-4 border-cyan-500 rounded-lg relative overflow-hidden flex items-center justify-center">
               <div className="text-cyan-400 font-bold text-2xl tracking-widest text-center">
                 TARGET<br/>LOCKED
                 <div className="text-sm mt-2 text-cyan-200">STAGE: {currentStage} / 5</div>
               </div>
               <div className="absolute inset-0 border-[4px] border-red-500 opacity-50 animate-ping" />
             </div>
           </div>
           
           {/* Side panels */}
           <div className="absolute bottom-0 left-0 w-32 h-64 bg-slate-900 border-r-8 border-t-8 border-slate-800" style={{ clipPath: "polygon(0 0, 100% 30%, 100% 100%, 0 100%)" }} />
           <div className="absolute bottom-0 right-0 w-32 h-64 bg-slate-900 border-l-8 border-t-8 border-slate-800" style={{ clipPath: "polygon(0 30%, 100% 0, 100% 100%, 0 100%)" }} />
        </div>
      </motion.div>
    </motion.div>
  );
};
