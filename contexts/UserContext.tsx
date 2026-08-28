"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, User, signOut, signInAnonymously } from "firebase/auth";
import { doc, setDoc, getDoc, runTransaction } from "firebase/firestore";
import { storage } from "../lib/storage";
import { rollPeriodSnapshot } from "../lib/periodSnapshot";
import { getCurrentJSTWeekString, getCurrentJSTMonth } from "../lib/raidLogic";
import { safeLocalStorage } from "../lib/safeLocalStorage";

export type UserData = {
  id?: string;
  name: string;
  xp: number;
  pt: number;
  sp: number;
  effects: string[];
  grade: number;
  mistakeIds: string[];
  masteredIds: string[];
  titles: string[];
  equippedTitle: string;
  avatars: string[];
  equippedAvatar: string;
  equipments: string[];
  equippedEquipment: string;
  theme: string;
  totalDamage: number;
  equippedEffect: string;
  weeklyXp?: number;
  lastWeekString?: string;
  monthlyDamage?: number;
  lastMonthString?: string;
  scaryMode?: boolean;
  claimedAchievements?: string[];
  lastLoginDate?: string;
  loginStreak?: number;
  categorySolved?: { [key: string]: number };
  // 分散学習（間隔反復）: 苦手問題ごとの復習段階と次回復習日
  mistakeStages?: { [key: string]: number };
  mistakeNextReview?: { [key: string]: string };
  // 保護者・先生向け閲覧用の共有コード（本人が発行、ログイン不要で閲覧可能にする）
  shareCode?: string;
  // ランキング関連の実績用：これまでに達成した最高順位（1が1位）。ランキング画面を
  // 訪れたタイミングで更新される（ランキングは都度計算のためリアルタイム判定はできない）。
  bestWeeklyHeroRank?: number;
  bestDamageRank?: number;
  // 系統（スキル）別・1日のPT上限判定用（同じ系統の問題の周回でのPT稼ぎ対策）。
  // 日付（lastPtEarnDate）が変わると系統ごとリセットされる。合計PTそのものには上限なし。
  dailyCategoryPt?: { [skillKey: string]: number };
  lastPtEarnDate?: string;
  // 「先週のヒーロー」「先月のダメージ」ランキング＝確定済みの前期間の成績。
  // weeklyXp / lastWeekString は次の期間に入ると上書きされて前期間の値が消えてしまうため、
  // 期間が切り替わった最初の書き込みで、リセット前の値をここへ退避（スナップショット）する。
  prevWeeklyXp?: number;
  prevWeekString?: string;
  prevMonthlyDamage?: number;
  prevMonthString?: string;
};

const DEFAULT_USER_DATA: UserData = {
  name: "名無し",
  xp: 0,
  pt: 0,
  sp: 0,
  effects: ["default"],
  grade: 1,
  mistakeIds: [],
  masteredIds: [],
  titles: ["見習い"],
  equippedTitle: "見習い",
  avatars: ["👦"],
  equippedAvatar: "👦",
  equipments: [],
  equippedEquipment: "",
  theme: "default",
  totalDamage: 0,
  equippedEffect: "",
  scaryMode: false,
  claimedAchievements: [],
  lastLoginDate: "",
  loginStreak: 1,
  categorySolved: {},
  mistakeStages: {},
  mistakeNextReview: {},
  shareCode: ""
};

export function getCurrentJSTDateString() {
  const d = new Date();
  const jst = new Date(d.getTime() + (9 * 60 * 60 * 1000));
  return jst.toISOString().slice(0, 10);
}

// 初期表示を速くするため一時的にキャッシュを表示するが、古すぎるキャッシュは
// 他端末での更新を反映していない可能性が高いため信用しない（表示せず読み込み中のままにする）。
const USER_CACHE_KEY = "kq_user_cache";
const USER_CACHE_MAX_AGE_MS = 5 * 60 * 1000; // 5分

function writeUserCache(data: UserData) {
  safeLocalStorage.setItem(USER_CACHE_KEY, JSON.stringify({ data, cachedAt: Date.now() }));
}

function readFreshUserCache(): UserData | null {
  const raw = safeLocalStorage.getItem(USER_CACHE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && "cachedAt" in parsed && "data" in parsed) {
      if (Date.now() - parsed.cachedAt > USER_CACHE_MAX_AGE_MS) return null;
      return parsed.data as UserData;
    }
    // 旧形式（タイムスタンプなし）のキャッシュは信用せず破棄する
    return null;
  } catch (e) {
    console.error("Failed to parse cached user data", e);
    return null;
  }
}

export function getYesterdayJSTDateString() {
  const d = new Date();
  const jst = new Date(d.getTime() + (9 * 60 * 60 * 1000) - (24 * 60 * 60 * 1000));
  return jst.toISOString().slice(0, 10);
}

export type UserContextType = {
  user: User | null;
  userData: UserData | null;
  isGuest: boolean;
  loading: boolean;
  addXpAndPt: (xp: number, pt: number) => Promise<void>;
  buyEffect: (effectId: string, cost: number) => Promise<boolean | null>;
  updateUserData: (updates: Partial<UserData>) => Promise<boolean>;
  // 戻り値: true=成功 / false=通信・保存エラー（呼び出し側はエラー表示すべき）
  // / null=updaterが意図的に中断（残高不足・二重クリック等）で、エラーではない（無表示でよい）
  updateUserDataAtomic: (updater: (current: UserData) => Partial<UserData> | null) => Promise<boolean | null>;
  logout: () => Promise<void>;
};

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 【重要】この処理が途中で例外を投げると onAuthStateChanged が登録されず、
    // loading が true のまま固定されて「読み込み中 100%」から永久に進まなくなる。
    // 実際、サイトデータをブロックしている端末では localStorage を参照した瞬間に
    // 例外が出るため、別の端末からログインできないという不具合になっていた。
    // localStorage は safeLocalStorage 経由（例外を投げない）に統一したうえで、
    // ここでも保険として全体を try/catch で囲い、失敗しても必ず loading を解除する。
    let cleanup: (() => void) | undefined;
    try {
      cleanup = initAuth();
    } catch (e) {
      console.error("ユーザー情報の初期化に失敗しました", e);
      setLoading(false);
    }
    return () => { try { cleanup?.(); } catch { /* 後始末の失敗は無視 */ } };

    function initAuth(): (() => void) | undefined {
    // Try to load cached user data immediately to prevent loading screen flashing.
    // 直近(5分以内)のキャッシュのみ信用する。古いキャッシュは他端末での更新を
    // 見逃す恐れがあるため使わず、Firestoreからの最新データを待つ。
    const freshCache = readFreshUserCache();
    if (freshCache) {
      setUserData(freshCache);
      setLoading(false); // Disable loading state early if we have a fresh cache
    }

    // Check if guest
    if (storage.isGuest()) {
      setIsGuest(true);
      const guestData = storage.getGuestData() as UserData;
      setUserData(guestData);
      setLoading(false);

      // ゲストは本人のデータをすべてlocalStorageで管理するためFirebase Authは不要だが、
      // ランキング等「他ユーザーの一覧」を読むFirestoreクエリは request.auth != null を要求するため、
      // 匿名認証でサインインしておく（ゲストのゲームデータ自体には影響しない）。
      // これが無いと「今週のヒーロー」等のランキングが permission-denied で読み込めなくなる。
      if (!auth.currentUser) {
        signInAnonymously(auth).catch(err => console.error("Anonymous sign-in failed", err));
      }

      const handleGuestUpdate = () => {
        setUserData(storage.getGuestData() as UserData);
      };
      window.addEventListener("kq_guest_update", handleGuestUpdate);
      return () => window.removeEventListener("kq_guest_update", handleGuestUpdate);
    }

    // Otherwise use Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // 600人規模の運用でFirestore無料枠(読み取り5万回/日)を超えないよう、常時購読
        // (onSnapshot)ではなく単発取得(getDoc)にしている。自分自身の書き込みは
        // updateUserDataAtomic/updateUserData が呼び出し直後にローカル状態を更新するため
        // 即座に画面へ反映され、常時購読は「自分の書き込みの結果を自分で読み返すだけの
        // 無駄な読み取り」になっていた。別デバイス・別タブでの変更は、このタブを再び
        // アクティブにしたタイミング（visibilitychange）で取り直すことで追従する。
        const docRef = doc(db, "users", currentUser.uid);
        const fetchAndApply = async () => {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const newData: UserData = {
              name: data.name || "名無し",
              xp: data.xp || 0,
              pt: data.pt || 0,
              sp: data.sp || 0,
              effects: data.effects || ["default"],
              grade: data.grade || 1,
              mistakeIds: data.mistakeIds || [],
              masteredIds: data.masteredIds || [],
              titles: data.titles || ["見習い"],
              equippedTitle: data.equippedTitle || "見習い",
              avatars: data.avatars || ["👦"],
              equippedAvatar: data.equippedAvatar || "👦",
              equipments: data.equipments || [],
              equippedEquipment: data.equippedEquipment || "",
              theme: data.theme || "default",
              totalDamage: data.totalDamage || 0,
              equippedEffect: data.equippedEffect || "",
              scaryMode: data.scaryMode || false,
              weeklyXp: data.weeklyXp || 0,
              lastWeekString: data.lastWeekString || "",
              monthlyDamage: data.monthlyDamage || 0,
              lastMonthString: data.lastMonthString || "",
              claimedAchievements: data.claimedAchievements || [],
              lastLoginDate: data.lastLoginDate || "",
              loginStreak: data.loginStreak || 1,
              // categorySolved はこれまでこのマッピングから漏れており、保存はされてもページ再読み込みのたびに
              // 見た目上リセットされてしまっていた（成長カルテのカテゴリ別集計が消えて見えるバグ）。
              categorySolved: data.categorySolved || {},
              mistakeStages: data.mistakeStages || {},
              mistakeNextReview: data.mistakeNextReview || {},
              shareCode: data.shareCode || "",
              bestWeeklyHeroRank: data.bestWeeklyHeroRank || undefined,
              bestDamageRank: data.bestDamageRank || undefined,
              dailyCategoryPt: data.dailyCategoryPt || {},
              lastPtEarnDate: data.lastPtEarnDate || "",
              prevWeeklyXp: data.prevWeeklyXp || 0,
              prevWeekString: data.prevWeekString || "",
              prevMonthlyDamage: data.prevMonthlyDamage || 0,
              prevMonthString: data.prevMonthString || ""
            };
            setUserData(newData);
            writeUserCache(newData);
          } else {
            // New user: check if guest data exists to migrate
            const guestData = storage.getGuestData() as UserData;
            const hasProgress = guestData && ((guestData.xp || 0) > 0 || (guestData.pt || 0) > 0 || (guestData.sp || 0) > 0 || (guestData.avatars || []).length > 1 || (guestData.equipments || []).length > 0);

            const initialData: UserData = hasProgress ? {
              ...DEFAULT_USER_DATA,
              ...guestData,
              name: currentUser.displayName || guestData.name || "名無し",
            } : {
              ...DEFAULT_USER_DATA,
              name: currentUser.displayName || "名無し",
            };

            setDoc(docRef, initialData, { merge: true }).catch(console.error);
            setUserData(initialData);
            writeUserCache(initialData);
            storage.clearGuest();
          }
        };

        try {
          await fetchAndApply();
        } catch (e) {
          console.error("Failed to fetch user data", e);
        }
        setLoading(false);

        const onVisible = () => {
          if (document.visibilityState === "visible") {
            fetchAndApply().catch(e => console.error("Failed to refresh user data", e));
          }
        };
        document.addEventListener("visibilitychange", onVisible);
        return () => document.removeEventListener("visibilitychange", onVisible);
      } else {
        setUserData(null);
        safeLocalStorage.removeItem(USER_CACHE_KEY);
        setLoading(false);
      }
    });

    return () => unsubscribe();
    }
  }, []);

  // 最後の安全網：どんな理由であれ一定時間たっても初期化が終わらない場合は、
  // 「読み込み中」で固まったまま何もできない状態にせず、先へ進めるようにする。
  // （通信が極端に遅い端末や、Firebaseの初期化が失敗したケースを想定）
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      console.warn("初期化に時間がかかりすぎたため、読み込み中の表示を解除します");
      setLoading(false);
    }, 12000);
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    if (userData && !loading) {
      const todayStr = getCurrentJSTDateString();
      const yesterdayStr = getYesterdayJSTDateString();
      
      if (userData.lastLoginDate !== todayStr) {
        updateUserDataAtomic(current => {
          // 別タブで既に今日分の更新が反映済みなら何もしない（複数タブでの二重加算防止）
          if (current.lastLoginDate === todayStr) return null;
          const newStreak = current.lastLoginDate === yesterdayStr ? (current.loginStreak || 0) + 1 : 1;
          // 週・月が切り替わっていれば、先週分・先月分の成績をここで退避しておく。
          // ゲーム終了時にも同じ退避を行っているが、それだと「新しい週にまだ一度も
          // プレイしていない子」の記録が退避されず、先週ランキングから漏れてしまう。
          // アプリを開いた時点で退避しておけば、ランキングを見に来た全員が対象になる。
          const weekRoll = rollPeriodSnapshot(current.lastWeekString, getCurrentJSTWeekString(), current.weeklyXp, current.prevWeekString, current.prevWeeklyXp);
          const monthRoll = rollPeriodSnapshot(current.lastMonthString, getCurrentJSTMonth(), current.monthlyDamage, current.prevMonthString, current.prevMonthlyDamage);
          return {
            lastLoginDate: todayStr,
            loginStreak: newStreak,
            ...weekRoll.snapshot("prevWeeklyXp", "prevWeekString"),
            ...monthRoll.snapshot("prevMonthlyDamage", "prevMonthString"),
          };
        });
      }
    }
  }, [userData?.lastLoginDate, loading]);

  const updateUserData = async (updates: Partial<UserData>): Promise<boolean> => {
    if (!userData) return false;
    const previousData = userData;
    const newData = { ...userData, ...updates };

    if (isGuest) {
      storage.updateGuestData(updates);
      setUserData(newData);
      return true;
    } else if (user) {
      // Optimistic UI update
      setUserData(newData);
      writeUserCache(newData);
      try {
        // Sync to firebase
        await setDoc(doc(db, "users", user.uid), updates, { merge: true });
        return true;
      } catch (e) {
        // 書き込み失敗時は楽観的更新を取り消し、呼び出し元がエラー表示できるよう false を返す
        console.error("updateUserData failed", e);
        setUserData(previousData);
        writeUserCache(previousData);
        return false;
      }
    }
    return false;
  };

  // updateUserData は呼び出し側が保持しているローカルの userData を起点に新しい値を計算するため、
  // 複数タブ・複数端末で同時に書き込むと片方の更新が失われることがある（レース条件）。
  // 加算・減算やリスト追加など「直前の値」に依存する更新は、この関数で Firestore の
  // トランザクション内から最新のサーバー側データを読み直して計算することで、取りこぼしを防ぐ。
  // updater が null を返すと書き込みを中止する（残高不足時など）。
  const updateUserDataAtomic = async (
    updater: (current: UserData) => Partial<UserData> | null
  ): Promise<boolean | null> => {
    if (isGuest) {
      if (!userData) return false;
      const updates = updater(userData);
      if (!updates) return null;
      storage.updateGuestData(updates);
      setUserData({ ...userData, ...updates });
      return true;
    }

    if (!user) return false;
    const ref = doc(db, "users", user.uid);
    try {
      const newData = await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(ref);
        const current = snap.exists() ? ({ ...DEFAULT_USER_DATA, ...(snap.data() as Partial<UserData>) }) : userData;
        if (!current) throw new Error("no-user-data");
        const updates = updater(current);
        if (!updates) throw new Error("aborted");
        transaction.set(ref, updates, { merge: true });
        return { ...current, ...updates };
      });
      setUserData(newData);
      writeUserCache(newData);
      return true;
    } catch (e) {
      if ((e as Error).message === "aborted") {
        return null;
      }
      console.error("updateUserDataAtomic failed", e);
      return false;
    }
  };

  const addXpAndPt = async (addedXp: number, addedPt: number) => {
    await updateUserDataAtomic(current => ({
      xp: current.xp + addedXp,
      pt: current.pt + addedPt
    }));
  };

  const buyEffect = async (effectId: string, cost: number) => {
    return updateUserDataAtomic(current => {
      if (current.pt < cost || current.effects.includes(effectId)) return null;
      return {
        pt: current.pt - cost,
        effects: [...current.effects, effectId]
      };
    });
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("SignOut error", e);
    }
    storage.clearGuest();
    setUserData(null);
    setIsGuest(false);
    setUser(null);
  };

  return (
    <UserContext.Provider value={{
      user,
      userData,
      isGuest,
      loading,
      addXpAndPt,
      buyEffect,
      updateUserData,
      updateUserDataAtomic,
      logout
    }}>
      {children}
    </UserContext.Provider>
  );
}
