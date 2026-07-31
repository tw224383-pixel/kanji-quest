export type KanjiQuestion = {
  id: string;
  grade: number;
  word: string;
  okurigana?: string;
  reading: string;
  type: "onyomi" | "kunyomi";
  choices: string[];
};

import rawKanjiData from "./kanji.json";

type RawKanji = {
  kanji: string;
  on: string[];
  kun: string[];
};

type KanjiDataMap = {
  [grade: string]: RawKanji[];
};

const kanjiData: KanjiDataMap = rawKanjiData as KanjiDataMap;

function mapToQuestions(pool: (RawKanji & { grade: number })[], count: number, allOnReadings: string[], allKunReadings: string[]): KanjiQuestion[] {
  const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
  const selected = shuffledPool.slice(0, count);

  return selected.map((k, index) => {
    let type: "onyomi" | "kunyomi" = "onyomi";
    let reading = "";
    let okurigana = "";

    if (k.on.length > 0 && k.kun.length > 0) {
      type = Math.random() > 0.5 ? "onyomi" : "kunyomi";
    } else if (k.kun.length > 0) {
      type = "kunyomi";
    }

    if (type === "onyomi") {
      reading = k.on[Math.floor(Math.random() * k.on.length)];
    } else {
      const rawReading = k.kun[Math.floor(Math.random() * k.kun.length)];
      if (rawReading.includes('.')) {
        const parts = rawReading.split('.');
        reading = parts.join('');
        okurigana = parts[1];
      } else {
        reading = rawReading;
      }
    }

    const targetReadings = type === "onyomi" ? allOnReadings : allKunReadings;
    
    const wrongChoices = new Set<string>();
    while (wrongChoices.size < 3) {
      const randomReading = targetReadings[Math.floor(Math.random() * targetReadings.length)];
      const cleanRandom = randomReading.replace('.', '');
      if (cleanRandom !== reading) {
        wrongChoices.add(cleanRandom);
      }
    }

    const choices = [reading, ...Array.from(wrongChoices)].sort(() => 0.5 - Math.random());

    return {
      id: `${k.grade}-${k.kanji}-${index}`,
      grade: k.grade,
      word: k.kanji,
      okurigana: okurigana || undefined,
      reading,
      type,
      choices,
    };
  });
}

export function getRandomQuestions(grades: number[], count: number = 5): KanjiQuestion[] {
  const validGrades = grades.length > 0 ? grades : [1];
  let pool: (RawKanji & { grade: number })[] = [];
  
  validGrades.forEach(g => {
    const gradeStr = g.toString();
    if (kanjiData[gradeStr]) {
      const withGrade = kanjiData[gradeStr].map(k => ({ ...k, grade: g }));
      pool = pool.concat(withGrade);
    }
  });

  if (pool.length === 0) {
    pool = kanjiData["1"].map(k => ({ ...k, grade: 1 }));
  }
  
  const allOnReadings = pool.flatMap(k => k.on).filter(Boolean);
  const allKunReadings = pool.flatMap(k => k.kun).filter(Boolean);

  return mapToQuestions(pool, count, allOnReadings, allKunReadings);
}

export function getRevengeQuestions(mistakeIds: string[], count: number = 5): KanjiQuestion[] {
  let pool: (RawKanji & { grade: number })[] = [];
  
  Object.keys(kanjiData).forEach(gStr => {
    const grade = parseInt(gStr, 10);
    const withGrade = kanjiData[gStr].map(k => ({ ...k, grade }));
    pool = pool.concat(withGrade);
  });

  const mistakesPool = pool.filter(k => mistakeIds.includes(k.kanji));
  
  if (mistakesPool.length === 0) return [];
  
  // Use all readings from the entire pool for dummy choices
  const allOnReadings = pool.flatMap(k => k.on).filter(Boolean);
  const allKunReadings = pool.flatMap(k => k.kun).filter(Boolean);

  return mapToQuestions(mistakesPool, count, allOnReadings, allKunReadings);
}

export function getAllKanji(): (RawKanji & { grade: number })[] {
  let pool: (RawKanji & { grade: number })[] = [];
  Object.keys(kanjiData).forEach(gStr => {
    const grade = parseInt(gStr, 10);
    const withGrade = kanjiData[gStr].map(k => ({ ...k, grade }));
    pool = pool.concat(withGrade);
  });
  return pool;
}
