"use client";

import { motion } from "framer-motion";
import { themeGradient } from "../../lib/themeVisuals";

/**
 * 画像を使わずコードで描くテーマ背景。
 *
 * 空のグラデーション（themeVisuals.ts）の上に、SVGのシルエットと光、
 * さらに動くエフェクトを重ねて「美麗な絵」を組み立てる。
 * レア度が上がるほど層とエフェクトを増やして豪華に見えるようにしている。
 *
 * 乱数は seed 付き（mulberry32）にしてある。Math.random() をそのまま使うと
 * 静的書き出ししたHTMLとブラウザ側の描画がずれて hydration エラーになるため。
 */

function mulberry32(seed: number) {
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
function StarField({ count, seed, maxTop = 70 }: { count: number; seed: number; maxTop?: number }) {
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
function Motes({
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
function Falling({
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
function Curtain({
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

// 使い回す地形シルエットのポリゴン（viewBox 0 0 100 40、下端=40）
const RIDGE_HILLS = "0,26 12,20 24,25 38,15 52,23 66,13 80,21 92,17 100,24";
const RIDGE_MOUNTAIN = "0,30 10,18 18,24 30,6 42,20 54,10 68,22 78,12 90,22 100,16";
const RIDGE_DUNES = "0,30 15,24 30,29 48,21 64,28 80,22 100,27";
const RIDGE_CITY =
  "0,32 4,32 4,22 9,22 9,28 14,28 14,16 20,16 20,26 26,26 26,20 32,20 32,30 38,30 38,14 45,14 45,25 52,25 52,19 58,19 58,29 64,29 64,12 71,12 71,24 78,24 78,20 85,20 85,27 92,27 92,18 97,18 97,30 100,30";
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

    // ============ テーマガチャ 激レア ============
    case "moonlight_bamboo":
      return (
        <div className="absolute inset-0 overflow-hidden">
          {base}
          <Glow x="76%" y="16%" size={300} color="rgba(226,248,255,0.85)" blur={30} />
          <div className="absolute rounded-full bg-slate-50" style={{ left: "76%", top: "16%", width: 92, height: 92, marginLeft: -46, marginTop: -46, boxShadow: "0 0 60px 18px rgba(210,240,255,0.55)" }} />
          <StarField count={55} seed={31} maxTop={50} />
          {/* 竹の幹 */}
          {Array.from({ length: 14 }).map((_, i) => {
            const rand = mulberry32(300 + i);
            const left = i * 7.4 + rand() * 3;
            const w = rand() * 10 + 8;
            return (
              <motion.div
                key={`bamboo-${i}`}
                className="absolute bottom-0 origin-bottom"
                style={{
                  left: `${left}%`, width: w, height: `${55 + rand() * 40}%`,
                  background: `linear-gradient(90deg,#0c2b1e,#2f6b45 40%,#1a4a30)`,
                  opacity: 0.85,
                }}
                animate={{ rotate: [-1.2, 1.2, -1.2] }}
                transition={{ duration: rand() * 3 + 5, repeat: Infinity, ease: "easeInOut", delay: rand() * 3 }}
              />
            );
          })}
          <Motes count={26} seed={32} color="rgba(253,230,138,0.95)" size={3} rise={220} dur={6} />
        </div>
      );

    case "storm_sea":
      return (
        <div className="absolute inset-0 overflow-hidden">
          {base}
          {/* ちぎれ雲 */}
          {[0, 1, 2, 3].map(i => (
            <motion.div
              key={`stormcloud-${i}`}
              className="absolute rounded-full blur-3xl"
              style={{ top: `${2 + i * 9}%`, left: "-40%", width: "70%", height: `${10 + i * 3}%`, background: "rgba(20,30,50,0.75)" }}
              animate={{ x: ["0vw", "160vw"] }}
              transition={{ duration: 26 + i * 8, repeat: Infinity, ease: "linear", delay: -i * 8 }}
            />
          ))}
          {/* 稲妻 */}
          {[0, 1].map(i => (
            <motion.div
              key={`bolt-${i}`}
              className="absolute inset-0 bg-white mix-blend-screen"
              animate={{ opacity: [0, 0, 0.55, 0, 0.3, 0] }}
              transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 6 + i * 5, delay: i * 3 }}
            />
          ))}
          {/* うねる波 */}
          {[0, 1, 2].map(i => (
            <motion.svg
              key={`wave-${i}`}
              viewBox="0 0 200 40"
              preserveAspectRatio="none"
              className="absolute left-0 w-[200%] h-[30%]"
              style={{ bottom: `${-4 + i * 7}%`, opacity: 0.55 + i * 0.15 }}
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 14 - i * 3, repeat: Infinity, ease: "linear" }}
            >
              <path
                d="M0,20 Q12,8 25,20 T50,20 T75,20 T100,20 T125,20 T150,20 T175,20 T200,20 L200,40 L0,40 Z"
                fill={["#12283f", "#1b3a58", "#27547d"][i]}
              />
            </motion.svg>
          ))}
          {/* 砕ける波しぶき */}
          <Motes count={30} seed={41} color="rgba(220,245,255,0.9)" size={3} rise={150} dur={3} />
        </div>
      );

    case "desert_night":
      return (
        <div className="absolute inset-0 overflow-hidden">
          {base}
          <StarField count={130} seed={51} maxTop={62} />
          {/* 天の川 */}
          <div
            className="absolute blur-2xl mix-blend-screen"
            style={{
              top: "-10%", left: "20%", width: "60%", height: "90%",
              transform: "rotate(24deg)",
              background: "linear-gradient(90deg,transparent,rgba(196,181,253,0.35),rgba(255,255,255,0.28),rgba(129,140,248,0.3),transparent)",
            }}
          />
          {/* 流れ星 */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={`shoot-${i}`}
              className="absolute h-px bg-gradient-to-r from-transparent via-white to-transparent"
              style={{ width: 160, top: `${8 + i * 12}%`, left: `${20 + i * 20}%`, rotate: "35deg" }}
              animate={{ x: [-200, 400], y: [-120, 260], opacity: [0, 1, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 7 + i * 4, ease: "linear" }}
            />
          ))}
          <Ridge points={RIDGE_DUNES} color="#6b4a33" opacity={0.85} blur={1} />
          <Ridge points="0,34 20,29 40,33 60,28 80,33 100,30" color="#3d2a1c" />
        </div>
      );

    case "sky_railway":
      return (
        <div className="absolute inset-0 overflow-hidden">
          {base}
          <Glow x="18%" y="14%" size={340} color="rgba(255,244,214,0.7)" blur={50} />
          {/* 雲海 */}
          {Array.from({ length: 7 }).map((_, i) => {
            const rand = mulberry32(600 + i);
            return (
              <motion.div
                key={`sea-${i}`}
                className="absolute rounded-full blur-3xl"
                style={{
                  bottom: `${rand() * 26 - 6}%`, left: "-45%",
                  width: `${rand() * 45 + 45}%`, height: `${rand() * 12 + 8}%`,
                  background: i % 2 ? "rgba(255,255,255,0.6)" : "rgba(226,215,245,0.55)",
                }}
                animate={{ x: ["0vw", "150vw"] }}
                transition={{ duration: rand() * 40 + 45, repeat: Infinity, ease: "linear", delay: -rand() * 60 }}
              />
            );
          })}
          {/* 高架のレール */}
          <div className="absolute left-0 right-0" style={{ top: "58%" }}>
            <div className="h-[3px] w-full bg-slate-700/70 shadow-[0_0_10px_rgba(15,23,42,0.5)]" />
            <div className="h-[3px] w-full bg-slate-700/70 mt-3" />
            <div className="flex justify-between px-2 -mt-[26px]">
              {Array.from({ length: 26 }).map((_, i) => (
                <div key={`tie-${i}`} className="w-[3px] h-[26px] bg-slate-700/55" />
              ))}
            </div>
          </div>
          {/* 走る列車の光 */}
          <motion.div
            className="absolute flex items-center gap-1"
            style={{ top: "54.5%", left: "-25%" }}
            animate={{ x: ["0vw", "150vw"] }}
            transition={{ duration: 13, repeat: Infinity, ease: "linear", repeatDelay: 6 }}
          >
            <div className="w-10 h-5 rounded-l-lg bg-slate-800 shadow-[0_0_20px_6px_rgba(253,224,71,0.6)]" />
            {[0, 1, 2, 3].map(i => (
              <div key={`car-${i}`} className="w-8 h-4 rounded-sm bg-slate-800 border-t border-amber-200/70 shadow-[0_0_12px_3px_rgba(253,224,71,0.45)]" />
            ))}
          </motion.div>
          <Motes count={16} seed={61} color="rgba(255,255,255,0.85)" size={2} rise={180} dur={9} />
        </div>
      );

    case "neon_arcade":
      return (
        <div className="absolute inset-0 overflow-hidden">
          {base}
          <Ridge points={RIDGE_CITY} color="#0d0420" opacity={0.95} />
          {/* ネオン看板 */}
          {Array.from({ length: 10 }).map((_, i) => {
            const rand = mulberry32(700 + i);
            const colors = ["#f0f", "#0ff", "#ff0", "#f43f5e", "#a855f7"];
            const c = colors[i % colors.length];
            return (
              <motion.div
                key={`neon-${i}`}
                className="absolute rounded-sm"
                style={{
                  left: `${rand() * 88 + 3}%`, top: `${rand() * 45 + 25}%`,
                  width: rand() * 46 + 14, height: rand() * 8 + 5,
                  background: c, boxShadow: `0 0 18px 5px ${c}`, opacity: 0.85,
                }}
                animate={{ opacity: [0.25, 0.95, 0.5, 0.95] }}
                transition={{ duration: rand() * 2 + 1.2, repeat: Infinity, delay: rand() * 3 }}
              />
            );
          })}
          {/* 反射する路面 */}
          <div className="absolute bottom-0 left-0 right-0 h-[22%] bg-gradient-to-t from-fuchsia-500/25 via-cyan-400/10 to-transparent blur-md" />
          {/* 走査線 */}
          <motion.div
            className="absolute left-0 right-0 h-1 bg-cyan-300 shadow-[0_0_18px_3px_#0ff] opacity-50"
            animate={{ top: ["-5%", "105%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0px,transparent_3px,rgba(0,0,0,0.25)_4px)] opacity-40" />
        </div>
      );

    case "snow_village":
      return (
        <div className="absolute inset-0 overflow-hidden">
          {base}
          <StarField count={40} seed={81} maxTop={40} />
          <Ridge points={RIDGE_MOUNTAIN} color="#1b2a45" opacity={0.7} blur={2} />
          {/* 家並みと灯り */}
          <Ridge points="0,33 6,33 6,27 12,23 18,27 18,33 30,33 30,26 36,21 42,26 42,33 56,33 56,28 62,24 68,28 68,33 82,33 82,26 88,22 94,26 94,33 100,33" color="#141d33" />
          {Array.from({ length: 9 }).map((_, i) => {
            const rand = mulberry32(900 + i);
            return (
              <motion.div
                key={`lantern-${i}`}
                className="absolute rounded-full"
                style={{
                  left: `${rand() * 92 + 3}%`, bottom: `${rand() * 12 + 6}%`,
                  width: 9, height: 9,
                  background: "#fde68a", boxShadow: "0 0 22px 8px rgba(253,186,116,0.75)",
                }}
                animate={{ opacity: [0.55, 1, 0.7] }}
                transition={{ duration: rand() * 2 + 2, repeat: Infinity, delay: rand() * 2 }}
              />
            );
          })}
          {/* 雪原 */}
          <div className="absolute bottom-0 left-0 right-0 h-[16%] bg-gradient-to-t from-slate-100/85 to-transparent" />
          <Falling
            count={70}
            seed={82}
            dur={14}
            render={() => <div className="w-2 h-2 rounded-full bg-white/90 shadow-[0_0_6px_rgba(255,255,255,0.8)]" />}
          />
        </div>
      );

    // ============ テーマガチャ 超激レア ============
    case "crystal_palace":
      return (
        <div className="absolute inset-0 overflow-hidden">
          {base}
          <Glow x="50%" y="20%" size={520} color="rgba(200,240,255,0.6)" blur={70} />
          {/* 氷の柱 */}
          {Array.from({ length: 11 }).map((_, i) => {
            const rand = mulberry32(1000 + i);
            const h = rand() * 45 + 30;
            return (
              <motion.div
                key={`ice-${i}`}
                className="absolute bottom-0"
                style={{
                  left: `${i * 9 + rand() * 4}%`,
                  width: rand() * 34 + 16, height: `${h}%`,
                  background: "linear-gradient(180deg,rgba(255,255,255,0.75),rgba(125,211,252,0.5) 45%,rgba(14,116,144,0.35))",
                  clipPath: "polygon(50% 0%,100% 18%,88% 100%,12% 100%,0% 18%)",
                  boxShadow: "0 0 30px rgba(186,230,253,0.6)",
                }}
                animate={{ opacity: [0.6, 0.95, 0.6] }}
                transition={{ duration: rand() * 3 + 4, repeat: Infinity, delay: rand() * 3 }}
              />
            );
          })}
          {/* 光の屈折（プリズム） */}
          <Curtain seed={1001} colors={["#a5f3fc", "#e9d5ff", "#bfdbfe", "#fbcfe8"]} count={5} opacity={0.42} />
          {/* 舞う氷の結晶 */}
          <Falling
            count={30}
            seed={1002}
            dur={12}
            render={() => <div className="text-cyan-100/90 text-xl drop-shadow-[0_0_10px_rgba(165,243,252,0.9)]">❉</div>}
          />
          <Motes count={26} seed={1003} color="rgba(224,252,255,0.95)" size={3} rise={260} dur={6} />
        </div>
      );

    case "phoenix_sky":
      return (
        <div className="absolute inset-0 overflow-hidden">
          {base}
          <Glow x="52%" y="42%" size={520} color="rgba(255,196,90,0.55)" blur={70} />
          {/* 燃えあがる雲 */}
          {Array.from({ length: 6 }).map((_, i) => {
            const rand = mulberry32(1100 + i);
            return (
              <motion.div
                key={`fcloud-${i}`}
                className="absolute rounded-full blur-3xl mix-blend-screen"
                style={{
                  top: `${rand() * 55}%`, left: "-40%",
                  width: `${rand() * 50 + 40}%`, height: `${rand() * 14 + 8}%`,
                  background: i % 2 ? "rgba(249,115,22,0.4)" : "rgba(220,38,38,0.35)",
                }}
                animate={{ x: ["0vw", "150vw"] }}
                transition={{ duration: rand() * 30 + 35, repeat: Infinity, ease: "linear", delay: -rand() * 40 }}
              />
            );
          })}
          {/* 不死鳥（翼を広げて羽ばたく）。
              絵文字は色を指定できず暗い塊にしか見えないため、SVGで描いている。
              画面中央はパネルで隠れるので、上のほうに配置して見えるようにしている。 */}
          <motion.svg
            viewBox="0 0 200 100"
            className="absolute left-1/2 top-[8%] -translate-x-1/2 w-[70%] max-w-[560px]"
            style={{ filter: "drop-shadow(0 0 26px rgba(255,140,40,0.95)) drop-shadow(0 0 60px rgba(255,90,20,0.6))" }}
            animate={{ scale: [1, 1.05, 1], y: [0, -10, 0], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <defs>
              <linearGradient id="phoenixGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fff7d6" />
                <stop offset="45%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
            </defs>
            {/* 翼・胴・尾を1本のパスで。中央が胴、左右に伸びるのが翼、下に垂れるのが尾羽 */}
            <path
              fill="url(#phoenixGrad)"
              d="M100 30 C104 30 107 34 107 39 L107 52 C112 46 122 40 136 34 C150 28 168 24 192 22
                 C176 32 164 40 154 48 C166 46 178 47 190 51 C172 54 158 60 148 68
                 C138 76 122 82 107 84 L110 96 L100 90 L90 96 L93 84
                 C78 82 62 76 52 68 C42 60 28 54 10 51 C22 47 34 46 46 48
                 C36 40 24 32 8 22 C32 24 50 28 64 34 C78 40 88 46 93 52 L93 39
                 C93 34 96 30 100 30 Z"
            />
            <circle cx="100" cy="27" r="5" fill="#fff7d6" />
          </motion.svg>
          <Motes count={55} seed={1101} color="rgba(255,196,90,0.95)" size={4} rise={420} dur={5} />
          <Ridge points={RIDGE_MOUNTAIN} color="#2a0b06" opacity={0.9} />
        </div>
      );

    case "dream_nebula":
      return (
        <div className="absolute inset-0 overflow-hidden">
          {base}
          <StarField count={140} seed={1201} maxTop={100} />
          {/* 極彩色の星雲 */}
          {[
            { c: "rgba(232,121,249,0.45)", x: "28%", y: "32%", s: 620 },
            { c: "rgba(56,189,248,0.4)", x: "70%", y: "50%", s: 540 },
            { c: "rgba(250,204,21,0.28)", x: "48%", y: "70%", s: 460 },
          ].map((n, i) => (
            <motion.div
              key={`neb-${i}`}
              className="absolute rounded-full blur-3xl mix-blend-screen"
              style={{
                left: n.x, top: n.y, width: n.s, height: n.s,
                marginLeft: -n.s / 2, marginTop: -n.s / 2,
                background: `radial-gradient(circle,${n.c} 0%,transparent 68%)`,
              }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 10 + i * 3, repeat: Infinity, ease: "easeInOut", delay: i * 2 }}
            />
          ))}
          {/* 回転する銀河 */}
          <motion.div
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: 640, height: 640, marginLeft: -320, marginTop: -320,
              background: "conic-gradient(from 0deg,transparent,rgba(216,180,254,0.28),transparent 40%,rgba(125,211,252,0.24),transparent 75%)",
              filter: "blur(14px)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
          />
          <Motes count={34} seed={1202} color="rgba(233,213,255,0.95)" size={3} rise={340} dur={8} />
        </div>
      );

    case "golden_shrine":
      return (
        <div className="absolute inset-0 overflow-hidden">
          {base}
          <Glow x="50%" y="30%" size={560} color="rgba(255,231,150,0.6)" blur={70} />
          {/* 光の柱 */}
          <Curtain seed={1301} colors={["#fde68a", "#fbbf24", "#fef3c7"]} count={5} opacity={0.5} />
          {/* 奥へ連なる鳥居。手前ほど大きく・濃く描いて参道の奥行きを出す。
              画面中央はパネルで隠れるので、いちばん手前の鳥居が左右にはみ出す幅にしてある */}
          <svg
            viewBox="0 0 100 50"
            preserveAspectRatio="xMidYMax meet"
            className="absolute bottom-0 left-0 w-full h-[62%]"
          >
            {[0, 1, 2, 3, 4].map(i => {
              const k = 1 - i * 0.17;          // 奥へいくほど小さく
              const w = 88 * k;                 // 鳥居の幅
              const h = 44 * k;                 // 鳥居の高さ
              const x = 50 - w / 2;
              const y = 50 - h;                 // 下端を地面(50)に合わせる
              const post = w * 0.075;           // 柱の太さ
              return (
                <g key={`torii-${i}`} opacity={0.92 - i * 0.14} fill="#b31b1b">
                  {/* 笠木（両端が少し反り上がった、いちばん上の横木） */}
                  <path
                    d={`M${x - w * 0.06},${y + h * 0.06} Q${50},${y - h * 0.03} ${x + w + w * 0.06},${y + h * 0.06} L${x + w + w * 0.04},${y + h * 0.12} Q${50},${y + h * 0.04} ${x - w * 0.04},${y + h * 0.12} Z`}
                  />
                  {/* 貫（2本目の横木） */}
                  <rect x={x} y={y + h * 0.2} width={w} height={h * 0.05} fill="#8f1414" />
                  {/* 柱 */}
                  <rect x={x + w * 0.08} y={y + h * 0.06} width={post} height={h * 0.94} />
                  <rect x={x + w * 0.92 - post} y={y + h * 0.06} width={post} height={h * 0.94} />
                </g>
              );
            })}
          </svg>
          {/* 参道 */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[46%] h-[20%] bg-gradient-to-t from-amber-200/45 to-transparent blur-sm" />
          <Motes count={44} seed={1302} color="rgba(253,224,71,0.95)" size={4} rise={330} dur={6} />
          <Falling
            count={20}
            seed={1303}
            dur={13}
            render={() => <div className="w-2.5 h-2.5 rotate-45 bg-amber-200/90 shadow-[0_0_10px_rgba(253,224,71,0.9)]" />}
          />
        </div>
      );

    // ============ テーマガチャ 神レア ============
    case "celestial_dragon":
      return (
        <div className="absolute inset-0 overflow-hidden">
          {base}
          <StarField count={160} seed={1401} maxTop={100} />
          {/* 星の海（うねる帯） */}
          <div
            className="absolute blur-3xl mix-blend-screen"
            style={{
              top: "-20%", left: "-10%", width: "120%", height: "120%",
              background:
                "radial-gradient(ellipse at 30% 30%,rgba(99,102,241,0.4),transparent 55%),radial-gradient(ellipse at 75% 60%,rgba(217,70,239,0.35),transparent 55%)",
            }}
          />
          {/* 天に浮かぶ月 */}
          <div
            className="absolute rounded-full"
            style={{
              left: "14%", top: "12%", width: 110, height: 110, marginLeft: -55, marginTop: -55,
              background: "radial-gradient(circle at 38% 34%,#ffffff,#c7d2fe 55%,#818cf8)",
              boxShadow: "0 0 70px 24px rgba(165,180,252,0.55)",
            }}
          />
          {/* 竜宮のシルエット（多層の楼閣）。中央はパネルで隠れるため、
              屋根の反りが左右にはみ出すよう横に大きくとってある */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[2%] w-[92%] max-w-[900px] h-[56%]">
            {[0, 1, 2, 3].map(i => (
              <div
                key={`palace-${i}`}
                className="absolute left-1/2 -translate-x-1/2"
                style={{ bottom: `${i * 22}%`, width: `${100 - i * 18}%`, height: "26%" }}
              >
                <div className="absolute bottom-0 left-0 right-0 h-[62%] bg-[#1a1240] border-x-2 border-indigo-300/25" />
                <div
                  className="absolute top-0 left-[-10%] right-[-10%] h-[46%] bg-[#2b1e63]"
                  style={{ clipPath: "polygon(50% 0%,100% 100%,0% 100%)", boxShadow: "0 0 24px rgba(165,180,252,0.5)" }}
                />
                {/* 窓明かり */}
                <div className="absolute bottom-[14%] left-0 right-0 flex justify-evenly">
                  {[0, 1, 2, 3].map(j => (
                    <motion.div
                      key={`win-${i}-${j}`}
                      className="w-1.5 h-2.5 bg-amber-200"
                      style={{ boxShadow: "0 0 10px 3px rgba(253,224,71,0.8)" }}
                      animate={{ opacity: [0.4, 1, 0.5] }}
                      transition={{ duration: 2 + j * 0.4, repeat: Infinity, delay: (i + j) * 0.3 }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* 天を舞う龍（光の帯） */}
          {[0, 1].map(i => (
            <motion.div
              key={`dragon-${i}`}
              className="absolute mix-blend-screen"
              style={{
                top: `${18 + i * 26}%`, left: "-30%",
                width: "60%", height: 10,
                background: `linear-gradient(90deg,transparent,${i ? "rgba(103,232,249,0.85)" : "rgba(196,181,253,0.85)"},transparent)`,
                filter: "blur(4px)",
                borderRadius: "9999px",
              }}
              animate={{ x: ["0vw", "170vw"], y: [0, -60, 50, -30, 0], scaleY: [1, 1.9, 0.7, 1.5, 1] }}
              transition={{ duration: 17 + i * 5, repeat: Infinity, ease: "easeInOut", delay: i * 4 }}
            />
          ))}
          <Curtain seed={1402} colors={["#818cf8", "#22d3ee", "#e879f9"]} count={4} opacity={0.4} />
          <Motes count={50} seed={1403} color="rgba(224,231,255,0.95)" size={4} rise={420} dur={7} />
        </div>
      );

    case "origin_of_all":
      return (
        <div className="absolute inset-0 overflow-hidden">
          {base}
          <StarField count={180} seed={1501} maxTop={100} />
          {/* 中心で脈打つ光（万物の始まり） */}
          <motion.div
            className="absolute left-1/2 top-[24%] rounded-full"
            style={{
              width: 300, height: 300, marginLeft: -150, marginTop: -150,
              background: "radial-gradient(circle,#ffffff 0%,#fde68a 22%,#fb923c 42%,rgba(217,70,239,0.5) 65%,transparent 78%)",
              filter: "blur(6px)",
            }}
            animate={{ scale: [1, 1.22, 1], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* 広がる衝撃波 */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={`shock-${i}`}
              className="absolute left-1/2 top-[24%] rounded-full border-2"
              style={{ width: 300, height: 300, marginLeft: -150, marginTop: -150, borderColor: "rgba(253,230,138,0.55)" }}
              animate={{ scale: [0.3, 4.2], opacity: [0.85, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeOut", delay: i * 2.33 }}
            />
          ))}
          {/* 二重の渦（時計回り・反時計回り） */}
          {[0, 1].map(i => (
            <motion.div
              key={`spiral-${i}`}
              className="absolute left-1/2 top-1/2 rounded-full mix-blend-screen"
              style={{
                width: 900, height: 900, marginLeft: -450, marginTop: -450,
                background: i
                  ? "conic-gradient(from 0deg,transparent,rgba(56,189,248,0.3),transparent 35%,rgba(232,121,249,0.28),transparent 70%)"
                  : "conic-gradient(from 180deg,transparent,rgba(251,191,36,0.3),transparent 30%,rgba(248,113,113,0.26),transparent 65%)",
                filter: "blur(18px)",
              }}
              animate={{ rotate: i ? -360 : 360 }}
              transition={{ duration: i ? 70 : 100, repeat: Infinity, ease: "linear" }}
            />
          ))}
          <Curtain seed={1502} colors={["#fbbf24", "#f472b6", "#38bdf8", "#a78bfa"]} count={6} opacity={0.38} />
          <Motes count={70} seed={1503} color="rgba(255,255,255,0.95)" size={4} rise={520} dur={6} />
          {/* 全体を包む光の粒子（最上位の豪華さ） */}
          <Falling
            count={26}
            seed={1504}
            dur={9}
            render={() => <div className="text-amber-100/90 text-lg drop-shadow-[0_0_12px_rgba(253,230,138,1)]">✦</div>}
          />
        </div>
      );

    default:
      return <div className="absolute inset-0">{base}</div>;
  }
}
