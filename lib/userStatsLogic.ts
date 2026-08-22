import { UserData } from "../contexts/UserContext";
import { getAllKanji } from "./kanjiData";
import { SCIENCE_QUESTIONS } from "./scienceData";
import { SOCIAL_QUESTIONS } from "./socialData";

export type StatCategoryKey = 'kanji' | 'calc' | 'logic' | 'geometry' | 'science' | 'social';

export type SkillStat = {
  key: StatCategoryKey;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  bgGradient: string;
  description: string;
  value: number;       // 0 to 100 (for radar chart scale)
  level: number;       // 1 to 99
  rank: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  totalSolved: number; // Total questions solved in this category (0 to 500+)
  targetMaxSolved: number; // 500 questions = Lv.99
  currentExp: number;  // Questions solved in current level
  nextExp: number;     // Total questions needed to advance from current level to next
  questionsToNextLevel: number; // Remaining questions needed for next level-up
  progressPercent: number; // Overall progress towards 500 questions
  trainingUrl: string;
  trainingLabel: string;
};

export type AdventurerArchetype = {
  title: string;
  subTitle: string;
  icon: string;
  description: string;
  primaryColor: string;
};

/**
 * Cumulative questions required to reach a specific level (1 to 99).
 * Total questions across all 98 level-ups is exactly 500.
 */
export function getCumulativeQuestionsForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level >= 99) return 500;
  // Progressive curve: early levels take ~1-3 questions, mid levels ~4-6, high levels ~7-8
  return Math.round(500 * Math.pow((level - 1) / 98, 1.35));
}

/**
 * Calculates level info given the total number of correctly answered questions.
 */
export function calculateLevelFromQuestions(totalSolved: number): {
  level: number;
  currentExp: number;
  nextExp: number;
  questionsToNextLevel: number;
  statValue: number;
  rank: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  progressPercent: number;
} {
  const q = Math.max(0, totalSolved);
  let level = 1;

  for (let l = 1; l <= 99; l++) {
    if (q >= getCumulativeQuestionsForLevel(l)) {
      level = l;
    } else {
      break;
    }
  }

  const statValue = Math.min(100, Math.max(8, Math.round((level / 99) * 100)));
  const progressPercent = Math.min(100, Math.round((q / 500) * 100));

  let rank: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (level >= 90) rank = 'S+';
  else if (level >= 75) rank = 'S';
  else if (level >= 55) rank = 'A';
  else if (level >= 35) rank = 'B';
  else if (level >= 20) rank = 'C';
  else if (level >= 10) rank = 'D';

  if (level >= 99) {
    return {
      level: 99,
      currentExp: 500,
      nextExp: 500,
      questionsToNextLevel: 0,
      statValue: 100,
      rank: 'S+',
      progressPercent: 100
    };
  }

  const curBase = getCumulativeQuestionsForLevel(level);
  const nextBase = getCumulativeQuestionsForLevel(level + 1);
  const nextExp = Math.max(1, nextBase - curBase);
  const currentExp = Math.max(0, q - curBase);
  const questionsToNextLevel = Math.max(1, nextExp - currentExp);

  return {
    level,
    currentExp,
    nextExp,
    questionsToNextLevel,
    statValue,
    rank,
    progressPercent
  };
}

export function calculateAdventurerStats(userData: UserData | null): {
  stats: SkillStat[];
  archetype: AdventurerArchetype;
  totalPower: number;
  averageLevel: number;
} {
  const allKanji = getAllKanji();

  const masteredSet = new Set(userData?.masteredIds || []);
  const grade = userData?.grade || 1;
  const totalXp = userData?.xp || 0;
  const totalPt = userData?.pt || 0;
  const totalSp = userData?.sp || 0;
  const totalDamage = userData?.totalDamage || 0;

  // Category solved counts (strictly based on actual questions answered correctly)
  const catSolved = userData?.categorySolved || {};
  const masteredKanjiCount = allKanji.filter(k => masteredSet.has(k.kanji)).length;
  const scienceMasteredCount = SCIENCE_QUESTIONS.filter(q => masteredSet.has(q.id)).length;
  const socialMasteredCount = SOCIAL_QUESTIONS.filter(q => masteredSet.has(q.id)).length;
  const mathMasteredCount = Array.from(masteredSet).filter(id => id.startsWith("math_") || id.startsWith("g")).length;

  const kanjiSolved = Math.min(500, Math.max(catSolved.kanji || 0, masteredKanjiCount));
  const calcSolved = Math.min(500, Math.max(catSolved.calc || 0, mathMasteredCount));
  const logicSolved = Math.min(500, catSolved.logic || 0);
  const geomSolved = Math.min(500, catSolved.geometry || 0);
  const scienceSolved = Math.min(500, Math.max(catSolved.science || 0, scienceMasteredCount));
  const socialSolved = Math.min(500, Math.max(catSolved.social || 0, socialMasteredCount));

  const statConfigs: {
    key: StatCategoryKey;
    name: string;
    shortName: string;
    icon: string;
    color: string;
    bgGradient: string;
    description: string;
    solved: number;
    trainingUrl: string;
    trainingLabel: string;
  }[] = [
    {
      key: 'kanji',
      name: '漢字・語彙力',
      shortName: '漢字',
      icon: '📖',
      color: '#3b82f6',
      bgGradient: 'from-blue-500 to-indigo-600',
      description: '全学年の漢字の読み書き・部首の総合力',
      solved: kanjiSolved,
      trainingUrl: `/game?subject=kanji&grades=${grade}&count=5&training=true`,
      trainingLabel: '漢字をとっくん'
    },
    {
      key: 'calc',
      name: '計算スピード',
      shortName: '計算',
      icon: '⚡',
      color: '#f59e0b',
      bgGradient: 'from-amber-500 to-yellow-600',
      description: '四則演算・九九の正確性と瞬発力',
      solved: calcSolved,
      trainingUrl: `/game?subject=math&category=calc&grade=${grade}&count=5&training=true`,
      trainingLabel: '計算をとっくん'
    },
    {
      key: 'logic',
      name: '論理・思考力',
      shortName: '思考力',
      icon: '🧠',
      color: '#a855f7',
      bgGradient: 'from-purple-500 to-fuchsia-600',
      description: '文章題や規則性を読み解く応用思考力',
      solved: logicSolved,
      trainingUrl: `/game?subject=math&category=logic&grade=${grade}&count=5&training=true`,
      trainingLabel: '思考力をとっくん'
    },
    {
      key: 'geometry',
      name: '空間・図形・単位',
      shortName: '図形・単位',
      icon: '📐',
      color: '#10b981',
      bgGradient: 'from-emerald-500 to-teal-600',
      description: '図形の性質・角度・単位換算の空間認識力',
      solved: geomSolved,
      trainingUrl: `/game?subject=math&category=geometry&grade=${grade}&count=5&training=true`,
      trainingLabel: '図形をとっくん'
    },
    {
      key: 'science',
      name: '科学探究・観察',
      shortName: grade <= 2 ? '生活（理科）' : '理科',
      icon: '🔬',
      color: '#06b6d4',
      bgGradient: 'from-cyan-500 to-blue-600',
      description: grade <= 2 ? '自然・いきもの・きせつの探究力（小1・小2生活）' : '生物・自然・地球・物理化学の探究力',
      solved: scienceSolved,
      trainingUrl: `/game?subject=science&grades=${grade}&count=5&training=true`,
      trainingLabel: grade <= 2 ? '生活（理科）をとっくん' : '理科をとっくん'
    },
    {
      key: 'social',
      name: '社会理解・歴史地理',
      shortName: grade <= 2 ? '生活（社会）' : '社会',
      icon: '🗺️',
      color: '#ec4899',
      bgGradient: 'from-pink-500 to-rose-600',
      description: grade <= 2 ? 'がっこう・まち・ルールの社会理解力（小1・小2生活）' : '日本の地理・歴史人物・産業・社会の仕組み',
      solved: socialSolved,
      trainingUrl: `/game?subject=social&grades=${grade}&count=5&training=true`,
      trainingLabel: grade <= 2 ? '生活（社会）をとっくん' : '社会をとっくん'
    }
  ];

  const stats: SkillStat[] = statConfigs.map(c => {
    const info = calculateLevelFromQuestions(c.solved);
    return {
      key: c.key,
      name: c.name,
      shortName: c.shortName,
      icon: c.icon,
      color: c.color,
      bgGradient: c.bgGradient,
      description: c.description,
      value: info.statValue,
      level: info.level,
      rank: info.rank,
      totalSolved: c.solved,
      targetMaxSolved: 500,
      currentExp: info.currentExp,
      nextExp: info.nextExp,
      questionsToNextLevel: info.questionsToNextLevel,
      progressPercent: info.progressPercent,
      trainingUrl: c.trainingUrl,
      trainingLabel: c.trainingLabel
    };
  });

  // Determine Archetype
  const sortedStats = [...stats].sort((a, b) => b.level - a.level);
  const highestStat = sortedStats[0];
  const lowestStat = sortedStats[sortedStats.length - 1];
  const avgLevel = Math.max(1, Math.round(stats.reduce((acc, s) => acc + s.level, 0) / stats.length));
  const totalPower = stats.reduce((acc, s) => acc + s.level, 0) * 10;

  let archetype: AdventurerArchetype;

  if (avgLevel <= 3 && totalXp < 150) {
    archetype = {
      title: '見習い冒険者',
      subTitle: '無限の可能性を秘めた旅人',
      icon: '🌱',
      description: 'これからたくさんの知識を冒険で身につけていく駆け出しの勇者。500問解いてLv.99のマスターを目指そう！',
      primaryColor: 'from-emerald-400 to-teal-600'
    };
  } else if (highestStat.level - lowestStat.level <= 12 && avgLevel >= 30) {
    archetype = {
      title: '万能のマスター勇者',
      subTitle: 'すべての知識を極めし全能者',
      icon: '👑',
      description: '漢字・算数・理科・社会のバランスが完璧に整った、非の打ち所がない最高峰の冒険者。',
      primaryColor: 'from-amber-400 via-yellow-300 to-amber-600'
    };
  } else if (highestStat.key === 'calc') {
    archetype = {
      title: '計算の魔術師',
      subTitle: '電光石火のスピードスター',
      icon: '⚡',
      description: '圧倒的な計算スピードと正確さで問題を瞬時に粉砕する数字のエキスパート。',
      primaryColor: 'from-amber-400 to-yellow-600'
    };
  } else if (highestStat.key === 'kanji') {
    archetype = {
      title: '言霊の賢者',
      subTitle: '漢字と語彙を統べる者',
      icon: '📖',
      description: '豊富な語彙力と漢字知識を持ち、正しい言葉の力で世界を切り拓く知の探究者。',
      primaryColor: 'from-blue-400 to-indigo-600'
    };
  } else if (highestStat.key === 'science') {
    archetype = {
      title: '探究の錬金術師',
      subTitle: '自然界の法則を解き明かす者',
      icon: '🔬',
      description: '生命や宇宙、物質の不思議を観察し、真理を追い求める好奇心あふれるサイエンティスト。',
      primaryColor: 'from-cyan-400 to-blue-600'
    };
  } else if (highestStat.key === 'social') {
    archetype = {
      title: '大地のナビゲーター',
      subTitle: '歴史と世界を俯瞰する旅人',
      icon: '🗺️',
      description: '地理や歴史の流れを深く理解し、社会の仕組みを読み解くグローバルな戦略家。',
      primaryColor: 'from-pink-400 to-rose-600'
    };
  } else if (highestStat.key === 'logic') {
    archetype = {
      title: '智謀のストラテジスト',
      subTitle: '論理の刃で難問を討つ者',
      icon: '🧠',
      description: '複雑な文章題や条件を鋭い論理的思考で解きほぐすブレイン・マスター。',
      primaryColor: 'from-purple-400 to-fuchsia-600'
    };
  } else {
    archetype = {
      title: '幾何学のアーキテクト',
      subTitle: '空間と次元を創り出す者',
      icon: '📐',
      description: '図形や空間の広がりを直感的に把握し、美しい解法を見つけ出す空間の覇者。',
      primaryColor: 'from-emerald-400 to-teal-600'
    };
  }

  return {
    stats,
    archetype,
    totalPower,
    averageLevel: avgLevel
  };
}
