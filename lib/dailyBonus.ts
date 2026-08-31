"use client";

import type { UserData } from "../contexts/UserContext";
import { calculateAdventurerStats, type StatCategoryKey } from "./userStatsLogic";
import { getCurrentJSTDateString } from "./reviewSchedule";
import { safeLocalStorage } from "./safeLocalStorage";

/**
 * 「今日限定！」ボーナス
 *
 * 実測では38%の子が漢字しかやっておらず、6軸のレーダーチャートが1本だけ尖った
 * 状態だった。そこで、いまカルテのレベルが低い分野を毎日えらび、そこで遊ぶと
 * XP・PT・SP が3倍になるようにして、自分でレーダーの穴を埋めたくなるようにする。
 *
 * 前は「きょうのミッション」として1分野・1.5倍・1日1回だけにしていたが、
 * 1回遊ぶと終わってしまい、その日のうちにやることが尽きてしまっていた。
 * そのため
 *   - 対象を3分野に増やす
 *   - 倍率を3倍に上げる
 *   - 回数制限をなくす（その日じゅう何回でも3倍）
 * に変更した。PTの稼ぎすぎは、別途ある「系統ごとの1日のPT上限(5,000PT)」が抑える。
 *
 * 対象はその日のうちに変わらないよう localStorage に保存する
 * （遊ぶたびにレベルが上がって対象が入れ替わると、目標がぶれるため）。
 * 判定も付与も端末内で完結するので、Firestoreの読み書きは一切増えない。
 */

export const DAILY_BONUS_MULTIPLIER = 3;

/** 1日にえらぶ分野の数 */
const DAILY_BONUS_COUNT = 3;

export type DailyBonusCategory = {
  category: StatCategoryKey;
  label: string;
  icon: string;
  /** ホームの出撃に渡すための科目 */
  subject: "kanji" | "math" | "science" | "social";
  /** 算数の場合の内訳（calc/logic/geometry）。それ以外は null */
  mathCategory: "calc" | "logic" | "geometry" | null;
};

const CATEGORY_DEFS: Record<StatCategoryKey, Omit<DailyBonusCategory, "category">> = {
  kanji: { label: "漢字", icon: "📖", subject: "kanji", mathCategory: null },
  calc: { label: "計算", icon: "⚡", subject: "math", mathCategory: "calc" },
  logic: { label: "思考力", icon: "🧠", subject: "math", mathCategory: "logic" },
  geometry: { label: "図形・単位", icon: "📐", subject: "math", mathCategory: "geometry" },
  science: { label: "理科", icon: "🔬", subject: "science", mathCategory: null },
  social: { label: "社会", icon: "🗺️", subject: "social", mathCategory: null },
};

const KEY = "kq_daily_bonus";

function build(cat: StatCategoryKey): DailyBonusCategory {
  return { category: cat, ...CATEGORY_DEFS[cat] };
}

/**
 * 今日のボーナス対象（レベルが低い順に3分野）を返す。
 * まだ決まっていなければ決めて、その日じゅう変わらないよう保存する。
 */
export function getDailyBonusCategories(userData: UserData | null): DailyBonusCategory[] {
  if (!userData) return [];
  const today = getCurrentJSTDateString();

  const saved = safeLocalStorage.getItem(KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed?.date === today && Array.isArray(parsed.categories)) {
        const list = (parsed.categories as string[])
          .filter(c => c in CATEGORY_DEFS)
          .map(c => build(c as StatCategoryKey));
        if (list.length > 0) return list;
      }
    } catch { /* 壊れていたら作り直す */ }
  }

  const { stats } = calculateAdventurerStats(userData);
  const sorted = [...stats].sort((a, b) =>
    a.level !== b.level ? a.level - b.level : a.totalSolved - b.totalSolved
  );

  // 始めたばかりの子は6分野すべてが同点になる。配列の先頭（漢字）から順に固定すると
  // 「いつも通り漢字」を勧めるだけになってしまうので、同点のかたまりは日付でずらす。
  const dayIndex = Number(today.replace(/-/g, "")) || 0;
  const groups = new Map<string, StatCategoryKey[]>();
  for (const s of sorted) {
    const k = `${s.level}:${s.totalSolved}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(s.key);
  }
  const picked: StatCategoryKey[] = [];
  for (const group of Array.from(groups.values())) {
    const offset = dayIndex % group.length;
    for (let i = 0; i < group.length && picked.length < DAILY_BONUS_COUNT; i++) {
      picked.push(group[(offset + i) % group.length]);
    }
    if (picked.length >= DAILY_BONUS_COUNT) break;
  }
  if (picked.length === 0) return [];

  safeLocalStorage.setItem(KEY, JSON.stringify({ date: today, categories: picked }));
  return picked.map(build);
}

/**
 * このセッションがボーナス対象かどうか。
 * ホームからの出撃・カルテからの特訓のどちらでも効くよう、科目と算数の内訳で判定する。
 */
export function isDailyBonusTarget(
  list: DailyBonusCategory[],
  subjectType: string,
  mathCategory: string | null,
  questionCategories: string[]
): boolean {
  return list.some(b => {
    if (b.subject !== subjectType) return false;
    if (!b.mathCategory) return true;
    // 算数は内訳まで一致させる。URLに category が無い場合は実際に出た問題から判定する。
    if (mathCategory) return mathCategory === b.mathCategory;
    return questionCategories.length > 0 && questionCategories.every(c => c === b.mathCategory);
  });
}

/** ホームの「今日限定！」ボタンから、その分野だけの出題ページへ飛ぶURLを作る */
export function dailyBonusGameUrl(b: DailyBonusCategory, grade: number, count: number = 5): string {
  const params = new URLSearchParams();
  params.set("subject", b.subject);
  params.set("grades", String(grade));
  params.set("count", String(count));
  if (b.mathCategory) params.set("category", b.mathCategory);
  return `/game?${params.toString()}`;
}
