export function getRaidBossMaxHp(level: number): number {
  const hps = [
    25000,   // Lv 1
    35000,   // Lv 2
    40000,   // Lv 3
    50000,   // Lv 4
    75000,   // Lv 5
    100000,  // Lv 6
    125000,  // Lv 7
    175000,  // Lv 8
    200000,  // Lv 9
    255000   // Lv 10 (Total cumulated ~ 1,080,000)
  ];
  return hps[Math.min(Math.max(1, level) - 1, 9)];
}

export function getRaidBossIcon(level: number): string {
  if (level <= 1) return "💧"; // Slime
  if (level === 2) return "🦇"; // Bat
  if (level === 3) return "🐺"; // Wolf
  if (level === 4) return "👹"; // Ogre
  if (level === 5) return "🦅"; // Griffin
  if (level === 6) return "🦂"; // Scorpion
  if (level === 7) return "🦑"; // Kraken
  if (level === 8) return "🦖"; // T-Rex
  if (level === 9) return "🌋"; // Volcanic Golem
  return "🐉"; // Ultimate Dragon (Lv 10+)
}

export function getRaidBossImagePath(level: number, isScary: boolean = true): string {
  const dir = isScary ? "/images/boss" : "/images/boss/cute";
  if (level <= 1) return `${dir}/slime.webp`;
  if (level === 2) return `${dir}/bat.webp`;
  if (level === 3) return `${dir}/wolf.webp`;
  if (level === 4) return `${dir}/ogre.webp`;
  if (level === 5) return `${dir}/griffin.webp`;
  if (level === 6) return `${dir}/scorpion.webp`;
  if (level === 7) return `${dir}/kraken.webp`;
  if (level === 8) return `${dir}/trex.webp`;
  if (level === 9) return `${dir}/golem.webp`;
  return `${dir}/dragon.webp`;
}

export function getRaidBossName(level: number): string {
  if (level <= 1) return "プチスライム";
  if (level === 2) return "ダークバット";
  if (level === 3) return "シャドウウルフ";
  if (level === 4) return "オーガロード";
  if (level === 5) return "グリフォン";
  if (level === 6) return "デススコーピオン";
  if (level === 7) return "クラーケン";
  if (level === 8) return "ギガントレックス";
  if (level === 9) return "ヴォルカニックゴーレム";
  return "アルティメットドラゴン";
}

export type BossProfile = {
  alias: string;
  profile: string;
  story: string;
};

const CUTE_BOSS_PROFILES: Record<number, BossProfile> = {
  1: { alias: "始まりのしずく", profile: "学習の海からこぼれ落ちた「ちょっとしたつまずき」がスライム状に固まった姿。", story: "攻撃力は皆無でぷるぷるしているだけだが、放っておくと仲間を呼んでノートをベタベタにしてしまう。勇者たちが最初に立ち向かう、愛嬌のある魔物。" },
  2: { alias: "宵闇の羽音", profile: "暗い教室の隅でひっそりと育ったコウモリの魔物。", story: "勉強への「苦手意識」をエネルギー源として飛び回り、超音波で集中力を奪い取ろうとする。光（正解の輝き）に弱く、みんなで一斉に問題を解くと慌てて逃げていく。" },
  3: { alias: "月夜の狩人", profile: "「面倒くさい」という影の感情が狼の形をとった魔獣。", story: "素早い動きで子どもたちのやる気を削ぎ落としていく。群れで行動する特性があり、一人で立ち向かうと苦戦するが、クラス全員で協力して学ぶことで容易に退けることができる。" },
  4: { alias: "宿題クラッシャー", profile: "膨大な量の宿題や課題が具現化した巨大な鬼。", story: "「あとでやろう」という言い訳を食べて筋骨隆々に成長した。その太い腕で叩きつける一撃は、提出物の期限を忘れさせるほどの威力があるという。" },
  5: { alias: "空駆ける難問", profile: "鷲の上半身と獅子の下半身を持つ誇り高き幻獣。", story: "少し難易度の高い「応用問題」の化身であり、空から鋭い爪（難問）を突き立ててくる。基礎をしっかり固めた者だけが、この獣の弱点を見抜くことができる。" },
  6: { alias: "砂漠の毒針", profile: "ケアレスミスという「毒」を操る巨大サソリ。", story: "一見簡単そうな問題に擬態し、油断したところを尻尾の針で刺してくる。見直しを怠ると致命傷を負うため、慎重な学習姿勢が求められる。" },
  7: { alias: "深海の迷宮", profile: "複雑な文章題のように絡みつく無数の触手を持つ深海の怪物。", story: "一度捕まると「何を聞かれているのかわからない」混乱状態に陥る。触手（問題の条件）を一つずつ丁寧に解きほぐすことが攻略の鍵となる。" },
  8: { alias: "太古の暴君", profile: "多くの生徒を挫折させてきた「最難関の壁」が化石から蘇った姿。", story: "圧倒的な威圧感を放ち、生半可な知識ではダメージを与えることすらできない。これまでの学習のすべてをぶつける覚悟が必要だ。" },
  9: { alias: "灼熱の防壁", profile: "マグマの熱を宿した超硬度の岩石生命体。", story: "「諦め」という心の壁そのものであり、燃え盛る拳で学習者の心を折ろうとする。しかし、仲間と共に挑み続ける情熱の炎（XP）だけが、この岩の装甲を溶かすことができる。" },
  10: { alias: "絶対なる試練の化身", profile: "すべての「わからない」が結集して誕生した最強最悪の古竜。", story: "空を覆うほどの巨大な翼で絶望を撒き散らし、口からは全てを灰にする「無気力の炎」を吐く。この竜を倒すことができるのは、日々の努力を積み重ね、決して諦めない心を持つ真の勇者たち（クラス全員）だけである。" }
};

const SCARY_BOSS_PROFILES: Record<number, BossProfile> = {
  1: { alias: "底無しの粘液", profile: "暗くじめじめとした地下迷宮で最初に遭遇する魔物。", story: "見た目とは裏腹に、あらゆる武器の衝撃を吸収してしまう特殊な体質を持つ。かつて多くの駆け出しの冒険者が、この魔物を甘く見て武器を腐食され、命を落としていった。" },
  2: { alias: "宵闇の吸血牙", profile: "月明かりすら届かない深淵の森に生息する巨大な蝙蝠。", story: "音もなく背後から忍び寄り、鋭い牙で獲物の生命力を奪い取る。血の臭いに敏感で、傷ついた者がいればどこまでも執拗に追い詰める凶暴な性質を持つ。" },
  3: { alias: "月下の幽鬼", profile: "闇夜と同化する漆黒の毛並みを持つ魔狼。", story: "かつて魔女に呪いをかけられ、死してなお彷徨い続ける亡霊の群れのリーダーである。仲間の遠吠えに呼応して影から次々と現れ、獲物を絶望の底へと引きずり込む。" },
  4: { alias: "血塗られた暴君", profile: "狂暴なオーガ族を力のみで従え、王として君臨する巨大な戦士。", story: "彼が振り下ろす巨大な鉄槌は大地を割り、城壁を粉砕するほどの威力を持つ。己の力を誇示するために、これまで数え切れないほどの挑戦者を葬ってきた。" },
  5: { alias: "裂空の支配者", profile: "古代の神々によって創り出されたとされる、黄金の羽を持つ天空の魔獣。", story: "縄張りを侵す者には容赦なく襲いかかり、暴風を巻き起こして獲物を上空から引き裂く。その羽は最上級の魔法の素材となるが、手にする生還者はごく僅かである。" },
  6: { alias: "砂漠の死神", profile: "不毛の砂漠地帯で恐れられる、巨大な甲殻を持つ暗殺者。", story: "分厚い装甲は並の剣戟を弾き返し、尾から滴る猛毒は一滴で巨象をも即死させる。砂の中に潜み、足音の振動を感知して獲物を容赦なく串刺しにする。" },
  7: { alias: "深淵よりの呼び声", profile: "船乗りたちに「海の悪夢」として恐れられる巨大な軟体魔獣。", story: "暗黒の海溝の底で何千年も生き続け、その巨腕は豪華客船すら一瞬で深海へと引きずり込む。怒り狂うと大渦を巻き起こし、周囲の海域を死の海へと変える。" },
  8: { alias: "太古の破壊神", profile: "世界が創生された時代から生き延びているとされる、規格外の巨大な古竜種。", story: "強靭な鱗は魔法を弾き返し、その咆哮は天候すら操ると言われている。古の王国を一夜にして滅ぼしたという伝説が残る、まさに破壊の化身。" },
  9: { alias: "灼熱の守護者", profile: "活火山の中心でマグマと鉱石が融合して生まれた、魂無き巨人。", story: "太古の遺跡を守護する命令だけを忠実に守り続けている。体表からは数千度の熱を放ち、近づく者すべてを灰燼に帰す。倒すためには核となるコアを砕くしかない。" },
  10: { alias: "終焉を呼ぶ厄災", profile: "世界の終わりの日に目覚めると予言されている、最古にして最強の真竜。", story: "その羽ばたきは世界を暴風で包み、口から吐き出される滅びのブレスは空間そのものを歪める。人間の知識と力を超えた存在であり、神々ですら封印するしかなかったという。" }
};

export function getRaidBossProfile(level: number, isScary: boolean): BossProfile {
  const safeLevel = Math.min(Math.max(1, level), 10);
  return isScary ? SCARY_BOSS_PROFILES[safeLevel] : CUTE_BOSS_PROFILES[safeLevel];
}

export const MAX_RAID_LEVEL = 10;

import { db } from "./firebase";
import { doc, getDoc, runTransaction } from "firebase/firestore";
import { storage } from "./storage";
import { safeLocalStorage } from "./safeLocalStorage";

export function getCurrentJSTMonth() {
  const d = new Date();
  const jst = new Date(d.getTime() + (9 * 60 * 60 * 1000));
  return jst.toISOString().slice(0, 7);
}

// 先月の月間ダメージランキング実績判定用（今週開いた瞬間に確定させる方式だと
// 週末・月末にログインしなかった子が不利になるため、「先月分の確定値」を今月中に
// 参照する方式に変更した。詳しくは getPreviousJSTWeekString のコメント参照）。
export function getPreviousJSTMonth() {
  const d = new Date();
  const jst = new Date(d.getTime() + (9 * 60 * 60 * 1000));
  const prevMonth = new Date(Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth() - 1, 1));
  return prevMonth.toISOString().slice(0, 7);
}

// ハロウィン(10月)・クリスマス(12月)の見た目上書き。以前は raid/page.tsx・RaidBoss.tsx・
// game/page.tsx の3箇所に個別実装され、しかも端末のローカル時刻を見ていたため、
// 端末とサーバーで判定がズレうる状態だった。JST基準でここに一本化する。
export function getSeasonalBossPresentation(baseIcon: string, baseName: string): { icon: string; name: string } {
  const jstMonthNum = parseInt(getCurrentJSTMonth().slice(5, 7), 10);
  if (jstMonthNum === 10) {
    return { icon: "🎃", name: "ハロウィン " + baseName };
  }
  if (jstMonthNum === 12) {
    return { icon: "⛄", name: "スノーマン " + baseName };
  }
  return { icon: baseIcon, name: baseName };
}

function jstWeekStringForDate(baseDate: Date) {
  const jst = new Date(baseDate.getTime() + (9 * 60 * 60 * 1000));
  // Calculate ISO week
  const date = new Date(jst.getTime());
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

export function getCurrentJSTWeekString() {
  return jstWeekStringForDate(new Date());
}

// 先週の週間ヒーローランキング実績判定用。
// 以前は「土日など週の終わり際にランキングを開いた瞬間の順位」を確定させていたが、
// 土日にログインしない子が実績を取り損ねてしまう不公平があった。
// 週が切り替わった直後はまだ自分のドキュメントに先週分の weeklyXp / lastWeekString が
// 残っている（今週分のプレイでリセットされるまでの間）ので、今週このページを開いた
// タイミングで「先週の確定順位」を過去分として参照し、そこに入っていれば実績を確定する。
export function getPreviousJSTWeekString() {
  return jstWeekStringForDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
}

export type RaidDamageResult = { success: boolean; defeatedLevels: number[] };

// このダメージで倒された（トドメを刺した）ボスのレベルを defeatedLevels として返す。
// 呼び出し側はこれを使って「LvN討伐隊」称号をトドメを刺したプレイヤーに付与できる。
// 以前はこの称号を付与するコードが存在せず、称号所持を条件にしていた raid_1〜raid_10
// 実績（achievementLogic.ts）が永久に解除不可能になっていた。
export async function dealDamageToRaidBoss(damage: number, grade: number): Promise<RaidDamageResult> {
  if (damage <= 0) return { success: false, defeatedLevels: [] };
  const currentMonth = getCurrentJSTMonth(); // YYYY-MM

  if (storage.isGuest()) {
    try {
      let level = parseInt(safeLocalStorage.getItem("kq_raid_level_" + grade) || "1", 10);
      let hp = parseInt(safeLocalStorage.getItem("kq_raid_hp_" + grade) || getRaidBossMaxHp(1).toString(), 10);
      const month = safeLocalStorage.getItem("kq_raid_month_" + grade) || currentMonth;

      if (month !== currentMonth) {
        level = 1;
        hp = getRaidBossMaxHp(1);
      }

      const defeatedLevels: number[] = [];
      hp -= damage;
      while (hp <= 0 && level < MAX_RAID_LEVEL) {
        defeatedLevels.push(level);
        level++;
        hp += getRaidBossMaxHp(level);
      }
      if (hp <= 0 && level >= MAX_RAID_LEVEL) {
        defeatedLevels.push(level);
        hp = 0;
      }

      safeLocalStorage.setItem("kq_raid_level_" + grade, level.toString());
      safeLocalStorage.setItem("kq_raid_hp_" + grade, hp.toString());
      safeLocalStorage.setItem("kq_raid_month_" + grade, currentMonth);
      return { success: true, defeatedLevels };
    } catch (e) {
      console.error("Guest raid boss update error:", e);
      return { success: false, defeatedLevels: [] };
    }
  } else {
    const maxRetries = 2;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const ref = doc(db, "globalStats", "raidBoss_" + grade);
        let defeatedLevels: number[] = [];
        await runTransaction(db, async (transaction) => {
          defeatedLevels = [];
          const docSnap = await transaction.get(ref);
          let data = docSnap.exists() ? docSnap.data() : { level: 1, hp: getRaidBossMaxHp(1), month: currentMonth };

          let level = data.level || 1;
          let hp = data.hp !== undefined ? data.hp : getRaidBossMaxHp(1);
          const month = data.month || currentMonth;

          if (month !== currentMonth) {
            level = 1;
            hp = getRaidBossMaxHp(1);
          }

          hp -= damage;
          while (hp <= 0 && level < MAX_RAID_LEVEL) {
            defeatedLevels.push(level);
            level++;
            hp += getRaidBossMaxHp(level);
          }
          if (hp <= 0 && level >= MAX_RAID_LEVEL) {
            defeatedLevels.push(level);
            hp = 0;
          }

          transaction.set(ref, { level, hp, month: currentMonth }, { merge: true });
        });
        return { success: true, defeatedLevels };
      } catch (e) {
        if (attempt === maxRetries) {
          console.error(`Failed to damage raid boss after ${maxRetries + 1} attempts:`, e);
          return { success: false, defeatedLevels: [] };
        }
        // Small delay before retry
        await new Promise(res => setTimeout(res, 200 * (attempt + 1)));
      }
    }
    return { success: false, defeatedLevels: [] };
  }
}

// 600人規模での運用でFirestore無料枠(書き込み2万回/日)を超えないよう、レイドボスへの
// ダメージ反映は毎ラウンドではなく数ラウンドに1回だけ実際に書き込む。共有ボスのHP表示が
// 数ラウンド遅れることはあるが、XP/PT本体（updateUserDataAtomic側）は毎回即時保存されるため
// プレイヤー自身の報酬には一切影響しない。
const RAID_SYNC_INTERVAL = 4;

function pendingDamageKey(grade: number) { return `kq_raid_pending_dmg_${grade}`; }
function pendingCountKey(grade: number) { return `kq_raid_pending_count_${grade}`; }

export async function dealDamageToRaidBossBatched(damage: number, grade: number): Promise<RaidDamageResult> {
  if (damage <= 0) return { success: false, defeatedLevels: [] };
  if (typeof window === "undefined") return dealDamageToRaidBoss(damage, grade);

  const pending = parseInt(safeLocalStorage.getItem(pendingDamageKey(grade)) || "0", 10) + damage;
  const count = parseInt(safeLocalStorage.getItem(pendingCountKey(grade)) || "0", 10) + 1;

  if (count < RAID_SYNC_INTERVAL) {
    safeLocalStorage.setItem(pendingDamageKey(grade), pending.toString());
    safeLocalStorage.setItem(pendingCountKey(grade), count.toString());
    return { success: true, defeatedLevels: [] };
  }

  safeLocalStorage.setItem(pendingDamageKey(grade), "0");
  safeLocalStorage.setItem(pendingCountKey(grade), "0");
  return dealDamageToRaidBoss(pending, grade);
}

// タブを閉じる・隠す際に、まだ書き込んでいない蓄積ダメージが消えてしまわないよう
// ベストエフォートで反映しておく（保証はできないが、何もしないよりはるかに良い）。
if (typeof window !== "undefined") {
  const flushAllPending = () => {
    for (let g = 1; g <= 6; g++) {
      const pending = parseInt(safeLocalStorage.getItem(pendingDamageKey(g)) || "0", 10);
      if (pending > 0 && !storage.isGuest()) {
        safeLocalStorage.setItem(pendingDamageKey(g), "0");
        safeLocalStorage.setItem(pendingCountKey(g), "0");
        dealDamageToRaidBoss(pending, g).catch(() => {});
      }
    }
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushAllPending();
  });
}

// ホーム/レイド/じっせき画面など複数箇所で同じ「学年のボス状況」を短時間に何度も
// 参照するため、短いTTLでメモリキャッシュしてFirestore読み取りを減らす。
const raidStatusCache = new Map<number, { data: { level: number; hp: number; month: string }; fetchedAt: number }>();
const RAID_STATUS_CACHE_TTL_MS = 60 * 1000;

export async function getCachedRaidBossStatus(grade: number): Promise<{ level: number; hp: number; month: string }> {
  const cached = raidStatusCache.get(grade);
  if (cached && Date.now() - cached.fetchedAt < RAID_STATUS_CACHE_TTL_MS) {
    return cached.data;
  }
  const ref = doc(db, "globalStats", "raidBoss_" + grade);
  const snap = await getDoc(ref);
  const data = snap.exists()
    ? { level: snap.data().level || 1, hp: snap.data().hp ?? getRaidBossMaxHp(snap.data().level || 1), month: snap.data().month || getCurrentJSTMonth() }
    : { level: 1, hp: getRaidBossMaxHp(1), month: getCurrentJSTMonth() };
  raidStatusCache.set(grade, { data, fetchedAt: Date.now() });
  return data;
}

