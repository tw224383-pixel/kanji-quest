"use client";

import type { UserData } from "../contexts/UserContext";
import { calculateAdventurerStats, type StatCategoryKey } from "./userStatsLogic";
import { getCurrentJSTDateString } from "./reviewSchedule";
import { safeLocalStorage } from "./safeLocalStorage";

/**
 * 「きょうのミッション」
 *
 * 実測では38%の子が漢字しかやっておらず、6軸のレーダーチャートが1本だけ尖った
 * 状態になっていた。ホームの初期選択が漢字で、そのまま出撃できてしまうのが大きい。
 * そこで毎日ひとつだけ「いま一番のびしろがある分野」を提案し、そこで遊ぶと
 * 報酬が増えるようにして、自分でレーダーの穴を埋めたくなるようにする。
 *
 * ミッションはその日のうちに変わらないよう localStorage に保存する
 * （遊ぶたびに一番低い分野が入れ替わって目標がぶれるのを防ぐため）。
 * 判定も付与も端末内で完結するので、Firestoreの読み書きは一切増えない。
 */

export const MISSION_BONUS = 1.5;

export type DailyMission = {
  category: StatCategoryKey;
  label: string;
  icon: string;
  /** ホームの「バトルへ出発」に渡すための科目 */
  subject: "kanji" | "math" | "science" | "social";
  /** 算数の場合の内訳（calc/logic/geometry）。それ以外は null */
  mathCategory: "calc" | "logic" | "geometry" | null;
};

const MISSION_DEFS: Record<StatCategoryKey, Omit<DailyMission, "category">> = {
  kanji:    { label: "漢字",     icon: "📖", subject: "kanji",   mathCategory: null },
  calc:     { label: "計算",     icon: "⚡", subject: "math",    mathCategory: "calc" },
  logic:    { label: "思考力",   icon: "🧠", subject: "math",    mathCategory: "logic" },
  geometry: { label: "図形・単位", icon: "📐", subject: "math",   mathCategory: "geometry" },
  science:  { label: "理科",     icon: "🔬", subject: "science", mathCategory: null },
  social:   { label: "社会",     icon: "🗺️", subject: "social",  mathCategory: null },
};

const KEY = "kq_daily_mission";

/**
 * 今日のミッションを取得する。まだ決まっていなければ「一番レベルが低い分野」から決める。
 * 同率の場合は解いた問題数が少ないほうを選ぶ。
 */
export function getDailyMission(userData: UserData | null): DailyMission | null {
  if (!userData) return null;
  const today = getCurrentJSTDateString();

  const saved = safeLocalStorage.getItem(KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed?.date === today && parsed?.category && MISSION_DEFS[parsed.category as StatCategoryKey]) {
        const cat = parsed.category as StatCategoryKey;
        return { category: cat, ...MISSION_DEFS[cat] };
      }
    } catch { /* 壊れていたら作り直す */ }
  }

  const { stats } = calculateAdventurerStats(userData);
  const sorted = [...stats].sort((a, b) =>
    a.level !== b.level ? a.level - b.level : a.totalSolved - b.totalSolved
  );
  const head = sorted[0];
  if (!head) return null;
  // 始めたばかりの子は6分野すべてが Lv.1・0問で同点になる。配列の先頭（漢字）に
  // 固定すると「いつも通り漢字」を勧めるだけになってしまうので、同点の分野は
  // 日付で回して毎日ちがう分野が出るようにする（その日のうちは変わらない）。
  const tied = sorted.filter(s => s.level === head.level && s.totalSolved === head.totalSolved);
  const dayIndex = Number(today.replace(/-/g, "")) || 0;
  const weakest = tied[dayIndex % tied.length];

  safeLocalStorage.setItem(KEY, JSON.stringify({ date: today, category: weakest.key }));
  return { category: weakest.key, ...MISSION_DEFS[weakest.key] };
}

/** 今日のミッションを達成済みとして記録する（1日1回だけボーナスを出すため） */
export function markMissionCleared() {
  safeLocalStorage.setItem(KEY + "_done", getCurrentJSTDateString());
}

export function isMissionCleared(): boolean {
  return safeLocalStorage.getItem(KEY + "_done") === getCurrentJSTDateString();
}

/**
 * このセッションがミッション対象かどうか。
 * ホームからの出撃・カルテからの特訓のどちらでも効くよう、科目と算数の内訳で判定する。
 */
export function matchesMission(
  mission: DailyMission | null,
  subjectType: string,
  mathCategory: string | null,
  questionCategories: string[]
): boolean {
  if (!mission) return false;
  if (mission.subject !== subjectType) return false;
  if (!mission.mathCategory) return true;
  // 算数は内訳まで一致させる。URLに category が無い場合は実際に出た問題から判定する。
  if (mathCategory) return mathCategory === mission.mathCategory;
  return questionCategories.length > 0 && questionCategories.every(c => c === mission.mathCategory);
}

/** ホームの「きょうのミッション」ボタンから、その分野だけの出題ページへ飛ぶURLを作る */
export function missionGameUrl(mission: DailyMission, grade: number, count: number = 5): string {
  const params = new URLSearchParams();
  params.set("subject", mission.subject);
  params.set("grades", String(grade));
  params.set("count", String(count));
  if (mission.mathCategory) params.set("category", mission.mathCategory);
  return `/game?${params.toString()}`;
}
