"use client";

// Keys
const GUEST_KEY = "kq_is_guest";
const GUEST_NAME = "kq_guest_name";
const GUEST_GRADE = "kq_guest_grade";
const XP_KEY = "kq_xp";
const PT_KEY = "kq_pt";
const EFFECTS_KEY = "kq_effects";
const MODE_KEY = "kq_answer_mode";
const MATH_SKILLS_KEY = "kq_math_skills";

export const storage = {
  isGuest: () => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(GUEST_KEY) === "true";
  },
  setGuest: (name: string, grade: number) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(GUEST_KEY, "true");
    localStorage.setItem(GUEST_NAME, name);
    localStorage.setItem(GUEST_GRADE, grade.toString());
    // Initialize if not exists
    if (!localStorage.getItem(XP_KEY)) localStorage.setItem(XP_KEY, "0");
    if (!localStorage.getItem(PT_KEY)) localStorage.setItem(PT_KEY, "0");
    if (!localStorage.getItem(EFFECTS_KEY)) localStorage.setItem(EFFECTS_KEY, JSON.stringify(["default"]));
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
    keysToRemove.forEach(k => localStorage.removeItem(k));
  },
  getGuestData: () => {
    if (typeof window === "undefined") return null;
    return {
      name: localStorage.getItem(GUEST_NAME) || "ゲスト",
      grade: parseInt(localStorage.getItem(GUEST_GRADE) || "1", 10),
      xp: parseInt(localStorage.getItem(XP_KEY) || "0", 10),
      pt: parseInt(localStorage.getItem(PT_KEY) || "0", 10),
      sp: parseInt(localStorage.getItem("kq_sp") || "0", 10),
      effects: JSON.parse(localStorage.getItem(EFFECTS_KEY) || '["default"]'),
      mistakeIds: JSON.parse(localStorage.getItem("kq_mistakes") || "[]"),
      masteredIds: JSON.parse(localStorage.getItem("kq_mastered") || "[]"),
      titles: JSON.parse(localStorage.getItem("kq_titles") || '["見習い"]'),
      equippedTitle: localStorage.getItem("kq_eq_title") || "見習い",
      avatars: JSON.parse(localStorage.getItem("kq_avatars") || '["👦"]'),
      equippedAvatar: localStorage.getItem("kq_eq_avatar") || "👦",
      equipments: JSON.parse(localStorage.getItem("kq_equipments") || "[]"),
      equippedEquipment: localStorage.getItem("kq_eq_equipment") || "",
      theme: localStorage.getItem("kq_theme") || "default",
      equippedEffect: localStorage.getItem("kq_eq_effect") || "",
      totalDamage: parseInt(localStorage.getItem("kq_total_damage") || "0", 10),
      weeklyXp: parseInt(localStorage.getItem("kq_weekly_xp") || "0", 10),
      lastWeekString: localStorage.getItem("kq_last_week") || "",
      monthlyDamage: parseInt(localStorage.getItem("kq_monthly_damage") || "0", 10),
      lastMonthString: localStorage.getItem("kq_last_month") || "",
      claimedAchievements: JSON.parse(localStorage.getItem("kq_claimed_achievements") || "[]"),
      lastLoginDate: localStorage.getItem("kq_last_login_date") || "",
      loginStreak: parseInt(localStorage.getItem("kq_login_streak") || "1", 10),
      categorySolved: JSON.parse(localStorage.getItem("kq_category_solved") || "{}"),
      mistakeStages: JSON.parse(localStorage.getItem("kq_mistake_stages") || "{}"),
      mistakeNextReview: JSON.parse(localStorage.getItem("kq_mistake_next_review") || "{}"),
      bestWeeklyHeroRank: localStorage.getItem("kq_best_weekly_hero_rank") ? parseInt(localStorage.getItem("kq_best_weekly_hero_rank")!, 10) : undefined,
      bestDamageRank: localStorage.getItem("kq_best_damage_rank") ? parseInt(localStorage.getItem("kq_best_damage_rank")!, 10) : undefined,
    };
  },
  updateGuestData: (updates: any) => {
    if (typeof window === "undefined") return;
    if (updates.xp !== undefined) localStorage.setItem(XP_KEY, updates.xp.toString());
    if (updates.pt !== undefined) localStorage.setItem(PT_KEY, updates.pt.toString());
    if (updates.sp !== undefined) localStorage.setItem("kq_sp", updates.sp.toString());
    if (updates.effects !== undefined) localStorage.setItem(EFFECTS_KEY, JSON.stringify(updates.effects));
    if (updates.mistakeIds !== undefined) localStorage.setItem("kq_mistakes", JSON.stringify(updates.mistakeIds));
    if (updates.masteredIds !== undefined) localStorage.setItem("kq_mastered", JSON.stringify(updates.masteredIds));
    if (updates.titles !== undefined) localStorage.setItem("kq_titles", JSON.stringify(updates.titles));
    if (updates.equippedTitle !== undefined) localStorage.setItem("kq_eq_title", updates.equippedTitle);
    if (updates.avatars !== undefined) localStorage.setItem("kq_avatars", JSON.stringify(updates.avatars));
    if (updates.equippedAvatar !== undefined) localStorage.setItem("kq_eq_avatar", updates.equippedAvatar);
    if (updates.equipments !== undefined) localStorage.setItem("kq_equipments", JSON.stringify(updates.equipments));
    if (updates.equippedEquipment !== undefined) localStorage.setItem("kq_eq_equipment", updates.equippedEquipment);
    if (updates.theme !== undefined) localStorage.setItem("kq_theme", updates.theme);
    if (updates.equippedEffect !== undefined) localStorage.setItem("kq_eq_effect", updates.equippedEffect);
    if (updates.totalDamage !== undefined) localStorage.setItem("kq_total_damage", updates.totalDamage.toString());
    if (updates.weeklyXp !== undefined) localStorage.setItem("kq_weekly_xp", updates.weeklyXp.toString());
    if (updates.lastWeekString !== undefined) localStorage.setItem("kq_last_week", updates.lastWeekString);
    if (updates.monthlyDamage !== undefined) localStorage.setItem("kq_monthly_damage", updates.monthlyDamage.toString());
    if (updates.lastMonthString !== undefined) localStorage.setItem("kq_last_month", updates.lastMonthString);
    if (updates.claimedAchievements !== undefined) localStorage.setItem("kq_claimed_achievements", JSON.stringify(updates.claimedAchievements));
    if (updates.lastLoginDate !== undefined) localStorage.setItem("kq_last_login_date", updates.lastLoginDate);
    if (updates.loginStreak !== undefined) localStorage.setItem("kq_login_streak", updates.loginStreak.toString());
    if (updates.categorySolved !== undefined) localStorage.setItem("kq_category_solved", JSON.stringify(updates.categorySolved));
    if (updates.mistakeStages !== undefined) localStorage.setItem("kq_mistake_stages", JSON.stringify(updates.mistakeStages));
    if (updates.mistakeNextReview !== undefined) localStorage.setItem("kq_mistake_next_review", JSON.stringify(updates.mistakeNextReview));
    if (updates.bestWeeklyHeroRank !== undefined) localStorage.setItem("kq_best_weekly_hero_rank", updates.bestWeeklyHeroRank.toString());
    if (updates.bestDamageRank !== undefined) localStorage.setItem("kq_best_damage_rank", updates.bestDamageRank.toString());

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("kq_guest_update"));
    }
  },
  getAnswerMode: () => {
    if (typeof window === "undefined") return "4choice";
    return localStorage.getItem(MODE_KEY) || "4choice";
  },
  setAnswerMode: (mode: "4choice" | "keyboard") => {
    if (typeof window === "undefined") return;
    localStorage.setItem(MODE_KEY, mode);
  },
  getMathSkills: () => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(MATH_SKILLS_KEY);
    return stored ? JSON.parse(stored) : null;
  },
  setMathSkills: (skills: string[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(MATH_SKILLS_KEY, JSON.stringify(skills));
  },
  getScienceCategories: () => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("kq_science_cats");
    return stored ? JSON.parse(stored) : null;
  },
  setScienceCategories: (cats: string[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("kq_science_cats", JSON.stringify(cats));
  },
  getSocialCategories: () => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("kq_social_cats");
    return stored ? JSON.parse(stored) : null;
  },
  setSocialCategories: (cats: string[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("kq_social_cats", JSON.stringify(cats));
  }
};
