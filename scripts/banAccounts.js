/**
 * 不要なアカウントを削除する管理用ツール。
 *
 * 【必ず先に確認してから実行すること】
 *   node scripts/banAccounts.js            … 対象の一覧を出すだけ（何も消さない）
 *   node scripts/banAccounts.js --execute  … バックアップを取ってから実際に削除する
 *
 * 削除するとFirestoreのドキュメントとログイン情報(Auth)の両方が消える。
 * 実行前に scripts/banned-backup.json へ中身をそのまま保存するので、
 * 間違えた場合はそのJSONから書き戻せる。
 *
 *   node ban.js            … 一覧を出すだけ（削除しない）
 *   node ban.js --execute  … バックアップを取ってから実際に削除する
 *
 * 対象（先生の指示）:
 *   1. 同名でXPを持つアカウントが別にあり、中身が空(XP=0)のもの
 *   2. T.A.K.Oたこ焼き先輩ー
 *   3. 名前が空("")、名無し（5件）
 *   4. "1", "a"
 */
const fs = require("fs"), https = require("https"), path = require("path"), os = require("os");
const CI = "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com";
const CS = "j9iVZfS8kkCEFUPaAeJV0sAi", P = "kanji-quest-b1a45";
const EXECUTE = process.argv.includes("--execute");
const BACKUP = path.join(__dirname, "banned-backup.json");  // 削除前のバックアップ
const cfg = JSON.parse(fs.readFileSync(path.join(os.homedir(), ".config", "configstore", "firebase-tools.json"), "utf8"));

const pf = (u, p) => new Promise((r, j) => { const b = new URLSearchParams(p).toString(), U = new URL(u);
  const q = https.request({ hostname: U.hostname, path: U.pathname, method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "Content-Length": Buffer.byteLength(b) } },
    x => { let d = ""; x.on("data", c => d += c); x.on("end", () => r(JSON.parse(d))); }); q.on("error", j); q.write(b); q.end(); });
const req = (method, u, t, body) => new Promise((r, j) => { const U = new URL(u); const p = body ? JSON.stringify(body) : null;
  const h = { Authorization: "Bearer " + t }; if (p) { h["Content-Type"] = "application/json"; h["Content-Length"] = Buffer.byteLength(p); }
  const q = https.request({ hostname: U.hostname, path: U.pathname + U.search, method, headers: h },
    x => { let d = ""; x.on("data", c => d += c); x.on("end", () => { try { r({ status: x.statusCode, body: JSON.parse(d || "{}") }); } catch (e) { r({ status: x.statusCode, body: { raw: d.slice(0, 200) } }); } }); });
  q.on("error", j); if (p) q.write(p); q.end(); });

(async () => {
  const t = (await pf("https://oauth2.googleapis.com/token", { client_id: CI, client_secret: CS, refresh_token: cfg.tokens.refresh_token, grant_type: "refresh_token" })).access_token;

  let pt = "", docs = [];
  do {
    const r = await req("GET", `https://firestore.googleapis.com/v1/projects/${P}/databases/(default)/documents/users?pageSize=300` + (pt ? `&pageToken=${pt}` : ""), t);
    (r.body.documents || []).forEach(d => docs.push(d)); pt = r.body.nextPageToken || "";
  } while (pt);

  const num = f => f ? Number(f.integerValue ?? f.doubleValue ?? 0) : 0;
  const rows = docs.map(d => ({
    uid: d.name.split("/").pop(),
    docPath: d.name,
    raw: d,
    name: d.fields && d.fields.name ? d.fields.name.stringValue : "",
    xp: num(d.fields && d.fields.xp),
    pt: num(d.fields && d.fields.pt),
    grade: num(d.fields && d.fields.grade),
    lastLogin: d.fields && d.fields.lastLoginDate ? d.fields.lastLoginDate.stringValue : "",
  }));

  // 1. 同名でXPを持つアカウントが別にあり、自分はXP=0のもの
  const byName = {};
  rows.forEach(r => { const k = r.name.trim(); (byName[k] = byName[k] || []).push(r); });
  const emptyDup = [];
  for (const [name, list] of Object.entries(byName)) {
    if (list.length < 2) continue;
    const hasProgress = list.some(r => r.xp > 0);
    if (!hasProgress) continue;               // 全部空なら「本物」が判別できないので触らない
    list.filter(r => r.xp === 0).forEach(r => emptyDup.push({ ...r, reason: `「${name}」の空の重複（XPを持つ本アカウントが別にある）` }));
  }

  // 2〜4. 名指しされたもの
  const named = [];
  rows.forEach(r => {
    const n = r.name.trim();
    if (n === "T.A.K.Oたこ焼き先輩ー") named.push({ ...r, reason: "名指し（ふざけた名前）" });
    else if (n === "") named.push({ ...r, reason: "名指し（名前が空）" });
    else if (n === "名無し") named.push({ ...r, reason: "名指し（名無し）" });
    else if (n === "1" || n === "a") named.push({ ...r, reason: `名指し（1文字「${n}」）` });
  });

  const seen = new Set();
  const targets = [...emptyDup, ...named].filter(r => { if (seen.has(r.uid)) return false; seen.add(r.uid); return true; });

  console.log(`全アカウント ${rows.length} 件 / 削除対象 ${targets.length} 件`);
  console.log(`削除後に残る: ${rows.length - targets.length} 件\n`);

  const withXp = targets.filter(r => r.xp > 0);
  console.log(`■ このうち、記録が残っているもの ${withXp.length} 件（消すとその記録は失われます）`);
  withXp.sort((a, b) => b.xp - a.xp).forEach(r =>
    console.log(`   ${JSON.stringify(r.name).padEnd(24)} ${r.grade}年 XP=${String(r.xp).padStart(6)} PT=${String(r.pt).padStart(6)} 最終ログイン=${r.lastLogin || "なし"}  ${r.reason}`));

  const byReason = {};
  targets.forEach(r => { const k = r.reason.replace(/「[^」]*」/, "「…」"); byReason[k] = (byReason[k] || 0) + 1; });
  console.log("\n■ 理由別の件数");
  Object.entries(byReason).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`   ${v}件  ${k}`));

  if (!EXECUTE) {
    console.log("\n--- これは確認用の表示です。まだ何も削除していません ---");
    return;
  }

  // バックアップ（元に戻せるように、消す前に中身をそのまま保存する）
  fs.writeFileSync(BACKUP, JSON.stringify({ deletedAt: new Date().toISOString(), targets: targets.map(r => r.raw) }, null, 2), "utf8");
  console.log(`\nバックアップを保存: ${BACKUP}`);

  let okDoc = 0, ngDoc = 0, okAuth = 0, ngAuth = 0;
  for (const r of targets) {
    const d = await req("DELETE", `https://firestore.googleapis.com/v1/${r.docPath}`, t);
    if (d.status >= 200 && d.status < 300) okDoc++; else { ngDoc++; console.log("  ドキュメント削除失敗", r.uid, d.status, JSON.stringify(d.body).slice(0, 120)); }
    const a = await req("POST", `https://identitytoolkit.googleapis.com/v1/projects/${P}/accounts:delete`, t, { localId: r.uid });
    if (a.status >= 200 && a.status < 300) okAuth++; else { ngAuth++; console.log("  ログイン情報の削除失敗", r.uid, a.status, JSON.stringify(a.body).slice(0, 120)); }
  }
  console.log(`\n完了: ドキュメント ${okDoc}件削除 (失敗${ngDoc}) / ログイン情報 ${okAuth}件削除 (失敗${ngAuth})`);
})();
