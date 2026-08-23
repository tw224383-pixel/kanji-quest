import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

// 紛らわしい文字（0/O, 1/I/L）を除いたアルファベット
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

function randomCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

// 保護者・先生向け共有コードを新規発行する。衝突した場合は数回リトライする。
export async function generateShareCode(uid: string): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const ref = doc(db, "shareCodes", code);
    try {
      const existing = await getDoc(ref);
      if (existing.exists()) continue;
      await setDoc(ref, { uid });
      return code;
    } catch (e) {
      if (attempt === 4) throw e;
    }
  }
  throw new Error("共有コードの発行に失敗しました。もう一度お試しください。");
}

export async function resolveShareCode(code: string): Promise<string | null> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;
  const snap = await getDoc(doc(db, "shareCodes", normalized));
  if (!snap.exists()) return null;
  const data = snap.data();
  return typeof data.uid === "string" ? data.uid : null;
}
