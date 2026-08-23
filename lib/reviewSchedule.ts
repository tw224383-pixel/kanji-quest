// 忘却曲線に基づく分散学習（間隔反復）のスケジュール管理。
// 苦手問題(mistakeIds)を「今すぐ」ではなく「1日後→3日後→7日後→14日後→30日後」と
// 間隔を空けて再出題し、5回連続で復習に成功した問題は苦手リストから卒業させる。

export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30];
export const GRADUATION_STAGE = REVIEW_INTERVALS_DAYS.length;

export function getCurrentJSTDateString(): string {
  const d = new Date();
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

export function addDaysToDateString(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// nextReviewDate が未設定（初めてのまちがい等）なら即復習対象とする
export function isDueForReview(nextReviewDate: string | undefined, todayStr: string): boolean {
  if (!nextReviewDate) return true;
  return nextReviewDate <= todayStr;
}

export function getNextReviewDate(stage: number, todayStr: string): string {
  const days = REVIEW_INTERVALS_DAYS[Math.min(stage, REVIEW_INTERVALS_DAYS.length - 1)];
  return addDaysToDateString(todayStr, days);
}
