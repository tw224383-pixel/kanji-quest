/**
 * テーマの見た目の定義（1か所にまとめた「絵の設計図」）。
 *
 * テーマの背景は2種類ある。
 *
 * (1) イラスト背景（22種）… `/images/themes/bg_{id}.webp` を敷く。
 *     Firebase Hosting の無料枠（10GiB/月）を一度使い切った経緯があるため、
 *     追加分は 1376px幅・WebP品質72 に圧縮してある（1枚 59〜207KB。
 *     元は 2816x1536・3〜6MB。変換は scripts/convertThemeImages.js）。
 *     絵に描かれていない「動き」だけを ThemeSceneryEffects が上に重ねる。
 *
 * (2) コードで描く背景（3種）… ショップ恒常の さくら並木・夕やけの丘・オーロラの夜。
 *     イラストがないので ThemeScenery がグラデーション＋SVG＋エフェクトで組み立てる。
 *     転送量はゼロ。
 *
 * あとから (2) にもイラストを用意したくなったら、`/images/themes/bg_{id}.webp` を置いて
 * 下の IMAGE_THEMES にIDを足すだけで画像版に切り替わる。
 */

export type ThemeVisual = {
  /**
   * 背景の下地。CSS の background 値としてそのまま使える形にしてある。
   * ランキングカードのような「エフェクトを出さない縮小表示」でも同じ色味になるよう、
   * 背景画像の代わりにこの値を使う。
   */
  gradient: string;
  /** true なら /images/themes/bg_{id}.webp を背景に使う（既存の10テーマ） */
  hasImage: boolean;
};

/** 背景イラスト（bg_{id}.webp）を持つテーマ */
export const IMAGE_THEMES = [
  // 初期からある10種
  "space", "ninja", "cyber", "skycastle", "magma",
  "ruins", "cybercity", "ocean", "forest", "candy",
  // テーマガチャの12種。あとからイラストを用意したので画像に差し替えた。
  // 絵に描かれていない「動き」だけを ThemeSceneryEffects が上に重ねる。
  "moonlight_bamboo", "storm_sea", "desert_night", "sky_railway",
  "neon_arcade", "snow_village", "crystal_palace", "phoenix_sky",
  "dream_nebula", "golden_shrine", "celestial_dragon", "origin_of_all",
] as const;

/**
 * イラストの上に効果だけを重ねるテーマ（＝テーマガチャの12種）。
 * 初期からある10種は ThemeBackground 内に効果を直接書いてあるので対象外。
 */
export const EFFECT_OVERLAY_THEMES = [
  "moonlight_bamboo", "storm_sea", "desert_night", "sky_railway",
  "neon_arcade", "snow_village", "crystal_palace", "phoenix_sky",
  "dream_nebula", "golden_shrine", "celestial_dragon", "origin_of_all",
] as const;

export function hasEffectOverlay(themeId: string): boolean {
  return (EFFECT_OVERLAY_THEMES as readonly string[]).includes(themeId);
}

/**
 * コードで描くテーマの下地グラデーション。
 * 上（空）から下（地面）へ向かう縦のグラデーションを基本にしている。
 */
export const THEME_GRADIENTS: Record<string, string> = {
  // --- ショップ恒常 ---
  sakura_road:
    "linear-gradient(180deg,#4b2a4a 0%,#8e4a6b 28%,#d97ea0 55%,#f3b9cd 78%,#5a2f45 100%)",
  sunset_hill:
    "linear-gradient(180deg,#20124d 0%,#6b2d6b 24%,#c4506a 48%,#f0894a 68%,#ffc46b 82%,#3a1f33 100%)",
  aurora_night:
    "linear-gradient(180deg,#020417 0%,#071a3a 30%,#0b3a56 58%,#123d4a 76%,#0d1b2a 100%)",

  // --- テーマガチャ 激レア ---
  moonlight_bamboo:
    "linear-gradient(180deg,#040d1a 0%,#0b2338 34%,#12405a 62%,#0e3226 84%,#04120e 100%)",
  storm_sea:
    "linear-gradient(180deg,#0a1020 0%,#1b2c4a 30%,#2d4a6b 52%,#1d3550 74%,#08131f 100%)",
  desert_night:
    "linear-gradient(180deg,#050416 0%,#141138 32%,#2e2450 56%,#7a5a45 78%,#c99a63 100%)",
  sky_railway:
    "linear-gradient(180deg,#0d1b3f 0%,#2a3f7a 26%,#6f7fc4 50%,#c9b7e8 72%,#f2d9e6 100%)",
  neon_arcade:
    "linear-gradient(180deg,#0a0118 0%,#1d0836 30%,#370f4f 54%,#160a2c 78%,#05010f 100%)",
  snow_village:
    "linear-gradient(180deg,#050a1e 0%,#12203f 30%,#26375c 56%,#5a6d8c 78%,#dfe7f2 100%)",

  // --- テーマガチャ 超激レア ---
  crystal_palace:
    "linear-gradient(180deg,#02121f 0%,#0a3350 26%,#1a6a90 50%,#79c8de 76%,#dff4fb 100%)",
  phoenix_sky:
    "linear-gradient(180deg,#1a0206 0%,#4d0d10 24%,#9c2b12 48%,#e0761a 70%,#ffc75e 88%,#2a0a08 100%)",
  dream_nebula:
    "linear-gradient(180deg,#07021c 0%,#2a0c53 26%,#5b1483 46%,#a3238c 66%,#2b0f5c 86%,#05010f 100%)",
  golden_shrine:
    "linear-gradient(180deg,#1a1005 0%,#4a2c07 24%,#95651a 46%,#e0b03c 68%,#fce39a 86%,#2b1c06 100%)",

  // --- テーマガチャ 神レア ---
  celestial_dragon:
    "linear-gradient(180deg,#01030f 0%,#0a1440 22%,#1c2f7a 42%,#3d1f7d 60%,#7a2c8e 78%,#050318 100%)",
  origin_of_all:
    "linear-gradient(180deg,#000004 0%,#12043a 20%,#3c0a70 38%,#8a1560 56%,#d84a2a 72%,#f6c36a 86%,#02010a 100%)",
};

/** 画像を持つテーマかどうか（time_space は space の画像を色相反転して流用している） */
export function themeHasImage(themeId: string): boolean {
  if (!themeId || themeId === "default" || themeId === "time_space") return true;
  return (IMAGE_THEMES as readonly string[]).includes(themeId);
}

/** 背景画像のURL。画像を持たないテーマでは null を返す */
export function themeImageUrl(themeId: string): string | null {
  if (!themeId || themeId === "default") return "/images/ui/fantasy_bg.webp";
  if (themeId === "time_space") return "/images/themes/bg_space.webp";
  if (!themeHasImage(themeId)) return null;
  return `/images/themes/bg_${themeId}.webp`;
}

/** 画像を持たないテーマの下地グラデーション。未知のIDでも真っ黒にならないよう既定値を返す */
export function themeGradient(themeId: string): string {
  return THEME_GRADIENTS[themeId] || "linear-gradient(180deg,#132038 0%,#0a1120 100%)";
}
