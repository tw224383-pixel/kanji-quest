"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type RegularGachaAnimationProps = {
  onComplete: () => void;
};

export const RegularGachaAnimation = ({ onComplete }: RegularGachaAnimationProps) => {
  const [stage, setStage] = useState<"shaking" | "opening">("shaking");

  useEffect(() => {
    // Shake for 2 seconds, then open
    const shakeTimer = setTimeout(() => {
      setStage("opening");
      
      // Wait for 1.5 seconds after opening before completing
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 1500);
      
      return () => clearTimeout(completeTimer);
    }, 2000);

    return () => clearTimeout(shakeTimer);
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center overflow-hidden font-mono"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative flex items-center justify-center w-full h-full">
        {/* Background glow when opening */}
        {stage === "opening" && (
          <motion.div
            className="absolute inset-0 bg-yellow-500/20"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.5 }}
            transition={{ duration: 1 }}
            style={{ filter: 'blur(50px)' }}
          />
        )}
        
        {/* Treasure Box */}
        <motion.div
          className="text-9xl relative z-10 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]"
          animate={
            stage === "shaking" 
              ? { rotate: [-5, 5, -5, 5, 0], scale: [1, 1.1, 1, 1.1, 1] } 
              : { scale: [1, 1.5, 0], opacity: [1, 1, 0], rotate: 360 }
          }
          transition={
            stage === "shaking"
              ? { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
              : { duration: 1, ease: "easeOut" }
          }
        >
          {stage === "shaking" ? "🎁" : "✨"}
        </motion.div>
        
        {/* Text */}
        <motion.div
          className="absolute bottom-32 text-2xl font-black text-amber-300 drop-shadow-md"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {stage === "shaking" ? "開けているよ..." : "何が出るかな！？"}
        </motion.div>
      </div>
    </motion.div>
  );
};
