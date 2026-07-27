export function getRaidBossMaxHp(level: number): number {
  const hps = [
    5000,    // Lv 1
    7000,    // Lv 2
    8000,    // Lv 3
    10000,   // Lv 4
    15000,   // Lv 5
    20000,   // Lv 6
    25000,   // Lv 7
    35000,   // Lv 8
    40000,   // Lv 9
    51000    // Lv 10 (Total cumulated ~ 216,000)
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

export const MAX_RAID_LEVEL = 10;

import { db } from "./firebase";
import { doc, getDoc, runTransaction } from "firebase/firestore";
import { storage } from "./storage";

export async function dealDamageToRaidBoss(damage: number, grade: number) {
  if (damage <= 0) return;
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  if (storage.isGuest()) {
    let level = parseInt(localStorage.getItem("kq_raid_level_" + grade) || "1", 10);
    let hp = parseInt(localStorage.getItem("kq_raid_hp_" + grade) || getRaidBossMaxHp(1).toString(), 10);
    const month = localStorage.getItem("kq_raid_month_" + grade) || currentMonth;

    if (month !== currentMonth) {
      level = 1;
      hp = getRaidBossMaxHp(1);
    }

    hp -= damage;
    while (hp <= 0 && level < MAX_RAID_LEVEL) {
      level++;
      hp += getRaidBossMaxHp(level);
    }
    if (hp <= 0 && level >= MAX_RAID_LEVEL) {
      hp = 0;
    }

    localStorage.setItem("kq_raid_level_" + grade, level.toString());
    localStorage.setItem("kq_raid_hp_" + grade, hp.toString());
    localStorage.setItem("kq_raid_month_" + grade, currentMonth);
  } else {
    try {
      const ref = doc(db, "globalStats", "raidBoss_" + grade);
      await runTransaction(db, async (transaction) => {
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
          level++;
          hp += getRaidBossMaxHp(level);
        }
        if (hp <= 0 && level >= MAX_RAID_LEVEL) {
          hp = 0;
        }

        transaction.set(ref, { level, hp, month: currentMonth }, { merge: true });
      });
    } catch(e) {
      console.error("Failed to damage raid boss", e);
    }
  }
}

