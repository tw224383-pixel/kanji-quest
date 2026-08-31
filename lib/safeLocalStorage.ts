"use client";

/**
 * localStorage の安全なラッパー。
 *
 * localStorage は「使えるが空」なだけでなく、**参照した瞬間に例外を投げる**環境がある：
 *   - ブラウザの設定で「サイトデータ（Cookie等）をブロック」している端末
 *     （学校で配布される管理端末や、iOS Safari の「すべてのCookieをブロック」など）
 *   - 一部ブラウザのプライベートブラウジング
 *   - 保存容量がいっぱいのとき（setItem が QuotaExceededError を投げる）
 *
 * 以前はこれを直接触っていたため、そうした端末では UserProvider の初期化処理が
 * 最初の1行で例外を投げ、Firebase の onAuthStateChanged が登録されないまま
 * loading が true のままになり、「読み込み中 100%」から先に進めなくなっていた。
 *
 * ここでは例外を握りつぶして既定値を返すだけにする。保存できない端末では
 * 「ゲストの記録が残らない」等の劣化はあるが、アプリ自体は動き続けられる。
 */

let warned = false;
function warnOnce(e: unknown) {
  if (warned) return;
  warned = true;
  console.warn("localStorage が使えない環境です。保存を伴う機能は制限されます。", e);
}

export const safeLocalStorage = {
  /** 読めなければ null（未設定と同じ扱い） */
  getItem(key: string): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      warnOnce(e);
      return null;
    }
  },

  /** 保存できなくても例外を投げない */
  setItem(key: string, value: string): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      warnOnce(e);
    }
  },

  removeItem(key: string): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      warnOnce(e);
    }
  },

  /** 保存されているキーの一覧。読めない環境では空配列を返す */
  keys(): string[] {
    if (typeof window === "undefined") return [];
    try {
      return Object.keys(window.localStorage);
    } catch (e) {
      warnOnce(e);
      return [];
    }
  },

  /** この端末で保存が使えるか（UIでの案内表示用） */
  isAvailable(): boolean {
    if (typeof window === "undefined") return false;
    try {
      const probe = "__kq_probe__";
      window.localStorage.setItem(probe, "1");
      window.localStorage.removeItem(probe);
      return true;
    } catch {
      return false;
    }
  },
};
