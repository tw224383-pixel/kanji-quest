export function calculateLevel(totalXp: number) {
  const MAX_LEVEL = 300;
  let level = 1;
  let currentXp = totalXp;

  while (level < MAX_LEVEL) {
    let requiredXp = 10;
    if (level >= 100 && level < 200) requiredXp = 20;
    else if (level >= 200) requiredXp = 30;

    if (currentXp >= requiredXp) {
      currentXp -= requiredXp;
      level++;
    } else {
      break;
    }
  }

  let nextLevelXp = 10;
  if (level >= 100 && level < 200) nextLevelXp = 20;
  else if (level >= 200 && level < 300) nextLevelXp = 30;
  else if (level === MAX_LEVEL) nextLevelXp = 0; // Max level

  return {
    level,
    currentLevelXp: level === MAX_LEVEL ? 0 : currentXp,
    nextLevelRequiredXp: nextLevelXp,
    totalXp,
    isMaxLevel: level === MAX_LEVEL,
  };
}

export function getRankColor(level: number): string {
  if (level >= 300) return "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white shadow-lg shadow-purple-500/50";
  if (level >= 250) return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-md shadow-yellow-500/50";
  if (level >= 200) return "bg-purple-100 text-purple-800 border border-purple-300";
  if (level >= 150) return "bg-red-100 text-red-800 border border-red-300";
  if (level >= 100) return "bg-yellow-100 text-yellow-800 border border-yellow-300";
  if (level >= 50) return "bg-blue-100 text-blue-800 border border-blue-300";
  return "bg-gray-100 text-gray-800 border border-gray-300";
}

export function getRankTitle(level: number): string {
  if (level >= 300) return "漢字神";
  if (level >= 250) return "伝説の勇者";
  if (level >= 200) return "大魔導士";
  if (level >= 150) return "熟練の戦士";
  if (level >= 100) return "一人前の冒険者";
  if (level >= 50) return "見習い勇者";
  return "かけだし";
}
