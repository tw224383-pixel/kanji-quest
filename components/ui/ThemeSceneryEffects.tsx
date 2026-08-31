"use client";

import { motion } from "framer-motion";
import { mulberry32, StarField, Motes, Falling, Curtain, Rain } from "./ThemeScenery";

/**
 * イラスト背景の上に重ねる「動き」だけのレイヤー。
 *
 * テーマガチャの12種は実際の背景イラストを用意したので、絵そのものは画像にまかせ、
 * ここでは絵に描かれていない「動き」だけを足す（雪が降る、火の粉が舞う、稲妻が光る…）。
 *
 * 【重要】絵にすでに描かれているものを二重に描かないこと。
 * 竹・鳥居・ネオン看板・波・天の川などはイラスト側にあるので、
 * 同じものをコードで重ねるとシルエットがぶつかって汚くなる。
 */
export function ThemeSceneryEffects({ theme }: { theme: string }) {
  switch (theme) {
    // ============ 激レア ============
    case "moonlight_bamboo":
      // 竹と月は絵にある。舞い上がる蛍だけを足す。
      return (
        <div className="absolute inset-0 overflow-hidden">
          <Motes count={28} seed={32} color="rgba(253,230,138,0.95)" size={3} rise={240} dur={6} />
          <StarField count={26} seed={31} maxTop={35} />
        </div>
      );

    case "storm_sea":
      // 波・雲・船は絵にある。稲妻の閃光と雨、しぶきだけを足す。
      return (
        <div className="absolute inset-0 overflow-hidden">
          {[0, 1].map(i => (
            <motion.div
              key={`bolt-${i}`}
              className="absolute inset-0 bg-white mix-blend-screen"
              animate={{ opacity: [0, 0, 0.4, 0, 0.22, 0] }}
              transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 6 + i * 5, delay: i * 3 }}
            />
          ))}
          <Rain seed={42} count={70} tilt={12} color="rgba(210,225,245,0.55)" />
          <Motes count={26} seed={41} color="rgba(220,245,255,0.85)" size={3} rise={140} dur={3} />
        </div>
      );

    case "desert_night":
      // 天の川も星も焚き火も絵にある。流れ星と、焚き火から立ちのぼる火の粉だけ。
      return (
        <div className="absolute inset-0 overflow-hidden">
          {[0, 1, 2].map(i => (
            <motion.div
              key={`shoot-${i}`}
              className="absolute h-px bg-gradient-to-r from-transparent via-white to-transparent"
              style={{ width: 170, top: `${6 + i * 10}%`, left: `${16 + i * 24}%`, rotate: "32deg" }}
              animate={{ x: [-220, 420], y: [-130, 250], opacity: [0, 1, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 7 + i * 4, ease: "linear" }}
            />
          ))}
          <Motes count={14} seed={52} color="rgba(255,186,120,0.9)" size={3} rise={180} dur={5} />
        </div>
      );

    case "sky_railway":
      // レールと列車は絵にある。手前を流れる雲と、風に舞う光の粒だけ。
      return (
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => {
            const rand = mulberry32(600 + i);
            return (
              <motion.div
                key={`cloud-${i}`}
                className="absolute rounded-full blur-3xl"
                style={{
                  bottom: `${rand() * 30 - 8}%`, left: "-45%",
                  width: `${rand() * 45 + 45}%`, height: `${rand() * 10 + 7}%`,
                  background: "rgba(255,255,255,0.4)",
                }}
                animate={{ x: ["0vw", "150vw"] }}
                transition={{ duration: rand() * 40 + 50, repeat: Infinity, ease: "linear", delay: -rand() * 60 }}
              />
            );
          })}
          <Motes count={18} seed={61} color="rgba(255,255,255,0.85)" size={2} rise={200} dur={9} />
        </div>
      );

    case "neon_arcade":
      // ネオン看板も濡れた路面も絵にある。降りしきる雨と、看板の明滅だけを足す。
      return (
        <div className="absolute inset-0 overflow-hidden">
          <Rain seed={71} count={90} tilt={8} color="rgba(190,235,255,0.5)" />
          <motion.div
            className="absolute inset-0 mix-blend-screen"
            style={{ background: "radial-gradient(ellipse at 50% 40%,rgba(236,72,153,0.14),transparent 65%)" }}
            animate={{ opacity: [0.35, 0.85, 0.5, 0.9] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0px,transparent_3px,rgba(0,0,0,0.18)_4px)] opacity-30" />
        </div>
      );

    case "snow_village":
      // 家も灯りも絵にある。しんしんと降る雪と、灯りのゆらぎだけ。
      return (
        <div className="absolute inset-0 overflow-hidden">
          <Falling
            count={80}
            seed={82}
            dur={14}
            render={() => <div className="w-2 h-2 rounded-full bg-white/90 shadow-[0_0_6px_rgba(255,255,255,0.8)]" />}
          />
          <motion.div
            className="absolute inset-0 mix-blend-screen"
            style={{ background: "radial-gradient(ellipse at 50% 78%,rgba(253,186,116,0.16),transparent 60%)" }}
            animate={{ opacity: [0.5, 1, 0.6] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      );

    // ============ 超激レア ============
    case "crystal_palace":
      // 氷の建物は絵にある。舞い落ちる結晶と、光の屈折のきらめきを足す。
      return (
        <div className="absolute inset-0 overflow-hidden">
          <Curtain seed={1001} colors={["#a5f3fc", "#e9d5ff", "#bfdbfe", "#fbcfe8"]} count={5} opacity={0.32} />
          <Falling
            count={30}
            seed={1002}
            dur={12}
            render={() => <div className="text-cyan-100/90 text-xl drop-shadow-[0_0_10px_rgba(165,243,252,0.9)]">❉</div>}
          />
          <Motes count={26} seed={1003} color="rgba(224,252,255,0.95)" size={3} rise={280} dur={6} />
        </div>
      );

    case "phoenix_sky":
      // 不死鳥も燃える空も絵にある。立ちのぼる火の粉と、熱のゆらぎだけ。
      return (
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute inset-x-0 bottom-0 h-[55%] blur-2xl mix-blend-screen"
            style={{ background: "linear-gradient(0deg,rgba(249,115,22,0.3),transparent)" }}
            animate={{ scaleY: [1, 1.12, 1], opacity: [0.4, 0.75, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <Motes count={55} seed={1101} color="rgba(255,196,90,0.95)" size={4} rise={440} dur={5} />
        </div>
      );

    case "dream_nebula":
      // 星雲は絵にある。星のまたたきと、ただよう光の粒を足す。
      return (
        <div className="absolute inset-0 overflow-hidden">
          <StarField count={70} seed={1201} maxTop={100} />
          <Motes count={34} seed={1202} color="rgba(233,213,255,0.95)" size={3} rise={360} dur={8} />
        </div>
      );

    case "golden_shrine":
      // 鳥居も参道も絵にある。降りそそぐ光の柱と、舞う金粉だけ。
      return (
        <div className="absolute inset-0 overflow-hidden">
          <Curtain seed={1301} colors={["#fde68a", "#fbbf24", "#fef3c7"]} count={5} opacity={0.4} />
          <Motes count={44} seed={1302} color="rgba(253,224,71,0.95)" size={4} rise={350} dur={6} />
          <Falling
            count={20}
            seed={1303}
            dur={13}
            render={() => <div className="w-2.5 h-2.5 rotate-45 bg-amber-200/90 shadow-[0_0_10px_rgba(253,224,71,0.9)]" />}
          />
        </div>
      );

    // ============ 神レア ============
    case "celestial_dragon":
      // 竜宮も星の海も絵にある。天を駆ける光の帯（龍）と立ちのぼる光の粒で、最上位らしくする。
      return (
        <div className="absolute inset-0 overflow-hidden">
          <StarField count={70} seed={1401} maxTop={100} />
          {[0, 1].map(i => (
            <motion.div
              key={`dragon-${i}`}
              className="absolute mix-blend-screen"
              style={{
                top: `${16 + i * 26}%`, left: "-30%",
                width: "60%", height: 10,
                background: `linear-gradient(90deg,transparent,${i ? "rgba(103,232,249,0.8)" : "rgba(196,181,253,0.8)"},transparent)`,
                filter: "blur(4px)",
                borderRadius: "9999px",
              }}
              animate={{ x: ["0vw", "170vw"], y: [0, -60, 50, -30, 0], scaleY: [1, 1.9, 0.7, 1.5, 1] }}
              transition={{ duration: 17 + i * 5, repeat: Infinity, ease: "easeInOut", delay: i * 4 }}
            />
          ))}
          <Curtain seed={1402} colors={["#818cf8", "#22d3ee", "#e879f9"]} count={4} opacity={0.28} />
          <Motes count={44} seed={1403} color="rgba(224,231,255,0.95)" size={4} rise={440} dur={7} />
        </div>
      );

    case "origin_of_all":
      // 絵の中心（およそ 50%, 48%）で光が生まれている。そこから広がる衝撃波と、
      // 全体に降る光の粒で「すべてが生まれる瞬間」を動かす。神レアらしくいちばん派手にする。
      return (
        <div className="absolute inset-0 overflow-hidden">
          {[0, 1, 2].map(i => (
            <motion.div
              key={`shock-${i}`}
              className="absolute rounded-full border-2 mix-blend-screen"
              style={{
                left: "50%", top: "48%", width: 300, height: 300,
                marginLeft: -150, marginTop: -150,
                borderColor: "rgba(253,230,138,0.45)",
              }}
              animate={{ scale: [0.25, 4], opacity: [0.7, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeOut", delay: i * 2.33 }}
            />
          ))}
          <motion.div
            className="absolute rounded-full mix-blend-screen"
            style={{
              left: "50%", top: "48%", width: 260, height: 260, marginLeft: -130, marginTop: -130,
              background: "radial-gradient(circle,rgba(255,255,255,0.5) 0%,rgba(253,230,138,0.25) 35%,transparent 70%)",
              filter: "blur(10px)",
            }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <StarField count={80} seed={1501} maxTop={100} />
          <Motes count={60} seed={1503} color="rgba(255,255,255,0.95)" size={4} rise={520} dur={6} />
          <Falling
            count={22}
            seed={1504}
            dur={9}
            render={() => <div className="text-amber-100/90 text-lg drop-shadow-[0_0_12px_rgba(253,230,138,1)]">✦</div>}
          />
        </div>
      );

    default:
      return null;
  }
}
