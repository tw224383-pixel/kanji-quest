/** Negative + positive rule tests: confirm the leaner rules still block cheating. */
const fs = require("fs");
const https = require("https");
const path = require("path");
const CLIENT_ID = "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com";
const CLIENT_SECRET = "j9iVZfS8kkCEFUPaAeJV0sAi";
const PROJECT_ID = "kanji-quest-b1a45";
const os = require("os");
const CONFIG_PATH = path.join(os.homedir(), ".config", "configstore", "firebase-tools.json");
if (!fs.existsSync(CONFIG_PATH)) { console.error("firebase-tools のログイン情報が見つかりません。`firebase login` を実行してください。"); process.exit(1); }
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
const rulesSource = fs.readFileSync(process.argv[2] || path.join(__dirname, "..", "firestore.rules"), "utf8");

function postForm(url, params) {
  return new Promise((resolve, reject) => {
    const b = new URLSearchParams(params).toString(); const u = new URL(url);
    const r = https.request({ hostname: u.hostname, path: u.pathname, method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "Content-Length": Buffer.byteLength(b) } },
      res => { let d = ""; res.on("data", c => d += c); res.on("end", () => resolve(JSON.parse(d))); });
    r.on("error", reject); r.write(b); r.end();
  });
}
function post(url, token, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url); const p = JSON.stringify(body);
    const r = https.request({ hostname: u.hostname, path: u.pathname + u.search, method: "POST",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json", "Content-Length": Buffer.byteLength(p) } },
      res => { let d = ""; res.on("data", c => d += c); res.on("end", () => resolve(JSON.parse(d))); });
    r.on("error", reject); r.write(p); r.end();
  });
}

const UID = "testkid";
const BASE = {
  id: UID, name: "たろう", xp: 1000, pt: 500, sp: 200, effects: ["default"], grade: 3,
  mistakeIds: [], masteredIds: [], titles: ["見習い"], equippedTitle: "見習い",
  avatars: ["👦"], equippedAvatar: "👦", equipments: [], equippedEquipment: "",
  theme: "default", totalDamage: 1000, equippedEffect: "", weeklyXp: 100,
  lastWeekString: "2026-W35", monthlyDamage: 500, lastMonthString: "2026-08",
  scaryMode: false, claimedAchievements: [], lastLoginDate: "2026-08-25",
  loginStreak: 3, categorySolved: {}, mistakeStages: {}, mistakeNextReview: {}, shareCode: "",
  dailyCategoryPt: { math_g3_add: 1500, kanji_g3: 300 }, lastPtEarnDate: "2026-08-27",
  prevWeeklyXp: 0, prevWeekString: "", prevMonthlyDamage: 0, prevMonthString: "",
};
const merge = o => Object.assign({}, BASE, o);

const CASES = [
  ["normal game finish (+200xp,+100pt)", "ALLOW", merge({ xp: 1200, pt: 600, totalDamage: 1200, weeklyXp: 300, monthlyDamage: 700 })],
  ["claim all achievements (+543k pt)",   "ALLOW", merge({ pt: 500 + 543300, sp: 200 + 201100, claimedAchievements: ["a", "b"] })],
  ["CHEAT: pt jump to 9,999,999",         "DENY",  merge({ pt: 9999999 })],
  ["CHEAT: xp jump to 500,000",           "DENY",  merge({ xp: 500000 })],
  ["CHEAT: sp jump to 5,000,000",         "DENY",  merge({ sp: 5000000 })],
  ["CHEAT: totalDamage jump to 999,999",  "DENY",  merge({ totalDamage: 999999 })],
  ["CHEAT: negative pt",                  "DENY",  merge({ pt: -100 })],
  ["CHEAT: weeklyXp jump (same week)",    "DENY",  merge({ weeklyXp: 900000 })],
  ["CHEAT: monthlyDamage jump (same mo)", "DENY",  merge({ monthlyDamage: 900000 })],
  ["CHEAT: loginStreak 3 -> 99",          "DENY",  merge({ loginStreak: 99 })],
  ["CHEAT: unknown field injected",       "DENY",  merge({ isAdmin: true })],
  ["CHEAT: grade 99",                     "DENY",  merge({ grade: 99 })],
  ["CHEAT: 200-char name",                "DENY",  merge({ name: "あ".repeat(200) })],
  ["CHEAT: bestDamageRank 5 -> 1 w/o earning is allowed by design", "ALLOW", merge({ bestDamageRank: 1 })],
  ["legit: new week resets weeklyXp",     "ALLOW", merge({ weeklyXp: 50, lastWeekString: "2026-W36" })],
  ["legit: new month resets monthlyDmg",  "ALLOW", merge({ monthlyDamage: 50, lastMonthString: "2026-09" })],
  ["legit: loginStreak 3 -> 4",           "ALLOW", merge({ loginStreak: 4, lastLoginDate: "2026-08-26" })],
  ["legit: dailyCategoryPt skill +800 (same day)", "ALLOW", merge({ pt: 1300, dailyCategoryPt: { math_g3_add: 2300, kanji_g3: 300 } })],
  ["legit: new day resets dailyCategoryPt", "ALLOW", merge({ pt: 700, dailyCategoryPt: { math_g3_logic: 200 }, lastPtEarnDate: "2026-08-28" })],
  ["legit: many skills played in one day (36 keys)", "ALLOW", merge({ dailyCategoryPt: Object.fromEntries(Array.from({length: 36}, (_, i) => [`math_s${i}`, 100])) })],
  ["CHEAT: dailyCategoryPt with too many keys", "DENY", merge({ dailyCategoryPt: Object.fromEntries(Array.from({length: 80}, (_, i) => [`c${i}`, 1])) })],
  ["legit: 週の切り替わりで先週分を prev* へ退避", "ALLOW", merge({ weeklyXp: 120, lastWeekString: "2026-W36", prevWeeklyXp: 100, prevWeekString: "2026-W35" })],
  ["legit: 月の切り替わりで先月分を prev* へ退避", "ALLOW", merge({ monthlyDamage: 80, lastMonthString: "2026-09", prevMonthlyDamage: 500, prevMonthString: "2026-08" })],
  ["CHEAT: prevWeeklyXp が負の値",           "DENY",  merge({ prevWeeklyXp: -50, prevWeekString: "2026-W35" })],
  ["CHEAT: prevMonthlyDamage が数値でない",  "DENY",  merge({ prevMonthlyDamage: "999999", prevMonthString: "2026-08" })],
  ["legit: すべてを超えし者の報酬(+10万PT/+5万SP)を受け取る", "ALLOW",
    merge({ pt: 500 + 100000, sp: 200 + 50000, claimedTranscendentMonths: ["2026-08"] })],
  ["CHEAT: 報酬を装って +900万PT",           "DENY",
    merge({ pt: 9000000, claimedTranscendentMonths: ["2026-08"] })],
];

// globalStats（学年共有のレイドボス）側のテスト
const GS_BASE = { level: 10, hp: 255000, month: "2026-08" };
const GS_CASES = [
  ["globalStats: 通常のダメージ反映",                    "ALLOW", { level: 10, hp: 100000, month: "2026-08" }],
  ["globalStats: Lv11(裏ボス)へ移行・999万HP",           "ALLOW", { level: 11, hp: 9990000, month: "2026-08" }],
  ["globalStats: Lv11討伐を記録",                        "ALLOW", { level: 11, hp: 0, month: "2026-08", transcendentClearedMonths: ["2026-08"] }],
  ["globalStats: CHEAT Lv12は存在しない",                "DENY",  { level: 12, hp: 100, month: "2026-08" }],
  ["globalStats: CHEAT HPが999万超",                     "DENY",  { level: 11, hp: 99999999, month: "2026-08" }],
  ["globalStats: CHEAT 討伐記録が多すぎる",              "DENY",  { level: 11, hp: 0, month: "2026-08", transcendentClearedMonths: Array.from({length: 30}, (_, i) => "m" + i) }],
  ["globalStats: CHEAT 未知のフィールド",                "DENY",  { level: 10, hp: 100, month: "2026-08", isAdmin: true }],
];

(async () => {
  const token = (await postForm("https://oauth2.googleapis.com/token", {
    client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
    refresh_token: config.tokens.refresh_token, grant_type: "refresh_token" })).access_token;

  const testCases = [
    ...CASES.map(([, exp, data]) => ({
      expectation: exp,
      request: { auth: { uid: UID, token: {} }, method: "update",
        path: `/databases/(default)/documents/users/${UID}`,
        time: new Date().toISOString(), resource: { data } },
      resource: { data: BASE },
    })),
    ...GS_CASES.map(([, exp, data]) => ({
      expectation: exp,
      request: { auth: { uid: UID, token: {} }, method: "update",
        path: `/databases/(default)/documents/globalStats/raidBoss_3`,
        time: new Date().toISOString(), resource: { data } },
      resource: { data: GS_BASE },
    })),
  ];
  const ALL = [...CASES, ...GS_CASES];

  const res = await post(`https://firebaserules.googleapis.com/v1/projects/${PROJECT_ID}:test`, token, {
    source: { files: [{ name: "firestore.rules", content: rulesSource }] },
    testSuite: { testCases },
  });
  if (res.error) { console.log("API error:", JSON.stringify(res.error).slice(0, 300)); return; }

  let bad = 0;
  (res.testResults || []).forEach((r, i) => {
    const [label, exp] = ALL[i];
    const ok = r.state === "SUCCESS";
    if (!ok) bad++;
    console.log(`${ok ? "PASS" : "**FAIL**"}  expect ${exp.padEnd(5)}  ${label}`);
    if (!ok) (r.debugMessages || []).slice(0, 2).forEach(d => console.log("        " + String(d).slice(0, 200)));
  });
  console.log(`\n${bad === 0 ? "All rule expectations met." : bad + " expectation(s) not met."}`);
})();
