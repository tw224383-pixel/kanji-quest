"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { storage } from "../lib/storage";

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
  categorySolved: {}
};

export function getCurrentJSTDateString() {
  const d = new Date();
  const jst = new Date(d.getTime() + (9 * 60 * 60 * 1000));
  return jst.toISOString().slice(0, 10);
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
  buyEffect: (effectId: string, cost: number) => Promise<boolean>;
  updateUserData: (updates: Partial<UserData>) => Promise<void>;
  logout: () => Promise<void>;
};

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load cached user data immediately to prevent loading screen flashing
    const cachedData = localStorage.getItem("kq_user_cache");
    if (cachedData) {
      try {
        setUserData(JSON.parse(cachedData));
        setLoading(false); // Disable loading state early if we have cache
      } catch (e) {
        console.error("Failed to parse cached user data", e);
      }
    }

    // Check if guest
    if (storage.isGuest()) {
      setIsGuest(true);
      const guestData = storage.getGuestData() as UserData;
      setUserData(guestData);
      setLoading(false);
      
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
        // subscribe to firestore doc
        const docRef = doc(db, "users", currentUser.uid);
        const unsubDoc = onSnapshot(docRef, (docSnap) => {
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
              loginStreak: data.loginStreak || 1
            };
            setUserData(newData);
            localStorage.setItem("kq_user_cache", JSON.stringify(newData));
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
            localStorage.setItem("kq_user_cache", JSON.stringify(initialData));
            storage.clearGuest();
          }
          setLoading(false);
        });
        return () => unsubDoc();
      } else {
        setUserData(null);
        localStorage.removeItem("kq_user_cache");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userData && !loading) {
      const todayStr = getCurrentJSTDateString();
      const yesterdayStr = getYesterdayJSTDateString();
      
      if (userData.lastLoginDate !== todayStr) {
        let newStreak = 1;
        if (userData.lastLoginDate === yesterdayStr) {
          newStreak = (userData.loginStreak || 0) + 1;
        }
        updateUserData({
          lastLoginDate: todayStr,
          loginStreak: newStreak,
        });
      }
    }
  }, [userData?.lastLoginDate, loading]);

  const updateUserData = async (updates: Partial<UserData>) => {
    if (!userData) return;
    const newData = { ...userData, ...updates };

    if (isGuest) {
      storage.updateGuestData(updates);
      setUserData(newData);
    } else if (user) {
      // Optimistic UI update
      setUserData(newData);
      localStorage.setItem("kq_user_cache", JSON.stringify(newData));
      // Sync to firebase
      await setDoc(doc(db, "users", user.uid), updates, { merge: true });
    }
  };

  const addXpAndPt = async (addedXp: number, addedPt: number) => {
    if (!userData) return;
    await updateUserData({
      xp: userData.xp + addedXp,
      pt: userData.pt + addedPt
    });
  };

  const buyEffect = async (effectId: string, cost: number) => {
    if (!userData || userData.pt < cost || userData.effects.includes(effectId)) return false;
    await updateUserData({
      pt: userData.pt - cost,
      effects: [...userData.effects, effectId]
    });
    return true;
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
      logout
    }}>
      {children}
    </UserContext.Provider>
  );
}
