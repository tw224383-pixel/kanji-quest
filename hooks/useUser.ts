"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { storage } from "../lib/storage";

export type UserData = {
  name: string;
  xp: number;
  pt: number;
  effects: string[];
  grade: number;
  mistakeIds: string[];
  masteredIds: string[];
  titles: string[];
  equippedTitle: string;
  avatars: string[];
  equippedAvatar: string;
  theme: string;
  totalDamage: number;
  equippedEffect: string;
  scaryMode: boolean;
};

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if guest
    if (storage.isGuest()) {
      setIsGuest(true);
      setUserData(storage.getGuestData() as UserData);
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
            setUserData({
              name: data.name || "名無し",
              xp: data.xp || 0,
              pt: data.pt || 0,
              effects: data.effects || ["default"],
              grade: data.grade || 1,
              mistakeIds: data.mistakeIds || [],
              masteredIds: data.masteredIds || [],
              titles: data.titles || ["見習い"],
              equippedTitle: data.equippedTitle || "見習い",
              avatars: data.avatars || ["👦"],
              equippedAvatar: data.equippedAvatar || "👦",
              theme: data.theme || "default",
              totalDamage: data.totalDamage || 0,
              equippedEffect: data.equippedEffect || "",
              scaryMode: data.scaryMode || false
            });
          } else {
            // default
            setUserData({ 
              name: "名無し", 
              xp: 0, 
              pt: 0, 
              effects: ["default"], 
              grade: 1,
              mistakeIds: [],
              masteredIds: [],
              titles: ["見習い"],
              equippedTitle: "見習い",
              avatars: ["👦"],
              equippedAvatar: "👦",
              theme: "default",
              totalDamage: 0,
              equippedEffect: "",
              scaryMode: false
            });
          }
          setLoading(false);
        });
        return () => unsubDoc();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateUserData = async (updates: Partial<UserData>) => {
    if (!userData) return;
    const newData = { ...userData, ...updates };

    if (isGuest) {
      storage.updateGuestData(updates);
      setUserData(newData);
    } else if (user) {
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

  return {
    user,
    userData,
    isGuest,
    loading,
    addXpAndPt,
    buyEffect,
    updateUserData,
  };
}
