/**
 * 「先週のヒーロー」「先月のダメージ」ランキング用の期間スナップショット。
 *
 * weeklyXp / lastWeekString（および monthlyDamage / lastMonthString）は
 * “最後にプレイした期間の累計”を持つ上書き式のカウンタで、次の期間に入って
 * 最初にプレイした瞬間に0へリセットされる。つまり前の期間の成績はどこにも残らない。
 *
 * そのためランキングを「lastWeekString == 先週」で引くと、
 * 「先週プレイしたが今週まだ一度もプレイしていない人」しか拾えず、
 * 週が進むほどリストが痩せていき、実績もほぼ付与されなくなる（実際にそうなっていた）。
 *
 * ここでは期間が切り替わったことを検知したときに、リセット前の値を prev* 側へ
 * 退避しておく。退避後は次に期間が変わるまで固定なので、いつランキングを開いても
 * 前期間の確定順位を正しく参照できる。
 */
export type PeriodRoll = {
  /** 退避が必要かどうか（既に退避済み・前期間の記録なしなら false） */
  changed: boolean;
  /** 書き込みオブジェクトに展開するための部分オブジェクトを返す（不要なら空） */
  snapshot: (valueKey: string, periodKey: string) => Record<string, string | number>;
};

export function rollPeriodSnapshot(
  lastPeriod: string | undefined,
  currentPeriod: string,
  lastValue: number | undefined,
  prevPeriod: string | undefined,
  prevValue: number | undefined
): PeriodRoll {
  const noop: PeriodRoll = { changed: false, snapshot: () => ({}) };

  // まだ同じ期間の中にいる → 退避するものはない
  if (!lastPeriod || lastPeriod === currentPeriod) return noop;
  // 前期間にプレイしていない（0点）なら、そもそもランキングに載らないので退避不要
  const value = lastValue || 0;
  if (value <= 0) return noop;
  // 既に同じ期間ぶんを退避済みなら、値が増えているときだけ更新する
  if (prevPeriod === lastPeriod && (prevValue || 0) >= value) return noop;

  return {
    changed: true,
    snapshot: (valueKey, periodKey) => ({ [valueKey]: value, [periodKey]: lastPeriod }),
  };
}
