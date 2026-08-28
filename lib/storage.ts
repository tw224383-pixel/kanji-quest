"use client";

import { safeLocalStorage } from "./safeLocalStorage";

// Keys
const GUEST_KEY = "kq_is_guest";
const GUEST_NAME = "kq_guest_name";
const GUEST_GRADE = "kq_guest_grade";
const XP_KEY = "kq_xp";
const PT_KEY = "kq_pt";
const EFFECTS_KEY = "kq_effects";
const MODE_KEY = "kq_answer_mode";
const FURIGANA_KEY = "kq_furigana_mode";
const MATH_SKILLS_KEY = "kq_math_skills";

export const storage = {
  isGuest: () => {
    if (typeof window === "undefined") return false;
    return safeLocalStorage.getItem(GUEST_KEY) === "true";
  },
  /** トップ画面で「つづきから あそぶ」に表示する、この端末に残っているゲストの名前 */
  getGuestName: () => {
    if (typeof window === "undefined") return null;
    return safeLocalStorage.getItem(GUEST_NAME);
  },
  setGuest: (name: string, grade: number) => {
    if (typeof window === "undefined") return;
    safeLocalStorage.setItem(GUEST_KEY, "true");
    safeLocalStorage.setItem(GUEST_NAME, name);
    safeLocalStorage.setItem(GUEST_GRADE, grade.toString());
    // Initialize if not exists
    if (!safeLocalStorage.getItem(XP_KEY)) safeLocalStorage.setItem(XP_KEY, "0");
    if (!safeLocalStorage.getItem(PT_KEY)) safeLocalStorage.setItem(PT_KEY, "0");
    if (!safeLocalStorage.getItem(EFFECTS_KEY)) safeLocalStorage.setItem(EFFECTS_KEY, JSON.stringify(["default"]));
  },
  clearGuest: () => {
    if (typeof window === "undefined") return;
    const keysToRemove = [
      GUEST_KEY, GUEST_NAME, GUEST_GRADE, XP_KEY, PT_KEY, "kq_sp",
      EFFECTS_KEY, "kq_mistakes", "kq_mastered", "kq_titles", "kq_eq_title",
      "kq_avatars", "kq_eq_avatar", "kq_equipments", "kq_eq_equipment",
      "kq_theme", "kq_eq_effect", "kq_total_damage", "kq_weekly_xp",
      "kq_last_week", "kq_monthly_damage", "kq_last_month",
      "kq_claimed_achievements", "kq_last_login_date", "kq_login_streak",
      "kq_user_cache", "kq_category_solved", "kq_mistake_stages", "kq_mistake_next_review",
      "kq_best_weekly_hero_rank", "kq_best_damage_rank"
    ];
    keysToRemove.forEach(k => safeLocalStorage.removeItem(k));
  },
  getGuestData: () => {
    if (typeof window === "undefined") return null;
    return {
      name: safeLocalStorage.getItem(GUEST_NAME) || "ゲスト",
      grade: parseInt(safeLocalStorage.getItem(GUEST_GRADE) || "1", 10),
      xp: parseInt(safeLocalStorage.getItem(XP_KEY) || "0", 10),
      pt: parseInt(safeLocalStorage.getItem(PT_KEY) || "0", 10),
      sp: parseInt(safeLocalStorage.getItem("kq_sp") || "0", 10),
      effects: JSON.parse(safeLocalStorage.getItem(EFFECTS_KEY) || '["default"]'),
      mistakeIds: JSON.parse(safeLocalStorage.getItem("kq_mistakes") || "[]"),
      masteredIds: JSON.parse(safeLocalStorage.getItem("kq_mastered") || "[]"),
      titles: JSON.parse(safeLocalStorage.getItem("kq_titles") || '["見習い"]'),
      equippedTitle: safeLocalStorage.getItem("kq_eq_title") || "見習い",
      avatars: JSON.parse(safeLocalStorage.getItem("kq_avatars") || '["👦"]'),
      equippedAvatar: safeLocalStorage.getItem("kq_eq_avatar") || "👦",
      equipments: JSON.parse(safeLocalStorage.getItem("kq_equipments") || "[]"),
      equippedEquipment: safeLocalStorage.getItem("kq_eq_equipment") || "",
      theme: safeLocalStorage.getItem("kq_theme") || "default",
      equippedEffect: safeLocalStorage.getItem("kq_eq_effect") || "",
      totalDamage: parseInt(safeLocalStorage.getItem("kq_total_damage") || "0", 10),
      weeklyXp: parseInt(safeLocalStorage.getItem("kq_weekly_xp") || "0", 10),
      lastWeekString: safeLocalStorage.getItem("kq_last_week") || "",
      monthlyDamage: parseInt(safeLocalStorage.getItem("kq_monthly_damage") || "0", 10),
      lastMonthString: safeLocalStorage.getItem("kq_last_month") || "",
      claimedAchievements: JSON.parse(safeLocalStorage.getItem("kq_claimed_achievements") || "[]"),
      lastLoginDate: safeLocalStorage.getItem("kq_last_login_date") || "",
      loginStreak: parseInt(safeLocalStorage.getItem("kq_login_streak") || "1", 10),
      categorySolved: JSON.parse(safeLocalStorage.getItem("kq_category_solved") || "{}"),
      mistakeStages: JSON.parse(safeLocalStorage.getItem("kq_mistake_stages") || "{}"),
      mistakeNextReview: JSON.parse(safeLocalStorage.getItem("kq_mistake_next_review") || "{}"),
      bestWeeklyHeroRank: safeLocalStorage.getItem("kq_best_weekly_hero_rank") ? parseInt(safeLocalStorage.getItem("kq_best_weekly_hero_rank")!, 10) : undefined,
      bestDamageRank: safeLocalStorage.getItem("kq_best_damage_rank") ? parseInt(safeLocalStorage.getItem("kq_best_damage_rank")!, 10) : undefined,
      dailyCategoryPt: JSON.parse(safeLocalStorage.getItem("kq_daily_category_pt") || "{}"),
      lastPtEarnDate: safeLocalStorage.getItem("kq_last_pt_earn_date") || "",
      prevWeeklyXp: parseInt(safeLocalStorage.getItem("kq_prev_weekly_xp") || "0", 10),
      prevWeekString: safeLocalStorage.getItem("kq_prev_week") || "",
      prevMonthlyDamage: parseInt(safeLocalStorage.getItem("kq_prev_monthly_damage") || "0", 10),
      prevMonthString: safeLocalStorage.getItem("kq_prev_month") || "",
      claimedTranscendentMonths: JSON.parse(safeLocalStorage.getItem("kq_claimed_transcendent") || "[]"),
    };
  },
  updateGuestData: (updates: any) => {
    if (typeof window === "undefined") return;
    if (updates.xp !== undefined) safeLocalStorage.setItem(XP_KEY, updates.xp.toString());
    if (updates.pt !== undefined) safeLocalStorage.setItem(PT_KEY, updates.pt.toString());
    if (updates.sp !== undefined) safeLocalStorage.setItem("kq_sp", updates.sp.toString());
    if (updates.effects !== undefined) safeLocalStorage.setItem(EFFECTS_KEY, JSON.stringify(updates.effects));
    if (updates.mistakeIds !== undefined) safeLocalStorage.setItem("kq_mistakes", JSON.stringify(updates.mistakeIds));
    if (updates.masteredIds !== undefined) safeLocalStorage.setItem("kq_mastered", JSON.stringify(updates.masteredIds));
    if (updates.titles !== undefined) safeLocalStorage.setItem("kq_titles", JSON.stringify(updates.titles));
    if (updates.equippedTitle !== undefined) safeLocalStorage.setItem("kq_eq_title", updates.equippedTitle);
    if (updates.avatars !== undefined) safeLocalStorage.setItem("kq_avatars", JSON.stringify(updates.avatars));
    if (updates.equippedAvatar !== undefined) safeLocalStorage.setItem("kq_eq_avatar", updates.equippedAvatar);
    if (updates.equipments !== undefined) safeLocalStorage.setItem("kq_equipments", JSON.stringify(updates.equipments));
    if (updates.equippedEquipment !== undefined) safeLocalStorage.setItem("kq_eq_equipment", updates.equippedEquipment);
    if (updates.theme !== undefined) safeLocalStorage.setItem("kq_theme", updates.theme);
    if (updates.equippedEffect !== undefined) safeLocalStorage.setItem("kq_eq_effect", updates.equippedEffect);
    if (updates.totalDamage !== undefined) safeLocalStorage.setItem("kq_total_damage", updates.totalDamage.toString());
    if (updates.weeklyXp !== undefined) safeLocalStorage.setItem("kq_weekly_xp", updates.weeklyXp.toString());
    if (updates.lastWeekString !== undefined) safeLocalStorage.setItem("kq_last_week", updates.lastWeekString);
    if (updates.monthlyDamage !== undefined) safeLocalStorage.setItem("kq_monthly_damage", updates.monthlyDamage.toString());
    if (updates.lastMonthString !== undefined) safeLocalStorage.setItem("kq_last_month", updates.lastMonthString);
    if (updates.claimedAchievements !== undefined) safeLocalStorage.setItem("kq_claimed_achievements", JSON.stringify(updates.claimedAchievements));
    if (updates.lastLoginDate !== undefined) safeLocalStorage.setItem("kq_last_login_date", updates.lastLoginDate);
    if (updates.loginStreak !== undefined) safeLocalStorage.setItem("kq_login_streak", updates.loginStreak.toString());
    if (updates.categorySolved !== undefined) safeLocalStorage.setItem("kq_category_solved", JSON.stringify(updates.categorySolved));
    if (updates.mistakeStages !== undefined) safeLocalStorage.setItem("kq_mistake_stages", JSON.stringify(updates.mistakeStages));
    if (updates.mistakeNextReview !== undefined) safeLocalStorage.setItem("kq_mistake_next_review", JSON.stringify(updates.mistakeNextReview));
    if (updates.bestWeeklyHeroRank !== undefined) safeLocalStorage.setItem("kq_best_weekly_hero_rank", updates.bestWeeklyHeroRank.toString());
    if (updates.bestDamageRank !== undefined) safeLocalStorage.setItem("kq_best_damage_rank", updates.bestDamageRank.toString());
    if (updates.dailyCategoryPt !== undefined) safeLocalStorage.setItem("kq_daily_category_pt", JSON.stringify(updates.dailyCategoryPt));
    if (updates.lastPtEarnDate !== undefined) safeLocalStorage.setItem("kq_last_pt_earn_date", updates.lastPtEarnDate);
    if (updates.prevWeeklyXp !== undefined) safeLocalStorage.setItem("kq_prev_weekly_xp", updates.prevWeeklyXp.toString());
    if (updates.prevWeekString !== undefined) safeLocalStorage.setItem("kq_prev_week", updates.prevWeekString);
    if (updates.prevMonthlyDamage !== undefined) safeLocalStorage.setItem("kq_prev_monthly_damage", updates.prevMonthlyDamage.toString());
    if (updates.prevMonthString !== undefined) safeLocalStorage.setItem("kq_prev_month", updates.prevMonthString);
    if (updates.claimedTranscendentMonths !== undefined) safeLocalStorage.setItem("kq_claimed_transcendent", JSON.stringify(updates.claimedTranscendentMonths));

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("kq_guest_update"));
    }
  },
  getAnswerMode: () => {
    if (typeof window === "undefined") return "4choice";
    return safeLocalStorage.getItem(MODE_KEY) || "4choice";
  },
  setAnswerMode: (mode: "4choice" | "keyboard") => {
    if (typeof window === "undefined") return;
    safeLocalStorage.setItem(MODE_KEY, mode);
  },
  // ふりがなモード：算数・理科・社会の問題文と選択肢をひらがな表示にする（端末ごとの好み設定）。
  getFuriganaMode: () => {
    if (typeof window === "undefined") return false;
    return safeLocalStorage.getItem(FURIGANA_KEY) === "true";
  },
  setFuriganaMode: (on: boolean) => {
    if (typeof window === "undefined") return;
    safeLocalStorage.setItem(FURIGANA_KEY, on ? "true" : "false");
  },
  getMathSkills: () => {
    if (typeof window === "undefined") return null;
    const stored = safeLocalStorage.getItem(MATH_SKILLS_KEY);
    return stored ? JSON.parse(stored) : null;
  },
  setMathSkills: (skills: string[]) => {
    if (typeof window === "undefined") return;
    safeLocalStorage.setItem(MATH_SKILLS_KEY, JSON.stringify(skills));
  },
  getScienceCategories: () => {
    if (typeof window === "undefined") return null;
    const stored = safeLocalStorage.getItem("kq_science_cats");
    return stored ? JSON.parse(stored) : null;
  },
  setScienceCategories: (cats: string[]) => {
    if (typeof window === "undefined") return;
    safeLocalStorage.setItem("kq_science_cats", JSON.stringify(cats));
  },
  getSocialCategories: () => {
    if (typeof window === "undefined") return null;
    const stored = safeLocalStorage.getItem("kq_social_cats");
    return stored ? JSON.parse(stored) : null;
  },
  setSocialCategories: (cats: string[]) => {
    if (typeof window === "undefined") return;
    safeLocalStorage.setItem("kq_social_cats", JSON.stringify(cats));
  }
};
