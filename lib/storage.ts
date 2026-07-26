"use client";

// Keys
const GUEST_KEY = "kq_is_guest";
const GUEST_NAME = "kq_guest_name";
const GUEST_GRADE = "kq_guest_grade";
const XP_KEY = "kq_xp";
const PT_KEY = "kq_pt";
const EFFECTS_KEY = "kq_effects";
const MODE_KEY = "kq_answer_mode";

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
    localStorage.removeItem(GUEST_KEY);
    localStorage.removeItem(GUEST_GRADE);
  },
  getGuestData: () => {
    if (typeof window === "undefined") return null;
    return {
      name: localStorage.getItem(GUEST_NAME) || "ゲスト",
      grade: parseInt(localStorage.getItem(GUEST_GRADE) || "1", 10),
      xp: parseInt(localStorage.getItem(XP_KEY) || "0", 10),
      pt: parseInt(localStorage.getItem(PT_KEY) || "0", 10),
      effects: JSON.parse(localStorage.getItem(EFFECTS_KEY) || '["default"]'),
      mistakeIds: JSON.parse(localStorage.getItem("kq_mistakes") || "[]"),
      masteredIds: JSON.parse(localStorage.getItem("kq_mastered") || "[]"),
      titles: JSON.parse(localStorage.getItem("kq_titles") || '["見習い"]'),
      equippedTitle: localStorage.getItem("kq_eq_title") || "見習い",
      avatars: JSON.parse(localStorage.getItem("kq_avatars") || '["👦"]'),
      equippedAvatar: localStorage.getItem("kq_eq_avatar") || "👦",
      theme: localStorage.getItem("kq_theme") || "default",
      equippedEffect: localStorage.getItem("kq_eq_effect") || "",
      totalDamage: parseInt(localStorage.getItem("kq_total_damage") || "0", 10),
    };
  },
  updateGuestData: (updates: any) => {
    if (typeof window === "undefined") return;
    if (updates.xp !== undefined) localStorage.setItem(XP_KEY, updates.xp.toString());
    if (updates.pt !== undefined) localStorage.setItem(PT_KEY, updates.pt.toString());
    if (updates.effects !== undefined) localStorage.setItem(EFFECTS_KEY, JSON.stringify(updates.effects));
    if (updates.mistakeIds !== undefined) localStorage.setItem("kq_mistakes", JSON.stringify(updates.mistakeIds));
    if (updates.masteredIds !== undefined) localStorage.setItem("kq_mastered", JSON.stringify(updates.masteredIds));
    if (updates.titles !== undefined) localStorage.setItem("kq_titles", JSON.stringify(updates.titles));
    if (updates.equippedTitle !== undefined) localStorage.setItem("kq_eq_title", updates.equippedTitle);
    if (updates.avatars !== undefined) localStorage.setItem("kq_avatars", JSON.stringify(updates.avatars));
    if (updates.equippedAvatar !== undefined) localStorage.setItem("kq_eq_avatar", updates.equippedAvatar);
    if (updates.theme !== undefined) localStorage.setItem("kq_theme", updates.theme);
    if (updates.equippedEffect !== undefined) localStorage.setItem("kq_eq_effect", updates.equippedEffect);
    if (updates.totalDamage !== undefined) localStorage.setItem("kq_total_damage", updates.totalDamage.toString());

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
  }
};
