export type MathQuestion = {
  id: string;
  grade: number;
  word: string; // The math equation (e.g. "5 + 3")
  reading: string; // The correct answer as a string (e.g. "8")
  type: "math";
  choices: string[]; // 4 choices including the correct answer
};

export type MathSkill = {
  id: string;
  grade: number;
  name: string;
};

export const MATH_SKILLS: MathSkill[] = [
  { id: 'g1_add', grade: 1, name: '1桁のたしざん' },
  { id: 'g1_sub', grade: 1, name: '1桁のひきざん' },
  { id: 'g2_add', grade: 2, name: '2桁のたしざん' },
  { id: 'g2_sub', grade: 2, name: '2桁のひきざん' },
  { id: 'g2_mul', grade: 2, name: 'かけざん（九九）' },
  { id: 'g3_add', grade: 3, name: '3桁のたしざん' },
  { id: 'g3_sub', grade: 3, name: '3桁のひきざん' },
  { id: 'g3_mul', grade: 3, name: 'かけざん（2桁×1桁）' },
  { id: 'g3_div', grade: 3, name: 'わりざん（あまりなし）' },
  { id: 'g4_div', grade: 4, name: 'わりざん（2桁÷1桁）' },
  { id: 'g4_dec_add', grade: 4, name: '小数のたしざん' },
  { id: 'g4_dec_sub', grade: 4, name: '小数のひきざん' },
  { id: 'g4_frac_addsub', grade: 4, name: '分数のたしざん・ひきざん（同分母）' },
  { id: 'g5_dec_mul', grade: 5, name: '小数の掛かけざん' },
  { id: 'g5_dec_div', grade: 5, name: '小数のわりざん' },
  { id: 'g5_frac_addsub', grade: 5, name: '分数のたしざん・ひきざん（異分母）' },
  { id: 'g6_frac_mul', grade: 6, name: '分数のかけざん' },
  { id: 'g6_frac_div', grade: 6, name: '分数のわりざん' },
];

function generateWrongChoices(correctAnswer: number, isDecimal = false): string[] {
  const choices = new Set<string>();
  choices.add(isDecimal ? correctAnswer.toFixed(1).replace(/\.0$/, '') : correctAnswer.toString());

  while (choices.size < 4) {
    let offset = Math.floor(Math.random() * 5) + 1; // 1 to 5
    if (Math.random() > 0.5) offset *= -1;
    
    let wrong = correctAnswer + (isDecimal ? offset * 0.1 : offset);
    if (!isDecimal && wrong < 0 && correctAnswer >= 0) {
      wrong = correctAnswer + Math.abs(offset);
    }
    
    // Format to 1 decimal place if it was a decimal
    choices.add(isDecimal ? wrong.toFixed(1).replace(/\.0$/, '') : wrong.toString());
  }

  return Array.from(choices).sort(() => 0.5 - Math.random());
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function simplifyFraction(n: number, d: number): string {
  if (n === 0) return "0";
  const common = gcd(Math.abs(n), Math.abs(d));
  const num = n / common;
  const den = d / common;
  if (den === 1) return num.toString();
  return `${num}/${den}`;
}

function generateWrongFractionChoices(correct: string): string[] {
  const choices = new Set<string>();
  choices.add(correct);
  let [nStr, dStr] = correct.split('/');
  let num = parseInt(nStr);
  let den = dStr ? parseInt(dStr) : 1;
  
  while (choices.size < 4) {
    let wrongNum = num + Math.floor(Math.random() * 5) - 2;
    if (wrongNum <= 0) wrongNum = 1;
    let wrongDen = den + Math.floor(Math.random() * 3) - 1;
    if (wrongDen <= 0) wrongDen = 1;
    choices.add(simplifyFraction(wrongNum, wrongDen));
  }
  return Array.from(choices).sort(() => 0.5 - Math.random());
}

function generateSkillQuestion(skillId: string): MathQuestion {
  const skill = MATH_SKILLS.find(s => s.id === skillId) || MATH_SKILLS[0];
  let word = "";
  let answerStr = "";
  let choices: string[] = [];
  
  let a = 0, b = 0, c = 0, d = 0, answer = 0;

  switch (skillId) {
    case 'g1_add':
      a = Math.floor(Math.random() * 9) + 1;
      b = Math.floor(Math.random() * 9) + 1;
      word = `${a} + ${b}`;
      answerStr = (a + b).toString();
      choices = generateWrongChoices(a + b);
      break;
    case 'g1_sub':
      a = Math.floor(Math.random() * 9) + 1;
      b = Math.floor(Math.random() * a);
      word = `${a} - ${b}`;
      answerStr = (a - b).toString();
      choices = generateWrongChoices(a - b);
      break;
    case 'g2_add':
      a = Math.floor(Math.random() * 90) + 10;
      b = Math.floor(Math.random() * 90) + 10;
      word = `${a} + ${b}`;
      answerStr = (a + b).toString();
      choices = generateWrongChoices(a + b);
      break;
    case 'g2_sub':
      a = Math.floor(Math.random() * 90) + 10;
      b = Math.floor(Math.random() * (a - 10)) + 10;
      word = `${a} - ${b}`;
      answerStr = (a - b).toString();
      choices = generateWrongChoices(a - b);
      break;
    case 'g2_mul':
      a = Math.floor(Math.random() * 9) + 1;
      b = Math.floor(Math.random() * 9) + 1;
      word = `${a} × ${b}`;
      answerStr = (a * b).toString();
      choices = generateWrongChoices(a * b);
      break;
    case 'g3_add':
      a = Math.floor(Math.random() * 900) + 100;
      b = Math.floor(Math.random() * 900) + 100;
      word = `${a} + ${b}`;
      answerStr = (a + b).toString();
      choices = generateWrongChoices(a + b);
      break;
    case 'g3_sub':
      a = Math.floor(Math.random() * 900) + 100;
      b = Math.floor(Math.random() * (a - 100)) + 100;
      word = `${a} - ${b}`;
      answerStr = (a - b).toString();
      choices = generateWrongChoices(a - b);
      break;
    case 'g3_mul':
      a = Math.floor(Math.random() * 90) + 10;
      b = Math.floor(Math.random() * 9) + 1;
      word = `${a} × ${b}`;
      answerStr = (a * b).toString();
      choices = generateWrongChoices(a * b);
      break;
    case 'g3_div':
      b = Math.floor(Math.random() * 9) + 1;
      answer = Math.floor(Math.random() * 9) + 1;
      a = b * answer;
      word = `${a} ÷ ${b}`;
      answerStr = answer.toString();
      choices = generateWrongChoices(answer);
      break;
    case 'g4_div':
      b = Math.floor(Math.random() * 9) + 1;
      answer = Math.floor(Math.random() * 20) + 10;
      a = b * answer;
      word = `${a} ÷ ${b}`;
      answerStr = answer.toString();
      choices = generateWrongChoices(answer);
      break;
    case 'g4_dec_add':
      a = (Math.floor(Math.random() * 90) + 10) / 10;
      b = (Math.floor(Math.random() * 90) + 10) / 10;
      word = `${a.toFixed(1)} + ${b.toFixed(1)}`;
      answerStr = (a + b).toFixed(1).replace(/\.0$/, '');
      choices = generateWrongChoices(a + b, true);
      break;
    case 'g4_dec_sub':
      a = (Math.floor(Math.random() * 90) + 10) / 10;
      b = (Math.floor(Math.random() * (a * 10 - 10)) + 10) / 10;
      word = `${a.toFixed(1)} - ${b.toFixed(1)}`;
      answerStr = (a - b).toFixed(1).replace(/\.0$/, '');
      choices = generateWrongChoices(a - b, true);
      break;
    case 'g4_frac_addsub': {
      c = Math.floor(Math.random() * 5) + 3; // denom
      const isAdd = Math.random() > 0.5;
      if (isAdd) {
        a = Math.floor(Math.random() * (c - 1)) + 1;
        b = Math.floor(Math.random() * (c - 1)) + 1;
        word = `${a}/${c} + ${b}/${c}`;
        answerStr = simplifyFraction(a + b, c);
      } else {
        a = Math.floor(Math.random() * (c - 1)) + 2;
        b = Math.floor(Math.random() * (a - 1)) + 1;
        word = `${a}/${c} - ${b}/${c}`;
        answerStr = simplifyFraction(a - b, c);
      }
      choices = generateWrongFractionChoices(answerStr);
      break;
    }
    case 'g5_dec_mul':
      a = (Math.floor(Math.random() * 90) + 10) / 10;
      b = Math.floor(Math.random() * 9) + 1;
      word = `${a.toFixed(1)} × ${b}`;
      answerStr = (a * b).toFixed(1).replace(/\.0$/, '');
      choices = generateWrongChoices(a * b, true);
      break;
    case 'g5_dec_div':
      b = Math.floor(Math.random() * 9) + 1;
      answer = (Math.floor(Math.random() * 90) + 10) / 10;
      a = Math.round(b * answer * 10) / 10;
      word = `${a} ÷ ${b}`;
      answerStr = answer.toFixed(1).replace(/\.0$/, '');
      choices = generateWrongChoices(answer, true);
      break;
    case 'g5_frac_addsub': {
      const isAdd = Math.random() > 0.5;
      const denoms = [2, 3, 4, 5, 6].sort(() => 0.5 - Math.random());
      const d1 = denoms[0], d2 = denoms[1];
      const n1 = Math.floor(Math.random() * (d1 - 1)) + 1;
      const n2 = Math.floor(Math.random() * (d2 - 1)) + 1;
      if (isAdd) {
        word = `${n1}/${d1} + ${n2}/${d2}`;
        answerStr = simplifyFraction(n1 * d2 + n2 * d1, d1 * d2);
      } else {
        // ensure positive
        const val1 = n1 / d1;
        const val2 = n2 / d2;
        if (val1 > val2) {
          word = `${n1}/${d1} - ${n2}/${d2}`;
          answerStr = simplifyFraction(n1 * d2 - n2 * d1, d1 * d2);
        } else {
          word = `${n2}/${d2} - ${n1}/${d1}`;
          answerStr = simplifyFraction(n2 * d1 - n1 * d2, d1 * d2);
        }
      }
      choices = generateWrongFractionChoices(answerStr);
      break;
    }
    case 'g6_frac_mul': {
      const d1 = Math.floor(Math.random() * 4) + 2;
      const d2 = Math.floor(Math.random() * 4) + 2;
      const n1 = Math.floor(Math.random() * 3) + 1;
      const n2 = Math.floor(Math.random() * 3) + 1;
      word = `${n1}/${d1} × ${n2}/${d2}`;
      answerStr = simplifyFraction(n1 * n2, d1 * d2);
      choices = generateWrongFractionChoices(answerStr);
      break;
    }
    case 'g6_frac_div': {
      const d1 = Math.floor(Math.random() * 4) + 2;
      const d2 = Math.floor(Math.random() * 4) + 2;
      const n1 = Math.floor(Math.random() * 3) + 1;
      const n2 = Math.floor(Math.random() * 3) + 1;
      word = `${n1}/${d1} ÷ ${n2}/${d2}`;
      answerStr = simplifyFraction(n1 * d2, d1 * n2);
      choices = generateWrongFractionChoices(answerStr);
      break;
    }
    default:
      a = Math.floor(Math.random() * 9) + 1;
      b = Math.floor(Math.random() * 9) + 1;
      word = `${a} + ${b}`;
      answerStr = (a + b).toString();
      choices = generateWrongChoices(a + b);
      break;
  }

  // Include a random ID component so React keys differ
  const uniqueId = Math.random().toString(36).substring(2, 9);
  return {
    id: `math_${skillId}_${uniqueId}`,
    grade: skill.grade,
    word,
    reading: answerStr,
    type: "math",
    choices
  };
}

export function getRandomMathQuestions(skillIds: string[], count: number = 5): MathQuestion[] {
  const validSkills = skillIds.length > 0 ? skillIds : [MATH_SKILLS[0].id];
  const questions: MathQuestion[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomSkillId = validSkills[Math.floor(Math.random() * validSkills.length)];
    questions.push(generateSkillQuestion(randomSkillId));
  }
  
  return questions;
}

export function getRevengeMathQuestions(mistakeIds: string[], count: number = 5): MathQuestion[] {
  // ID format: `math_g1_add_someId`
  const validMistakes = mistakeIds.filter(id => id.startsWith('math_'));
  if (validMistakes.length === 0) return [];
  
  const shuffled = validMistakes.sort(() => 0.5 - Math.random()).slice(0, count);
  
  return shuffled.map(id => {
    const parts = id.split('_');
    const skillId = `${parts[1]}_${parts[2]}${parts[3] && !parts[3].match(/^[0-9a-z]{7}$/) ? '_' + parts[3] : ''}`; // reconstruct skillId roughly
    const match = MATH_SKILLS.find(s => s.id === skillId) || MATH_SKILLS.find(s => skillId.startsWith(s.id));
    
    // Just generate a new question of the same skill
    if (match) {
      return generateSkillQuestion(match.id);
    } else {
      return generateSkillQuestion(MATH_SKILLS[0].id);
    }
  });
}
