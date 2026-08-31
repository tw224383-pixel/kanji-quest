"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ThemeScenery } from "./ThemeScenery";
import { themeHasImage } from "../../lib/themeVisuals";

export function ThemeBackground({ theme }: { theme: string }) {
  const isDefault = !theme || theme === "default";

  // AI-generated background image paths
  // 背景画像を持つのは既存の10テーマ＋デフォルトのみ。
  // 追加した15テーマは画像を持たず、ThemeScenery がコードで絵を描く
  // （1枚0.2〜0.35MBの画像を増やすとHostingの無料枠を圧迫するため。
  //   詳細は lib/themeVisuals.ts のコメント参照）。
  const usesImage = themeHasImage(theme);
  const bgImageTheme = isDefault ? 'fantasy_bg' : (theme === 'time_space' ? 'space' : theme);
  const bgImageUrl = isDefault ? `/images/ui/fantasy_bg.webp` : `/images/themes/bg_${bgImageTheme}.webp`;

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${theme === 'time_space' ? 'hue-rotate-180' : ''}`}>
      {usesImage ? (
        <Image
          src={bgImageUrl}
          alt="background"
          fill
          className="object-cover"
          quality={100}
          priority
          unoptimized
        />
      ) : (
        <ThemeScenery theme={theme} />
      )}

      {/* Darken/Lighten overlay to ensure contrast and blend with animations */}
      {/* コードで描くテーマは元から暗めに設計してあるので、暗幕は薄くして絵を潰さない */}
      <div className={`absolute inset-0 ${usesImage ? 'bg-black/30' : 'bg-black/15'}`} />

      {/* ==== うちゅう (space) & 時空の支配者 (time_space) ==== */}
      {(theme === 'space' || theme === 'time_space') && (
        <div className="absolute inset-0 overflow-hidden perspective-[1000px]">
          {/* Nebula backgrounds */}
          <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-purple-900/20 to-transparent blur-3xl opacity-60 animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-[20%] right-[-20%] w-[100%] h-[100%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-fuchsia-900/30 via-pink-900/10 to-transparent blur-3xl opacity-50 animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
          
          {/* Slow rotating galaxy */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -ml-[400px] -mt-[400px] rounded-full border-[1px] border-indigo-500/10"
            style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 60%)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          >
            {[...Array(30)].map((_, i) => (
              <div key={i} className="absolute rounded-full bg-white blur-[1px]" style={{
                width: Math.random() * 3 + 1 + 'px',
                height: Math.random() * 3 + 1 + 'px',
                top: `${50 + Math.sin(i) * (Math.random() * 40 + 10)}%`,
                left: `${50 + Math.cos(i) * (Math.random() * 40 + 10)}%`,
                opacity: Math.random() * 0.8 + 0.2
              }} />
            ))}
          </motion.div>

          {/* Shooting stars */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`shooting-${i}`}
              className="absolute h-px bg-gradient-to-r from-transparent via-white to-transparent"
              style={{
                width: `${Math.random() * 150 + 50}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                rotate: '45deg',
              }}
              animate={{
                x: ['-100vw', '100vw'],
                y: ['-100vh', '100vh'],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: Math.random() * 2 + 1,
                repeat: Infinity,
                delay: Math.random() * 15,
                ease: "linear"
              }}
            />
          ))}

          {/* Twinkling stars */}
          {[...Array(100)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() > 0.9 ? '3px' : '1px',
                height: Math.random() > 0.9 ? '3px' : '1px',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                boxShadow: Math.random() > 0.8 ? '0 0 4px #fff' : 'none'
              }}
              animate={{ opacity: [0.1, 1, 0.1] }}
              transition={{
                duration: Math.random() * 3 + 1,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
            />
          ))}
        </div>
      )}

      {/* ==== にんじゃ (ninja) ==== */}
      {theme === 'ninja' && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Sakura Petals */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={`petal-${i}`}
              className="absolute w-3 h-3 bg-pink-200 rounded-br-full rounded-tl-full opacity-80 drop-shadow-[0_0_4px_rgba(255,192,203,0.8)]"
              style={{
                left: `${Math.random() * 120 - 10}%`,
                top: -20,
              }}
              animate={{
                y: '110vh',
                x: `${Math.random() * 200 - 100}px`,
                rotate: [0, 360, 720],
                rotateX: [0, 360],
                rotateY: [0, 360],
              }}
              transition={{
                duration: Math.random() * 8 + 5,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * -10
              }}
            />
          ))}

          {/* Occasional Shuriken throw */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`shuriken-${i}`}
              className="absolute text-slate-300 opacity-40 text-4xl font-bold drop-shadow-md"
              style={{ left: '-50px', top: `${Math.random() * 80 + 10}%` }}
              animate={{
                x: ['0vw', '120vw'],
                rotate: 1440,
                opacity: [0, 0.6, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: Math.random() * 20 + 5,
                ease: "linear"
              }}
            >
              ✥
            </motion.div>
          ))}
        </div>
      )}

      {/* ==== サイバー (cyber) ==== */}
      {theme === 'cyber' && (
        <div className="absolute inset-0 overflow-hidden perspective-[1000px]">
          {/* Grid Floor Overlay */}
          <div className="absolute bottom-0 left-[-50%] w-[200%] h-[60%] bg-[linear-gradient(transparent_95%,#0ff_95%),linear-gradient(90deg,transparent_95%,#0ff_95%)] bg-[length:50px_50px] opacity-30 mix-blend-screen"
               style={{ transform: 'rotateX(75deg) translateY(0)', transformOrigin: 'center bottom' }} />
          
          {/* Matrix Rain */}
          <div className="absolute inset-0 flex justify-between overflow-hidden opacity-50">
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={`matrix-${i}`}
                className="text-cyan-400 font-mono text-xs whitespace-nowrap opacity-80"
                style={{
                  writingMode: 'vertical-rl',
                  textOrientation: 'upright',
                  left: `${i * 2.5}%`,
                  top: '-100%',
                }}
                animate={{ top: '100%' }}
                transition={{
                  duration: Math.random() * 10 + 5,
                  repeat: Infinity,
                  ease: "linear",
                  delay: Math.random() * -10
                }}
              >
                {Array.from({ length: 20 }).map(() => String.fromCharCode(0x30A0 + Math.random() * 96)).join('')}
              </motion.div>
            ))}
          </div>

          {/* Scanning Line */}
          <motion.div
            className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_15px_2px_#0ff] opacity-60"
            animate={{ top: ['-10%', '110%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}

      {/* ==== 天空の城 (skycastle) - 神レア・超激レア ==== */}
      {theme === 'skycastle' && (
        <div className="absolute inset-0 overflow-hidden mix-blend-lighten">
          {/* Sun / God rays overlay */}
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[150%] h-[150%] bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.4)_10deg,transparent_20deg,rgba(255,255,255,0.3)_30deg,transparent_40deg)] animate-[spin_120s_linear_infinite] opacity-60 blur-xl mix-blend-screen" />
          
          {/* Parallax Clouds Overlay (Foreground) */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`cloud-fg-${i}`}
              className="absolute bg-white/40 rounded-full blur-2xl"
              style={{
                width: `${Math.random() * 600 + 300}px`,
                height: `${Math.random() * 150 + 80}px`,
                bottom: `${Math.random() * 30 - 10}%`,
                left: '-600px',
              }}
              animate={{ x: ['0vw', '150vw'] }}
              transition={{
                duration: Math.random() * 40 + 20,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * -40
              }}
            />
          ))}

          {/* Sparkling dust */}
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute w-1.5 h-1.5 rounded-full bg-yellow-100"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, boxShadow: '0 0 10px 3px rgba(253, 224, 71, 0.8)' }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], y: [0, -30] }}
              transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 5 }}
            />
          ))}
        </div>
      )}

      {/* ==== サイバーシティ (cybercity) ==== */}
      {theme === 'cybercity' && (
        <div className="absolute inset-0 overflow-hidden mix-blend-screen">
          {/* Cyber rain */}
          {[...Array(80)].map((_, i) => (
            <motion.div
              key={`rain-${i}`}
              className="absolute w-px bg-gradient-to-b from-transparent via-cyan-300/60 to-transparent"
              style={{
                height: `${Math.random() * 150 + 50}px`,
                left: `${Math.random() * 100}%`,
                top: `-200px`
              }}
              animate={{ y: ['0vh', '120vh'] }}
              transition={{ duration: Math.random() * 0.4 + 0.4, repeat: Infinity, ease: "linear", delay: Math.random() * 2 }}
            />
          ))}

          {/* Flying Cars (Hologram dots) */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`car-${i}`}
              className="absolute w-4 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_3px_#0ff]"
              style={{ top: `${Math.random() * 50 + 20}%`, left: '-50px' }}
              animate={{ x: ['0vw', '120vw'] }}
              transition={{ duration: Math.random() * 4 + 2, repeat: Infinity, ease: "linear", delay: Math.random() * 5 }}
            />
          ))}
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={`car-rev-${i}`}
              className="absolute w-4 h-1.5 rounded-full bg-pink-400 shadow-[0_0_12px_3px_#f0f]"
              style={{ top: `${Math.random() * 40 + 30}%`, right: '-50px' }}
              animate={{ x: ['0vw', '-120vw'] }}
              transition={{ duration: Math.random() * 3 + 1.5, repeat: Infinity, ease: "linear", delay: Math.random() * 4 }}
            />
          ))}
        </div>
      )}

      {/* ==== マグマ地帯 (magma) ==== */}
      {theme === 'magma' && (
        <div className="absolute inset-0 overflow-hidden mix-blend-screen">
          {/* Heat distortion (CSS trick using blur and scale) */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-orange-600/30 to-transparent blur-xl"
            animate={{ scaleY: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Embers / Fire sparks */}
          {[...Array(60)].map((_, i) => (
            <motion.div
              key={`ember-${i}`}
              className="absolute rounded-full bg-yellow-200"
              style={{
                width: Math.random() * 5 + 2 + 'px',
                height: Math.random() * 5 + 2 + 'px',
                left: `${Math.random() * 100}%`,
                bottom: `${Math.random() * 30}%`,
                boxShadow: '0 0 12px 3px #f59e0b'
              }}
              animate={{
                y: [0, -(Math.random() * 500 + 200)],
                x: [(Math.random() - 0.5) * 200],
                opacity: [1, 1, 0],
                scale: [1, 0]
              }}
              transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, ease: "easeOut", delay: Math.random() * 3 }}
            />
          ))}
        </div>
      )}

      {/* ==== 古代遺跡 (ruins) ==== */}
      {theme === 'ruins' && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Ancient Runes Glowing - Overlay */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`rune-${i}`}
              className="absolute text-amber-300/60 text-6xl font-black drop-shadow-[0_0_20px_rgba(245,158,11,1)] mix-blend-screen"
              style={{
                left: `${Math.random() * 90 + 5}%`,
                top: `${Math.random() * 90 + 5}%`,
                rotate: `${Math.random() * 40 - 20}deg`
              }}
              animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: Math.random() * 5 + 3, repeat: Infinity, delay: Math.random() * 5 }}
            >
              {['⍙', '⍎', '⍏', '⍣', '⍟', '⍝', '⍦', '⍧'][Math.floor(Math.random() * 8)]}
            </motion.div>
          ))}

          {/* Dust motes */}
          {[...Array(60)].map((_, i) => (
            <motion.div
              key={`dust-${i}`}
              className="absolute w-1.5 h-1.5 rounded-full bg-amber-100/60 blur-[1px] mix-blend-screen"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{
                y: [0, -80, 0],
                x: [0, Math.random() * 60 - 30, 0],
                opacity: [0, 0.9, 0]
              }}
              transition={{ duration: Math.random() * 6 + 4, repeat: Infinity, delay: Math.random() * 5 }}
            />
          ))}
        </div>
      )}

      {/* ==== 深海 (ocean) ==== */}
      {theme === 'ocean' && (
        <div className="absolute inset-0 overflow-hidden mix-blend-screen">
          {/* Light rays from surface */}
          <div className="absolute top-[-20%] left-0 right-0 h-[80%] flex justify-center opacity-40">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`ray-${i}`}
                className="w-40 h-full bg-gradient-to-b from-cyan-200 to-transparent blur-3xl origin-top"
                style={{ rotate: `${(i - 2) * 15}deg` }}
                animate={{ opacity: [0.3, 0.8, 0.3], rotate: [`${(i - 2) * 15 - 2}deg`, `${(i - 2) * 15 + 2}deg`, `${(i - 2) * 15 - 2}deg`] }}
                transition={{ duration: Math.random() * 4 + 4, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 }}
              />
            ))}
          </div>

          {/* Rising Bubbles */}
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={`bubble-${i}`}
              className="absolute rounded-full border border-cyan-200/60 bg-cyan-100/20 shadow-[0_0_10px_rgba(103,232,249,0.4)]"
              style={{
                width: `${Math.random() * 20 + 5}px`,
                height: `${Math.random() * 20 + 5}px`,
                left: `${Math.random() * 100}%`,
                bottom: '-30px'
              }}
              animate={{
                y: [0, -window.innerHeight - 100],
                x: [0, Math.sin(i) * 60, 0],
                opacity: [0, 1, 0]
              }}
              transition={{ duration: Math.random() * 8 + 4, repeat: Infinity, ease: "linear", delay: Math.random() * 10 }}
            />
          ))}

          {/* Fish silhouettes crossing */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`fish-${i}`}
              className="absolute w-10 h-4 bg-black/60 rounded-[50%_100%_50%_100%_/_50%_50%_50%_50%] blur-[1px] mix-blend-multiply"
              style={{ top: `${Math.random() * 80 + 10}%`, left: '-50px' }}
              animate={{ x: ['0vw', '120vw'], y: [0, Math.sin(i) * 40, 0] }}
              transition={{ duration: Math.random() * 10 + 10, repeat: Infinity, ease: "linear", delay: Math.random() * 20 }}
            />
          ))}
        </div>
      )}

      {/* ==== 魔法の森 (forest) ==== */}
      {theme === 'forest' && (
        <div className="absolute inset-0 overflow-hidden mix-blend-screen">
          {/* Fireflies */}
          {[...Array(70)].map((_, i) => (
            <motion.div
              key={`firefly-${i}`}
              className="absolute w-2.5 h-2.5 rounded-full bg-yellow-200"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                boxShadow: '0 0 15px 4px rgba(253, 224, 71, 0.9)'
              }}
              animate={{
                opacity: [0, 1, 0],
                x: [(Math.random() - 0.5) * 150],
                y: [(Math.random() - 0.5) * 150]
              }}
              transition={{ duration: Math.random() * 4 + 2, repeat: Infinity, delay: Math.random() * 5 }}
            />
          ))}

          {/* Magical Spores */}
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={`spore-${i}`}
              className="absolute text-green-200/80 font-black text-2xl drop-shadow-[0_0_12px_rgba(134,239,172,1)]"
              style={{ left: `${Math.random() * 100}%`, top: '-50px' }}
              animate={{
                y: ['0vh', '110vh'],
                rotate: [0, 360],
                x: [0, Math.sin(i) * 80, 0]
              }}
              transition={{ duration: Math.random() * 10 + 10, repeat: Infinity, ease: "linear", delay: Math.random() * -20 }}
            >
              ✦
            </motion.div>
          ))}
        </div>
      )}

      {/* ==== お菓子の国 (candy) ==== */}
      {theme === 'candy' && (
        <div className="absolute inset-0 overflow-hidden mix-blend-screen">
          {/* Falling Sweets */}
          {[...Array(30)].map((_, i) => {
            const emojis = ['🍬', '🍭', '🍩', '🍪', '🍡', '🧁', '🍦', '🍫'];
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];
            return (
              <motion.div
                key={`sweet-${i}`}
                className="absolute text-4xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]"
                style={{ left: `${Math.random() * 100}%`, top: '-60px' }}
                animate={{
                  y: ['0vh', '110vh'],
                  rotate: [0, 360],
                  x: [0, Math.sin(i) * 80, 0]
                }}
                transition={{ duration: Math.random() * 8 + 6, repeat: Infinity, ease: "linear", delay: Math.random() * -10 }}
              >
                {emoji}
              </motion.div>
            );
          })}

          {/* Sprinkles / Sparkles */}
          {[...Array(60)].map((_, i) => (
            <motion.div
              key={`sprinkle-${i}`}
              className="absolute w-3 h-6 rounded-full opacity-90 shadow-md"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#f472b6', '#60a5fa', '#fbbf24', '#34d399', '#a78bfa'][Math.floor(Math.random() * 5)],
                rotate: `${Math.random() * 360}deg`
              }}
              animate={{ scale: [0, 1.2, 0], rotate: '+=180deg' }}
              transition={{ duration: Math.random() * 2 + 1, repeat: Infinity, delay: Math.random() * 3 }}
            />
          ))}
        </div>
      )}

    </div>
  );
}
