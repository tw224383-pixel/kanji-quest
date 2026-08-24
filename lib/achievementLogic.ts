import { UserData } from "../contexts/UserContext";
import { calculateAdventurerStats } from "./userStatsLogic";

export interface AchievementItem {
  id: string;
  name: string;
  desc: string;
  icon: string;
  rewardPt: number;
  rewardSp: number;
  rewardTitle?: string;
  unlocked: boolean;
  category: "growth" | "login" | "xp" | "pt" | "raid" | "title" | "avatar" | "grade" | "ranking";
}

export type AchievementTabType = "growth" | "raid" | "level" | "pt" | "collection" | "ranking" | "all";

export interface AchievementTabConfig {
  id: AchievementTabType;
  label: string;
  icon: string;
  matchCats: AchievementItem["category"][];
}

export const ACHIEVEMENT_TABS: AchievementTabConfig[] = [
  { id: "growth", label: "成長カルテ", icon: "📊", matchCats: ["growth"] },
  { id: "raid", label: "レイド・学年", icon: "⚔️", matchCats: ["raid", "grade"] },
  { id: "level", label: "レベル・ログイン", icon: "🔰", matchCats: ["xp", "login"] },
  { id: "pt", label: "PT・SPポイント", icon: "🪙", matchCats: ["pt"] },
  { id: "collection", label: "コレクション", icon: "👑", matchCats: ["title", "avatar"] },
  { id: "ranking", label: "ランキング", icon: "🥇", matchCats: ["ranking"] },
  { id: "all", label: "すべて", icon: "🌟", matchCats: ["growth", "raid", "grade", "xp", "login", "pt", "title", "avatar", "ranking"] },
];

/**
 * ユーザーデータとボスレベルに基づき全実績リストと解放状態を算出
 */
export function getAchievements(userData: UserData, gradeBossLevel: number = 1): AchievementItem[] {
  if (!userData) return [];

  const titleCount = userData.titles?.length || 0;
  const avatarCount = userData.avatars?.length || 0;
  const bossesKilled = Math.max(0, gradeBossLevel - 1);
  const loginStreak = userData.loginStreak || 1;

  // Calculate Adventurer Stats & Growth Levels
  const { stats, averageLevel } = calculateAdventurerStats(userData);
  const kanjiLevel = stats.find(s => s.key === "kanji")?.level || 1;
  const calcLevel = stats.find(s => s.key === "calc")?.level || 1;
  const logicLevel = stats.find(s => s.key === "logic")?.level || 1;
  const geomLevel = stats.find(s => s.key === "geometry")?.level || 1;
  const sciLevel = stats.find(s => s.key === "science")?.level || 1;
  const socLevel = stats.find(s => s.key === "social")?.level || 1;
  const totalSolvedCount = stats.reduce((acc, s) => acc + s.totalSolved, 0);

  return [
    // ==========================================
    // 📊 成長カルテ・能力育成実績 (Growth Milestones)
    // ==========================================
    // --- 総合カルテ・平均レベル ---
    { id: "growth_avg_5", name: "冒険者の第一歩", desc: "成長カルテの平均レベルが Lv.5 に到達！", icon: "🌱", rewardPt: 500, rewardSp: 200, rewardTitle: "ひよっこ冒険者", unlocked: averageLevel >= 5, category: "growth" },
    { id: "growth_avg_10", name: "一人前の冒険者", desc: "成長カルテの平均レベルが Lv.10 に到達！", icon: "⚔️", rewardPt: 1200, rewardSp: 500, rewardTitle: "熟練の探究者", unlocked: averageLevel >= 10, category: "growth" },
    { id: "growth_avg_20", name: "文武両道の勇士", desc: "成長カルテの平均レベルが Lv.20 に到達！", icon: "🛡️", rewardPt: 2500, rewardSp: 1000, rewardTitle: "万能の知恵者", unlocked: averageLevel >= 20, category: "growth" },
    { id: "growth_avg_35", name: "博学の英雄", desc: "成長カルテの平均レベルが Lv.35 に到達！", icon: "👑", rewardPt: 5000, rewardSp: 2000, rewardTitle: "大賢者", unlocked: averageLevel >= 35, category: "growth" },
    { id: "growth_avg_50", name: "全知全能の覇者", desc: "成長カルテの平均レベルが Lv.50 に到達！", icon: "🌟", rewardPt: 10000, rewardSp: 4000, rewardTitle: "神域の賢王", unlocked: averageLevel >= 50, category: "growth" },
    { id: "growth_avg_99", name: "カルテ・ゴッド", desc: "成長カルテの全分野が Lv.99（極致）に到達！", icon: "🏆", rewardPt: 50000, rewardSp: 20000, rewardTitle: "創世の神", unlocked: averageLevel >= 99, category: "growth" },

    // --- 分野別レベルアップ実績 ---
    // 漢字
    { id: "growth_kanji_10", name: "漢字の読み巧者", desc: "漢字・語彙力レベルが Lv.10 に到達！", icon: "📖", rewardPt: 600, rewardSp: 250, unlocked: kanjiLevel >= 10, category: "growth" },
    { id: "growth_kanji_30", name: "語彙の達人", desc: "漢字・語彙力レベルが Lv.30 に到達！", icon: "📚", rewardPt: 2000, rewardSp: 800, rewardTitle: "語彙の達人", unlocked: kanjiLevel >= 30, category: "growth" },
    { id: "growth_kanji_50", name: "漢字マスター", desc: "漢字・語彙力レベルが Lv.50 に到達！", icon: "📜", rewardPt: 5000, rewardSp: 2000, rewardTitle: "漢字マスター", unlocked: kanjiLevel >= 50, category: "growth" },
    { id: "growth_kanji_99", name: "言霊の神", desc: "漢字・語彙力レベルが Lv.99 に到達！", icon: "✒️", rewardPt: 15000, rewardSp: 6000, rewardTitle: "言霊の神", unlocked: kanjiLevel >= 99, category: "growth" },

    // 計算
    { id: "growth_calc_10", name: "電光石火のそろばん", desc: "計算スピードレベルが Lv.10 に到達！", icon: "⚡", rewardPt: 600, rewardSp: 250, unlocked: calcLevel >= 10, category: "growth" },
    { id: "growth_calc_30", name: "神速の計算機", desc: "計算スピードレベルが Lv.30 に到達！", icon: "🔢", rewardPt: 2000, rewardSp: 800, rewardTitle: "神速の計算機", unlocked: calcLevel >= 30, category: "growth" },
    { id: "growth_calc_50", name: "光速の数学者", desc: "計算スピードレベルが Lv.50 に到達！", icon: "💫", rewardPt: 5000, rewardSp: 2000, rewardTitle: "光速の数学者", unlocked: calcLevel >= 50, category: "growth" },
    { id: "growth_calc_99", name: "数理の神童", desc: "計算スピードレベルが Lv.99 に到達！", icon: "⚛️", rewardPt: 15000, rewardSp: 6000, rewardTitle: "数理の神童", unlocked: calcLevel >= 99, category: "growth" },

    // 思考力
    { id: "growth_logic_10", name: "ひらめきの新星", desc: "論理・思考力レベルが Lv.10 に到達！", icon: "🧠", rewardPt: 600, rewardSp: 250, unlocked: logicLevel >= 10, category: "growth" },
    { id: "growth_logic_30", name: "名探偵の直感", desc: "論理・思考力レベルが Lv.30 に到達！", icon: "🔍", rewardPt: 2000, rewardSp: 800, rewardTitle: "名探偵", unlocked: logicLevel >= 30, category: "growth" },
    { id: "growth_logic_50", name: "論理の巨匠", desc: "論理・思考力レベルが Lv.50 に到達！", icon: "💡", rewardPt: 5000, rewardSp: 2000, rewardTitle: "論理の巨匠", unlocked: logicLevel >= 50, category: "growth" },
    { id: "growth_logic_99", name: "全知の知略王", desc: "論理・思考力レベルが Lv.99 に到達！", icon: "♟️", rewardPt: 15000, rewardSp: 6000, rewardTitle: "知略王", unlocked: logicLevel >= 99, category: "growth" },

    // 図形・単位
    { id: "growth_geom_10", name: "幾何の旅人", desc: "空間・図形・単位レベルが Lv.10 に到達！", icon: "📐", rewardPt: 600, rewardSp: 250, unlocked: geomLevel >= 10, category: "growth" },
    { id: "growth_geom_30", name: "空間のマエストロ", desc: "空間・図形・単位レベルが Lv.30 に到達！", icon: "📏", rewardPt: 2000, rewardSp: 800, rewardTitle: "空間のマエストロ", unlocked: geomLevel >= 30, category: "growth" },
    { id: "growth_geom_50", name: "次元の超越者", desc: "空間・図形・単位レベルが Lv.50 に到達！", icon: "🧊", rewardPt: 5000, rewardSp: 2000, rewardTitle: "次元の超越者", unlocked: geomLevel >= 50, category: "growth" },
    { id: "growth_geom_99", name: "時空の統治者", desc: "空間・図形・単位レベルが Lv.99 に到達！", icon: "🌌", rewardPt: 15000, rewardSp: 6000, rewardTitle: "時空の統治者", unlocked: geomLevel >= 99, category: "growth" },

    // 理科
    { id: "growth_sci_10", name: "リトル・ニュートン", desc: "科学探究レベルが Lv.10 に到達！", icon: "🔬", rewardPt: 600, rewardSp: 250, unlocked: sciLevel >= 10, category: "growth" },
    { id: "growth_sci_30", name: "自然の探究者", desc: "科学探究レベルが Lv.30 に到達！", icon: "🧪", rewardPt: 2000, rewardSp: 800, rewardTitle: "自然の探究者", unlocked: sciLevel >= 30, category: "growth" },
    { id: "growth_sci_50", name: "大科学者", desc: "科学探究レベルが Lv.50 に到達！", icon: "🔭", rewardPt: 5000, rewardSp: 2000, rewardTitle: "大科学者", unlocked: sciLevel >= 50, category: "growth" },
    { id: "growth_sci_99", name: "万物の理を識る者", desc: "科学探究レベルが Lv.99 に到達！", icon: "🌠", rewardPt: 15000, rewardSp: 6000, rewardTitle: "万物の理を識る者", unlocked: sciLevel >= 99, category: "growth" },

    // 社会
    { id: "growth_soc_10", name: "小さな歴史家", desc: "社会理解レベルが Lv.10 に到達！", icon: "🗺️", rewardPt: 600, rewardSp: 250, unlocked: socLevel >= 10, category: "growth" },
    { id: "growth_soc_30", name: "天下布武の志", desc: "社会理解レベルが Lv.30 に到達！", icon: "🏯", rewardPt: 2000, rewardSp: 800, rewardTitle: "天下人", unlocked: socLevel >= 30, category: "growth" },
    { id: "growth_soc_50", name: "地球儀を回す者", desc: "社会理解レベルが Lv.50 に到達！", icon: "🌍", rewardPt: 5000, rewardSp: 2000, rewardTitle: "世界探検家", unlocked: socLevel >= 50, category: "growth" },
    { id: "growth_soc_99", name: "歴史を創りし者", desc: "社会理解レベルが Lv.99 に到達！", icon: "👑", rewardPt: 15000, rewardSp: 6000, rewardTitle: "歴史を創りし者", unlocked: socLevel >= 99, category: "growth" },

    // --- 累計解法数（鍛錬）---
    { id: "growth_solve_50", name: "修練の第一歩", desc: "カルテ累計50問正解を達成！", icon: "🎯", rewardPt: 1000, rewardSp: 400, unlocked: totalSolvedCount >= 50, category: "growth" },
    { id: "growth_solve_200", name: "鍛錬の結晶", desc: "カルテ累計200問正解を達成！", icon: "💎", rewardPt: 3000, rewardSp: 1200, unlocked: totalSolvedCount >= 200, category: "growth" },
    { id: "growth_solve_500", name: "百錬成鋼の勇士", desc: "カルテ累計500問正解を達成！", icon: "🔥", rewardPt: 8000, rewardSp: 3500, rewardTitle: "百錬成鋼", unlocked: totalSolvedCount >= 500, category: "growth" },
    { id: "growth_solve_1000", name: "千問ノ極致", desc: "カルテ累計1000問正解を達成！", icon: "🎖️", rewardPt: 20000, rewardSp: 8000, rewardTitle: "千問ノ覇者", unlocked: totalSolvedCount >= 1000, category: "growth" },

    // ==========================================
    // 連続ログイン (Login Streak)
    // ==========================================
    { id: "login_1", name: "継続は力なり", desc: "2日連続でログインする", icon: "🔥", rewardPt: 200, rewardSp: 100, unlocked: loginStreak >= 2, category: "login" },
    { id: "login_2", name: "習慣化の第一歩", desc: "3日連続でログインする", icon: "✨", rewardPt: 500, rewardSp: 200, unlocked: loginStreak >= 3, category: "login" },
    { id: "login_3", name: "一週間の継続者", desc: "7日連続でログインする", icon: "🌟", rewardPt: 1500, rewardSp: 500, unlocked: loginStreak >= 7, category: "login" },
    { id: "login_4", name: "努力の鉄人", desc: "14日連続でログインする", icon: "🛡️", rewardPt: 3000, rewardSp: 1000, unlocked: loginStreak >= 14, category: "login" },
    { id: "login_5", name: "伝説の全勤賞", desc: "30日連続でログインする", icon: "🏆", rewardPt: 10000, rewardSp: 3000, unlocked: loginStreak >= 30, category: "login" },

    // ==========================================
    // XP (Levels)
    // ==========================================
    { id: "xp_1", name: "はじめての冒険", desc: "XPを少しでも稼ぐ", icon: "🔰", rewardPt: 100, rewardSp: 50, unlocked: userData.xp > 0, category: "xp" },
    { id: "xp_2", name: "見習い卒業", desc: "レベル5到達 (XP 400)", icon: "🌱", rewardPt: 300, rewardSp: 100, unlocked: userData.xp >= 400, category: "xp" },
    { id: "xp_3", name: "一人前の勇者", desc: "レベル10到達 (XP 1,000)", icon: "⚔️", rewardPt: 500, rewardSp: 200, unlocked: userData.xp >= 1000, category: "xp" },
    { id: "xp_4", name: "ベテラン勇者", desc: "レベル30到達 (XP 9,000)", icon: "🛡️", rewardPt: 2000, rewardSp: 500, unlocked: userData.xp >= 9000, category: "xp" },
    { id: "xp_5", name: "伝説の勇者", desc: "レベル100到達 (XP 100,000)", icon: "👑", rewardPt: 10000, rewardSp: 2000, unlocked: userData.xp >= 100000, category: "xp" },
    { id: "xp_6", name: "神話の勇者", desc: "レベル200到達 (XP 400,000)", icon: "✨", rewardPt: 30000, rewardSp: 5000, unlocked: userData.xp >= 400000, category: "xp" },

    // ==========================================
    // PT (Money)
    // ==========================================
    { id: "pt_1", name: "おこづかいゲット", desc: "100 PT以上稼ぐ", icon: "🪙", rewardPt: 100, rewardSp: 50, unlocked: userData.pt >= 100, category: "pt" },
    { id: "pt_2", name: "貯金箱がいっぱい", desc: "1,000 PT以上稼ぐ", icon: "👛", rewardPt: 500, rewardSp: 200, unlocked: userData.pt >= 1000, category: "pt" },
    { id: "pt_3", name: "お金持ち", desc: "5,000 PT以上稼ぐ", icon: "💴", rewardPt: 2000, rewardSp: 500, unlocked: userData.pt >= 5000, category: "pt" },
    { id: "pt_4", name: "大富豪", desc: "10,000 PT以上稼ぐ", icon: "💰", rewardPt: 5000, rewardSp: 1000, unlocked: userData.pt >= 10000, category: "pt" },
    { id: "pt_5", name: "億万長者", desc: "50,000 PT以上稼ぐ", icon: "🏦", rewardPt: 20000, rewardSp: 5000, unlocked: userData.pt >= 50000, category: "pt" },

    // ==========================================
    // SP (Science & Social Research Points)
    // ==========================================
    { id: "sp_1", name: "探究の芽生え", desc: "100 SP以上稼ぐ", icon: "🧪", rewardPt: 100, rewardSp: 50, unlocked: (userData.sp || 0) >= 100, category: "pt" },
    { id: "sp_2", name: "研究者の心得", desc: "500 SP以上稼ぐ", icon: "🔬", rewardPt: 300, rewardSp: 150, unlocked: (userData.sp || 0) >= 500, category: "pt" },
    { id: "sp_3", name: "知識の泉", desc: "1,500 SP以上稼ぐ", icon: "💧", rewardPt: 1000, rewardSp: 400, unlocked: (userData.sp || 0) >= 1500, category: "pt" },
    { id: "sp_4", name: "学会のエース", desc: "5,000 SP以上稼ぐ", icon: "🔭", rewardPt: 3000, rewardSp: 1200, rewardTitle: "知識の探求者", unlocked: (userData.sp || 0) >= 5000, category: "pt" },
    { id: "sp_5", name: "理科社会の泰斗", desc: "10,000 SP以上稼ぐ", icon: "🌠", rewardPt: 8000, rewardSp: 3000, rewardTitle: "叡智の巨星", unlocked: (userData.sp || 0) >= 10000, category: "pt" },
    { id: "sp_6", name: "万象を識る賢人", desc: "30,000 SP以上稼ぐ", icon: "🌌", rewardPt: 20000, rewardSp: 8000, rewardTitle: "森羅万象", unlocked: (userData.sp || 0) >= 30000, category: "pt" },

    // ==========================================
    // Damage & Raids
    // ==========================================
    { id: "dmg_1", name: "はじめての貢献", desc: "レイドボスにダメージを与える", icon: "💥", rewardPt: 200, rewardSp: 100, unlocked: (userData.totalDamage || 0) > 0, category: "raid" },
    { id: "raid_1", name: "スライムキラー", desc: "Lv1 レイドボス討伐", icon: "💧", rewardPt: 300, rewardSp: 150, unlocked: (userData.titles || []).includes("Lv1討伐隊"), category: "raid" },
    { id: "raid_3", name: "ウルフハンター", desc: "Lv3 レイドボス討伐", icon: "🐺", rewardPt: 500, rewardSp: 250, unlocked: (userData.titles || []).includes("Lv3討伐隊"), category: "raid" },
    { id: "raid_5", name: "猛禽の天敵", desc: "Lv5 レイドボス討伐", icon: "🦅", rewardPt: 1000, rewardSp: 500, unlocked: (userData.titles || []).includes("Lv5討伐隊"), category: "raid" },
    { id: "raid_7", name: "海からの生還", desc: "Lv7 レイドボス討伐", icon: "🦑", rewardPt: 2000, rewardSp: 1000, unlocked: (userData.titles || []).includes("Lv7討伐隊"), category: "raid" },
    { id: "raid_10", name: "伝説の救世主", desc: "Lv10 レイドボス討伐", icon: "🐉", rewardPt: 5000, rewardSp: 2500, unlocked: (userData.titles || []).includes("Lv10討伐隊"), category: "raid" },
    { id: "dmg_3", name: "レイドの英雄", desc: "ボスに累計10,000ダメージ", icon: "🦸", rewardPt: 2000, rewardSp: 800, unlocked: (userData.totalDamage || 0) >= 10000, category: "raid" },
    { id: "dmg_4", name: "伝説のドラゴンスレイヤー", desc: "ボスに累計50,000ダメージ", icon: "🗡️", rewardPt: 5000, rewardSp: 2000, unlocked: (userData.totalDamage || 0) >= 50000, category: "raid" },
    { id: "dmg_5", name: "救世主", desc: "ボスに累計100,000ダメージ", icon: "🌟", rewardPt: 10000, rewardSp: 4000, unlocked: (userData.totalDamage || 0) >= 100000, category: "raid" },

    // ==========================================
    // Titles
    // ==========================================
    { id: "title_1", name: "駆け出しの冒険者", desc: "称号を1つ集める", icon: "📛", rewardPt: 100, rewardSp: 50, unlocked: titleCount >= 1, category: "title" },
    { id: "title_2", name: "名乗りを上げる者", desc: "称号を3つ集める", icon: "📜", rewardPt: 300, rewardSp: 100, unlocked: titleCount >= 3, category: "title" },
    { id: "title_3", name: "称号コレクター", desc: "称号を5つ集める", icon: "🏆", rewardPt: 800, rewardSp: 300, unlocked: titleCount >= 5, category: "title" },
    { id: "title_4", name: "言葉の魔術師", desc: "称号を10つ集める", icon: "🎩", rewardPt: 2000, rewardSp: 800, unlocked: titleCount >= 10, category: "title" },

    // ==========================================
    // Avatars
    // ==========================================
    { id: "avatar_1", name: "おしゃれ好き", desc: "アバターを1つ集める", icon: "👕", rewardPt: 100, rewardSp: 50, unlocked: avatarCount >= 1, category: "avatar" },
    { id: "avatar_2", name: "変装マスター", desc: "アバターを5つ集める", icon: "🎭", rewardPt: 500, rewardSp: 200, unlocked: avatarCount >= 5, category: "avatar" },
    { id: "avatar_3", name: "アバターコレクター", desc: "アバターを10つ集める", icon: "🧑‍🎤", rewardPt: 1500, rewardSp: 500, unlocked: avatarCount >= 10, category: "avatar" },
    { id: "avatar_4", name: "百面相", desc: "アバターを20つ集める", icon: "👽", rewardPt: 5000, rewardSp: 1500, unlocked: avatarCount >= 20, category: "avatar" },

    // ==========================================
    // Grade
    // ==========================================
    { id: "g_first_kill", name: "はじめての勝利", desc: "学年全体でレイドボスを1体たおした！", icon: "🎉", rewardPt: 500, rewardSp: 200, unlocked: bossesKilled >= 1, category: "grade" },
    { id: "g_ten_kills", name: "ボスキラー軍団", desc: "学年全体でレイドボスを10体たおした！", icon: "🔥", rewardPt: 2000, rewardSp: 1000, unlocked: bossesKilled >= 10, category: "grade" },

    // ==========================================
    // 🥇 ランキング（ランキング画面で観測した自己ベスト順位）
    // ==========================================
    { id: "rank_hero_10", name: "学年の実力者", desc: "週間ヒーローランキングで学年TOP10入り！", icon: "🥉", rewardPt: 300, rewardSp: 150, unlocked: !!userData.bestWeeklyHeroRank && userData.bestWeeklyHeroRank <= 10, category: "ranking" },
    { id: "rank_hero_5", name: "学年の有力者", desc: "週間ヒーローランキングで学年TOP5入り！", icon: "🎖️", rewardPt: 800, rewardSp: 350, unlocked: !!userData.bestWeeklyHeroRank && userData.bestWeeklyHeroRank <= 5, category: "ranking" },
    { id: "rank_hero_3", name: "学年の表彰台", desc: "週間ヒーローランキングで学年TOP3入り！", icon: "🏅", rewardPt: 1500, rewardSp: 600, rewardTitle: "学年の実力者", unlocked: !!userData.bestWeeklyHeroRank && userData.bestWeeklyHeroRank <= 3, category: "ranking" },
    { id: "rank_hero_2", name: "学年の準王者", desc: "週間ヒーローランキングで学年2位を獲得！", icon: "🥈", rewardPt: 3000, rewardSp: 1200, rewardTitle: "学年の準王者", unlocked: !!userData.bestWeeklyHeroRank && userData.bestWeeklyHeroRank <= 2, category: "ranking" },
    { id: "rank_hero_1", name: "週間チャンピオン", desc: "週間ヒーローランキングで学年1位を獲得！", icon: "🥇", rewardPt: 6000, rewardSp: 2500, rewardTitle: "週間チャンピオン", unlocked: userData.bestWeeklyHeroRank === 1, category: "ranking" },

    { id: "rank_dmg_5", name: "全国区の勇者", desc: "全学年ダメージランキング（全校でたった5枠）にランクイン！", icon: "💥", rewardPt: 8000, rewardSp: 3000, rewardTitle: "全国区の勇者", unlocked: !!userData.bestDamageRank && userData.bestDamageRank <= 5, category: "ranking" },
    { id: "rank_dmg_3", name: "全学年の覇者", desc: "全学年ダメージランキングで表彰台（TOP3）入り！", icon: "🔥", rewardPt: 15000, rewardSp: 6000, rewardTitle: "全学年の覇者", unlocked: !!userData.bestDamageRank && userData.bestDamageRank <= 3, category: "ranking" },
    { id: "rank_dmg_2", name: "全学年の準王者", desc: "全学年ダメージランキングで2位を獲得！", icon: "⚡", rewardPt: 25000, rewardSp: 9000, rewardTitle: "全学年の準王者", unlocked: !!userData.bestDamageRank && userData.bestDamageRank <= 2, category: "ranking" },
    { id: "rank_dmg_1", name: "不動の絶対王者", desc: "全学年ダメージランキングで堂々の1位を獲得！", icon: "👑", rewardPt: 40000, rewardSp: 15000, rewardTitle: "絶対王者", unlocked: userData.bestDamageRank === 1, category: "ranking" },

    { id: "rank_double_crown", name: "二冠の伝説", desc: "週間ヒーロー1位と全学年ダメージTOP5、その両方を成し遂げた！", icon: "🌈", rewardPt: 50000, rewardSp: 20000, rewardTitle: "二冠の伝説", unlocked: userData.bestWeeklyHeroRank === 1 && !!userData.bestDamageRank && userData.bestDamageRank <= 5, category: "ranking" },
  ];
}

/**
 * 未受け取り（解放済み）の実績アイテム一覧を取得
 */
export function getClaimableAchievements(userData: UserData, gradeBossLevel: number = 1): AchievementItem[] {
  if (!userData) return [];
  const claimed = userData.claimedAchievements || [];
  const all = getAchievements(userData, gradeBossLevel);
  return all.filter(a => a.unlocked && !claimed.includes(a.id));
}

/**
 * 未受け取り（解放済み）の実績件数を取得
 */
export function getUnclaimedAchievementsCount(userData: UserData, gradeBossLevel: number = 1): number {
  return getClaimableAchievements(userData, gradeBossLevel).length;
}

/**
 * 未受け取りの実績があるかどうかを判定（赤い点バッジ表示用）
 */
export function hasUnclaimedAchievements(userData: UserData, gradeBossLevel: number = 1): boolean {
  return getUnclaimedAchievementsCount(userData, gradeBossLevel) > 0;
}
