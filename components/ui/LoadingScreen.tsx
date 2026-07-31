"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function LoadingScreen({ fullScreen = true }: { fullScreen?: boolean }) {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    // 擬似的なローディングアニメーション (1秒弱くらいで100%になる)
    const interval = setInterval(() => {
      setPercent(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const content = (
    <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border-4 border-blue-200 flex flex-col items-center">
      <div className="text-6xl mb-6 animate-bounce">🏃</div>
      <h2 className="text-2xl font-black text-slate-700 mb-6 drop-shadow-sm">読み込み中...</h2>
      
      <div className="w-full bg-slate-200 h-8 rounded-full overflow-hidden border-2 border-slate-300 shadow-inner relative">
        <motion.div 
          className="h-full bg-gradient-to-r from-blue-400 to-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percent, 100)}%` }}
          transition={{ type: "spring", bounce: 0, duration: 0.2 }}
        />
        <div className="absolute inset-0 flex items-center justify-center font-black text-white text-sm drop-shadow-md tracking-wider">
          {Math.min(percent, 100)} %
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-slate-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full h-full min-h-[300px]">
      {content}
    </div>
  );
}
