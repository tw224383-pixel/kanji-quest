"use client";

import { motion } from "framer-motion";
import { themeGradient } from "../../lib/themeVisuals";

/**
 * 画像を使わずコードで描くテーマ背景。
 *
 * 対象はショップ恒常の3種（さくら並木・夕やけの丘・オーロラの夜）だけ。
 * イラストを用意したテーマは画像を敷くので、ここには来ない。
 *
 * 空のグラデーション（themeVisuals.ts）の上に、SVGのシルエットと光、
 * さらに動くエフェクトを重ねて「美麗な絵」を組み立てる。
 * ここで定義した部品（StarField / Motes / Falling / Curtain / Rain）は、
 * イラストの上に動きだけを重ねる ThemeSceneryEffects からも使っている。
 *
 * 乱数は seed 付き（mulberry32）にしてある。Math.random() をそのまま使うと
 * 静的書き出ししたHTMLとブラウザ側の描画がずれて hydration エラーになるため。
 */

export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 空に浮かぶ光源（太陽・月・星の輝きなど） */
function Glow({
  x, y, size, color, opacity = 0.9, blur = 40,
}: { x: string; y: string; size: number; color: string; opacity?: number; blur?: number }) {
  return (
    <div
      className="absolute rounded-full"
      style={{
        left: x, top: y, width: size, height: size,
        marginLeft: -size / 2, marginTop: -size / 2,
        background: `radial-gradient(circle,${color} 0%,transparent 70%)`,
        filter: `blur(${blur}px)`,
        opacity,
      }}
    />
  );
}

/** 地平線のシルエット（山・丘・ビル・木立）。画面下端にぴったり張り付く */
function Ridge({
  points, color, opacity = 1, blur = 0,
}: { points: string; color: string; opacity?: number; blur?: number }) {
  return (
    <svg
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      className="absolute bottom-0 left-0 w-full h-[45%]"
      style={{ opacity, filter: blur ? `blur(${blur}px)` : undefined }}
    >
      <polygon points={`0,40 ${points} 100,40`} fill={color} />
    </svg>
  );
}

/** またたく星 */
export function StarField({ count, seed, maxTop = 70 }: { count: number; seed: number; maxTop?: number }) {
  const rand = mulberry32(seed);
  const stars = Array.from({ length: count }, () => ({
    top: rand() * maxTop,
    left: rand() * 100,
    size: rand() > 0.88 ? 2.5 : 1.2,
    dur: rand() * 3 + 1.5,
    delay: rand() * 5,
  }));
  return (
    <>
      {stars.map((s, i) => (
        <motion.div
          key={`sf-${seed}-${i}`}
          className="absolute rounded-full bg-white"
          style={{ top: `${s.top}%`, left: `${s.left}%`, width: s.size, height: s.size, boxShadow: "0 0 4px #fff" }}
          animate={{ opacity: [0.15, 1, 0.15] }}
          transition={{ duration: s.dur, repeat: Infinity, delay: s.delay }}
        />
      ))}
    </>
  );
}

/** 下から上へ舞い上がる粒（火の粉・光の粒・雪の逆再生など） */
export function Motes({
  count, seed, color, size = 3, rise = 320, dur = 5,
}: { count: number; seed: number; color: string; size?: number; rise?: number; dur?: number }) {
  const rand = mulberry32(seed);
  const items = Array.from({ length: count }, () => ({
    left: rand() * 100,
    bottom: rand() * 30,
    s: rand() * size + 1.5,
    drift: (rand() - 0.5) * 160,
    d: rand() * dur + dur * 0.6,
    delay: rand() * dur,
  }));
  return (
    <>
      {items.map((p, i) => (
        <motion.div
          key={`mote-${seed}-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`, bottom: `${p.bottom}%`,
            width: p.s, height: p.s,
            background: color, boxShadow: `0 0 ${p.s * 4}px ${p.s}px ${color}`,
          }}
          animate={{ y: [0, -rise], x: [0, p.drift], opacity: [0, 1, 0], scale: [1, 0.3] }}
          transition={{ duration: p.d, repeat: Infinity, ease: "easeOut", delay: p.delay }}
        />
      ))}
    </>
  );
}

/** 上から下へ落ちる粒（花びら・雪・木の葉） */
export function Falling({
  count, seed, render, dur = 10,
}: { count: number; seed: number; render: (i: number) => React.ReactNode; dur?: number }) {
  const rand = mulberry32(seed);
  const items = Array.from({ length: count }, () => ({
    left: rand() * 110 - 5,
    d: rand() * dur + dur * 0.5,
    delay: rand() * -dur,
    sway: (rand() - 0.5) * 200,
    spin: rand() > 0.5 ? 360 : -360,
  }));
  return (
    <>
      {items.map((p, i) => (
        <motion.div
          key={`fall-${seed}-${i}`}
          className="absolute"
          style={{ left: `${p.left}%`, top: -40 }}
          animate={{ y: ["0vh", "115vh"], x: [0, p.sway, 0], rotate: [0, p.spin] }}
          transition={{ duration: p.d, repeat: Infinity, ease: "linear", delay: p.delay }}
        >
          {render(i)}
        </motion.div>
      ))}
    </>
  );
}

/** 光のカーテン（オーロラ・光柱） */
export function Curtain({
  seed, colors, count = 5, opacity = 0.5, blurClass = "blur-2xl",
}: { seed: number; colors: string[]; count?: number; opacity?: number; blurClass?: string }) {
  const rand = mulberry32(seed);
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const left = rand() * 90;
        const w = rand() * 22 + 12;
        const c = colors[i % colors.length];
        return (
          <motion.div
            key={`curtain-${seed}-${i}`}
            className={`absolute top-0 ${blurClass} mix-blend-screen`}
            style={{
              left: `${left}%`, width: `${w}%`, height: "72%",
              background: `linear-gradient(180deg,transparent 0%,${c} 35%,transparent 100%)`,
              opacity,
            }}
            animate={{ scaleY: [0.75, 1.15, 0.85], x: [0, 30, -20, 0], opacity: [opacity * 0.5, opacity, opacity * 0.6] }}
            transition={{ duration: rand() * 6 + 7, repeat: Infinity, ease: "easeInOut", delay: rand() * 4 }}
          />
        );
      })}
    </>
  );
}

/** 降りしきる雨。イラスト背景の上に重ねて使う */
export function Rain({
  seed, count, tilt = 10, color = "rgba(200,225,255,0.5)",
}: { seed: number; count: number; tilt?: number; color?: string }) {
  const rand = mulberry32(seed);
  const drops = Array.from({ length: count }, () => ({
    left: rand() * 110 - 5,
    h: rand() * 90 + 40,
    d: rand() * 0.4 + 0.45,
    delay: rand() * 2,
  }));
  return (
    <>
      {drops.map((p, i) => (
        <motion.div
          key={`rain-${seed}-${i}`}
          className="absolute w-px"
          style={{
            left: `${p.left}%`, top: -160, height: p.h,
            background: `linear-gradient(180deg,transparent,${color},transparent)`,
            transform: `rotate(${tilt}deg)`,
          }}
          animate={{ y: ["0vh", "125vh"] }}
          transition={{ duration: p.d, repeat: Infinity, ease: "linear", delay: p.delay }}
        />
      ))}
    </>
  );
}

// 使い回す地形シルエットのポリゴン（viewBox 0 0 100 40、下端=40）
const RIDGE_HILLS = "0,26 12,20 24,25 38,15 52,23 66,13 80,21 92,17 100,24";
const RIDGE_MOUNTAIN = "0,30 10,18 18,24 30,6 42,20 54,10 68,22 78,12 90,22 100,16";
const RIDGE_TREES =
  "0,30 5,22 8,28 12,18 16,27 21,20 25,29 30,17 35,26 40,21 45,29 50,19 56,27 61,22 66,29 71,18 77,26 82,21 88,28 94,20 100,28";

/** テーマIDごとの「絵」。ThemeBackground から呼ばれる */
export function ThemeScenery({ theme }: { theme: string }) {
  const base = (
    <div className="absolute inset-0" style={{ background: themeGradient(theme) }} />
  );

  switch (theme) {
    // ============ ショップ恒常 ============
    case "sakura_road":
      return (
        <div className="absolute inset-0 overflow-hidden">
          {base}
          <Glow x="72%" y="16%" size={460} color="rgba(255,196,222,0.85)" blur={60} />
          <Ridge points={RIDGE_TREES} color="#3a1b30" opacity={0.5} blur={3} />
          <Ridge points="0,34 10,26 18,31 28,23 38,30 50,24 62,31 72,25 84,31 94,26 100,32" color="#2a1122" />
          {/* 桜のトンネル。画面中央はパネルで隠れるので、左右上の角から枝を張り出させて
              「並木道の下から見上げている」構図にしている */}
          <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-[62%]">
            {/* 枝 */}
            <path d="M-2,-2 C10,6 16,14 20,26 M-2,-2 C14,2 24,8 32,16 M8,-2 C12,10 12,20 10,32"
              stroke="#4a2135" strokeWidth="1.2" fill="none" opacity="0.85" />
            <path d="M102,-2 C90,6 84,14 80,26 M102,-2 C86,2 76,8 68,16 M92,-2 C88,10 88,20 90,32"
              stroke="#4a2135" strokeWidth="1.2" fill="none" opacity="0.85" />
            {/* 花のかたまり */}
            <g fill="#ffc2da" opacity="0.9">
              <ellipse cx="12" cy="6" rx="20" ry="11" />
              <ellipse cx="30" cy="14" rx="14" ry="8" />
              <ellipse cx="18" cy="22" rx="11" ry="7" />
              <ellipse cx="88" cy="6" rx="20" ry="11" />
              <ellipse cx="70" cy="14" rx="14" ry="8" />
              <ellipse cx="83" cy="22" rx="11" ry="7" />
              <ellipse cx="50" cy="1" rx="26" ry="8" />
            </g>
            <g fill="#ffe3ef" opacity="0.75">
              <ellipse cx="16" cy="3" rx="13" ry="7" />
              <ellipse cx="85" cy="3" rx="13" ry="7" />
              <ellipse cx="50" cy="-2" rx="18" ry="6" />
            </g>
          </svg>
          <Falling
            count={34}
            seed={11}
            dur={11}
            render={() => <div className="w-3 h-3 bg-pink-200/90 rounded-br-full rounded-tl-full shadow-[0_0_6px_rgba(255,192,203,0.9)]" />}
          />
          <Motes count={18} seed={12} color="rgba(255,235,245,0.9)" size={2} rise={200} dur={7} />
        </div>
      );

    case "sunset_hill":
      return (
        <div className="absolute inset-0 overflow-hidden">
          {base}
          {/* 沈む夕日 */}
          <motion.div
            className="absolute rounded-full"
            style={{
              left: "50%", top: "22%", width: 260, height: 260, marginLeft: -130, marginTop: -130,
              background: "radial-gradient(circle,#fff3c4 0%,#ffb347 45%,rgba(255,120,60,0.35) 70%,transparent 78%)",
            }}
            animate={{ opacity: [0.85, 1, 0.85], scale: [1, 1.04, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          <Ridge points={RIDGE_HILLS} color="#5a2a3c" opacity={0.55} blur={2} />
          <Ridge points="0,32 14,25 28,31 44,22 58,29 74,23 88,30 100,26" color="#2b1220" />
          {/* 帰る鳥の群れ */}
          {[0, 1, 2, 3, 4].map(i => (
            <motion.div
              key={`bird-${i}`}
              className="absolute text-slate-900/70 text-lg"
              style={{ top: `${18 + i * 5}%`, left: "-8%" }}
              animate={{ x: ["0vw", "118vw"], y: [0, -14, 6, 0] }}
              transition={{ duration: 26 + i * 4, repeat: Infinity, ease: "linear", delay: i * 3 }}
            >
              ᶺ
            </motion.div>
          ))}
          {/* たなびく雲 */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={`scloud-${i}`}
              className="absolute rounded-full blur-2xl"
              style={{
                top: `${20 + i * 12}%`, left: "-30%",
                width: `${45 + i * 12}%`, height: `${6 + i * 2}%`,
                background: i % 2 ? "rgba(255,190,120,0.35)" : "rgba(255,140,150,0.3)",
              }}
              animate={{ x: ["0vw", "150vw"] }}
              transition={{ duration: 60 + i * 20, repeat: Infinity, ease: "linear", delay: -i * 20 }}
            />
          ))}
        </div>
      );

    case "aurora_night":
      return (
        <div className="absolute inset-0 overflow-hidden">
          {base}
          <StarField count={90} seed={21} maxTop={60} />
          <Curtain seed={22} colors={["#4ade80", "#22d3ee", "#a78bfa", "#34d399", "#86efac"]} count={8} opacity={0.85} blurClass="blur-xl" />
          <Ridge points={RIDGE_MOUNTAIN} color="#0b1a2a" opacity={0.9} />
          {/* 雪原の照り返し */}
          <div className="absolute bottom-0 left-0 right-0 h-[18%] bg-gradient-to-t from-cyan-100/25 to-transparent" />
          <Motes count={22} seed={23} color="rgba(190,240,255,0.9)" size={2} rise={160} dur={8} />
        </div>
      );


    default:
      return <div className="absolute inset-0">{base}</div>;
  }
}
