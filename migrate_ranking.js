// データ移行スクリプト
// 既存ユーザーの monthlyDamage / weeklyXp / lastMonthString / lastWeekString をバックフィル

const { initializeApp } = require('firebase/app');
const { getFirestore, getDocs, collection, doc, updateDoc } = require('firebase/firestore');

const app = initializeApp({ projectId: 'kanji-quest-b1a45' });
const db = getFirestore(app);

// 現在のJST週・月を計算
function getCurrentJSTMonth() {
  const d = new Date();
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 7);
}

function getCurrentJSTWeekString() {
  const d = new Date();
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const date = new Date(jst.getTime());
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

async function migrate() {
  const currentMonth = getCurrentJSTMonth();
  const currentWeek = getCurrentJSTWeekString();
  console.log('currentMonth:', currentMonth, 'currentWeek:', currentWeek);

  const snap = await getDocs(collection(db, 'users'));
  console.log(`Found ${snap.size} users`);

  for (const d of snap.docs) {
    const u = d.data();
    const updates = {};

    // monthlyDamage が今月になっていない → totalDamage をそのまま今月のダメージとして設定
    if (u.lastMonthString !== currentMonth) {
      updates.monthlyDamage = u.totalDamage || u.xp || 0;
      updates.lastMonthString = currentMonth;
    }

    // weeklyXp が今週になっていない → 0 でリセット（今週分はまだプレイしていないと判断）
    // ただし totalDamage が大きい人は今週も活躍している可能性が高いので xp の一部を設定
    // → シンプルに「今週のxp」は不明なのでweeklyXpは0のまま（次回プレイ時に正確に記録）

    if (Object.keys(updates).length > 0) {
      console.log(`Updating ${u.name} (${u.grade}年):`, updates);
      await updateDoc(doc(db, 'users', d.id), updates);
    } else {
      console.log(`Skip ${u.name} - already up to date (month:${u.lastMonthString}, monthlyDmg:${u.monthlyDamage})`);
    }
  }

  console.log('Done!');
}

migrate().catch(console.error).finally(() => setTimeout(() => process.exit(0), 1000));
