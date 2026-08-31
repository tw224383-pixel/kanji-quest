"use client";

import type { UserData } from "../contexts/UserContext";
import {
  TRANSCENDENT_REWARD_PT,
  TRANSCENDENT_REWARD_SP,
  getCachedRaidBossStatus,
} from "./raidLogic";
import { safeLocalStorage } from "./safeLocalStorage";
import { storage } from "./storage";

/**
 * Lv11「すべてを超えし者」討伐報酬を、学年全員に配るための受け取り処理。
 *
 * Firestoreのセキュリティルールでは、子どもは自分のドキュメントしか書き換えられない。
 * つまり「討伐した誰か」が学年全員に報酬を配ることは、クライアントだけでは不可能で、
 * サーバー処理（Cloud Functions）は有料プランが必要になる。
 *
 * そこで「配る」のではなく「各自が受け取る」形にしている：
 *   1. 討伐時、学年共有の globalStats/raidBoss_{grade} に討伐した月を記録する
 *   2. 各自がアプリを開いたとき、その一覧と自分の受取済み一覧を突き合わせ、
 *      未受取ぶんだけ自分のドキュメントに加算する
 *
 * 判定に使うボス情報は、ホーム画面が元々読んでいるキャッシュ付きの取得を使い回すので、
 * この機能のためにFirestoreの読み取りが増えることはない。
 */

/** ゲスト用：この端末で討伐済みの月（認証ユーザーの globalStats に相当） */
function getGuestClearedMonths(grade: number): string[] {
  return (safeLocalStorage.getItem("kq_raid_transcendent_" + grade) || "").split(",").filter(Boolean);
}

export type TranscendentClaimResult = {
  /** 実際に受け取れた月の数（0なら何もしていない） */
  claimedCount: number;
  totalPt: number;
  totalSp: number;
};

/**
 * 未受取の討伐報酬があれば受け取る。無ければ書き込みは一切行わない。
 * @param userData 現在のユーザーデータ（学年と受取済み一覧の参照に使う）
 * @param updateUserDataAtomic UserContext の同名関数
 */
export async function claimTranscendentRewards(
  userData: UserData,
  updateUserDataAtomic: (updater: (current: UserData) => Partial<UserData> | null) => Promise<boolean | null>
): Promise<TranscendentClaimResult> {
  const none: TranscendentClaimResult = { claimedCount: 0, totalPt: 0, totalSp: 0 };
  const grade = userData.grade;
  if (!grade) return none;

  let clearedMonths: string[];
  if (storage.isGuest()) {
    clearedMonths = getGuestClearedMonths(grade);
  } else {
    try {
      clearedMonths = (await getCachedRaidBossStatus(grade)).transcendentClearedMonths;
    } catch {
      return none; // 取得に失敗したら今回は何もしない（次にアプリを開いたときに再挑戦）
    }
  }
  if (clearedMonths.length === 0) return none;

  const alreadyClaimed = userData.claimedTranscendentMonths || [];
  const unclaimed = clearedMonths.filter(m => !alreadyClaimed.includes(m));
  if (unclaimed.length === 0) return none;

  let awarded: string[] = [];
  const ok = await updateUserDataAtomic(current => {
    // トランザクション内で最新の受取済み一覧を見て二重取得を防ぐ
    const claimed = current.claimedTranscendentMonths || [];
    awarded = clearedMonths.filter(m => !claimed.includes(m));
    if (awarded.length === 0) return null;
    return {
      pt: current.pt + TRANSCENDENT_REWARD_PT * awarded.length,
      sp: (current.sp || 0) + TRANSCENDENT_REWARD_SP * awarded.length,
      claimedTranscendentMonths: [...claimed, ...awarded].slice(-12),
    };
  });

  if (!ok || awarded.length === 0) return none;

  return {
    claimedCount: awarded.length,
    totalPt: TRANSCENDENT_REWARD_PT * awarded.length,
    totalSp: TRANSCENDENT_REWARD_SP * awarded.length,
  };
}
